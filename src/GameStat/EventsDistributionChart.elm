module GameStat.EventsDistributionChart exposing (view)

import Chart
import Chart.Attributes
import Dice
import Dict exposing (Dict)
import Html exposing (Html)


collectDistribution : List Dice.Event -> Dict String Int
collectDistribution turns =
    List.foldl
        (\event acc ->
            let
                color =
                    Dice.toColor event

                count =
                    Maybe.withDefault 0 (Dict.get color acc)
            in
            Dict.insert color (count + 1) acc
        )
        Dict.empty
        turns


view : List Dice.Event -> Html msg
view turns =
    let
        distrubution =
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
        , Chart.yAxis
            [ Chart.Attributes.noArrow
            ]
        , Chart.yLabels
            [ Chart.Attributes.withGrid
            , Chart.Attributes.ints
            ]
        , Chart.bars
            [ Chart.Attributes.x1 (always 0.5)
            , Chart.Attributes.margin 0.25
            ]
            (List.map
                (\event ->
                    let
                        color =
                            Dice.toColor event

                        count =
                            Maybe.withDefault 0 (Dict.get color distrubution)
                    in
                    Chart.bar (\_ -> toFloat count)
                        [ Chart.Attributes.color color
                        , Chart.Attributes.borderWidth 1
                        , Chart.Attributes.opacity 0.5
                        ]
                )
                [ Dice.Yellow, Dice.Blue, Dice.Green, Dice.Black ]
            )
            [ () ]
        ]
