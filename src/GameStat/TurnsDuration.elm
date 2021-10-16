module GameStat.TurnsDuration exposing (Model, view)

import Chart
import Chart.Attributes
import Html exposing (Html)
import Html.Attributes
import Player exposing (Player)



-- M O D E L


type alias Model =
    { turns : List Int
    , players : List Player
    }



-- V I E W


type alias Round =
    List Int


getTurnDurationFor : Int -> Round -> Maybe Int
getTurnDurationFor index round =
    List.head (List.drop index round)


buildRounds : List Int -> List Player -> List Round
buildRounds turns players =
    let
        totalPlayersCount =
            List.length players

        buildRoundsInner : List Int -> List Round -> List Round
        buildRoundsInner remainingTurns acc =
            if List.isEmpty remainingTurns then
                acc

            else
                buildRoundsInner
                    (List.drop totalPlayersCount remainingTurns)
                    (List.take totalPlayersCount remainingTurns :: acc)
    in
    List.reverse (buildRoundsInner turns [])


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


view : Model -> Html msg
view { turns, players } =
    let
        totalPlayersCount =
            List.length players
    in
    Html.div
        [ Html.Attributes.class "w-[400px] p-2"
        ]
        [ Chart.chart
            [ Chart.Attributes.width 400
            , Chart.Attributes.height 300
            ]
            [ Chart.xAxis
                [ Chart.Attributes.noArrow
                ]
            , Chart.xLabels []
            , Chart.yAxis
                [ Chart.Attributes.noArrow
                ]
            , Chart.bars
                [ Chart.Attributes.margin 0
                , Chart.Attributes.spacing 0
                ]
                (List.indexedMap
                    (\index player ->
                        let
                            playerIndex =
                                modBy totalPlayersCount index
                        in
                        Chart.barMaybe
                            (Maybe.map toFloat << getTurnDurationFor playerIndex)
                            [ Chart.Attributes.color (playerToBarColor player.color)
                            ]
                    )
                    players
                )
                (buildRounds turns players)
            ]
        ]
