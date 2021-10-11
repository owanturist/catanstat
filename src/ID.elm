module ID exposing
    ( ID
    , decoder
    , encoder
    , fromInt
    , parser
    , toString
    )

import Json.Decode as Decode exposing (Decoder)
import Json.Encode as Encode exposing (Value)
import Url.Parser exposing (Parser)


type ID supported
    = ID String


fromString : String -> ID supported
fromString =
    ID


fromInt : Int -> ID supported
fromInt =
    ID << String.fromInt


toString : ID supported -> String
toString (ID id) =
    id


decoder : Decoder (ID supported)
decoder =
    Decode.oneOf
        [ Decode.map fromString Decode.string
        , Decode.map fromInt Decode.int
        ]


encoder : ID supported -> Value
encoder (ID id) =
    String.toInt id
        |> Maybe.map Encode.int
        |> Maybe.withDefault (Encode.string id)


parser : Parser (ID supported -> a) a
parser =
    Url.Parser.oneOf
        [ Url.Parser.map fromInt Url.Parser.int
        , Url.Parser.map fromString Url.Parser.string
        ]
