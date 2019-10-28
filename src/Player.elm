module Player exposing
    ( Color(..)
    , Player
    , colorDecoder
    , colorEncoder
    , decoder
    , encoder
    , paint
    )

import Element
import Json.Decode as Decode exposing (Decoder)
import Json.Encode as Encode exposing (Value)



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


paint : Color -> Element.Color
paint color =
    case color of
        White ->
            Element.rgb255 236 240 241

        Red ->
            Element.rgb255 231 76 60

        Blue ->
            Element.rgb255 52 152 219

        Yellow ->
            Element.rgb255 243 156 18

        Green ->
            Element.rgb255 46 204 113

        Brown ->
            Element.rgb255 211 84 0



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
