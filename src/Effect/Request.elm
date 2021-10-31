module Effect.Request exposing (Config, map, middleware)

import Http
import Result.Extra


type alias Config msg =
    { method : String
    , url : String
    , headers : List Http.Header
    , body : Http.Body
    , handle : Http.Response String -> msg
    }


map : (a -> b) -> Config a -> Config b
map tagger config =
    { method = config.method
    , url = config.url
    , headers = config.headers
    , body = config.body
    , handle = tagger << config.handle
    }


middleware : Config msg -> Cmd msg
middleware config =
    Http.request
        { method = config.method
        , url = config.url
        , headers = config.headers
        , body = config.body
        , expect = Http.expectStringResponse (config.handle << Result.Extra.merge) Ok
        , timeout = Nothing
        , tracker = Nothing
        }
