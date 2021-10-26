module GameStat.EventsDistributionChart exposing (view)

import Chart
import Chart.Attributes
import Dice
import GameStat.Combination as Combination
import Html exposing (Html)


distributor : Combination.Distributor Dice.Event
distributor =
    [ ( Dice.Yellow, 0.5 / 3 )
    , ( Dice.Blue, 0.5 / 3 )
    , ( Dice.Green, 0.5 / 3 )
    , ( Dice.Black, 0.5 )
    ]
        |> Combination.fromIdeals Dice.toColor


view : List Dice.Event -> Html msg
view turns =
    let
        combinations =
            Combination.toCombinations distributor turns
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
        , Chart.yAxis
            [ Chart.Attributes.noArrow
            ]
        , Chart.yLabels
            [ Chart.Attributes.withGrid
            , Chart.Attributes.ints
            ]
        , List.indexedMap
            (\index combination ->
                let
                    color =
                        Dice.toColor combination.value
                in
                Chart.bars
                    [ Chart.Attributes.x1 (\_ -> toFloat index)
                    , Chart.Attributes.margin 0.25
                    , Chart.Attributes.ungroup
                    ]
                    [ Chart.bar (toFloat << .real)
                        [ Chart.Attributes.color color
                        ]
                    , Chart.stacked
                        [ Chart.bar
                            (toFloat << .idealGap)
                            [ Chart.Attributes.color Chart.Attributes.pink
                            , Chart.Attributes.striped [ Chart.Attributes.spacing 6 ]
                            ]
                        , Chart.bar (toFloat << .ideal)
                            [ Chart.Attributes.color Chart.Attributes.pink
                            , Chart.Attributes.borderWidth 1
                            , Chart.Attributes.opacity 0
                            ]
                        ]
                    ]
                    [ combination ]
            )
            combinations
            |> Chart.list
        ]
