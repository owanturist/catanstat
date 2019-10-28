module Game exposing (Dice, Game, ID, Move, create, decoder, encoder, generateID, getCurrentPlayer)

import Cons exposing (Cons)
import Dice
import ID
import Json.Decode as Decode exposing (Decoder)
import Json.Encode as Encode exposing (Value)
import Murmur3
import Player exposing (Player)
import Time


type alias ID =
    ID.ID { game : () }


generateID : Time.Posix -> ID
generateID posix =
    Time.posixToMillis posix
        |> String.fromInt
        |> Murmur3.hashString 0
        |> ID.fromInt


posixEncoder : Time.Posix -> Value
posixEncoder posix =
    Encode.int (Time.posixToMillis posix // 1000)


posixDecoder : Decoder Time.Posix
posixDecoder =
    Decode.map (Time.millisToPosix << (*) 1000) Decode.int


type alias Dice =
    { white : Dice.Number
    , red : Dice.Number
    , event : Dice.Event
    }


diceEncoder : Dice -> Value
diceEncoder dice =
    Encode.list identity
        [ Dice.numberEncoder dice.white
        , Dice.numberEncoder dice.red
        , Dice.eventEncoder dice.event
        ]


diceDecoder : Decoder Dice
diceDecoder =
    Decode.map3 Dice
        (Decode.index 0 Dice.numberDecoder)
        (Decode.index 1 Dice.numberDecoder)
        (Decode.index 2 Dice.eventDecoder)


type alias Move =
    { endAt : Time.Posix
    , player : Player.Color
    , dice : Dice
    }


moveEncoder : Move -> Value
moveEncoder move =
    Encode.list identity
        [ posixEncoder move.endAt
        , Player.colorEncoder move.player
        , diceEncoder move.dice
        ]


moveDecoder : Decoder Move
moveDecoder =
    Decode.map3 Move
        (Decode.index 0 posixDecoder)
        (Decode.index 1 Player.colorDecoder)
        (Decode.index 2 diceDecoder)


type alias Game =
    { id : ID
    , startAt : Time.Posix
    , players : Cons Player
    , moves : List Move
    }


encoder : Game -> Value
encoder game =
    Encode.list identity
        [ ID.encoder game.id
        , posixEncoder game.startAt
        , Encode.list Player.encoder (Cons.toList game.players)
        , Encode.list moveEncoder game.moves
        ]


decoder : Decoder Game
decoder =
    Decode.map4 Game
        (Decode.index 0 ID.decoder)
        (Decode.index 1 posixDecoder)
        (Decode.index 2 (Decode.oneOrMore Cons.cons Player.decoder))
        (Decode.index 3 (Decode.list moveDecoder))


getCurrentPlayerHelp : Player.Color -> List Player -> Maybe Player
getCurrentPlayerHelp latest players =
    case players of
        first :: second :: rest ->
            if latest == first.color then
                Just second

            else
                getCurrentPlayerHelp latest (second :: rest)

        _ ->
            Nothing


getCurrentPlayer : Game -> Player.Color
getCurrentPlayer game =
    case List.head game.moves of
        Nothing ->
            Cons.head game.players
                |> .color

        Just latest ->
            Cons.tail game.players
                |> getCurrentPlayerHelp latest.player
                |> Maybe.withDefault (Cons.head game.players)
                |> .color


create : Cons Player -> Time.Posix -> Game
create players posix =
    Game (generateID posix) posix players []
