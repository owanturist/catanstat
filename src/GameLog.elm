module GameLog exposing (Model, Msg, init, update, view)

import Api
import Cons exposing (Cons)
import Dice
import Dict.Any exposing (AnyDict)
import Effect exposing (Effect)
import Element exposing (Element, column, el, link, none, row, text)
import Element.Background as Background
import Element.Border as Border
import Element.Font as Font
import Extra exposing (formatMilliseconds)
import FontAwesome.Icon exposing (Icon, viewIcon)
import FontAwesome.Solid exposing (chartPie, dice, square)
import Game exposing (Game)
import Json.Decode as Decode
import LocalStorage
import Palette
import Player exposing (Player)
import Router
import Time



-- M O D E L


type alias Turn =
    { index : Int
    , player : Player.Color
    , dice : Game.Dice
    , duration : Int
    }


gameToTurns : Game -> List Turn
gameToTurns game =
    List.foldr
        (\move { index, startAt, turns } ->
            { index = index + 1
            , startAt = move.endAt
            , turns =
                { index = index
                , player = move.player
                , dice = move.dice
                , duration = Time.posixToMillis move.endAt - Time.posixToMillis startAt
                }
                    :: turns
            }
        )
        { index = 1
        , startAt = game.startAt
        , turns = []
        }
        game.moves
        |> .turns


playersToDict : Cons Player -> AnyDict Int Player.Color Player
playersToDict players =
    players
        |> Cons.foldr (\player acc -> ( player.color, player ) :: acc) []
        |> Dict.Any.fromList Player.colorToInt


countPlayers : State -> List ( Int, Player )
countPlayers state =
    let
        durations =
            List.foldr
                (\turn ->
                    Dict.Any.update turn.player
                        (Just << (+) turn.duration << Maybe.withDefault 0)
                )
                (Dict.Any.empty Player.colorToInt)
                state.turns
    in
    Cons.filterMap
        (\playerColor ->
            Maybe.map2 Tuple.pair
                (Dict.Any.get playerColor durations)
                (Dict.Any.get playerColor state.players)
        )
        state.sequence


type alias State =
    { turns : List Turn
    , players : AnyDict Int Player.Color Player
    , sequence : Cons Player.Color
    }


type Model
    = Loading
    | Failure Decode.Error
    | Succeed State


init : Game.ID -> ( Model, Effect Msg )
init gameID =
    ( Loading
    , Api.loadGame gameID
        |> Effect.map LoadGame
    )



-- U P D A T E


type Msg
    = LoadGame (Result LocalStorage.Error Game)


update : Msg -> Model -> ( Model, Effect Msg )
update msg model =
    case ( msg, model ) of
        ( LoadGame (Err LocalStorage.NotFound), _ ) ->
            ( model
            , Router.replace Router.ToCreateGame
            )

        ( LoadGame (Err (LocalStorage.DecodeError error)), _ ) ->
            ( Failure error
            , Effect.none
            )

        ( LoadGame (Ok loadedGame), _ ) ->
            ( Succeed
                { turns = gameToTurns loadedGame
                , players = playersToDict loadedGame.players
                , sequence = Cons.map .color loadedGame.players
                }
            , Effect.none
            )



-- V I E W


viewDice : Palette.Color -> Icon -> Element msg
viewDice color icon =
    el
        [ Font.color color
        , Font.size 32
        ]
        (Element.html (viewIcon icon))


viewTurn : Turn -> Player -> Element msg
viewTurn turn player =
    row
        [ Element.width Element.fill
        , Element.spacing 10
        , Element.paddingEach
            { top = 10
            , right = 20
            , bottom = 10
            , left = 10
            }
        , Border.color Palette.silver
        , Border.widthEach
            { top = 1
            , right = 0
            , bottom = 0
            , left = 0
            }
        , Font.size 24
        ]
        [ text (String.fromInt turn.index)
        , viewDice Palette.concrete (Dice.toIcon turn.dice.white)
        , viewDice Palette.pomegranate (Dice.toIcon turn.dice.red)
        , viewDice (Dice.toColor turn.dice.event) square
        , el [] (text (formatMilliseconds turn.duration))
        ]
        |> el
            [ Element.width Element.fill
            , Border.color (Player.toColor player.color)
            , Border.widthEach
                { top = 0
                , right = 0
                , bottom = 0
                , left = 20
                }
            ]


viewPlayer : ( Int, Player ) -> Element Msg
viewPlayer ( duration, player ) =
    formatMilliseconds duration
        |> text
        |> el
            [ Element.centerX
            , Element.centerY
            ]
        |> el
            [ Element.width Element.fill
            , Element.height (Element.px 60)
            , Background.color (Player.toColor player.color)
            , Font.color Palette.clouds
            ]


viewPlayers : List ( Int, Player ) -> Element Msg
viewPlayers players =
    row
        [ Element.width Element.fill
        ]
        (List.map viewPlayer players)


viewLink : Router.Route -> Icon -> String -> Element msg
viewLink route icon label =
    link
        [ Element.paddingXY 15 5
        , Border.rounded 6
        , Background.color Palette.amethyst
        , Font.color Palette.clouds
        ]
        { url = Router.toPath route
        , label =
            row
                [ Element.spacing 10
                ]
                [ viewIcon icon
                    |> Element.html
                    |> el []
                , text label
                ]
        }


view : Game.ID -> Model -> Element Msg
view gameID model =
    case model of
        Loading ->
            none

        Failure error ->
            text (Decode.errorToString error)

        Succeed state ->
            column
                [ Element.width Element.fill
                , Element.height Element.fill
                , Element.spacing 10
                ]
                [ viewPlayers (countPlayers state)
                , row
                    [ Element.width Element.fill
                    , Element.paddingXY 10 0
                    , Element.spacing 10
                    ]
                    [ viewLink (Router.ToPlayGame gameID) dice "play"
                    , viewLink (Router.ToGameStat gameID) chartPie "stat"
                    ]
                , state.turns
                    |> List.filterMap
                        (\turn ->
                            Maybe.map
                                (viewTurn turn)
                                (Dict.Any.get turn.player state.players)
                        )
                    |> column
                        [ Element.width Element.fill
                        , Element.height Element.shrink
                        ]
                ]
