module CreateGame exposing (Model, Msg, initial, update, view)

import Api
import Cons exposing (Cons)
import Dict exposing (Dict)
import Effect exposing (Effect)
import Element exposing (Element, column, el, none, row, text)
import Element.Background as Background
import Element.Border as Border
import Element.Events as Events
import Element.Font as Font
import Element.Input as Input exposing (button)
import Game exposing (Game)
import Json.Decode as Decode
import LocalStorage
import Palette
import Player exposing (Player)
import Router
import Task
import Time



-- M O D E L


type alias Draft =
    { inGame : Bool
    , player : Player
    }


type alias State =
    { players : Dict Int Draft
    }


initialState : State
initialState =
    Player.x6
        |> List.indexedMap (\i x -> ( i, Draft True x ))
        |> Dict.fromList
        |> State


type Model
    = Loading
    | Failure Decode.Error
    | Succeed (List Game.ID) State


initial : ( Model, Effect Msg )
initial =
    ( Loading
    , Api.loadAllGames
        |> Effect.map LoadAllGames
    )



-- U P D A T E


type Msg
    = LoadAllGames (Result LocalStorage.Error (List Game.ID))
    | Swap Int Int
    | ChangeName Int String
    | InGame Int
    | Create (Cons Player)
    | CreateDone Game


update : Msg -> Model -> ( Model, Effect Msg )
update msg model =
    case ( msg, model ) of
        ( LoadAllGames (Err LocalStorage.NotFound), _ ) ->
            ( Succeed [] initialState
            , Effect.none
            )

        ( LoadAllGames (Err (LocalStorage.DecodeError error)), _ ) ->
            ( Failure error
            , Effect.none
            )

        ( LoadAllGames (Ok gameIDs), _ ) ->
            ( Succeed gameIDs initialState
            , Effect.none
            )

        ( Swap from to, Succeed gameIDs state ) ->
            let
                count =
                    Dict.size state.players

                fromIndex =
                    modBy count (count + from)

                toIndex =
                    modBy count (count + to)

                nextPlayers =
                    Maybe.map2
                        (\fromDraft toDraft ->
                            state.players
                                |> Dict.insert fromIndex toDraft
                                |> Dict.insert toIndex { fromDraft | inGame = True }
                        )
                        (Dict.get fromIndex state.players)
                        (Dict.get toIndex state.players)
                        |> Maybe.withDefault state.players
            in
            ( Succeed gameIDs { state | players = nextPlayers }
            , Effect.none
            )

        ( Swap _ _, _ ) ->
            ( model, Effect.none )

        ( ChangeName index nextName, Succeed gameIDs state ) ->
            let
                nextPlayers =
                    Dict.update index
                        (Maybe.map (\{ player } -> Draft True { player | name = nextName }))
                        state.players
            in
            ( Succeed gameIDs { state | players = nextPlayers }
            , Effect.none
            )

        ( ChangeName _ _, _ ) ->
            ( model, Effect.none )

        ( InGame index, Succeed gameIDs state ) ->
            let
                nextPlayers =
                    Dict.update index
                        (Maybe.map (\{ inGame, player } -> Draft (not inGame) player))
                        state.players
            in
            ( Succeed gameIDs { state | players = nextPlayers }
            , Effect.none
            )

        ( InGame _, _ ) ->
            ( model, Effect.none )

        ( Create players, _ ) ->
            ( model
            , Time.now
                |> Task.perform (CreateDone << Game.create players)
                |> Effect.fromCmd
            )

        ( CreateDone game, Succeed gameIDs _ ) ->
            ( model
            , Effect.batch
                [ Api.saveGame game
                , Api.saveAllGames (game.id :: gameIDs)
                , Router.push (Router.ToPlayGame game.id)
                ]
            )

        ( CreateDone _, _ ) ->
            ( model, Effect.none )


viewButton : List (Element.Attribute msg) -> Element msg -> Element msg
viewButton attributes child =
    button
        (Element.width (Element.px 46)
            :: Element.height (Element.px 46)
            :: Background.color (Element.rgb255 255 255 255)
            :: Border.rounded 3
            :: Border.width 1
            :: Border.color (Element.rgb255 186 189 182)
            :: Font.center
            :: attributes
        )
        { onPress = Nothing, label = child }



-- V I E W


viewDraft : ( Int, Draft ) -> Element Msg
viewDraft ( position, { inGame, player } ) =
    row
        [ Element.paddingXY 20 5
        , Element.spacing 5
        , Element.width Element.fill
        , Background.color (Player.toColor player.color)
        , if inGame then
            Element.alpha 1

          else
            Element.alpha 0.33
        ]
        [ Input.text
            []
            { onChange = ChangeName position
            , placeholder = Nothing
            , label = Input.labelHidden "Player name"
            , text = player.name
            }
        , viewButton
            [ Events.onClick (Swap position (position - 1))
            ]
            (text "↑")
        , viewButton
            [ Events.onClick (Swap position (position + 1))
            ]
            (text "↓")
        , viewButton
            [ Events.onClick (InGame position)
            ]
            (text "×")
        ]


viewSucceed : List ( Int, Draft ) -> Element Msg
viewSucceed players =
    column
        [ Element.spacing 10
        ]
        [ column
            [ Element.width Element.fill
            , Element.spacing 5
            ]
            (List.map viewDraft players)
        , button
            [ Element.padding 10
            , Element.width Element.fill
            , Background.color Palette.wetAsphalt
            , Font.color Palette.clouds
            , Font.center
            ]
            { onPress =
                players
                    |> List.filterMap
                        (\( _, { inGame, player } ) ->
                            if inGame then
                                Just player

                            else
                                Nothing
                        )
                    |> Cons.fromList
                    |> Maybe.map Create
            , label = text "Create"
            }
            |> el
                [ Element.paddingXY 10 0
                , Element.width Element.fill
                ]
        ]


view : Model -> Element Msg
view model =
    case model of
        Loading ->
            none

        Failure error ->
            el
                [ Element.width Element.fill
                , Font.family [ Font.monospace ]
                , Font.size 10
                ]
                (text (Decode.errorToString error))

        Succeed _ state ->
            viewSucceed (Dict.toList state.players)
