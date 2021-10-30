module GameStat.TurnsDurationChart exposing (view)

import Chart
import Chart.Attributes
import Extra exposing (formatMilliseconds)
import Html exposing (Html)
import Player exposing (Player)



-- M O D E L


type alias Turn =
    { duration : Int
    , player : Player
    }


buildTurnsDurationData : List Int -> List Player -> List Turn
buildTurnsDurationData turnsDuration players =
    let
        totalTurnsCount =
            List.length turnsDuration

        totalRoundsCount =
            -- that's fine if it is longer than turnsDuration
            1 + totalTurnsCount // List.length players

        playersSequence =
            List.concat (List.repeat totalRoundsCount players)
    in
    List.map2 Turn turnsDuration playersSequence


viewBar : Int -> Turn -> Chart.Element Turn msg
viewBar index turn =
    Chart.bars
        [ Chart.Attributes.x1 (\_ -> toFloat (index + 1))
        , Chart.Attributes.margin 0.25
        , Chart.Attributes.ungroup
        ]
        [ Chart.bar (toFloat << .duration)
            [ Chart.Attributes.color (Player.toHex turn.player.color)
            , Chart.Attributes.roundTop 0.25
            ]
        ]
        [ turn ]


view : List Int -> List Player -> Html msg
view turnsDuration players =
    Chart.chart
        [ Chart.Attributes.width 400
        , Chart.Attributes.height 300
        , Chart.Attributes.margin
            { top = 0
            , bottom = 20
            , left = 50
            , right = 10
            }

        -- x-axis range
        , Chart.Attributes.range
            [ Chart.Attributes.lowest 1 Chart.Attributes.exactly
            , Chart.Attributes.highest 10 Chart.Attributes.orHigher
            ]
        , Chart.Attributes.domain
            [ Chart.Attributes.highest 60000 Chart.Attributes.orHigher
            ]
        ]
        [ Chart.xAxis
            [ Chart.Attributes.noArrow
            ]
        , Chart.xLabels
            [ Chart.Attributes.withGrid
            , Chart.Attributes.ints
            , Chart.Attributes.fontSize 12
            ]
        , Chart.yAxis
            [ Chart.Attributes.noArrow
            ]
        , Chart.yLabels
            [ Chart.Attributes.format (formatMilliseconds << floor)
            , Chart.Attributes.fontSize 12
            ]
        , buildTurnsDurationData turnsDuration players
            |> List.indexedMap viewBar
            |> Chart.list
        ]
