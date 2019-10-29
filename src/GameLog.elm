module GameLog exposing (Model, Msg, init, update, view)

import Api
import Effect exposing (Effect)
import Element exposing (Element, text)
import Game exposing (Game)
import LocalStorage



-- M O D E L


type alias Model =
    { game : Maybe Game
    }


init : Game.ID -> ( Model, Effect Msg )
init gameID =
    ( Model Nothing
    , Api.loadGame gameID
        |> Effect.map LoadGame
    )



-- U P D A T E


type Msg
    = LoadGame (Result LocalStorage.Error Game)


update : Msg -> Model -> ( Model, Effect Msg )
update msg model =
    case msg of
        LoadGame (Err _) ->
            ( model, Effect.none )

        LoadGame (Ok loadedGame) ->
            ( { model | game = Just loadedGame }
            , Effect.none
            )



-- V I E W


view : Model -> Element Msg
view model =
    text "LOG"
