module Stories.GameStat exposing (stories)

import Bulletproof
import Bulletproof.Knob
import Cons
import Dice
import Game
import GameStat
import GameStat.DiceDistributionChart as DiceDistributionChart
import GameStat.EventsDieDistributionChart as EventsDieDistributionChart
import GameStat.EventsDistributionChart as EventsDistributionChart
import GameStat.TotalDurationTable as TotalDurationTable
import GameStat.TurnsDistributionChart as TurnsDistributionChart
import GameStat.TurnsDurationChart as TurnsDurationChart
import ID
import Player exposing (Player)
import Random
import Request


stories : List Bulletproof.Story
stories =
    let
        maxTurns =
            200

        takePlayers amount =
            List.take amount Player.x6
                |> Cons.fromList
                |> Maybe.withDefault (Cons.singleton (Player (ID.fromInt 0) Player.Red "Red"))

        durationGenerator =
            Random.int (1 * 60 * 1000) (5 * 60 * 1000)

        dieGenerator =
            Random.uniform
                Dice.One
                [ Dice.Two, Dice.Three, Dice.Four, Dice.Five, Dice.Six ]

        eventGenerator =
            Random.uniform
                Dice.Black
                [ Dice.Black, Dice.Black, Dice.Yellow, Dice.Blue, Dice.Green ]

        ( durationTurns, _ ) =
            Random.step
                (Random.list maxTurns durationGenerator)
                (Random.initialSeed 0)

        ( redTurns, _ ) =
            Random.step
                (Random.list maxTurns dieGenerator)
                (Random.initialSeed 1)

        ( whiteTurns, _ ) =
            Random.step
                (Random.list maxTurns dieGenerator)
                (Random.initialSeed 2)

        ( eventTurns, _ ) =
            Random.step
                (Random.list maxTurns eventGenerator)
                (Random.initialSeed 3)
    in
    [ Bulletproof.story "TotalDurationTable"
        (\playersCount turnsCount ->
            TotalDurationTable.view
                (takePlayers playersCount)
                (List.take turnsCount durationTurns)
                |> Bulletproof.fromHtml
        )
        |> Bulletproof.Knob.int "Players count"
            4
            [ Bulletproof.Knob.range
            , Bulletproof.Knob.min 2
            , Bulletproof.Knob.max 6
            ]
        |> Bulletproof.Knob.int "Turns count"
            40
            [ Bulletproof.Knob.range
            , Bulletproof.Knob.min 0
            , Bulletproof.Knob.max maxTurns
            ]

    --
    , Bulletproof.story "TurnsDurationChart"
        (\playersCount turnsCount ->
            TurnsDurationChart.view
                (takePlayers playersCount)
                (List.take turnsCount durationTurns)
                |> Bulletproof.fromHtml
        )
        |> Bulletproof.Knob.int "Players count"
            4
            [ Bulletproof.Knob.range
            , Bulletproof.Knob.min 2
            , Bulletproof.Knob.max 6
            ]
        |> Bulletproof.Knob.int "Turns count"
            40
            [ Bulletproof.Knob.range
            , Bulletproof.Knob.min 0
            , Bulletproof.Knob.max maxTurns
            ]

    --
    , Bulletproof.story "TurnsDistributionChart"
        (\turnsCount ->
            List.map2 TurnsDistributionChart.Turn whiteTurns redTurns
                |> List.take turnsCount
                |> TurnsDistributionChart.view
                |> Bulletproof.fromHtml
        )
        |> Bulletproof.Knob.int "Turns count"
            40
            [ Bulletproof.Knob.range
            , Bulletproof.Knob.min 0
            , Bulletproof.Knob.max maxTurns
            ]

    --
    , Bulletproof.story "DiceDistributionChart"
        (\turnsCount ->
            List.map2 DiceDistributionChart.Turn whiteTurns redTurns
                |> List.take turnsCount
                |> DiceDistributionChart.view
                |> Bulletproof.fromHtml
        )
        |> Bulletproof.Knob.int "Turns count"
            40
            [ Bulletproof.Knob.range
            , Bulletproof.Knob.min 0
            , Bulletproof.Knob.max maxTurns
            ]

    --
    , Bulletproof.story "EventsDistributionChart"
        (\turnsCount ->
            List.take turnsCount eventTurns
                |> EventsDistributionChart.view
                |> Bulletproof.fromHtml
        )
        |> Bulletproof.Knob.int "Turns count"
            40
            [ Bulletproof.Knob.range
            , Bulletproof.Knob.min 0
            , Bulletproof.Knob.max maxTurns
            ]

    --
    , Bulletproof.story "EventsDieDistributionChart"
        (\turnsCount ->
            List.map2 EventsDieDistributionChart.Turn redTurns eventTurns
                |> List.take turnsCount
                |> EventsDieDistributionChart.view
                |> Bulletproof.fromHtml
        )
        |> Bulletproof.Knob.int "Turns count"
            40
            [ Bulletproof.Knob.range
            , Bulletproof.Knob.min 0
            , Bulletproof.Knob.max maxTurns
            ]

    --
    , Bulletproof.story "GameState | Loading"
        (GameStat.Loading
            |> GameStat.view (ID.fromInt 0)
            |> Bulletproof.fromHtml
        )

    --
    , Bulletproof.story "GameState | Failure"
        (GameStat.Failure Request.NetworkError
            |> GameStat.view (ID.fromInt 0)
            |> Bulletproof.fromHtml
        )

    --
    , Bulletproof.story "GameState | Succeed"
        (\playersCount turnsCount ->
            let
                turns =
                    List.map4 Game.Turn
                        durationTurns
                        whiteTurns
                        redTurns
                        eventTurns
            in
            { players = takePlayers playersCount
            , turns = List.take turnsCount turns
            }
                |> GameStat.Succeed
                |> GameStat.view (ID.fromInt 0)
                |> Bulletproof.fromHtml
        )
        |> Bulletproof.Knob.int "Players count"
            4
            [ Bulletproof.Knob.range
            , Bulletproof.Knob.min 2
            , Bulletproof.Knob.max 6
            ]
        |> Bulletproof.Knob.int "Turns count"
            40
            [ Bulletproof.Knob.range
            , Bulletproof.Knob.min 0
            , Bulletproof.Knob.max maxTurns
            ]
    ]
