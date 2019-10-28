module Main exposing (main)

import Browser
import Browser.Navigation
import Effect exposing (Effect)
import Effect.History
import Effect.LocalStorage
import Element
import Game
import Middleware
import Url exposing (Url)



-- M O D E L


type alias Model =
    { localStorage : Effect.LocalStorage.State Msg
    , navigation : Browser.Navigation.Key
    , game : Game.Model
    }


init : () -> Url -> Browser.Navigation.Key -> ( Model, Effect Msg )
init _ _ navigation =
    let
        ( initialGame, gameEffect ) =
            Game.init
    in
    ( { localStorage = Effect.LocalStorage.initial
      , navigation = navigation
      , game = initialGame
      }
    , Effect.map GameMsg gameEffect
    )



-- U P D A T E


type Msg
    = UrlRequested Browser.UrlRequest
    | UrlChanged Url
    | LocalStorageMsg Effect.LocalStorage.Msg
    | GameMsg Game.Msg


update : Msg -> Model -> ( Model, Effect Msg )
update msg model =
    case msg of
        UrlRequested _ ->
            Debug.todo "Main.UrlRequested"

        UrlChanged _ ->
            Debug.todo "UrlChanged"

        LocalStorageMsg localStorageMsg ->
            case Effect.LocalStorage.update localStorageMsg model.localStorage of
                Nothing ->
                    ( model, Effect.none )

                Just ( nextLocalStorage, subMsg ) ->
                    update subMsg { model | localStorage = nextLocalStorage }

        GameMsg gameMsg ->
            let
                ( nextGame, gameEffect ) =
                    Game.update gameMsg model.game
            in
            ( { model | game = nextGame }
            , Effect.map GameMsg gameEffect
            )



-- S U B S C R I P T I O N


subscriptions : Model -> Sub Msg
subscriptions _ =
    Sub.map LocalStorageMsg Effect.LocalStorage.subscriptions



-- M I D D L E W A R E S


middlewares : Model -> Effect.Custom Msg -> ( Model, Cmd Msg )
middlewares model effect =
    case effect of
        Effect.Cmd cmd ->
            ( model, cmd )

        Effect.LocalStorage action ->
            let
                ( nextLocalStorage, localStorageCmd ) =
                    Effect.LocalStorage.middleware action model.localStorage
            in
            ( { model | localStorage = nextLocalStorage }
            , localStorageCmd
            )

        Effect.History action ->
            ( model
            , Effect.History.middleware model.navigation action
            )

        Effect.Toast _ ->
            Debug.todo "Main.Toast"



-- V I E W


view : Model -> Browser.Document Msg
view model =
    Game.view model.game
        |> Element.map GameMsg
        |> Element.layout []
        |> List.singleton
        |> Browser.Document "Catan"



-- M A I N


main : Program () Model Msg
main =
    Middleware.application
        { onUrlRequest = UrlRequested
        , onUrlChange = UrlChanged
        , init = init
        , update = update
        , subscriptions = subscriptions
        , middlewares = middlewares
        , view = view
        }
