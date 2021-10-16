module GameStat.TurnsDuration exposing (Model, view)

import Html exposing (Html)
import LineChart
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

        indexesSequence =
            List.range 1 totalTurnsCount

        playersSequence =
            List.concat (List.repeat totalRoundsCount players)
    in
    List.map3 Turn indexesSequence turns playersSequence


view : Model -> Html msg
view { turns, players } =
    let
        durationData =
            buildTurnsDurationData turns players
    in
    Html.div []
        [ LineChart.view1 (toFloat << .index) (toFloat << .duration) durationData
        ]
