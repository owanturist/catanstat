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

const ViewContainer: React.FC = ({ children }) => (
  <div className="flex justify-center p-3 h-full overflow-hidden">
    <div
      className={cx(
        'space-y-3 w-full sm:max-w-md overflow-y-auto overflow-x-hidden',
        'sm:p-3 sm:max-w-md sm:rounded-md sm:shadow-lg sm:border sm:border-gray-50'
      )}
    >
      {children}
    </div>
  </div>
)

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

  if (error != null) {
    return <div>Something went wrong while loading the game</div>
  }

  if (game == null) {
    return <div>Game not found</div>
  }

  if (game.status.type === 'COMPLETED') {
    return (
      <ViewContainer>
        <CompletedGame
          gameId={gameId}
          status={game.status}
          players={game.players}
          store={store}
        />
      </ViewContainer>
    )
  }

  return (
    <ViewContainer>
      <OngoingGame
        gameId={game.id}
        status={game.status}
        players={game.players}
        hasTurns={game.turns.length > 0}
        store={store}
      />
    </ViewContainer>
  )
})
