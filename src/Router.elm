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
import ID exposing (ID)
import Url exposing (Url)
import Url.Builder exposing (absolute)
import Url.Parser exposing ((</>), Parser, s, top)


type Route
    = ToGameList
    | ToGameCreate
    | ToGame (ID { game : () })


parser : Parser (Route -> a) a
parser =
    Url.Parser.oneOf
        [ Url.Parser.map ToGameList top
        , Url.Parser.map ToGameCreate (s "create")
        , Url.Parser.map ToGame (s "game" </> ID.parser)
        ]


type Direction
    = Redirect Route
    | Direct Route


parse : Url -> Direction
parse url =
    case Url.Parser.parse parser url of
        Nothing ->
            Redirect ToGameList

        Just route ->
            Direct route


toPath : Route -> String
toPath route =
    case route of
        ToGameList ->
            absolute [] []

        ToGameCreate ->
            absolute [ "create" ] []

        ToGame gameID ->
            absolute [ "game", ID.toString gameID ] []


push : Route -> Effect msg
push =
    Effect.middleware << Effect.History << Effect.History.Push << toPath


replace : Route -> Effect msg
replace =
    Effect.middleware << Effect.History << Effect.History.Replace << toPath
