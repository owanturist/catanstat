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
import FontAwesome.Icon exposing (viewIcon)
import FontAwesome.Solid exposing (diceFive, diceFour, diceOne, diceSix, diceThree, diceTwo, square)
import Game exposing (Game)
import ID exposing (ID)
import LocalStorage
import Player exposing (Player)
import Task
import Time



-- M O D E L


type alias Model =
    { dice : ( Maybe Dice.Number, Maybe Dice.Number, Maybe Dice.Event )
    , now : Time.Posix
    , game : Maybe Game
    }


init : ID { game : () } -> ( Model, Effect Msg )
init gameID =
    ( Model
        ( Nothing, Nothing, Nothing )
        (Time.millisToPosix 0)
        Nothing
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
    | Turn Player.Color Game.Dice


update : Msg -> Model -> ( Model, Effect Msg )
update msg model =
    case msg of
        LoadGame (Err err) ->
            ( model
            , Effect.none
            )

        LoadGame (Ok loadedGame) ->
            ( { model | game = Just loadedGame }
            , Effect.none
            )

        Tick now ->
            ( { model | now = now }
            , Effect.none
            )

        Choose dice ->
            ( case ( dice, model.dice ) of
                ( White white, ( _, red, event ) ) ->
                    { model | dice = ( Just white, red, event ) }

                ( Red red, ( white, _, event ) ) ->
                    { model | dice = ( white, Just red, event ) }

                ( Event event, ( white, red, _ ) ) ->
                    { model | dice = ( white, red, Just event ) }
            , Effect.none
            )

        Turn current finalDice ->
            case model.game of
                Nothing ->
                    ( model, Effect.none )

                Just game ->
                    let
                        nextGame =
                            { game | moves = Game.Move model.now current finalDice :: game.moves }
                    in
                    ( { model
                        | dice = ( Nothing, Nothing, Nothing )
                        , game = Just nextGame
                      }
                    , Api.saveGame nextGame
                    )



-- S U B S C R I P T I O N S


subscriptions : Model -> Sub Msg
subscriptions _ =
    Time.every 950 Tick



-- V I E W


formatMilliseconds : Int -> String
formatMilliseconds milliseconds =
    let
        seconds =
            milliseconds // 1000

        minutes =
            seconds // 60

        hours =
            minutes // 60
    in
    if hours > 0 then
        String.fromInt hours ++ "h " ++ String.fromInt (minutes - hours * 60) ++ "m"

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


viewPlayers : Int -> Player.Color -> List Player -> Element Msg
viewPlayers duration current players =
    row
        [ Element.width Element.fill
        ]
        (List.map
            (\player ->
                viewPlayer
                    (if current == player.color then
                        Just duration

                     else
                        Nothing
                    )
                    player
            )
            players
        )


viewNumberDice : Dice.Number -> Element msg
viewNumberDice dice =
    case dice of
        Dice.One ->
            Element.html (viewIcon diceOne)

        Dice.Two ->
            Element.html (viewIcon diceTwo)

        Dice.Three ->
            Element.html (viewIcon diceThree)

        Dice.Four ->
            Element.html (viewIcon diceFour)

        Dice.Five ->
            Element.html (viewIcon diceFive)

        Dice.Six ->
            Element.html (viewIcon diceSix)


viewDiceSide : Bool -> Dice -> Element Msg
viewDiceSide vivid dice =
    let
        ( fColor, label ) =
            case dice of
                White white ->
                    ( Element.rgb255 149 165 166
                    , viewNumberDice white
                    )

                Red red ->
                    ( Element.rgb255 231 76 60
                    , viewNumberDice red
                    )

                Event event ->
                    ( Dice.paint event
                    , Element.html (viewIcon square)
                    )
    in
    button
        [ Element.width Element.fill
        , Border.rounded 5
        , Font.color fColor
        , Font.size 60
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
        ]
        (List.map
            (\element ->
                viewDiceSide
                    (selected == Nothing || selected == Just element)
                    (toDice element)
            )
            elements
        )


viewResult : ( Maybe Dice.Number, Maybe Dice.Number, Maybe Dice.Event ) -> Player.Color -> Element Msg
viewResult ( whiteDice, redDice, eventDice ) current =
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
        { onPress = Maybe.map (Turn current) (Maybe.map3 Game.Dice whiteDice redDice eventDice)
        , label =
            Maybe.withDefault 0 (Maybe.map Dice.toInt whiteDice)
                + Maybe.withDefault 0 (Maybe.map Dice.toInt redDice)
                |> String.fromInt
                |> text
        }


view : Model -> Element Msg
view model =
    let
        ( white, red, event ) =
            model.dice

        current =
            Maybe.map Game.getCurrentPlayer model.game

        duration =
            case model.game of
                Nothing ->
                    0

                Just game ->
                    List.head game.moves
                        |> Maybe.map .endAt
                        |> Maybe.withDefault game.startAt
                        |> Time.posixToMillis
                        |> (-) (Time.posixToMillis model.now)
    in
    column
        [ Element.width Element.fill
        , Element.height Element.fill
        , Element.spacing 5
        ]
        [ model.game
            |> Maybe.map (Cons.toList << .players)
            |> Maybe.map2 (viewPlayers duration) current
            |> Maybe.withDefault none
        , viewDice White white Dice.numbers
        , viewDice Red red Dice.numbers
        , viewDice Event event Dice.events
        , Maybe.map (viewResult model.dice) current
            |> Maybe.withDefault none
        ]
