module Effect exposing (Custom(..), Effect, batch, fromCmd, map, middleware, none)

import Effect.History
import Effect.LocalStorage
import Middleware exposing (Middleware)


type alias Effect msg =
    Middleware (Custom msg)


type Custom msg
    = Cmd (Cmd msg)
    | LocalStorage (Effect.LocalStorage.Action msg)
    | History Effect.History.Action


mapCustom : (a -> b) -> Custom a -> Custom b
mapCustom tagger custom =
    case custom of
        Cmd cmd ->
            Cmd (Cmd.map tagger cmd)

        LocalStorage action ->
            LocalStorage (Effect.LocalStorage.map tagger action)

        History history ->
            History history


map : (a -> b) -> Effect a -> Effect b
map tagger effect =
    Middleware.map (mapCustom tagger) effect


none : Effect msg
none =
    Middleware.batch []


batch : List (Effect msg) -> Effect msg
batch =
    Middleware.batch


middleware : Custom msg -> Effect msg
middleware =
    Middleware.middleware


fromCmd : Cmd msg -> Effect msg
fromCmd =
    middleware << Cmd
