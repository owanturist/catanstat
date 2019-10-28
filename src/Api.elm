module Api exposing (loadGame, saveGame)

import Effect exposing (Effect)
import Game exposing (Game)
import ID
import LocalStorage


saveGame : Game -> Effect msg
saveGame game =
    LocalStorage.setItem (ID.toString game.id) (Game.encoder game)


loadGame : Game.ID -> Effect (Result LocalStorage.Error Game)
loadGame gameID =
    LocalStorage.getItem (ID.toString gameID) Game.decoder identity
