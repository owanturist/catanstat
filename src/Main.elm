module Main exposing (main)

import Browser
import Browser.Navigation
import Effect exposing (Effect)
import Effect.History
import Effect.LocalStorage
import Element exposing (row, text)
import Element.Input exposing (button)
import Json.Decode
import Json.Encode
import LocalStorage
import Middleware
import Url exposing (Url)



-- M O D E L


type alias Model =
    { navigation : Browser.Navigation.Key
    , localStorage : Effect.LocalStorage.State Msg
    , count : Int
    , hoi : String
    }


init : () -> Url -> Browser.Navigation.Key -> ( Model, Effect Msg )
init _ _ navigation =
    ( Model navigation Effect.LocalStorage.initial 0 "hey"
    , LocalStorage.setItem "hoi" (Json.Encode.string "hi")
    )



-- U P D A T E


type Msg
    = UrlRequested Browser.UrlRequest
    | UrlChanged Url
    | LocalStorageMsg Effect.LocalStorage.Msg
    | ReadHoi (Result LocalStorage.Error String)
    | Dec
    | Inc


update : Msg -> Model -> ( Model, Effect Msg )
update msg model =
    case msg of
        LocalStorageMsg localStorageMsg ->
            case Effect.LocalStorage.update localStorageMsg model.localStorage of
                Nothing ->
                    ( model, Effect.none )

                Just ( nextLocalStorage, subMsg ) ->
                    update subMsg { model | localStorage = nextLocalStorage }

        Dec ->
            ( { model | count = model.count - 1 }
            , LocalStorage.getItem "hoi" Json.Decode.string ReadHoi
            )

        Inc ->
            ( { model | count = model.count + 1 }
            , Effect.none
            )

        ReadHoi (Err _) ->
            ( { model | hoi = "error" }
            , Effect.none
            )

        ReadHoi (Ok hoi) ->
            ( { model | hoi = hoi }
            , Effect.none
            )

        _ ->
            ( model, Effect.none )



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

        Effect.Toast toast ->
            ( model, Cmd.none )



-- V I E W


view : Model -> Browser.Document Msg
view model =
    row []
        [ button []
            { onPress = Just Dec
            , label = text "-"
            }
        , text (String.fromInt model.count)
        , button []
            { onPress = Just Inc
            , label = text "+"
            }
        , text model.hoi
        ]
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
