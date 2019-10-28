module Main exposing (main)

import Browser
import Browser.Navigation
import Effect exposing (Effect)
import Effect.History
import Effect.LocalStorage
import Element exposing (Element, none)
import GameHistory
import ID exposing (ID)
import Middleware
import PlayGame
import Router
import Url exposing (Url)



-- M O D E L


type Screen
    = BlankScreen
    | GameHistoryScreen GameHistory.Model
    | PlayGameScreen (ID { game : () }) PlayGame.Model


type alias Model =
    { localStorage : Effect.LocalStorage.State Msg
    , navigation : Browser.Navigation.Key
    , screen : Screen
    }


initScreen : Router.Direction -> Screen -> ( Screen, Effect Msg )
initScreen direction screen =
    case direction of
        Router.Redirect route ->
            ( screen
            , Router.replace route
            )

        Router.Direct Router.ToGameHistory ->
            let
                ( initialGameHistory, gameHistoryEffect ) =
                    GameHistory.init
            in
            ( GameHistoryScreen initialGameHistory
            , Effect.map GameHistoryMsg gameHistoryEffect
            )

        Router.Direct Router.ToCreateGame ->
            ( screen
            , Router.replace Router.ToGameHistory
            )

        Router.Direct (Router.ToPlayGame gameID) ->
            let
                ( initialPlayGame, playGameEffect ) =
                    PlayGame.init gameID
            in
            ( PlayGameScreen gameID initialPlayGame
            , Effect.map PlayGameMsg playGameEffect
            )


init : () -> Url -> Browser.Navigation.Key -> ( Model, Effect Msg )
init _ url navigation =
    let
        ( initialScreen, screenEffect ) =
            initScreen (Router.parse url) BlankScreen
    in
    ( { localStorage = Effect.LocalStorage.initial
      , navigation = navigation
      , screen = initialScreen
      }
    , screenEffect
    )



-- U P D A T E


type Msg
    = UrlRequested Browser.UrlRequest
    | UrlChanged Url
    | LocalStorageMsg Effect.LocalStorage.Msg
    | GameHistoryMsg GameHistory.Msg
    | PlayGameMsg PlayGame.Msg


update : Msg -> Model -> ( Model, Effect Msg )
update msg model =
    case ( msg, model.screen ) of
        ( UrlRequested (Browser.Internal url), _ ) ->
            ( model
            , Url.toString url
                |> Browser.Navigation.pushUrl model.navigation
                |> Effect.fromCmd
            )

        ( UrlRequested (Browser.External url), _ ) ->
            ( model
            , Browser.Navigation.load url
                |> Effect.fromCmd
            )

        ( UrlChanged url, _ ) ->
            let
                ( nextScreen, screenEffect ) =
                    initScreen (Router.parse url) model.screen
            in
            ( { model | screen = nextScreen }
            , screenEffect
            )

        ( LocalStorageMsg localStorageMsg, _ ) ->
            case Effect.LocalStorage.update localStorageMsg model.localStorage of
                Nothing ->
                    ( model, Effect.none )

                Just ( nextLocalStorage, subMsg ) ->
                    update subMsg { model | localStorage = nextLocalStorage }

        ( GameHistoryMsg gameListMsg, GameHistoryScreen gameHistory ) ->
            let
                ( nextGameHistory, gameHistoryEffect ) =
                    GameHistory.update gameListMsg gameHistory
            in
            ( { model | screen = GameHistoryScreen nextGameHistory }
            , Effect.map GameHistoryMsg gameHistoryEffect
            )

        ( GameHistoryMsg _, _ ) ->
            ( model, Effect.none )

        ( PlayGameMsg gameMsg, PlayGameScreen gameID playGame ) ->
            let
                ( nextPlayGame, playGameEffect ) =
                    PlayGame.update gameMsg playGame
            in
            ( { model | screen = PlayGameScreen gameID nextPlayGame }
            , Effect.map PlayGameMsg playGameEffect
            )

        ( PlayGameMsg _, _ ) ->
            ( model, Effect.none )



-- S U B S C R I P T I O N


subscriptions : Model -> Sub Msg
subscriptions model =
    Sub.batch
        [ Sub.map LocalStorageMsg Effect.LocalStorage.subscriptions
        , case model.screen of
            BlankScreen ->
                Sub.none

            GameHistoryScreen _ ->
                Sub.none

            PlayGameScreen _ playGame ->
                Sub.map PlayGameMsg (PlayGame.subscriptions playGame)
        ]



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


view : Model -> Element Msg
view model =
    case model.screen of
        BlankScreen ->
            none

        GameHistoryScreen gameHistory ->
            Element.map GameHistoryMsg (GameHistory.view gameHistory)

        PlayGameScreen _ playGame ->
            Element.map PlayGameMsg (PlayGame.view playGame)


document : Model -> Browser.Document Msg
document model =
    Browser.Document "Catan"
        [ Element.layout [] (view model)
        ]



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
        , view = document
        }
