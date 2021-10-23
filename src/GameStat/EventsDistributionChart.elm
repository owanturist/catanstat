module GameStat.EventsDistributionChart exposing (view)

import Chart
import Chart.Attributes
import Dice
import Dict exposing (Dict)
import Html exposing (Html)


type alias Combination =
    { value : Dice.Event
    , real : Int
    , idealMin : Int
    , idealMax : Int
    }


idealCombinaitons : Dict String Float
idealCombinaitons =
    [ ( Dice.Yellow, 0.5 / 3 )
    , ( Dice.Blue, 0.5 / 3 )
    , ( Dice.Green, 0.5 / 3 )
    , ( Dice.Black, 0.5 )
    ]
        |> List.map (Tuple.mapFirst Dice.toColor)
        |> Dict.fromList


collectDistribution : List Dice.Event -> List Combination
collectDistribution turns =
    let
        totalTurnsCount =
            List.length turns

        counts =
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
    in
    List.map
        (\event ->
            let
                color =
                    Dice.toColor event

                ideal =
                    toFloat totalTurnsCount * Maybe.withDefault 0 (Dict.get color idealCombinaitons)
            in
            { value = event
            , real = Maybe.withDefault 0 (Dict.get color counts)
            , idealMin = floor ideal
            , idealMax = ceiling ideal
            }
        )
        [ Dice.Yellow, Dice.Blue, Dice.Green, Dice.Black ]


view : List Dice.Event -> Html msg
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
                            (\{ idealMin, idealMax } -> toFloat (idealMax - idealMin))
                            [ Chart.Attributes.color Chart.Attributes.pink
                            , Chart.Attributes.striped [ Chart.Attributes.spacing 6 ]
                            ]
                        , Chart.bar (toFloat << .idealMin)
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
