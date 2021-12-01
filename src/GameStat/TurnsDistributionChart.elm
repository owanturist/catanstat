module GameStat.TurnsDistributionChart exposing (Turn, view)

import Chart
import Chart.Attributes
import Dice
import GameStat.Combination as Combination
import Html exposing (Html)


distributor : Combination.Distributor Int
distributor =
    [ ( 2, 1 ) --- 1+1
    , ( 3, 2 ) --- 1+2 2+1
    , ( 4, 3 ) --- 1+3 2+2 3+1
    , ( 5, 4 ) --- 1+4 2+3 3+2 4+1
    , ( 6, 5 ) --- 1+5 2+4 3+3 4+2 5+1
    , ( 7, 6 ) --- 1+6 2+5 3+4 4+3 5+2 6+1
    , ( 8, 5 ) --- 2+6 3+5 4+4 5+3 6+2
    , ( 9, 4 ) --- 3+6 4+5 5+4 6+3
    , ( 10, 3 ) -- 4+6 5+5 6+4
    , ( 11, 2 ) -- 5+6 6+5
    , ( 12, 1 ) -- 6+6

    -- total:      36
    ]
        |> List.map (\( result, count ) -> ( result, count / 36 ))
        |> Combination.fromIdeals String.fromInt


type alias Turn =
    { white : Dice.Number
    , red : Dice.Number
    }


view : List Turn -> Html msg
view turns =
    let
        combinations =
            turns
                |> List.map (\{ white, red } -> Dice.toInt white + Dice.toInt red)
                |> Combination.toCombinations distributor
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
            , Chart.Attributes.amount 11
            , Chart.Attributes.fontSize 12
            ]
        , Chart.yAxis
            [ Chart.Attributes.noArrow
            ]
        , Chart.yLabels
            [ Chart.Attributes.withGrid
            , Chart.Attributes.ints
            , Chart.Attributes.fontSize 12
            ]
        , Chart.bars
            [ Chart.Attributes.ungroup
            , Chart.Attributes.x1 (\{ value } -> toFloat value - 0.5)
            ]
            [ Chart.bar (toFloat << .real)
                [ Chart.Attributes.roundTop 0.25
                ]
            , Chart.stacked
                [ Chart.bar
                    (toFloat << .idealGap)
                    [ Chart.Attributes.color Chart.Attributes.pink
                    , Chart.Attributes.striped [ Chart.Attributes.spacing 6 ]
                    ]
                , Chart.bar (toFloat << .ideal)
                    [ Chart.Attributes.borderWidth 1
                    , Chart.Attributes.opacity 0
                    ]
                ]
            ]
            combinations
        ]
