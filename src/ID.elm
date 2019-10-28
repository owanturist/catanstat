module ID exposing
    ( ID
    , compare
    , decoder
    , encoder
    , fromInt
    , fromString
    , parameter
    , parser
    , query
    , toString
    )

import Json.Decode as Decode exposing (Decoder)
import Json.Encode as Encode exposing (Value)
import Url.Builder exposing (QueryParameter)
import Url.Parser exposing (Parser)
import Url.Parser.Query


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


compare : ID supported -> ID supported -> Order
compare (ID left) (ID right) =
    Basics.compare left right


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


query : String -> Url.Parser.Query.Parser (Maybe (ID supported))
query key =
    Url.Parser.Query.custom key
        (\values ->
            case values of
                [ single ] ->
                    case String.toInt single of
                        Nothing ->
                            Just (fromString single)

                        Just int ->
                            Just (fromInt int)

                _ ->
                    Nothing
        )


parameter : String -> ID supported -> QueryParameter
parameter key (ID id) =
    case String.toInt id of
        Nothing ->
            Url.Builder.string key id

        Just int ->
            Url.Builder.int key int
