module Main exposing (main)

import Browser
import Browser.Navigation
import Effect exposing (Effect)
import Effect.History
import Effect.LocalStorage
import Element exposing (Element, none)
import Game
import GameList
import ID exposing (ID)
import Middleware
import Router
import Url exposing (Url)



-- M O D E L


type Screen
    = BlankScreen
    | GameListScreen GameList.Model
    | GameScreen (ID { game : () }) Game.Model


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

        Router.Direct Router.ToGameList ->
            let
                ( initialGameList, gameListEffect ) =
                    GameList.init
            in
            ( GameListScreen initialGameList
            , Effect.map GameListMsg gameListEffect
            )

        Router.Direct (Router.ToGame gameID) ->
            let
                ( initialGame, gameEffect ) =
                    Game.init gameID
            in
            ( GameScreen gameID initialGame
            , Effect.map GameMsg gameEffect
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
    | GameListMsg GameList.Msg
    | GameMsg Game.Msg


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

        ( GameListMsg gameListMsg, GameListScreen gameList ) ->
            let
                ( nextGameList, gameListEffect ) =
                    GameList.update gameListMsg gameList
            in
            ( { model | screen = GameListScreen nextGameList }
            , Effect.map GameListMsg gameListEffect
            )

        ( GameListMsg _, _ ) ->
            ( model, Effect.none )

        ( GameMsg gameMsg, GameScreen gameID game ) ->
            let
                ( nextGame, gameEffect ) =
                    Game.update gameMsg game
            in
            ( { model | screen = GameScreen gameID nextGame }
            , Effect.map GameMsg gameEffect
            )

        ( GameMsg _, _ ) ->
            ( model, Effect.none )



-- S U B S C R I P T I O N


subscriptions : Model -> Sub Msg
subscriptions model =
    Sub.batch
        [ Sub.map LocalStorageMsg Effect.LocalStorage.subscriptions
        , case model.screen of
            BlankScreen ->
                Sub.none

            GameListScreen _ ->
                Sub.none

            GameScreen _ game ->
                Sub.map GameMsg (Game.subscriptions game)
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

        GameListScreen gameList ->
            Element.map GameListMsg (GameList.view gameList)

        GameScreen _ game ->
            Element.map GameMsg (Game.view game)


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
