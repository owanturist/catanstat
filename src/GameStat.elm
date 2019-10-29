module GameStat exposing (Model, Msg, init, update, view)

import Api
import Effect exposing (Effect)
import Element exposing (Element, text)
import Game exposing (Game)
import LocalStorage



-- M O D E L


type alias Model =
    {}


init : Game.ID -> ( Model, Effect Msg )
init gameID =
    ( {}, Effect.none )



-- U P D A T E


type Msg
    = NoOp


update : Msg -> Model -> ( Model, Effect Msg )
update msg model =
    ( model, Effect.none )



-- V I E W


view : Model -> Element Msg
view model =
    text "STAT"
