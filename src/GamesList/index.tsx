import React from 'react'
import { Link, useParams } from 'react-router-dom'
import cx from 'classnames'
import {
  differenceInMilliseconds,
  format,
  millisecondsToSeconds,
  secondsToMilliseconds
} from 'date-fns'

import { castID, formatDurationMs, sum, useEvery } from '../utils'
import {
  GameID,
  Game,
  useQueryAllGames,
  useQueryGame,
  GameStatus,
  Turn
} from '../api'
import { OngoingGamePlayers, CompletedGamePlayers } from '../GamePlayers'

const gameToolClassName = cx(
  'flex-1 p-1 bg-gray-50 rounded border border-gray-100'
)

const ViewGameToolbar: React.VFC<{
  gameId: GameID
}> = React.memo(({ gameId }) => {
  return (
    <div className="flex gap-1 flex-row text-gray-600 text-center text-xs font-semibold uppercase">
      <Link to={`/game/${gameId}`} className={gameToolClassName}>
        board
      </Link>

      <Link to={`/game/${gameId}/history`} className={gameToolClassName}>
        history
      </Link>

      <Link to={`/game/${gameId}/stat`} className={gameToolClassName}>
        statistic
      </Link>

      <Link to={`/game/${gameId}/stat`} className={gameToolClassName}>
        delete
      </Link>
    </div>
  )
})

const ViewGameDuration: React.VFC<{
  status: GameStatus
  turns: ReadonlyArray<Turn>
}> = React.memo(({ status, turns }) => {
  const prevTurnsDurationMs = React.useMemo(
    () => sum(turns.map(turn => turn.durationMs)),
    [turns]
  )

  const gameDuration = useEvery(
    now => {
      if (status.type === 'COMPLETED') {
        return formatDurationMs(prevTurnsDurationMs)
      }

      if (status.isPaused) {
        return formatDurationMs(
          prevTurnsDurationMs + status.currentTurnDurationMs
        )
      }

      const diffMs = differenceInMilliseconds(
        now,
        status.currentTurnDurationSince
      )

      // floor to the nearest second in milliseconds
      return formatDurationMs(
        prevTurnsDurationMs + status.currentTurnDurationMs + diffMs
      )
    },
    {
      interval: 60,
      skip: status.type === 'COMPLETED' || status.isPaused
    }
  )

  return (
    <>
      <span
        className={cx(
          'px-1 py-0.5 font-mono text-xs text-center text-gray-500 bg-gray-200 rounded',
          '2xs:text-sm'
        )}
      >
        {gameDuration}
      </span>

      {status.type === 'ONGOING' && status.isPaused && (
        <span
          className={cx(
            'px-1 py-0.5 uppercase text-xs text-center text-gray-500 bg-gray-50 ring-1 ring-gray-200 rounded',
            '2xs:text-sm'
          )}
        >
          paused
        </span>
      )}
    </>
  )
})

const ViewGamePicture: React.VFC<{
  picture: File
}> = React.memo(({ picture }) => {
  const pictureUrl = React.useMemo(
    () => URL.createObjectURL(picture),
    [picture]
  )

  return (
    <div className="relative flex justify-center rounded-md overflow-hidden bg-gray-100">
      <img src={pictureUrl} className="max-h-96" alt="board picture" />
    </div>
  )
})

const ViewGame: React.VFC<{
  game: Game
}> = React.memo(({ game }) => (
  <div className={cx('py-3 space-y-2')}>
    <div className="flex items-center gap-2">
      <time className="text-gray-500 text-xs font-light uppercase">
        {format(game.startTime, 'MMMM d HH:mm, yyyy')}
      </time>

      <ViewGameDuration status={game.status} turns={game.turns} />
    </div>

    {game.status.type === 'COMPLETED' && game.status.boardPicture && (
      <ViewGamePicture picture={game.status.boardPicture} />
    )}

    <ViewGameToolbar gameId={game.id} />

    {game.status.type === 'COMPLETED' ? (
      <CompletedGamePlayers
        winnerId={game.status.winnerPlayerId}
        players={game.players}
      />
    ) : (
      <OngoingGamePlayers status={game.status} players={game.players} />
    )}
  </div>
))

const ViewContainer: React.FC<{
  withDividers?: boolean
}> = ({ withDividers, children }) => (
  <div className="h-full overflow-x-hidden overflow-y-auto text-gray-700 mx-auto">
    <div
      className={cx(
        withDividers && 'divide-y divide-gray-200',
        'px-2 mx-auto bg-white border-gray-50',
        'xs:max-w-md xs:px-3 xs:shadow-lg xs:border'
      )}
    >
      {children}
    </div>
  </div>
)

export const GameList = React.memo(() => {
  const { isLoading, error, games } = useQueryAllGames()

  if (isLoading) {
    return null
  }

  if (error != null) {
    return (
      <ViewContainer>
        Something went wrong while loading the games
      </ViewContainer>
    )
  }

  return (
    <ViewContainer withDividers>
      {games.map(game => (
        <ViewGame key={game.id} game={game} />
      ))}
    </ViewContainer>
  )
})
