module Player exposing
    ( Color(..)
    , Player
    , colorDecoder
    , colorEncoder
    , colorToInt
    , decoder
    , encoder
    , toColor
    , toHex
    , x6
    )

import ID exposing (ID)
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


toHex : Color -> String
toHex color =
    case color of
        White ->
            -- gray-300
            "#d1d5db"

        Red ->
            -- red-400
            "#f87171"

        Blue ->
            -- blue-400
            "#60a5fa"

        Yellow ->
            -- yellow-400
            "#fbbf24"

        Green ->
            -- green-400
            "#34d399"

        Brown ->
            -- yellow-800
            "#92400e"



-- P L A Y E R


type alias Player =
    { id : ID { player : () }
    , color : Color
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
    Decode.map3 Player
        (Decode.index 0 ID.decoder)
        (Decode.index 0 colorDecoder)
        (Decode.index 1 Decode.string)


x4 : List Player
x4 =
    [ Player (ID.fromInt 0) Red "Red"
    , Player (ID.fromInt 1) Blue "Blue"
    , Player (ID.fromInt 2) White "White"
    , Player (ID.fromInt 3) Yellow "Yellow"
    ]


x6 : List Player
x6 =
    x4 ++ [ Player (ID.fromInt 4) Green "Green", Player (ID.fromInt 5) Brown "Brown" ]
