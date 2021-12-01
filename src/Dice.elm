module Dice exposing
    ( Event(..)
    , Number(..)
    , eventDecoder
    , eventEncoder
    , eventToInt
    , events
    , fromInt
    , numberDecoder
    , numberEncoder
    , numbers
    , toColor
    , toIcon
    , toInt
    )

import Html exposing (Html)
import Icon exposing (diceFive, diceFour, diceOne, diceSix, diceThree, diceTwo)
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


fromInt : Int -> Maybe Number
fromInt int =
    case int of
        1 ->
            Just One

        2 ->
            Just Two

        3 ->
            Just Three

        4 ->
            Just Four

        5 ->
            Just Five

        6 ->
            Just Six

        _ ->
            Nothing


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


toColor : Event -> String
toColor event =
    case event of
        Yellow ->
            -- yellow-600
            "#d97706"

        Blue ->
            -- blue-600
            "#2563eb"

        Green ->
            -- green-600
            "#059669"

        Black ->
            -- gray-700
            "#374151"


toIcon : Number -> Html msg
toIcon number =
    case number of
        One ->
            diceOne

        Two ->
            diceTwo

        Three ->
            diceThree

        Four ->
            diceFour

        Five ->
            diceFive

        Six ->
            diceSix
