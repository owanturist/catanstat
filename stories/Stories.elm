port module Stories exposing (main)

import Bulletproof
import Bulletproof.Knob
import Html
import Html.Attributes


port save_settings : String -> Cmd msg


main : Bulletproof.Program
main =
    Bulletproof.program
        save_settings
        [ Bulletproof.folder "Example"
            [ Bulletproof.story "with single knob"
                (\txt ->
                    Html.div
                        [ Html.Attributes.class "w-[200px] bg-gray-200 p-4" ]
                        [ Html.text txt ]
                        |> Bulletproof.fromHtml
                )
                |> Bulletproof.Knob.string "Text" ":)"
            ]
        ]
