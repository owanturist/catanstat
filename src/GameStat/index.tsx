import React from 'react'
import { useParams } from 'react-router-dom'
import cx from 'classnames'

import { castID } from '../utils'
import { GameID, useQueryGame } from '../api'
import { LoadingScreen } from '../LoadingScreen'

const ViewContainer: React.FC<{
  className?: string
}> = ({ className, children }) => (
  <div className="h-full overflow-y-auto text-gray-700 mx-auto">
    <div
      className={cx(
        className,
        'h-full min-h-full p-2 mx-auto space-y-4 bg-white border-gray-50',
        '2xs:space-y-6',
        'xs:max-w-md xs:p-3 xs:shadow-lg xs:border-x'
      )}
    >
      {children}
    </div>
  </div>
)

const LazyGameStat = React.lazy(() => import('./GameStat'))

const ViewLoading: React.VFC = () => (
  <ViewContainer className="flex justify-center">
    <LoadingScreen />
  </ViewContainer>
)

export const GameStat: React.VFC = React.memo(() => {
  const params = useParams<'gameId'>()
  const gameId = castID<GameID>(params.gameId!)
  const { isLoading, error, game } = useQueryGame(gameId)

  if (isLoading) {
    return <ViewLoading />
  }

  if (error != null) {
    return (
      <ViewContainer>Something went wrong while loading the game</ViewContainer>
    )
  }

  if (game == null) {
    return <ViewContainer>Game not found</ViewContainer>
  }

  return (
    <React.Suspense fallback={<ViewLoading />}>
      <ViewContainer>
        <LazyGameStat game={game} />
      </ViewContainer>
    </React.Suspense>
  )
})
