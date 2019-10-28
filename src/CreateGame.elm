module CreateGame exposing (Model, Msg, initial, update, view)

import Api
import Cons exposing (Cons)
import Dict exposing (Dict)
import Effect exposing (Effect)
import Element exposing (Element, column, el, row, text)
import Element.Background as Background
import Element.Border as Border
import Element.Events as Events
import Element.Font as Font
import Element.Input as Input exposing (button)
import Game exposing (Game)
import Player exposing (Player)
import Router
import Task
import Time



-- M O D E L


type alias Draft =
    { inGame : Bool
    , player : Player
    }


type alias Model =
    { players : Dict Int Draft
    }


initial : Model
initial =
    Model
        (Dict.fromList (List.indexedMap (\i x -> ( i, Draft True x )) Player.x6))



-- U P D A T E


type Msg
    = Swap Int Int
    | ChangeName Int String
    | InGame Int
    | Create (Cons Player)
    | CreateDone Game


update : Msg -> Model -> ( Model, Effect Msg )
update msg model =
    case msg of
        Swap from to ->
            let
                count =
                    Dict.size model.players

                fromIndex =
                    modBy count (count + from)

                toIndex =
                    modBy count (count + to)

                nextPlayers =
                    Maybe.map2
                        (\fromDraft toDraft ->
                            model.players
                                |> Dict.insert fromIndex toDraft
                                |> Dict.insert toIndex { fromDraft | inGame = True }
                        )
                        (Dict.get fromIndex model.players)
                        (Dict.get toIndex model.players)
                        |> Maybe.withDefault model.players
            in
            ( { model | players = nextPlayers }
            , Effect.none
            )

        ChangeName index nextName ->
            let
                nextPlayers =
                    Dict.update index
                        (Maybe.map (\{ player } -> Draft True { player | name = nextName }))
                        model.players
            in
            ( { model | players = nextPlayers }
            , Effect.none
            )

        InGame index ->
            let
                nextPlayers =
                    Dict.update index
                        (Maybe.map (\{ inGame, player } -> Draft (not inGame) player))
                        model.players
            in
            ( { model | players = nextPlayers }
            , Effect.none
            )

        Create players ->
            ( model
            , Time.now
                |> Task.perform (CreateDone << Game.create players)
                |> Effect.fromCmd
            )

        CreateDone game ->
            ( model
            , Effect.batch
                [ Api.saveGame game
                , Router.push (Router.ToPlayGame game.id)
                ]
            )


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
        , Background.color (Player.paint player.color)
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


view : Model -> Element Msg
view model =
    let
        players =
            Dict.toList model.players
    in
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
            , Background.color (Element.rgb255 52 73 94)
            , Font.color (Element.rgb255 236 240 241)
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
