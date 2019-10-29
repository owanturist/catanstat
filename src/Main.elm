module Main exposing (main)

import Browser
import Browser.Navigation
import CreateGame
import Effect exposing (Effect)
import Effect.History
import Effect.LocalStorage
import Element exposing (Element, none)
import FontAwesome.Styles
import Game
import GameHistory
import GameLog
import GameStat
import Middleware
import PlayGame
import Router
import Url exposing (Url)



-- M O D E L


type Screen
    = BlankScreen
    | GameHistoryScreen GameHistory.Model
    | CreateGameScreen CreateGame.Model
    | PlayGameScreen Game.ID PlayGame.Model
    | GameLogScreen Game.ID GameLog.Model
    | GameStatScreen Game.ID GameStat.Model


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
            Tuple.mapBoth
                GameHistoryScreen
                (Effect.map GameHistoryMsg)
                GameHistory.init

        Router.Direct Router.ToCreateGame ->
            Tuple.mapBoth
                CreateGameScreen
                (Effect.map CreateGameMsg)
                CreateGame.initial

        Router.Direct (Router.ToPlayGame gameID) ->
            Tuple.mapBoth
                (PlayGameScreen gameID)
                (Effect.map PlayGameMsg)
                (PlayGame.init gameID)

        Router.Direct (Router.ToGameLog gameID) ->
            Tuple.mapBoth
                (GameLogScreen gameID)
                (Effect.map GameLogMsg)
                (GameLog.init gameID)

        Router.Direct (Router.ToGameStat gameID) ->
            Tuple.mapBoth
                (GameStatScreen gameID)
                (Effect.map GameStatMsg)
                (GameStat.init gameID)


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
    | CreateGameMsg CreateGame.Msg
    | PlayGameMsg PlayGame.Msg
    | GameLogMsg GameLog.Msg
    | GameStatMsg GameStat.Msg


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

        ( GameHistoryMsg gameHistoryMsg, GameHistoryScreen gameHistory ) ->
            let
                ( nextGameHistory, gameHistoryEffect ) =
                    GameHistory.update gameHistoryMsg gameHistory
            in
            ( { model | screen = GameHistoryScreen nextGameHistory }
            , Effect.map GameHistoryMsg gameHistoryEffect
            )

        ( GameHistoryMsg _, _ ) ->
            ( model, Effect.none )

        ( CreateGameMsg createGameMsg, CreateGameScreen createGame ) ->
            let
                ( nextCreateGame, createGameEffect ) =
                    CreateGame.update createGameMsg createGame
            in
            ( { model | screen = CreateGameScreen nextCreateGame }
            , Effect.map CreateGameMsg createGameEffect
            )

        ( CreateGameMsg _, _ ) ->
            ( model, Effect.none )

        ( PlayGameMsg playGameMsg, PlayGameScreen gameID playGame ) ->
            let
                ( nextPlayGame, playGameEffect ) =
                    PlayGame.update playGameMsg playGame
            in
            ( { model | screen = PlayGameScreen gameID nextPlayGame }
            , Effect.map PlayGameMsg playGameEffect
            )

        ( PlayGameMsg _, _ ) ->
            ( model, Effect.none )

        ( GameLogMsg gameLogMsg, GameLogScreen gameID gameLog ) ->
            let
                ( nextGameLog, gameLogEffect ) =
                    GameLog.update gameLogMsg gameLog
            in
            ( { model | screen = GameLogScreen gameID nextGameLog }
            , Effect.map GameLogMsg gameLogEffect
            )

        ( GameLogMsg _, _ ) ->
            ( model, Effect.none )

        ( GameStatMsg gameStatMsg, GameStatScreen gameID gameStat ) ->
            let
                ( nextGameStat, gameStatEffect ) =
                    GameStat.update gameStatMsg gameStat
            in
            ( { model | screen = GameStatScreen gameID nextGameStat }
            , Effect.map GameStatMsg gameStatEffect
            )

        ( GameStatMsg _, _ ) ->
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

            CreateGameScreen _ ->
                Sub.none

            PlayGameScreen _ playGame ->
                Sub.map PlayGameMsg (PlayGame.subscriptions playGame)

            GameLogScreen _ _ ->
                Sub.none

            GameStatScreen _ _ ->
                Sub.none
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
            ( model, Cmd.none )



-- V I E W


view : Model -> Element Msg
view model =
    case model.screen of
        BlankScreen ->
            none

        GameHistoryScreen gameHistory ->
            Element.map GameHistoryMsg (GameHistory.view gameHistory)

        CreateGameScreen createGame ->
            Element.map CreateGameMsg (CreateGame.view createGame)

        PlayGameScreen _ playGame ->
            Element.map PlayGameMsg (PlayGame.view playGame)

        GameLogScreen gameID gameLog ->
            Element.map GameLogMsg (GameLog.view gameID gameLog)

        GameStatScreen gameID gameStat ->
            Element.map GameStatMsg (GameStat.view gameID gameStat)


document : Model -> Browser.Document Msg
document model =
    Browser.Document "Catan"
        [ FontAwesome.Styles.css
        , Element.layout [] (view model)
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
