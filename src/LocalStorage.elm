module LocalStorage exposing (Error(..), getItem, setItem)

import Effect exposing (Effect)
import Effect.LocalStorage
import Json.Decode exposing (Decoder, decodeString)
import Json.Encode exposing (Value, encode)


type Error
    = NotFound
    | DecodeError Json.Decode.Error


getItem : String -> Decoder a -> (Result Error a -> msg) -> Effect msg
getItem key decoder tagger =
    (\optionalString ->
        case Maybe.map (decodeString decoder) optionalString of
            Nothing ->
                tagger (Err NotFound)

            Just (Err decodeError) ->
                tagger (Err (DecodeError decodeError))

            Just (Ok value) ->
                tagger (Ok value)
    )
        |> Effect.LocalStorage.getItem key
        |> Effect.LocalStorage
        |> Effect.middleware


setItem : String -> Value -> Effect msg
setItem key value =
    Effect.LocalStorage.setItem key (encode 0 value)
        |> Effect.fromCmd
