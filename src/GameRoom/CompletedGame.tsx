import React from 'react'

import { PlayerID, Player } from '../api'

import * as PlayersRow from './PlayersRow'

export const CompletedGame: React.VFC<{
  winnerId: PlayerID
  players: ReadonlyArray<Player>
}> = React.memo(({ winnerId, players }) => {
  return (
    <>
      <PlayersRow.CompletedGame winnerId={winnerId} players={players} />
    </>
  )
})
