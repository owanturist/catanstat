module Middleware exposing (Middleware, application, batch, map, middleware, none)

import Browser
import Browser.Navigation
import Url exposing (Url)


type Middleware custom
    = Custom custom
    | Batch (List (Middleware custom))


map : (a -> b) -> Middleware a -> Middleware b
map tagger mid =
    case mid of
        Custom custom ->
            Custom (tagger custom)

        Batch many ->
            Batch (List.map (map tagger) many)


middleware : custom -> Middleware custom
middleware =
    Custom


none : Middleware custom
none =
    Batch []


batch : List (Middleware custom) -> Middleware custom
batch =
    Batch


injectHelp : (model -> custom -> ( model, Cmd msg )) -> Middleware custom -> ( model, List (Cmd msg) ) -> ( model, List (Cmd msg) )
injectHelp middlewares mid ( model, cmds ) =
    case mid of
        Custom custom ->
            let
                ( nextModel, cmd ) =
                    middlewares model custom
            in
            ( nextModel, cmd :: cmds )

        Batch many ->
            List.foldr (injectHelp middlewares) ( model, cmds ) many


inject : (model -> custom -> ( model, Cmd msg )) -> ( model, Middleware custom ) -> ( model, Cmd msg )
inject middlewares ( model, mid ) =
    Tuple.mapSecond Cmd.batch (injectHelp middlewares mid ( model, [] ))


application :
    { init : flags -> Url -> Browser.Navigation.Key -> ( model, Middleware custom )
    , update : msg -> model -> ( model, Middleware custom )
    , middlewares : model -> custom -> ( model, Cmd msg )
    , subscriptions : model -> Sub msg
    , view : model -> Browser.Document msg
    , onUrlRequest : Browser.UrlRequest -> msg
    , onUrlChange : Url -> msg
    }
    -> Program flags model msg
application config =
    Browser.application
        { init =
            \flags url key ->
                inject config.middlewares (config.init flags url key)
        , update =
            \msg model ->
                inject config.middlewares (config.update msg model)
        , subscriptions = config.subscriptions
        , view = config.view
        , onUrlRequest = config.onUrlRequest
        , onUrlChange = config.onUrlChange
        }
