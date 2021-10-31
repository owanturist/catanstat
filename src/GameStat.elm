module GameStat exposing (Model(..), Msg, init, update, view)

import Api
import Effect exposing (Custom(..), Effect)
import Game
import GameStat.DiceDistributionChart as DiceDistributionChart
import GameStat.EventsDieDistributionChart as EventsDieDistributionChart
import GameStat.EventsDistributionChart as EventsDistributionChart
import GameStat.TotalDurationTable as TotalDurationTable
import GameStat.TurnsDistributionChart as TurnsDistributionChart
import GameStat.TurnsDurationChart as TurnsDurationChart
import Html exposing (Html)
import Html.Events
import Html.Lazy
import Request



-- M O D E L


type Model
    = Loading
    | Failure Request.Error
    | Succeed Game.Statistic


init : Game.ID -> ( Model, Effect Msg )
init gameID =
    ( Loading
    , Api.loadGameStatistic gameID
        |> Request.send LoadGameDone
    )



-- U P D A T E


type Msg
    = LoadGame Game.ID
    | LoadGameDone (Result Request.Error Game.Statistic)


update : Msg -> ( Model, Effect Msg )
update msg =
    case msg of
        LoadGame gameID ->
            init gameID

        LoadGameDone (Err error) ->
            ( Failure error
            , Effect.none
            )

        LoadGameDone (Ok statistic) ->
            ( Succeed statistic
            , Effect.none
            )



-- V I E W


viewLoading : Html msg
viewLoading =
    Html.text "Loading..."


viewFailure : Game.ID -> Request.Error -> Html Msg
viewFailure gameID error =
    -- TODO handle error
    Html.div []
        [ Html.h2 [] [ Html.text "Something went wrong" ]
        , Html.button
            [ Html.Events.onClick (LoadGame gameID)
            ]
            [ Html.text "Try again"
            ]
        ]


viewSucceed : Game.Statistic -> Html msg
viewSucceed statistic =
    let
        turnsDuration =
            List.map .duration statistic.turns

        turnsWhite =
            List.map .white statistic.turns

        turnsRed =
            List.map .red statistic.turns

        turnsEvent =
            List.map .event statistic.turns
    in
    Html.div []
        [ TotalDurationTable.view statistic.players turnsDuration
        , TurnsDurationChart.view statistic.players turnsDuration
        , TurnsDistributionChart.view (List.map2 TurnsDistributionChart.Turn turnsWhite turnsRed)
        , DiceDistributionChart.view (List.map2 DiceDistributionChart.Turn turnsWhite turnsRed)
        , EventsDieDistributionChart.view (List.map2 EventsDieDistributionChart.Turn turnsRed turnsEvent)
        , EventsDistributionChart.view turnsEvent
        ]


view : Game.ID -> Model -> Html Msg
view gameID model =
    case model of
        Loading ->
            viewLoading

        Failure error ->
            viewFailure gameID error

        Succeed statistic ->
            Html.Lazy.lazy viewSucceed statistic
