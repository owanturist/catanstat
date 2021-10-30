module GameStat.TotalDurationTable exposing (view)

import Extra exposing (formatMilliseconds)
import Html exposing (Html)
import Html.Attributes
import ID
import Icon
import Player exposing (Player)
import Round
import Table


buildPlayersDurationData : List Int -> List Player -> List ( Player, Int )
buildPlayersDurationData turnsDuration players =
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
        (\index player -> ( player, countPlayerDuration 0 (List.drop index turnsDuration) ))
        players


view : List Int -> List Player -> Html msg
view turnsDuration players =
    let
        totalDuration =
            List.sum turnsDuration

        formatPercent : Int -> String
        formatPercent duration =
            Round.round 2 (100 * toFloat duration / toFloat totalDuration) ++ "%"
    in
    Table.empty
        |> Table.withKey (ID.toString << .id << Tuple.first)
        |> Table.withColumn
            []
            (\( player, _ ) ->
                [ Html.span
                    [ Html.Attributes.style "color" (Player.toHex player.color)
                    ]
                    [ Icon.square ]
                ]
            )
        |> Table.withColumn
            [ Html.text "Name" ]
            (\( player, _ ) -> [ Html.text player.name ])
        |> Table.withColumn
            [ Html.text "Duration" ]
            (\( _, duration ) -> [ Html.text (formatMilliseconds duration) ])
        |> Table.withColumn
            [ Html.text "Percent" ]
            (\( _, duration ) -> [ Html.text (formatPercent duration) ])
        |> Table.render (buildPlayersDurationData turnsDuration players)
