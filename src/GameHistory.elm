module GameHistory exposing (Model, Msg, init, update, view)

import Api
import Cons exposing (Cons)
import DateFormat
import Dict.Any exposing (AnyDict)
import Effect exposing (Effect)
import Element exposing (Element, column, el, link, none, row, text)
import Element.Background as Background
import Element.Border as Border
import Element.Font as Font
import FontAwesome.Icon exposing (viewIcon)
import FontAwesome.Solid exposing (plus, trophy)
import Game exposing (Game)
import ID
import Json.Decode as Decode
import LocalStorage
import Palette
import Player exposing (Player)
import Router
import Task
import Time



-- M O D E L


type alias State =
    { sequence : List Game.ID
    , games : AnyDict String Game.ID Game
    , zone : Time.Zone
    }


type Model
    = Loading
    | Failure Decode.Error
    | Succeed State


init : ( Model, Effect Msg )
init =
    ( Loading
    , Api.loadAllGames
        |> Effect.map LoadAllGames
    )



-- U P D A T E


type Msg
    = LoadAllGames (Result LocalStorage.Error (List Game.ID))
    | LoadGame Game.ID (Result LocalStorage.Error Game)
    | GetZone Time.Zone


update : Msg -> Model -> ( Model, Effect Msg )
update msg model =
    case ( msg, model ) of
        ( LoadAllGames (Err LocalStorage.NotFound), _ ) ->
            ( Succeed
                { sequence = []
                , games = Dict.Any.empty ID.toString
                , zone = Time.utc
                }
            , Time.here
                |> Task.perform GetZone
                |> Effect.fromCmd
            )

        ( LoadAllGames (Err (LocalStorage.DecodeError error)), _ ) ->
            ( Failure error
            , Effect.none
            )

        ( LoadAllGames (Ok gameIDs), _ ) ->
            ( Succeed
                { sequence = gameIDs
                , games = Dict.Any.empty ID.toString
                , zone = Time.utc
                }
            , Effect.batch
                [ Time.here
                    |> Task.perform GetZone
                    |> Effect.fromCmd
                , gameIDs
                    |> List.map (\gameID -> Effect.map (LoadGame gameID) (Api.loadGame gameID))
                    |> Effect.batch
                ]
            )

        ( LoadGame gameID (Err LocalStorage.NotFound), Succeed state ) ->
            ( Succeed { state | sequence = List.filter ((/=) gameID) state.sequence }
            , Effect.none
            )

        ( LoadGame _ (Err (LocalStorage.DecodeError error)), _ ) ->
            ( Failure error
            , Effect.none
            )

        ( LoadGame _ (Ok game), Succeed state ) ->
            ( Succeed { state | games = Dict.Any.insert game.id game state.games }
            , Effect.none
            )

        ( LoadGame _ _, _ ) ->
            ( model, Effect.none )

        ( GetZone zone, Succeed state ) ->
            ( Succeed { state | zone = zone }
            , Effect.none
            )

        ( GetZone _, _ ) ->
            ( model, Effect.none )



-- V I E W


formatDate : Time.Zone -> Time.Posix -> String
formatDate =
    DateFormat.format
        [ DateFormat.hourMilitaryFixed
        , DateFormat.text ":"
        , DateFormat.minuteFixed
        , DateFormat.text ", "
        , DateFormat.dayOfMonthNumber
        , DateFormat.text " "
        , DateFormat.monthNameAbbreviated
        , DateFormat.text " "
        , DateFormat.yearNumber
        ]


viewPlayer : Bool -> Player -> Element msg
viewPlayer winner player =
    el
        [ Element.width (Element.px 30)
        , Element.height (Element.px 30)
        , Background.color (Player.toColor player.color)
        , Font.color Palette.clouds
        , Border.rounded 3
        ]
        (if winner then
            viewIcon trophy
                |> Element.html
                |> el
                    [ Element.centerX
                    , Element.centerY
                    , Font.size 15
                    ]

         else
            none
        )


viewPlayers : Maybe Player.Color -> Cons Player -> Element msg
viewPlayers winnerColor players =
    row
        [ Element.spacing 5
        ]
        (List.map
            (\player -> viewPlayer (winnerColor == Just player.color) player)
            (Cons.toList players)
        )


viewGame : Time.Zone -> Game -> Element msg
viewGame zone game =
    link
        [ Element.padding 10
        , Element.width Element.fill
        , Background.color Palette.clouds
        , Border.rounded 6
        ]
        { url = Router.toPath (Router.ToPlayGame game.id)
        , label =
            row
                [ Element.width Element.fill
                ]
                [ case game.status of
                    Game.InGame ->
                        viewPlayers Nothing game.players

                    Game.Finished _ winner ->
                        viewPlayers (Just winner) game.players
                , formatDate zone game.startAt
                    |> text
                    |> el
                        [ Element.alignRight
                        , Font.color Palette.concrete
                        , Font.size 16
                        ]
                ]
        }


viewSucceed : State -> Element msg
viewSucceed state =
    column
        [ Element.width Element.fill
        , Element.padding 10
        , Element.spacing 10
        ]
        [ link
            [ Element.width Element.fill
            , Element.padding 15
            , Border.rounded 6
            , Background.color Palette.peterRiver
            , Font.color Palette.clouds
            ]
            { url = Router.toPath Router.ToCreateGame
            , label =
                row
                    [ Element.spacing 10
                    , Element.centerX
                    ]
                    [ viewIcon plus
                        |> Element.html
                        |> el []
                    , text "Create new Game!"
                    ]
            }
        , if List.isEmpty state.sequence then
            text "You don't have any games!"
                |> el
                    [ Element.centerX
                    , Element.centerY
                    ]
                |> el
                    [ Element.width Element.fill
                    , Element.height (Element.px 200)
                    , Background.color Palette.clouds
                    , Font.color Palette.concrete
                    , Font.size 24
                    ]

          else
            column
                [ Element.width Element.fill
                , Element.spacing 10
                ]
                (List.filterMap
                    (\gameID ->
                        Maybe.map
                            (viewGame state.zone)
                            (Dict.Any.get gameID state.games)
                    )
                    state.sequence
                )
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

        Succeed state ->
            viewSucceed state
