module CreateGame exposing (Model, Msg, initial, update, view)

import Effect exposing (Effect)
import Element exposing (Element, text)



-- M O D E L


type alias Model =
    {}


initial : Model
initial =
    {}



-- U P D A T E


type Msg
    = NoOp


update : Msg -> Model -> ( Model, Effect Msg )
update msg model =
    ( model, Effect.none )



-- V I E W


view : Model -> Element Msg
view model =
    text "C R E A T E"
