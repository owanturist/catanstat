import React from 'react'

import { Player, GameStatusCompleted } from '../api'

import * as PlayersRow from './PlayersRow'

export const CompletedGame: React.VFC<{
  status: GameStatusCompleted
  players: ReadonlyArray<Player>
}> = React.memo(({ status, players }) => {
  return (
    <>
      <PlayersRow.CompletedGame
        winnerId={status.winnerPlayerId}
        players={players}
      />
    </>
  )
})
