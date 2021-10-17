module GameStat.TurnsDuration exposing (Model, view)

import Chart
import Chart.Attributes
import Chart.Svg
import Html exposing (Html)
import Html.Attributes
import Html.Lazy
import Player exposing (Player)



-- M O D E L


type alias Model =
    { turns : List Int
    , players : List Player
    }



-- V I E W


type alias Turn =
    { index : Int
    , duration : Int
    , player : Player
    }


buildTurnsDurationData : List Int -> List Player -> List Turn
buildTurnsDurationData turns players =
    let
        totalTurnsCount =
            List.length turns

        totalRoundsCount =
            -- that's fine if it is longer than turns
            1 + totalTurnsCount // List.length players

        indexes =
            List.range 1 totalTurnsCount

        playersSequence =
            List.concat (List.repeat totalRoundsCount players)
    in
    List.map3 Turn indexes turns playersSequence


playerToBarColor : Player.Color -> String
playerToBarColor color =
    case color of
        Player.White ->
            Chart.Attributes.gray

        Player.Red ->
            Chart.Attributes.red

        Player.Blue ->
            Chart.Attributes.blue

        Player.Yellow ->
            Chart.Attributes.yellow

        Player.Green ->
            Chart.Attributes.green

        Player.Brown ->
            Chart.Attributes.brown


viewBar : Turn -> Chart.Element Turn msg
viewBar turn =
    let
        color =
            playerToBarColor turn.player.color

        position =
            { x1 = toFloat turn.index - 0.4
            , x2 = toFloat turn.index + 0.4
            , y1 = 0
            , y2 = toFloat turn.duration
            }
    in
    Chart.custom
        { name = turn.player.name
        , color = color
        , position = position
        , format = always "ms"
        , data = turn
        , render =
            \plane ->
                Chart.Svg.bar plane
                    [ Chart.Attributes.color color
                    , Chart.Attributes.roundTop 1
                    ]
                    position
        }


viewChart : List Int -> List Player -> Html msg
viewChart turns players =
    let
        xMax =
            List.length turns

        yMax =
            Maybe.withDefault 0 (List.maximum turns)
    in
    Chart.chart
        [ Chart.Attributes.width 400
        , Chart.Attributes.height 300
        , Chart.Attributes.margin
            { top = 0
            , bottom = 20
            , left = 0
            , right = 10
            }

        -- x-axis range
        , Chart.Attributes.range
            [ Chart.Attributes.lowest 0.5 Chart.Attributes.exactly
            , Chart.Attributes.highest (toFloat xMax + 0.5) Chart.Attributes.orHigher
            ]

        -- y-axis domain
        , Chart.Attributes.domain
            [ Chart.Attributes.lowest 0 Chart.Attributes.exactly
            , Chart.Attributes.highest (toFloat yMax) Chart.Attributes.orHigher
            ]
        ]
        [ Chart.xAxis
            [ Chart.Attributes.noArrow
            ]
        , Chart.xLabels
            [ Chart.Attributes.withGrid
            , Chart.Attributes.ints
            ]
        , Chart.yAxis
            [ Chart.Attributes.noArrow
            ]
        , buildTurnsDurationData turns players
            |> List.map viewBar
            |> Chart.list
        ]


view : Model -> Html msg
view { turns, players } =
    Html.div
        [ Html.Attributes.class "w-[400px] p-2"
        ]
        [ Html.Lazy.lazy2 viewChart turns players
        ]
