module Player exposing
    ( Color(..)
    , Player
    , colorDecoder
    , colorEncoder
    , colorToInt
    , decoder
    , encoder
    , toColor
    , x4
    , x6
    )

import Json.Decode as Decode exposing (Decoder)
import Json.Encode as Encode exposing (Value)
import Palette



-- C O L O R


type Color
    = White
    | Red
    | Blue
    | Yellow
    | Green
    | Brown


colorToInt : Color -> Int
colorToInt color =
    case color of
        White ->
            0

        Red ->
            1

        Blue ->
            2

        Yellow ->
            3

        Green ->
            4

        Brown ->
            5


colorEncoder : Color -> Value
colorEncoder =
    Encode.int << colorToInt


colorDecoder : Decoder Color
colorDecoder =
    Decode.andThen
        (\x ->
            case x of
                0 ->
                    Decode.succeed White

                1 ->
                    Decode.succeed Red

                2 ->
                    Decode.succeed Blue

                3 ->
                    Decode.succeed Yellow

                4 ->
                    Decode.succeed Green

                5 ->
                    Decode.succeed Brown

                _ ->
                    Decode.fail ("Expecting an INTEGER [0, 5] but got `" ++ String.fromInt x ++ "` instead.")
        )
        Decode.int


toColor : Color -> Palette.Color
toColor color =
    case color of
        White ->
            Palette.concrete

        Red ->
            Palette.pomegranate

        Blue ->
            Palette.peterRiver

        Yellow ->
            Palette.orange

        Green ->
            Palette.emerald

        Brown ->
            Palette.pumpkin



-- P L A Y E R


type alias Player =
    { color : Color
    , name : String
    }


encoder : Player -> Value
encoder player =
    Encode.list identity
        [ colorEncoder player.color
        , Encode.string player.name
        ]


decoder : Decoder Player
decoder =
    Decode.map2 Player
        (Decode.index 0 colorDecoder)
        (Decode.index 1 Decode.string)


x4 : List Player
x4 =
    [ Player Red "Red"
    , Player Blue "Blue"
    , Player White "White"
    , Player Yellow "Yellow"
    ]


x6 : List Player
x6 =
    x4 ++ [ Player Green "Green", Player Brown "Brown" ]
