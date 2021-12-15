import cx from 'classnames'
import React from 'react'
import { useParams } from 'react-router-dom'
import { InnerStore } from 'react-inner-store'

import { GameID, useQueryGame } from '../api'
import { castID } from '../utils'

import { State } from './domain'
import { CompletedGame } from './CompletedGame'
import { OngoingGame } from './OngoingGame'

export { State } from './domain'

export const View: React.VFC<{
  store: InnerStore<State>
}> = React.memo(({ store }) => {
  const params = useParams<'gameId'>()
  const gameId = castID<GameID>(params.gameId!)
  const { isLoading, error, game } = useQueryGame(gameId)

  if (isLoading) {
    // @TODO loading skeleton
    return null
  }

  if (error != null || game == null) {
    return <div>Something went wrong while loading the game</div>
  }

  const lastTurn = game.turns[0]

  return (
    <div className={cx('flex justify-center p-3 h-full overflow-hidden')}>
      <div
        className={cx(
          'space-y-3 w-full sm:max-w-md',
          'sm:p-3 sm:max-w-md sm:rounded-md sm:shadow-lg sm:border sm:border-gray-50'
        )}
      >
        {game.endTime != null && lastTurn != null ? (
          <CompletedGame winnerId={lastTurn.player.id} players={game.players} />
        ) : (
          <OngoingGame game={game} store={store} />
        )}
      </div>
    </div>
  )
})
