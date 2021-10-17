module GameStat.TotalDurationTable exposing (view)

import Extra exposing (formatMilliseconds)
import Html exposing (Html)
import Html.Attributes
import Icon
import Player exposing (Player)
import Round


buildPlayersDurationData : List Int -> List Player -> List ( Player, Int )
buildPlayersDurationData turns players =
    let
        totalPlayersCount =
            List.length players

        countPlayerDuration : Int -> List Int -> Int
        countPlayerDuration acc remainingTurns =
            case List.head remainingTurns of
                Nothing ->
                    acc

                Just duration ->
                    countPlayerDuration
                        (acc + duration)
                        (List.drop totalPlayersCount remainingTurns)
    in
    List.indexedMap
        (\index player -> ( player, countPlayerDuration 0 (List.drop index turns) ))
        players


view : List Int -> List Player -> Html msg
view turns players =
    let
        totalDuration =
            List.sum turns

        formatPercent : Int -> String
        formatPercent duration =
            Round.round 2 (100 * toFloat duration / toFloat totalDuration) ++ "%"
    in
    Html.table
        []
        [ Html.thead []
            [ Html.tr []
                [ Html.td [] []
                , Html.td [] [ Html.text "Name" ]
                , Html.td [] [ Html.text "Total duration" ]
                , Html.td [] [ Html.text "Percent" ]
                ]
            ]
        , Html.tbody []
            (List.map
                (\( player, duration ) ->
                    Html.tr []
                        [ Html.td
                            [ Html.Attributes.style "color" (Player.toHex player.color) ]
                            [ Icon.square ]
                        , Html.td [] [ Html.text player.name ]
                        , Html.td [] [ Html.text (formatMilliseconds duration) ]
                        , Html.td [] [ Html.text (formatPercent duration) ]
                        ]
                )
                (buildPlayersDurationData turns players)
            )
        , Html.tfoot
            []
            [ Html.tr []
                [ Html.td [] []
                , Html.td [] [ Html.text "Total" ]
                , Html.td [] [ Html.text (formatMilliseconds totalDuration) ]
                ]
            ]
        ]
