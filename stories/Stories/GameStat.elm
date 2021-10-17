module Stories.GameStat exposing (stories)

import Bulletproof
import Bulletproof.Knob
import GameStat.TurnsDuration as TurnsDuration
import Player
import Random


stories : List Bulletproof.Story
stories =
    let
        maxTurns =
            200

        turnGenerator =
            Random.int (1 * 60 * 1000) (5 * 60 * 1000)

        ( turns, _ ) =
            Random.step (Random.list maxTurns turnGenerator) (Random.initialSeed 0)
    in
    [ Bulletproof.story "TurnsDuration"
        (\playersCount turnsCount ->
            TurnsDuration.view
                { players = List.take playersCount Player.x6
                , turns = List.take turnsCount turns
                }
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
