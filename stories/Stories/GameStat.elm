module Stories.GameStat exposing (stories)

import Bulletproof
import Stories.GameStat.TurnsDuration


stories : List Bulletproof.Story
stories =
    [ Bulletproof.folder "TurnsDuration" Stories.GameStat.TurnsDuration.stories
    ]
