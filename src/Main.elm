module Main exposing (main)

import Browser
import Browser.Navigation
import Effect exposing (Effect)
import Effect.History
import Element exposing (row, text)
import Element.Input exposing (button)
import Middleware
import Url exposing (Url)



-- M O D E L


type alias Model =
    { navigation : Browser.Navigation.Key
    , count : Int
    }


init : () -> Url -> Browser.Navigation.Key -> ( Model, Effect Msg )
init _ _ navigation =
    ( Model navigation 0
    , Effect.none
    )



-- U P D A T E


type Msg
    = UrlRequested Browser.UrlRequest
    | UrlChanged Url
    | Dec
    | Inc


update : Msg -> Model -> ( Model, Effect Msg )
update msg model =
    ( case msg of
        Dec ->
            { model | count = model.count - 1 }

        Inc ->
            { model | count = model.count + 1 }

        _ ->
            model
    , Effect.none
    )



-- S U B S C R I P T I O N


subscriptions : Model -> Sub Msg
subscriptions _ =
    Sub.none



-- M I D D L E W A R E S


middlewares : Model -> Effect.Custom msg -> ( Model, Cmd msg )
middlewares model effect =
    case effect of
        Effect.Cmd cmd ->
            ( model, cmd )

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
