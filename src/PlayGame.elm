module PlayGame exposing (Model, Msg, init, subscriptions, update, view)

import Api
import Cons
import Dice
import Effect exposing (Effect)
import Element exposing (Element, column, el, none, row, text)
import Element.Background as Background
import Element.Border as Border
import Element.Font as Font
import Element.Input exposing (button)
import Game exposing (Game)
import ID exposing (ID)
import LocalStorage
import Player exposing (Player)
import Task
import Time



-- M O D E L


type alias State =
    { dice : ( Maybe Dice.Number, Maybe Dice.Number, Maybe Dice.Event )
    , now : Time.Posix
    }


type Model
    = Model (Maybe Game) State


init : ID { game : () } -> ( Model, Effect Msg )
init gameID =
    ( Model
        Nothing
        { dice = ( Nothing, Nothing, Nothing )
        , now = Time.millisToPosix 0
        }
    , Effect.batch
        [ Api.loadGame gameID
            |> Effect.map LoadGame
        , Time.now
            |> Task.perform Tick
            |> Effect.fromCmd
        ]
    )



-- U P D A T E


type Dice
    = White Dice.Number
    | Red Dice.Number
    | Event Dice.Event


type Msg
    = LoadGame (Result LocalStorage.Error Game)
    | Tick Time.Posix
    | Choose Dice


update : Msg -> Model -> ( Model, Effect Msg )
update msg (Model game state) =
    case msg of
        LoadGame (Err err) ->
            ( Model game state
            , Effect.none
            )

        LoadGame (Ok loadedGame) ->
            ( Model (Just loadedGame) state
            , Effect.none
            )

        Tick now ->
            ( Model game { state | now = now }
            , Effect.none
            )

        Choose dice ->
            ( case ( dice, state.dice ) of
                ( White white, ( _, red, event ) ) ->
                    Model game { state | dice = ( Just white, red, event ) }

                ( Red red, ( white, _, event ) ) ->
                    Model game { state | dice = ( white, Just red, event ) }

                ( Event event, ( white, red, _ ) ) ->
                    Model game { state | dice = ( white, red, Just event ) }
            , Effect.none
            )



-- S U B S C R I P T I O N S


subscriptions : Model -> Sub Msg
subscriptions _ =
    Time.every 1000 Tick



-- V I E W


formatMilliseconds : Int -> String
formatMilliseconds milliseconds =
    let
        seconds =
            milliseconds // 1000

        minutes =
            seconds // 60
    in
    if minutes > 99 then
        String.fromInt minutes ++ "m"

    else if minutes > 0 then
        String.fromInt minutes ++ "m " ++ String.fromInt (seconds - minutes * 60) ++ "s"

    else
        String.fromInt seconds ++ "s"


viewPlayer : Maybe Int -> Player -> Element Msg
viewPlayer duration player =
    el
        [ Element.width Element.fill
        , Element.height (Element.px 60)
        , Background.color (Player.paint player.color)
        , Font.color (Element.rgb255 236 240 241)
        ]
        (case duration of
            Nothing ->
                none

            Just milliseconds ->
                el
                    [ Element.centerX
                    , Element.centerY
                    ]
                    (text (formatMilliseconds milliseconds))
        )


viewPlayers : Game -> State -> Element Msg
viewPlayers game state =
    let
        current =
            Game.getCurrentPlayer game
    in
    row
        [ Element.width Element.fill
        ]
        (Cons.foldr
            (\player acc ->
                viewPlayer
                    (if current == player.color then
                        Just (Time.posixToMillis state.now - Time.posixToMillis game.startAt)

                     else
                        Nothing
                    )
                    player
                    :: acc
            )
            []
            game.players
        )


viewDiceSide : Bool -> Dice -> Element Msg
viewDiceSide vivid dice =
    let
        ( bgColor, fColor, label ) =
            case dice of
                White white ->
                    ( Element.rgb255 236 240 241
                    , Element.rgb255 52 73 94
                    , text (String.fromInt (Dice.toInt white))
                    )

                Red red ->
                    ( Element.rgb255 231 76 60
                    , Element.rgb255 236 240 241
                    , text (String.fromInt (Dice.toInt red))
                    )

                Event event ->
                    ( Dice.paint event
                    , Dice.paint event
                    , none
                    )
    in
    button
        [ Element.width Element.fill
        , Element.height (Element.px 60)
        , Border.rounded 5
        , Background.color bgColor
        , Font.color fColor
        , Font.center
        , if vivid then
            Element.alpha 1

          else
            Element.alpha 0.33
        ]
        { onPress = Just (Choose dice)
        , label = label
        }


viewDice : (a -> Dice) -> Maybe a -> List a -> Element Msg
viewDice toDice selected elements =
    row
        [ Element.width Element.fill
        , Element.paddingXY 10 0
        , Element.spacing 10
        ]
        (List.map
            (\element ->
                viewDiceSide
                    (selected == Nothing || selected == Just element)
                    (toDice element)
            )
            elements
        )


viewResult : ( Maybe Dice.Number, Maybe Dice.Number, Maybe Dice.Event ) -> Element msg
viewResult ( whiteDice, redDice, eventDice ) =
    button
        [ Element.centerX
        , Element.width (Element.px 160)
        , Element.height (Element.px 160)
        , Border.rounded 80
        , eventDice
            |> Maybe.map Dice.paint
            |> Maybe.withDefault (Element.rgb255 189 195 199)
            |> Background.color
        , Font.color (Element.rgb255 236 240 241)
        , Font.center
        , Font.size 84
        , if whiteDice == Nothing || redDice == Nothing || eventDice == Nothing then
            Element.alpha 0.33

          else
            Element.alpha 1
        ]
        { onPress = Nothing
        , label =
            Maybe.withDefault 0 (Maybe.map Dice.toInt whiteDice)
                + Maybe.withDefault 0 (Maybe.map Dice.toInt redDice)
                |> String.fromInt
                |> text
        }


view : Model -> Element Msg
view (Model game state) =
    let
        ( white, red, event ) =
            state.dice
    in
    column
        [ Element.width Element.fill
        , Element.height Element.fill
        , Element.spacing 10
        ]
        [ case game of
            Nothing ->
                none

            Just g ->
                viewPlayers g state
        , viewDice White white Dice.numbers
        , viewDice Red red Dice.numbers
        , viewDice Event event Dice.events
        , viewResult state.dice
        ]
