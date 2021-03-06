module Router exposing
    ( Direction(..)
    , Route(..)
    , parse
    , push
    , replace
    , toPath
    )

import Effect exposing (Effect)
import Effect.History
import Game
import ID
import Url exposing (Url)
import Url.Builder exposing (absolute)
import Url.Parser exposing ((</>), Parser, s, top)


type Route
    = ToGameHistory
    | ToCreateGame
    | ToPlayGame Game.ID
    | ToGameLog Game.ID
    | ToGameStat Game.ID


parser : Parser (Route -> a) a
parser =
    Url.Parser.oneOf
        [ Url.Parser.map ToGameHistory top
        , Url.Parser.map ToCreateGame (s "create")
        , Url.Parser.map ToPlayGame (s "game" </> ID.parser)
        , Url.Parser.map ToGameLog (s "game" </> ID.parser </> s "log")
        , Url.Parser.map ToGameStat (s "game" </> ID.parser </> s "stat")
        ]


type Direction
    = Redirect Route
    | Direct Route


parse : Url -> Direction
parse url =
    case Url.Parser.parse parser url of
        Nothing ->
            Redirect ToGameHistory

        Just route ->
            Direct route


toPath : Route -> String
toPath route =
    case route of
        ToGameHistory ->
            absolute [] []

        ToCreateGame ->
            absolute [ "create" ] []

        ToPlayGame gameID ->
            absolute [ "game", ID.toString gameID ] []

        ToGameLog gameID ->
            absolute [ "game", ID.toString gameID, "log" ] []

        ToGameStat gameID ->
            absolute [ "game", ID.toString gameID, "stat" ] []


push : Route -> Effect msg
push =
    Effect.middleware << Effect.History << Effect.History.Push << toPath


replace : Route -> Effect msg
replace =
    Effect.middleware << Effect.History << Effect.History.Replace << toPath
