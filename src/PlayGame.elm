module PlayGame exposing (Model, Msg, init, subscriptions, update, view)

import Api
import Cons
import Dice
import Effect exposing (Effect)
import Element exposing (Element, column, el, link, none, row, text)
import Element.Background as Background
import Element.Border as Border
import Element.Font as Font
import Element.Input exposing (button)
import Extra exposing (formatMilliseconds)
import FontAwesome.Icon exposing (Icon, viewIcon)
import FontAwesome.Solid exposing (chartPie, listUl, square)
import Game exposing (Game)
import ID exposing (ID)
import LocalStorage
import Palette
import Player exposing (Player)
import Router
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


viewPlayer : Maybe Int -> Player -> Element Msg
viewPlayer duration player =
    el
        [ Element.width Element.fill
        , Element.height (Element.px 60)
        , Background.color (Player.toColor player.color)
        , Font.color Palette.clouds
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


viewDiceSide : Bool -> Dice -> Element Msg
viewDiceSide vivid dice =
    let
        ( fColor, icon ) =
            case dice of
                White white ->
                    ( Palette.concrete
                    , Dice.toIcon white
                    )

                Red red ->
                    ( Palette.alizarin
                    , Dice.toIcon red
                    )

                Event event ->
                    ( Dice.toColor event
                    , square
                    )
    in
    button
        [ Border.rounded 5
        , Font.color fColor
        , Font.size 60
        , Font.center
        , if vivid then
            Element.alpha 1

          else
            Element.alpha 0.33
        ]
        { onPress = Just (Choose dice)
        , label = Element.html (viewIcon icon)
        }


viewDice : (a -> Dice) -> Maybe a -> List a -> Element Msg
viewDice toDice selected elements =
    row
        [ Element.spaceEvenly
        , Element.width Element.fill
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
            |> Maybe.map Dice.toColor
            |> Maybe.withDefault Palette.silver
            |> Background.color
        , Font.color Palette.clouds
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


viewLink : Router.Route -> Icon -> String -> Element msg
viewLink route icon label =
    link
        [ Element.paddingXY 15 5
        , Border.rounded 6
        , Background.color Palette.amethyst
        , Font.color Palette.clouds
        ]
        { url = Router.toPath route
        , label =
            row
                [ Element.spacing 10
                ]
                [ viewIcon icon
                    |> Element.html
                    |> el []
                , text label
                ]
        }


view : Game.ID -> Model -> Element Msg
view gameID model =
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
        ]
        [ model.game
            |> Maybe.map (Cons.toList << .players)
            |> Maybe.map2 (viewPlayers duration) current
            |> Maybe.withDefault none
        , column
            [ Element.paddingXY 10 0
            , Element.spacing 5
            , Element.width Element.fill
            , Element.height Element.fill
            ]
            [ row
                [ Element.paddingEach
                    { top = 10
                    , left = 0
                    , bottom = 0
                    , right = 0
                    }
                , Element.spacing 10
                , Element.width Element.fill
                ]
                [ viewLink (Router.ToGameLog gameID) listUl "logs"
                , viewLink (Router.ToGameStat gameID) chartPie "stat"
                ]
            , viewDice White white Dice.numbers
            , viewDice Red red Dice.numbers
            , viewDice Event event Dice.events
            , Maybe.map (viewResult model.dice) current
                |> Maybe.withDefault none
            ]
        ]
