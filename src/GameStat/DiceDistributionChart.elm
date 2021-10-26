module GameStat.DiceDistributionChart exposing (view)

import Chart
import Chart.Attributes
import Dice
import GameStat.Combination as Combination
import Html exposing (Html)


distributor : Combination.Distributor Dice.Number
distributor =
    [ Dice.One
    , Dice.Two
    , Dice.Three
    , Dice.Four
    , Dice.Five
    , Dice.Six
    ]
        |> List.map (\number -> ( number, 1 / 6 ))
        |> Combination.fromIdeals (String.fromInt << Dice.toInt)


type alias Turn value =
    { red : value
    , white : value
    }


view : List (Turn Dice.Number) -> Html msg
view turns =
    let
        combinationsRed =
            Combination.toCombinations distributor (List.map .red turns)

        combinationsWhite =
            Combination.toCombinations distributor (List.map .white turns)

        combinations =
            List.map2 Turn combinationsRed combinationsWhite
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
            [ Chart.Attributes.margin 0.25
            ]
            [ Chart.bar (toFloat << .real << .white)
                [ Chart.Attributes.color Chart.Attributes.darkGray
                , Chart.Attributes.opacity 0.5
                ]
            , Chart.bar (toFloat << .real << .red)
                [ Chart.Attributes.color Chart.Attributes.red
                ]
            ]
            combinations
        , Chart.bars
            [ Chart.Attributes.margin 0.25
            ]
            [ Chart.stacked
                [ Chart.bar
                    (\{ white } -> toFloat (white.idealMax - white.idealMin))
                    [ Chart.Attributes.color Chart.Attributes.pink
                    , Chart.Attributes.striped [ Chart.Attributes.spacing 6 ]
                    ]
                , Chart.bar (toFloat << .idealMin << .white)
                    [ Chart.Attributes.color Chart.Attributes.pink
                    , Chart.Attributes.borderWidth 1
                    , Chart.Attributes.opacity 0
                    ]
                ]
            ]
            combinations
        ]
