module Stories.GameStat exposing (stories)

import Bulletproof
import Bulletproof.Knob
import Dice
import GameStat.DiceDistributionChart as DiceDistributionChart
import GameStat.EventsDistributionChart as EventsDistributionChart
import GameStat.TotalDurationTable as TotalDurationTable
import GameStat.TurnsDurationChart as TurnsDurationChart
import GameStat.TurnsValueChart as TurnsValueChart
import Player
import Random


stories : List Bulletproof.Story
stories =
    let
        maxTurns =
            200

        turnGenerator =
            Random.int (1 * 60 * 1000) (5 * 60 * 1000)

        diceGenerator =
            Random.uniform
                Dice.One
                [ Dice.Two, Dice.Three, Dice.Four, Dice.Five, Dice.Six ]

        eventGenerator =
            Random.uniform
                Dice.Black
                [ Dice.Black, Dice.Black, Dice.Yellow, Dice.Blue, Dice.Green ]

        ( turns, _ ) =
            Random.step
                (Random.list maxTurns turnGenerator)
                (Random.initialSeed 0)

        ( doublceDiceTurns, _ ) =
            Random.step
                (Random.list maxTurns (Random.pair diceGenerator diceGenerator))
                (Random.initialSeed 0)

        ( eventDiceTurns, _ ) =
            Random.step
                (Random.list maxTurns eventGenerator)
                (Random.initialSeed 0)
    in
    [ Bulletproof.story "TotalDurationTable"
        (\playersCount turnsCount ->
            TotalDurationTable.view
                (List.take turnsCount turns)
                (List.take playersCount Player.x6)
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
                (List.take turnsCount turns)
                (List.take playersCount Player.x6)
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
    , Bulletproof.story "TurnsValueChart"
        (\turnsCount ->
            TurnsValueChart.view
                (List.take turnsCount doublceDiceTurns)
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
            List.take turnsCount doublceDiceTurns
                |> List.map (\( red, white ) -> { red = red, white = white })
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
            List.take turnsCount eventDiceTurns
                |> EventsDistributionChart.view
                |> Bulletproof.fromHtml
        )
        |> Bulletproof.Knob.int "Turns count"
            40
            [ Bulletproof.Knob.range
            , Bulletproof.Knob.min 0
            , Bulletproof.Knob.max maxTurns
            ]
    ]
