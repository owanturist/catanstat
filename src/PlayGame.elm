module PlayGame exposing (Model, Msg, init, subscriptions, update, view)

import Api
import Cons
import Dice
import Effect exposing (Effect)
import Element exposing (Element, column, el, link, none, row, text)
import Element.Background as Background
import Element.Border as Border
import Element.Events as Events
import Element.Font as Font
import Element.Input exposing (button)
import Extra exposing (formatMilliseconds, ifelse)
import FontAwesome.Attributes
import FontAwesome.Icon exposing (Icon, viewIcon)
import FontAwesome.Solid exposing (alignJustify, chartPie, check, flag, home, square, times, trophy)
import Game exposing (Game)
import ID exposing (ID)
import Json.Decode as Decode
import LocalStorage
import Palette
import Player exposing (Player)
import Router
import Task
import Time



-- M O D E L


type alias FinishDialog =
    { endAt : Time.Posix
    , winner : Player.Color
    }


type alias State =
    { white : Maybe Dice.Number
    , red : Maybe Dice.Number
    , event : Maybe Dice.Event
    , now : Time.Posix
    , finish : Maybe FinishDialog
    }


type Model
    = Loading
    | Failure Decode.Error
    | Succeed Game State


init : ID { game : () } -> ( Model, Effect Msg )
init gameID =
    ( Loading
    , Api.loadGame gameID
        |> Effect.map LoadGame
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
    | ShowFinishDialog Player.Color
    | ChangeWinner Player.Color
    | HideFinishDialog
    | Finish


update : Msg -> Model -> ( Model, Effect Msg )
update msg model =
    case ( msg, model ) of
        ( LoadGame (Err LocalStorage.NotFound), _ ) ->
            ( model
            , Router.replace Router.ToCreateGame
            )

        ( LoadGame (Err (LocalStorage.DecodeError error)), _ ) ->
            ( Failure error
            , Effect.none
            )

        ( LoadGame (Ok loadedGame), _ ) ->
            ( Succeed loadedGame
                { white = Nothing
                , red = Nothing
                , event = Nothing
                , now = Time.millisToPosix 0
                , finish = Nothing
                }
            , if loadedGame.status == Game.InGame then
                Time.now
                    |> Task.perform Tick
                    |> Effect.fromCmd

              else
                Effect.none
            )

        ( Tick now, Succeed game state ) ->
            ( Succeed game { state | now = now }
            , Effect.none
            )

        ( Tick _, _ ) ->
            ( model, Effect.none )

        ( Choose (White white), Succeed game state ) ->
            ( Succeed game { state | white = Just white }
            , Effect.none
            )

        ( Choose (Red red), Succeed game state ) ->
            ( Succeed game { state | red = Just red }
            , Effect.none
            )

        ( Choose (Event event), Succeed game state ) ->
            ( Succeed game { state | event = Just event }
            , Effect.none
            )

        ( Choose _, _ ) ->
            ( model, Effect.none )

        ( Turn current finalDice, Succeed game state ) ->
            let
                nextGame =
                    { game | moves = Game.Move state.now current finalDice :: game.moves }
            in
            ( Succeed nextGame
                { state
                    | red = Nothing
                    , white = Nothing
                    , event = Nothing
                }
            , Api.saveGame nextGame
            )

        ( Turn _ _, _ ) ->
            ( model, Effect.none )

        ( ShowFinishDialog current, Succeed game state ) ->
            ( Succeed game
                { state
                    | finish =
                        Just
                            { endAt = state.now
                            , winner = current
                            }
                }
            , Effect.none
            )

        ( ShowFinishDialog _, _ ) ->
            ( model, Effect.none )

        ( ChangeWinner nextWinner, Succeed game state ) ->
            ( case state.finish of
                Nothing ->
                    model

                Just finish ->
                    Succeed game { state | finish = Just { finish | winner = nextWinner } }
            , Effect.none
            )

        ( ChangeWinner _, _ ) ->
            ( model, Effect.none )

        ( HideFinishDialog, Succeed game state ) ->
            ( Succeed game { state | finish = Nothing }
            , Effect.none
            )

        ( HideFinishDialog, _ ) ->
            ( model, Effect.none )

        ( Finish, Succeed game state ) ->
            ( model
            , case state.finish of
                Nothing ->
                    Effect.none

                Just finish ->
                    Effect.batch
                        [ Api.saveGame { game | status = Game.Finished finish.endAt finish.winner }
                        , Router.push (Router.ToGameStat game.id)
                        ]
            )

        ( Finish, _ ) ->
            ( model, Effect.none )



-- S U B S C R I P T I O N S


subscriptions : Model -> Sub Msg
subscriptions model =
    case model of
        Succeed game _ ->
            if game.status == Game.InGame then
                Time.every 950 Tick

            else
                Sub.none

        _ ->
            Sub.none



-- V I E W


viewPlayer : Player.Color -> Element msg -> Element msg
viewPlayer color =
    el
        [ Element.width Element.fill
        , Element.height (Element.px 60)
        , Background.color (Player.toColor color)
        , Font.color Palette.clouds
        ]


viewPlayers : Player.Color -> Game -> State -> Element msg
viewPlayers current game state =
    case game.status of
        Game.InGame ->
            row
                [ Element.width Element.fill
                ]
                (List.map
                    (\player ->
                        if current == player.color then
                            List.head game.moves
                                |> Maybe.map .endAt
                                |> Maybe.withDefault game.startAt
                                |> Time.posixToMillis
                                |> (-) (Time.posixToMillis state.now)
                                |> formatMilliseconds
                                |> text
                                |> el
                                    [ Element.centerX
                                    , Element.centerY
                                    ]
                                |> viewPlayer player.color

                        else
                            viewPlayer player.color none
                    )
                    (Cons.toList game.players)
                )

        Game.Finished _ winner ->
            row
                [ Element.width Element.fill
                ]
                (List.map
                    (\player ->
                        if winner == player.color then
                            viewIcon trophy
                                |> Element.html
                                |> el
                                    [ Element.centerX
                                    , Element.centerY
                                    ]
                                |> viewPlayer player.color

                        else
                            viewPlayer player.color none
                    )
                    (Cons.toList game.players)
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
        , Element.alpha (ifelse vivid 1 0.33)
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


viewResult : Player.Color -> State -> Element Msg
viewResult current state =
    button
        [ Element.centerX
        , Element.width (Element.px 160)
        , Element.height (Element.px 160)
        , Border.rounded 80
        , state.event
            |> Maybe.map Dice.toColor
            |> Maybe.withDefault Palette.silver
            |> Background.color
        , Font.color Palette.clouds
        , Font.center
        , Font.size 84
        , if state.white == Nothing || state.red == Nothing || state.event == Nothing then
            Element.alpha 0.33

          else
            Element.alpha 1
        ]
        { onPress =
            Maybe.map3 Game.Dice
                state.white
                state.red
                state.event
                |> Maybe.map (Turn current)
        , label =
            Maybe.withDefault 0 (Maybe.map Dice.toInt state.white)
                + Maybe.withDefault 0 (Maybe.map Dice.toInt state.red)
                |> String.fromInt
                |> text
        }


viewLink : Router.Route -> Icon -> Element msg
viewLink route icon =
    link
        [ Element.padding 10
        , Border.rounded 6
        , Background.color Palette.amethyst
        , Font.color Palette.clouds
        ]
        { url = Router.toPath route
        , label =
            icon
                |> FontAwesome.Icon.viewStyled
                    [ FontAwesome.Attributes.fw
                    ]
                |> Element.html
        }


viewFinishTrigger : Player.Color -> Element Msg
viewFinishTrigger current =
    button
        [ Element.alignRight
        , Element.padding 10
        , Border.rounded 6
        , Background.color Palette.amethyst
        , Font.color Palette.clouds
        ]
        { onPress = Just (ShowFinishDialog current)
        , label =
            flag
                |> FontAwesome.Icon.viewStyled
                    [ FontAwesome.Attributes.fw
                    ]
                |> Element.html
        }


viewButton : List (Element.Attribute msg) -> Element msg -> Element msg
viewButton attributes child =
    button
        (Element.width (Element.px 46)
            :: Element.height (Element.px 46)
            :: Background.color (Element.rgb255 255 255 255)
            :: Border.rounded 3
            :: Border.width 1
            :: Border.color (Element.rgb255 186 189 182)
            :: Font.color Palette.wetAsphalt
            :: Font.center
            :: attributes
        )
        { onPress = Nothing, label = child }


viewWinner : Player.Color -> Player -> Element Msg
viewWinner selected player =
    row
        [ Element.paddingXY 20 5
        , Element.spacing 5
        , Element.width Element.fill
        , Background.color (Player.toColor player.color)
        , Font.color Palette.clouds
        ]
        [ text player.name
        , if selected == player.color then
            row
                [ Element.alignRight
                , Element.spacing 5
                ]
                [ viewIcon check
                    |> Element.html
                    |> el
                        [ Element.centerX
                        , Element.centerY
                        ]
                    |> viewButton
                        [ Events.onClick Finish
                        ]
                , viewIcon times
                    |> Element.html
                    |> el
                        [ Element.centerX
                        , Element.centerY
                        ]
                    |> viewButton
                        [ Events.onClick HideFinishDialog
                        ]
                ]

          else
            viewIcon trophy
                |> Element.html
                |> el
                    [ Element.centerX
                    , Element.centerY
                    ]
                |> viewButton
                    [ Element.alignRight
                    , Events.onClick (ChangeWinner player.color)
                    ]
        ]


viewFinisDialog : Game -> FinishDialog -> Element Msg
viewFinisDialog game finish =
    el
        [ Element.width Element.fill
        , Element.height Element.fill
        , Element.padding 20
        , button
            [ Element.width Element.fill
            , Element.height Element.fill
            , Background.color (Element.rgba 0.25 0.25 0.25 0.75)
            ]
            { onPress = Just HideFinishDialog
            , label = none
            }
            |> Element.behindContent
        ]
        (column
            [ Element.centerX
            , Element.centerY
            , Element.width Element.fill
            ]
            (List.map (viewWinner finish.winner) (Cons.toList game.players))
        )


viewSucceed : Game -> State -> Element Msg
viewSucceed game state =
    let
        current =
            Game.getCurrentPlayer game
    in
    column
        [ Element.width Element.fill
        , Element.height Element.fill
        , state.finish
            |> Maybe.map (viewFinisDialog game)
            |> Maybe.withDefault none
            |> Element.inFront
        ]
        [ viewPlayers current game state
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
                [ viewLink Router.ToGameHistory home
                , viewLink (Router.ToGameLog game.id) alignJustify
                , viewLink (Router.ToGameStat game.id) chartPie
                , case game.status of
                    Game.InGame ->
                        viewFinishTrigger current

                    Game.Finished endAt _ ->
                        Time.posixToMillis endAt
                            - Time.posixToMillis game.startAt
                            |> formatMilliseconds
                            |> text
                            |> el
                                [ Element.alignRight
                                , Font.color Palette.wetAsphalt
                                ]
                ]
            , if game.status == Game.InGame then
                column
                    [ Element.width Element.fill
                    , Element.height Element.fill
                    , Element.spacing 5
                    ]
                    [ viewDice White state.white Dice.numbers
                    , viewDice Red state.red Dice.numbers
                    , viewDice Event state.event Dice.events
                    , viewResult current state
                    ]

              else
                none
            ]
        ]


view : Model -> Element Msg
view model =
    case model of
        Loading ->
            none

        Failure error ->
            el
                [ Element.width Element.fill
                , Font.family [ Font.monospace ]
                , Font.size 10
                ]
                (text (Decode.errorToString error))

        Succeed game state ->
            viewSucceed game state
