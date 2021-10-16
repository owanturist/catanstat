port module Stories exposing (main)

import Bulletproof
import Stories.Icon


port save_settings : String -> Cmd msg


main : Bulletproof.Program
main =
    Bulletproof.program
        save_settings
        [ Stories.Icon.story
        ]
