module Main exposing (main)

import Browser
import Browser.Navigation
import Element exposing (row, text)
import Element.Input exposing (button)
import Url exposing (Url)



-- M O D E L


type alias Model =
    { count : Int
    }


init : () -> Url -> Browser.Navigation.Key -> ( Model, Cmd Msg )
init _ _ _ =
    ( Model 0
    , Cmd.none
    )



-- U P D A T E


type Msg
    = UrlRequested Browser.UrlRequest
    | UrlChanged Url
    | Dec
    | Inc


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    ( case msg of
        Dec ->
            { model | count = model.count - 1 }

        Inc ->
            { model | count = model.count + 1 }

        _ ->
            model
    , Cmd.none
    )



-- S U B S C R I P T I O N


subscriptions : Model -> Sub Msg
subscriptions _ =
    Sub.none



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
    Browser.application
        { onUrlRequest = UrlRequested
        , onUrlChange = UrlChanged
        , init = init
        , update = update
        , subscriptions = subscriptions
        , view = view
        }
