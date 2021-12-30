import React from 'react'
import { Link } from 'react-router-dom'
import cx from 'classnames'
import { differenceInMilliseconds, format } from 'date-fns'
import { toast } from 'react-hot-toast'

import { formatDurationMs, sum, useEvery } from '../utils'
import {
  GameID,
  Game,
  useQueryAllGames,
  useDeleteGame,
  GameStatus,
  Turn
} from '../api'
import * as Icon from '../Icon'
import { OngoingGamePlayers, CompletedGamePlayers } from '../GamePlayers'

const DELETE_RESTORE_INTERVAL_SEC = 3

const styleGameTool = cx(
  'flex-1 p-1 rounded border text-center text-2xs font-semibold uppercase outline-none transition',
  'focus-within:ring-2',
  '2xs:text-xs',
  'xs:text-sm'
)

const ViewGameToolLink: React.FC<{
  to: string
}> = props => (
  <Link
    {...props}
    className={cx(
      styleGameTool,
      'text-gray-600 bg-gray-50 border-gray-100 ring-gray-100',
      'hover:bg-gray-100 hover:border-gray-200'
    )}
  />
)

const ViewDeleteGameTool: React.FC<{
  gameId: GameID
}> = React.memo(({ gameId }) => {
  const [restoreSince, setRestoreSince] = React.useState<null | Date>(null)
  const countdown = useEvery(
    now => {
      if (restoreSince == null) {
        return null
      }

      const diff = Math.max(
        0,
        DELETE_RESTORE_INTERVAL_SEC -
          differenceInMilliseconds(now, restoreSince) / 1000
      )

      return Number(diff.toFixed(1))
    },
    {
      interval: 60,
      skip: restoreSince === null
    }
  )
  const { isLoading, deleteGame } = useDeleteGame({
    onError() {
      toast.error('Failed to delete game')
    }
  })

  React.useEffect(() => {
    if (countdown === 0) {
      deleteGame(gameId)
      setRestoreSince(null)
    }
  }, [deleteGame, countdown, gameId])

  if (countdown != null && countdown > 0) {
    return (
      <button
        type="button"
        className={cx(
          styleGameTool,
          'whitespace-nowrap',
          'text-blue-600 bg-blue-50 border-blue-100 ring-blue-100',
          'hover:bg-blue-100 hover:border-blue-200'
        )}
        onClick={() => setRestoreSince(null)}
      >
        <span className="inline-block w-[3ch]">{countdown.toFixed(1)}</span>
        restore
      </button>
    )
  }

  return (
    <button
      type="button"
      className={cx(
        styleGameTool,
        'text-red-600 bg-red-50 border-red-100 ring-red-100',
        'hover:bg-red-100 hover:border-red-200'
      )}
      onClick={() => {
        if (!isLoading) {
          setRestoreSince(new Date())
        }
      }}
    >
      delete
    </button>
  )
})

const ViewGameToolbar: React.VFC<{
  gameId: GameID
}> = React.memo(({ gameId }) => (
  <div className="flex gap-1 flex-row">
    <ViewGameToolLink to={`/game/${gameId}`}>board</ViewGameToolLink>

    <ViewGameToolLink to={`/game/${gameId}/history`}>history</ViewGameToolLink>

    <ViewGameToolLink to={`/game/${gameId}/stat`}>statistic</ViewGameToolLink>

    <ViewDeleteGameTool gameId={gameId} />
  </div>
))

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
            'px-1 py-0.5 uppercase text-xs text-yellow-500 bg-yellow-50 ring-1 ring-yellow-300 tracking-wider rounded',
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
  <div
    className={cx(
      'py-3 space-y-2',
      '2xs:py-4 2xs:space-y-3',
      'xs:py-5 xs:space-y-4'
    )}
  >
    <div className="flex items-center gap-2">
      <time
        className={cx(
          'text-gray-500 text-xs font-light uppercase',
          '2xs:text-sm'
        )}
      >
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

const ViewEmpty: React.VFC = React.memo(() => (
  <div className="flex flex-col gap-2 justify-center items-center h-full">
    <p className="text-center text-lg 2xs:text-xl xs:text-2xl">
      No games found{' '}
      <span role="img" className="text-2xl 2xs:text-3xl xs:text-4xl">
        🤷‍♂️
      </span>
      <br />
      Start a new game by clicking{' '}
      <Icon.Plus role="img" className="inline-block ml-1 cursor-default" />
    </p>
  </div>
))

const ViewContainer: React.FC<{
  className?: string
}> = ({ className, children }) => (
  <div className="h-full overflow-x-hidden overflow-y-auto text-gray-700 mx-auto">
    <div
      className={cx(
        className,
        'h-full min-h-full px-2 mx-auto bg-white border-gray-50',
        'xs:max-w-md xs:px-3 xs:shadow-lg xs:border-x'
      )}
    >
      {children}
    </div>
  </div>
)

export const GameList = React.memo(() => {
  const { isLoading, error, games } = useQueryAllGames()

  if (isLoading) {
    return <ViewContainer />
  }

  if (error != null) {
    return (
      <ViewContainer>
        Something went wrong while loading the games
      </ViewContainer>
    )
  }

  if (games.length === 0) {
    return (
      <ViewContainer>
        <ViewEmpty />
      </ViewContainer>
    )
  }

  return (
    <ViewContainer className="divide-y divide-gray-200">
      {games.map(game => (
        <ViewGame key={game.id} game={game} />
      ))}
    </ViewContainer>
  )
})
