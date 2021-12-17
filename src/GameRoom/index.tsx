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
  <div className="h-full overflow-y-auto">
    <div
      className={cx(
        'flex flex-col min-h-full items-center text-gray-700',
        'sm:justify-center sm:py-3'
      )}
    >
      <div
        className={cx(
          'flex-1 shrink-0 max-w-md w-full p-2 bg-white border-gray-50 overflow-hidden',
          'xs:p-3 xs:shadow-lg',
          'sm:max-w-md sm:border sm:rounded-md sm:flex-initial'
        )}
      >
        {children}
      </div>
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
