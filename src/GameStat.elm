module GameStat exposing (Model, Msg, init, update, view)

import Api
import Dice
import Dict exposing (Dict)
import Dict.Any exposing (AnyDict)
import Effect exposing (Effect)
import Element exposing (Element, column, el, link, none, row, table, text)
import Element.Background as Background
import Element.Border as Border
import Element.Font as Font
import Extra exposing (ifelse)
import FontAwesome.Icon exposing (Icon, viewIcon)
import FontAwesome.Solid exposing (dice, listUl, square)
import Game exposing (Game)
import Json.Decode as Decode
import LocalStorage
import Palette
import Round
import Router



-- M O D E L


type alias CombinationsEvents =
    { yellow : Int
    , blue : Int
    , green : Int
    , black : Int
    }


emptyCombinationsEvents : CombinationsEvents
emptyCombinationsEvents =
    CombinationsEvents 0 0 0 0


type alias State =
    { total : Int
    , combinationsNumbers : Dict Int Int
    , overallWhite : AnyDict Int Dice.Number Int
    , overallRed : AnyDict Int Dice.Number Int
    , overallEvents : AnyDict Int Dice.Event Int
    , combinationsEvents : AnyDict Int Dice.Number CombinationsEvents
    }


increment : Maybe Int -> Maybe Int
increment =
    Just << (+) 1 << Maybe.withDefault 0


percent : Int -> Int -> String
percent total x =
    Round.round 2 (100 * toFloat x / toFloat total) ++ "%"


calcCombinationsNumbers : List Game.Move -> Dict Int Int
calcCombinationsNumbers moves =
    List.foldr
        (\{ dice } -> Dict.update (Dice.toInt dice.white + Dice.toInt dice.red) increment)
        Dict.empty
        moves


calcOverallEvents : List Game.Move -> AnyDict Int Dice.Event Int
calcOverallEvents moves =
    List.foldr
        (\{ dice } -> Dict.Any.update dice.event increment)
        (Dict.Any.empty Dice.eventToInt)
        moves


calcOverallNumbers : (Game.Dice -> Dice.Number) -> List Game.Move -> AnyDict Int Dice.Number Int
calcOverallNumbers extractor moves =
    List.foldr
        (\{ dice } -> Dict.Any.update (extractor dice) increment)
        (Dict.Any.empty Dice.toInt)
        moves


calcCombinationsEvents : List Game.Move -> AnyDict Int Dice.Number CombinationsEvents
calcCombinationsEvents moves =
    List.foldr
        (\{ dice } ->
            Dict.Any.update dice.red
                (\events ->
                    let
                        cobminations =
                            Maybe.withDefault emptyCombinationsEvents events
                    in
                    case dice.event of
                        Dice.Yellow ->
                            Just { cobminations | yellow = cobminations.yellow + 1 }

                        Dice.Blue ->
                            Just { cobminations | blue = cobminations.blue + 1 }

                        Dice.Green ->
                            Just { cobminations | green = cobminations.green + 1 }

                        Dice.Black ->
                            Just { cobminations | black = cobminations.black + 1 }
                )
        )
        (Dict.Any.empty Dice.toInt)
        moves


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
                { total = List.length loadedGame.moves
                , combinationsNumbers = calcCombinationsNumbers loadedGame.moves
                , overallWhite = calcOverallNumbers .white loadedGame.moves
                , overallRed = calcOverallNumbers .red loadedGame.moves
                , overallEvents = calcOverallEvents loadedGame.moves
                , combinationsEvents = calcCombinationsEvents loadedGame.moves
                }
            , Effect.none
            )



-- V I E W


viewDiceSide : Palette.Color -> Icon -> Element msg
viewDiceSide color icon =
    el
        [ Font.color color
        , Font.size 32
        ]
        (Element.html (viewIcon icon))


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


viewTableCell : Bool -> Int -> Element msg -> Element msg
viewTableCell first padY =
    el
        [ Element.height Element.fill
        , Element.paddingXY 10 padY
        , Border.widthEach
            { top = 0
            , right = ifelse first 1 0
            , bottom = 1
            , left = 0
            }
        , Border.color Palette.clouds
        ]
        << el
            [ Element.centerY
            , ifelse first Element.alignRight Element.alignLeft
            , Border.color Palette.clouds
            ]


viewCombinationsNumbersTable : Int -> Dict Int Int -> Element msg
viewCombinationsNumbersTable total combinationsNumbers =
    let
        data =
            List.map
                (\combination ->
                    { combination = combination
                    , count = Maybe.withDefault 0 (Dict.get combination combinationsNumbers)
                    }
                )
                (List.range 2 12)
    in
    table
        [ Element.width Element.fill
        , Font.size 16
        ]
        { data = data
        , columns =
            [ { width = Element.shrink
              , header = none
              , view = viewTableCell True 10 << text << String.fromInt << .combination
              }
            , { width = Element.fill
              , header = none
              , view = viewTableCell False 10 << text << String.fromInt << .count
              }
            , { width = Element.fill
              , header = none
              , view = viewTableCell False 10 << text << percent total << .count
              }
            ]
        }


viewOverallEventsTable : Int -> AnyDict Int Dice.Event Int -> Element msg
viewOverallEventsTable total overallEvents =
    let
        data =
            List.map
                (\event ->
                    { event = event
                    , count = Maybe.withDefault 0 (Dict.Any.get event overallEvents)
                    }
                )
                [ Dice.Yellow, Dice.Blue, Dice.Green, Dice.Black ]
    in
    table
        [ Element.width Element.fill
        , Font.size 16
        ]
        { data = data
        , columns =
            [ { width = Element.shrink
              , header = none
              , view =
                    \item ->
                        square
                            |> viewDiceSide (Dice.toColor item.event)
                            |> viewTableCell True 5
              }
            , { width = Element.fill
              , header = none
              , view = viewTableCell False 5 << text << String.fromInt << .count
              }
            , { width = Element.fill
              , header = none
              , view = viewTableCell False 5 << text << percent total << .count
              }
            ]
        }


viewOverallNumbersTable : Palette.Color -> Int -> AnyDict Int Dice.Number Int -> Element msg
viewOverallNumbersTable diceColor total overalNumbers =
    let
        data =
            List.map
                (\number ->
                    { number = number
                    , count = Maybe.withDefault 0 (Dict.Any.get number overalNumbers)
                    }
                )
                Dice.numbers
    in
    table
        [ Element.width Element.fill
        , Font.size 16
        ]
        { data = data
        , columns =
            [ { width = Element.shrink
              , header = none
              , view = viewTableCell True 5 << viewDiceSide diceColor << Dice.toIcon << .number
              }
            , { width = Element.fill
              , header = none
              , view = viewTableCell False 5 << text << String.fromInt << .count
              }
            , { width = Element.fill
              , header = none
              , view = viewTableCell False 5 << text << percent total << .count
              }
            ]
        }


viewCombinationsTable : AnyDict Int Dice.Number CombinationsEvents -> Element msg
viewCombinationsTable combinationsEvents =
    let
        data =
            List.map
                (\number ->
                    { number = number
                    , count = Maybe.withDefault emptyCombinationsEvents (Dict.Any.get number combinationsEvents)
                    }
                )
                Dice.numbers

        columns =
            List.map
                (\( extractor, event ) ->
                    { width = Element.fill
                    , header =
                        square
                            |> viewDiceSide (Dice.toColor event)
                            |> viewTableCell False 5
                    , view = viewTableCell False 5 << text << String.fromInt << extractor << .count
                    }
                )
                [ ( .yellow, Dice.Yellow )
                , ( .blue, Dice.Blue )
                , ( .green, Dice.Green )
                , ( .black, Dice.Black )
                ]
    in
    table
        [ Element.width Element.fill
        , Font.size 16
        ]
        { data = data
        , columns =
            { width = Element.shrink
            , header = viewTableCell True 5 none
            , view = viewTableCell True 5 << viewDiceSide Palette.pomegranate << Dice.toIcon << .number
            }
                :: columns
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
                [ Element.padding 10
                , Element.spacing 20
                , Element.width Element.fill
                ]
                [ row
                    [ Element.spacing 10
                    ]
                    [ viewLink (Router.ToPlayGame gameID) dice "play"
                    , viewLink (Router.ToGameLog gameID) listUl "logs"
                    ]
                , viewCombinationsNumbersTable state.total state.combinationsNumbers
                , viewOverallNumbersTable Palette.concrete state.total state.overallWhite
                , viewOverallNumbersTable Palette.pomegranate state.total state.overallRed
                , viewOverallEventsTable state.total state.overallEvents
                , viewCombinationsTable state.combinationsEvents
                ]
