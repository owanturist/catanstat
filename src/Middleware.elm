module Middleware exposing (Middleware, application, batch, map, middleware)

import Browser
import Browser.Navigation
import Url exposing (Url)


type Middleware mid
    = Middleware (List mid)


unpack : Middleware a -> List a
unpack (Middleware middlewares) =
    middlewares


map : (a -> b) -> Middleware a -> Middleware b
map tagger (Middleware middlewares) =
    Middleware (List.map tagger middlewares)


middleware : mid -> Middleware mid
middleware =
    Middleware << List.singleton


batch : List (Middleware mid) -> Middleware mid
batch middlewares =
    Middleware (List.concatMap unpack middlewares)


inject : (model -> mid -> ( model, Cmd msg )) -> ( model, Middleware mid ) -> ( model, Cmd msg )
inject mid ( model, Middleware middlewares ) =
    let
        ( resultModel, resultCmds ) =
            List.foldl
                (\middl ( prevModel, cmds ) ->
                    let
                        ( nextModel, cmd ) =
                            mid prevModel middl
                    in
                    ( nextModel, cmd :: cmds )
                )
                ( model, [] )
                middlewares
    in
    ( resultModel, Cmd.batch resultCmds )


application :
    { init : flags -> Url -> Browser.Navigation.Key -> ( model, Middleware mid )
    , update : msg -> model -> ( model, Middleware mid )
    , middlewares : model -> mid -> ( model, Cmd msg )
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
