module Stories.Icon exposing (story)

import Bulletproof
import Bulletproof.Knob
import Html
import Html.Attributes
import Icon


story : Bulletproof.Story
story =
    Bulletproof.story "Icons"
        (\fontSize color ->
            Html.div
                [ Html.Attributes.class "flex flex-wrap font-mono"
                ]
                (List.map
                    (\( name, icon ) ->
                        Html.div
                            [ Html.Attributes.class "p-2 flex flex-col items-center"
                            ]
                            [ Html.span
                                [ Html.Attributes.style "fontSize" (String.fromInt fontSize ++ "px")
                                , Html.Attributes.style "color" color.hex
                                ]
                                [ icon ]
                            , Html.span [ Html.Attributes.class "mt-1 text-sm" ] [ Html.text name ]
                            ]
                    )
                    [ ( "square", Icon.square )
                    , ( "diceOne", Icon.diceOne )
                    , ( "diceTwo", Icon.diceTwo )
                    , ( "diceThree", Icon.diceThree )
                    , ( "diceFour", Icon.diceFour )
                    , ( "diceFive", Icon.diceFive )
                    , ( "diceSix", Icon.diceSix )
                    ]
                )
                |> Bulletproof.fromHtml
        )
        |> Bulletproof.Knob.int "Font size"
            48
            [ Bulletproof.Knob.range
            , Bulletproof.Knob.min 0
            , Bulletproof.Knob.max 256
            ]
        |> Bulletproof.Knob.color "Color" "#444"
