module GameStat.TurnsValueChart exposing (view)

import Chart
import Chart.Attributes
import Dice
import Dict exposing (Dict)
import Html exposing (Html)


type alias Combination =
    { value : Int
    , real : Int
    , ideal : Float
    }


idealCombinaitons : Dict Int Float
idealCombinaitons =
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
        |> List.map (Tuple.mapSecond (\count -> count / 36))
        |> Dict.fromList


buildCombinations : List ( Dice.Number, Dice.Number ) -> List Combination
buildCombinations turns =
    let
        totalTurnsCount =
            max 1 (List.length turns)

        turnsDict =
            List.foldl
                (\( left, right ) acc ->
                    let
                        key =
                            Dice.toInt left + Dice.toInt right

                        value =
                            Maybe.withDefault 0 (Dict.get key acc)
                    in
                    Dict.insert key (value + 1) acc
                )
                Dict.empty
                turns
    in
    List.map
        (\value ->
            let
                idealCombinaiton =
                    Maybe.withDefault 0 (Dict.get value idealCombinaitons)
            in
            { value = value
            , real = Maybe.withDefault 0 (Dict.get value turnsDict)
            , ideal = idealCombinaiton * toFloat totalTurnsCount
            }
        )
        (List.range 2 12)


view : List ( Dice.Number, Dice.Number ) -> Html msg
view turns =
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
            ]
        , Chart.yAxis
            [ Chart.Attributes.noArrow
            ]
        , Chart.yLabels
            [ Chart.Attributes.withGrid
            , Chart.Attributes.ints
            ]
        , Chart.bars
            [ Chart.Attributes.ungroup
            , Chart.Attributes.x1 (\{ value } -> toFloat value - 0.5)
            ]
            [ Chart.bar (toFloat << .real) []
            , Chart.bar .ideal
                [ Chart.Attributes.striped []
                ]
            ]
            (buildCombinations turns)
        ]
