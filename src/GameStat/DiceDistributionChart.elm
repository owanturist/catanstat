module GameStat.DiceDistributionChart exposing (view)

import Chart
import Chart.Attributes
import Dice
import Dict exposing (Dict)
import Html exposing (Html)


type alias Distribution =
    { value : Int
    , white : Int
    , red : Int
    }


collectDistribution : List Turn -> List Distribution
collectDistribution turns =
    let
        collectPerDice : (Turn -> Dice.Number) -> Dict Int Int
        collectPerDice extract =
            List.foldl
                (\dice acc ->
                    let
                        value =
                            Dice.toInt (extract dice)

                        count =
                            Maybe.withDefault 0 (Dict.get value acc)
                    in
                    Dict.insert value (count + 1) acc
                )
                Dict.empty
                turns

        whites =
            collectPerDice .white

        reds =
            collectPerDice .red
    in
    List.map
        (\value ->
            { value = value
            , white = Maybe.withDefault 0 (Dict.get value whites)
            , red = Maybe.withDefault 0 (Dict.get value reds)
            }
        )
        (List.range 1 6)


type alias Turn =
    { red : Dice.Number
    , white : Dice.Number
    }


view : List Turn -> Html msg
view turns =
    let
        combinations =
            collectDistribution turns
    in
    Chart.chart
        [ Chart.Attributes.width 400
        , Chart.Attributes.height 300
        , Chart.Attributes.margin
            { top = 10
            , bottom = 20
            , left = 30
            , right = 10
            }
        ]
        [ Chart.xAxis
            [ Chart.Attributes.noArrow
            ]
        , Chart.xLabels
            [ Chart.Attributes.withGrid
            , Chart.Attributes.ints
            , Chart.Attributes.amount 6
            ]
        , Chart.yAxis
            [ Chart.Attributes.noArrow
            ]
        , Chart.yLabels
            [ Chart.Attributes.withGrid
            , Chart.Attributes.ints
            ]
        , Chart.bars
            [ Chart.Attributes.x1 (\{ value } -> toFloat value - 0.5)
            , Chart.Attributes.margin 0.25
            ]
            [ Chart.bar (toFloat << .white)
                [ Chart.Attributes.color Chart.Attributes.darkGray
                , Chart.Attributes.borderWidth 1
                , Chart.Attributes.opacity 0.5
                ]
            , Chart.bar (toFloat << .red)
                [ Chart.Attributes.color Chart.Attributes.red
                ]
            ]
            combinations
        ]
