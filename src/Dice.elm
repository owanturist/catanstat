module Dice exposing
    ( Event(..)
    , Number(..)
    , eventDecoder
    , eventEncoder
    , events
    , numberDecoder
    , numberEncoder
    , numbers
    , paint
    , toInt
    )

import Element
import Json.Decode as Decode exposing (Decoder)
import Json.Encode as Encode exposing (Value)



-- C O L O R


type Number
    = One
    | Two
    | Three
    | Four
    | Five
    | Six


toInt : Number -> Int
toInt number =
    case number of
        One ->
            1

        Two ->
            2

        Three ->
            3

        Four ->
            4

        Five ->
            5

        Six ->
            6


numberEncoder : Number -> Value
numberEncoder =
    Encode.int << toInt


numberDecoder : Decoder Number
numberDecoder =
    Decode.andThen
        (\x ->
            case x of
                1 ->
                    Decode.succeed One

                2 ->
                    Decode.succeed Two

                3 ->
                    Decode.succeed Three

                4 ->
                    Decode.succeed Four

                5 ->
                    Decode.succeed Five

                6 ->
                    Decode.succeed Six

                _ ->
                    Decode.fail ("Expecting an INTEGER [1, 6] but got `" ++ String.fromInt x ++ "` instead.")
        )
        Decode.int


numbers : List Number
numbers =
    [ One, Two, Three, Four, Five, Six ]


type Event
    = Yellow
    | Blue
    | Green
    | Black


eventToInt : Event -> Int
eventToInt event =
    case event of
        Yellow ->
            0

        Blue ->
            1

        Green ->
            2

        Black ->
            3


eventEncoder : Event -> Value
eventEncoder =
    Encode.int << eventToInt


eventDecoder : Decoder Event
eventDecoder =
    Decode.andThen
        (\x ->
            case x of
                0 ->
                    Decode.succeed Yellow

                1 ->
                    Decode.succeed Blue

                2 ->
                    Decode.succeed Green

                3 ->
                    Decode.succeed Black

                _ ->
                    Decode.fail ("Expecting an INTEGER [0, 2] but got `" ++ String.fromInt x ++ "` instead.")
        )
        Decode.int


events : List Event
events =
    [ Yellow, Blue, Green, Black, Black, Black ]


paint : Event -> Element.Color
paint event =
    case event of
        Yellow ->
            Element.rgb255 241 196 15

        Blue ->
            Element.rgb255 41 128 185

        Green ->
            Element.rgb255 39 174 96

        Black ->
            Element.rgb255 44 62 80
