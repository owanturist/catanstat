module Api exposing
    ( loadAllGames
    , loadGame
    , saveAllGames
    , saveGame
    )

import Effect exposing (Effect)
import Game exposing (Game)
import ID
import Json.Decode as Decode
import Json.Encode as Encode
import LocalStorage


saveGame : Game -> Effect msg
saveGame game =
    LocalStorage.setItem (ID.toString game.id) (Game.encoder game)


loadGame : Game.ID -> Effect (Result LocalStorage.Error Game)
loadGame gameID =
    LocalStorage.getItem (ID.toString gameID) Game.decoder identity


saveAllGames : List Game.ID -> Effect msg
saveAllGames gameIDs =
    LocalStorage.setItem "games" (Encode.list ID.encoder gameIDs)


loadAllGames : Effect (Result LocalStorage.Error (List Game.ID))
loadAllGames =
    LocalStorage.getItem "games" (Decode.list ID.decoder) identity
