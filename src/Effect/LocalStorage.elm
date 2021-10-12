port module Effect.LocalStorage exposing
    ( Action
    , Msg
    , State
    , getItem
    , initial
    , map
    , middleware
    , setItem
    , subscriptions
    , update
    )

import Dict exposing (Dict)


port local_storage__get_item : String -> Cmd msg


port local_storage__get_item_done : (( String, Maybe String ) -> msg) -> Sub msg


port local_storage__set_item : ( String, String ) -> Cmd msg


getItem : String -> (Maybe String -> msg) -> Action msg
getItem key tagger =
    Get key tagger


setItem : String -> String -> Cmd msg
setItem key value =
    local_storage__set_item ( key, value )


type State msg
    = State (Dict String (Maybe String -> msg))


initial : State msg
initial =
    State Dict.empty


type Msg
    = GetDone ( String, Maybe String )


update : Msg -> State msg -> Maybe ( State msg, msg )
update (GetDone ( key, value )) (State getters) =
    Maybe.map
        (\getter ->
            ( State (Dict.remove key getters)
            , getter value
            )
        )
        (Dict.get key getters)


subscriptions : Sub Msg
subscriptions =
    local_storage__get_item_done GetDone


type Action msg
    = Get String (Maybe String -> msg)


map : (a -> b) -> Action a -> Action b
map tagger (Get key getter) =
    Get key (tagger << getter)


middleware : Action msg -> State msg -> ( State msg, Cmd msg )
middleware action (State getters) =
    case action of
        Get key getter ->
            ( State (Dict.insert key getter getters)
            , local_storage__get_item key
            )
