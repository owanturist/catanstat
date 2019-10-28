module Game exposing (Model, Msg, init, update, view)

import Effect exposing (Effect)
import Element exposing (Element, text)



-- M O D E L


type alias Model =
    { name : String
    }


init : ( Model, Effect Msg )
init =
    ( Model "GAME", Effect.none )



-- U P D A T E


type Msg
    = NoOp


update : Msg -> Model -> ( Model, Effect Msg )
update msg model =
    ( model, Effect.none )



-- V I E W


view : Model -> Element Msg
view model =
    text model.name
