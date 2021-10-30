module GameStat.EventsDieDistributionChart exposing (view)

import Chart
import Chart.Attributes
import Dice
import Dict exposing (Dict)
import Html exposing (Html)
import Svg
import Svg.Attributes


collectEventsPerDie : List ( Dice.Number, Dice.Event ) -> Dict Int (Dict String Int)
collectEventsPerDie turns =
    List.foldl
        (\( die, event ) dict ->
            let
                num =
                    Dice.toInt die

                color =
                    Dice.toColor event

                eventsDict =
                    Maybe.withDefault Dict.empty (Dict.get num dict)

                eventCount =
                    Maybe.withDefault 0 (Dict.get color eventsDict)
            in
            Dict.insert num (Dict.insert color (eventCount + 1) eventsDict) dict
        )
        Dict.empty
        turns


view : List ( Dice.Number, Dice.Event ) -> Html msg
view turns =
    let
        eventsPerDie =
            collectEventsPerDie turns
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
            , Chart.Attributes.fontSize 0
            ]
        , Dice.numbers
            |> List.indexedMap
                (\index die ->
                    Chart.svgAt
                        (Chart.Attributes.percent (100 / 6 * toFloat index))
                        Chart.Attributes.zero
                        10
                        5
                        [ Svg.g
                            [ Svg.Attributes.transform "scale(0.1)"
                            , Svg.Attributes.color Chart.Attributes.red
                            ]
                            [ Dice.toIcon die ]
                        ]
                )
            |> Chart.list
        , Chart.yAxis
            [ Chart.Attributes.noArrow
            ]
        , Chart.yLabels
            [ Chart.Attributes.withGrid
            , Chart.Attributes.ints
            , Chart.Attributes.fontSize 12
            ]
        , Chart.bars
            [ Chart.Attributes.margin 0.25
            ]
            (List.map
                (\event ->
                    Chart.barMaybe
                        (\num ->
                            Dict.get num eventsPerDie
                                |> Maybe.andThen (Dict.get (Dice.toColor event))
                                |> Maybe.map toFloat
                        )
                        [ Chart.Attributes.color (Dice.toColor event)
                        , Chart.Attributes.roundTop 0.25
                        ]
                )
                [ Dice.Yellow, Dice.Blue, Dice.Green, Dice.Black ]
            )
            (List.map Dice.toInt Dice.numbers)
        ]
