module GameList exposing (Model, Msg, init, update, view)

import Effect exposing (Effect)
import Element exposing (Element, text)
import ID exposing (ID)



-- M O D E L


type alias Model =
    { games : List (ID { game : () })
    }


init : ( Model, Effect Msg )
init =
    ( Model []
    , Effect.none
    )



-- U P D A T E


type Msg
    = NoOp


update : Msg -> Model -> ( Model, Effect Msg )
update msg model =
    ( model, Effect.none )



-- V I E W


view : Model -> Element Msg
view model =
    text "I'm GAME LIST!"
