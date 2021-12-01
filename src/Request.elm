module Request exposing
    ( Body
    , Error(..)
    , Request
    , get
    , post
    , send
    , withBody
    , withHeader
    , withHeaders
    , withJsonBody
    , withJsonResponse
    )

import Effect exposing (Effect)
import Effect.Request
import Http exposing (request)
import Json.Decode as Decode
import Json.Encode as Encode


type Error
    = BadUrl String
    | Timeout
    | NetworkError
    | BadStatus Int String
    | BadBody Decode.Error


type alias Request data =
    Effect.Request.Config (Result Error data)


type alias Body =
    Http.Body


init : String -> String -> Request ()
init method url =
    { method = method
    , url = url
    , headers = []
    , body = emptyBody
    , handle = decodeStringResponse (Decode.succeed ())
    }


get : String -> Request ()
get =
    init "GET"


post : String -> Request ()
post =
    init "POST"


withHeader : String -> String -> Request data -> Request data
withHeader name value request =
    withHeaders [ ( name, value ) ] request


makeHttpHeader : ( String, String ) -> Http.Header
makeHttpHeader ( name, value ) =
    Http.header name value


withHeaders : List ( String, String ) -> Request data -> Request data
withHeaders headers request =
    { request | headers = request.headers ++ List.map makeHttpHeader headers }


withBody : Body -> Request data -> Request data
withBody body request =
    { request | body = body }


withJsonBody : Encode.Value -> Request data -> Request data
withJsonBody value request =
    withBody (jsonBody value) request


jsonBody : Encode.Value -> Body
jsonBody =
    Http.jsonBody


emptyBody : Body
emptyBody =
    Http.emptyBody


decodeStringResponse : Decode.Decoder data -> Http.Response String -> Result Error data
decodeStringResponse decoder response =
    case response of
        Http.BadUrl_ url ->
            Err (BadUrl url)

        Http.Timeout_ ->
            Err Timeout

        Http.NetworkError_ ->
            Err NetworkError

        Http.BadStatus_ meta _ ->
            Err (BadStatus meta.statusCode meta.statusText)

        Http.GoodStatus_ _ json ->
            Result.mapError BadBody (Decode.decodeString decoder json)


withJsonResponse : Decode.Decoder data -> Request x -> Request data
withJsonResponse decoder request =
    { method = request.method
    , url = request.url
    , headers = request.headers
    , body = request.body
    , handle = decodeStringResponse decoder
    }


send : (Result Error data -> msg) -> Request data -> Effect msg
send toMsg request =
    Effect.Request.map toMsg request
        |> Effect.Request
        |> Effect.middleware
