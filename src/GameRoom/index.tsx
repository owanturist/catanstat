import cx from 'classnames'
import React from 'react'
import { useParams } from 'react-router-dom'
import { InnerStore, useGetInnerState } from 'react-inner-store'
import { toast } from 'react-hot-toast'
import { differenceInMilliseconds } from 'date-fns'

import { pct, formatDurationMs, useEvery } from '../utils'
import {
  Game,
  Player,
  useCompleteTurn,
  useQueryGame,
  usePauseGame,
  useResumeGame,
  useCompleteGame
} from '../api'
import * as Icon from '../Icon'
import { DieEvent, DieNumber } from '../domain'

import * as DieRow from './DieRow'

export abstract class State {
  abstract readonly whiteDie: InnerStore<DieRow.State<DieNumber>>
  abstract readonly redDie: InnerStore<DieRow.State<DieNumber>>
  abstract readonly eventDie: InnerStore<DieRow.State<DieEvent>>

  public static init(): State {
    return {
      whiteDie: InnerStore.of(DieRow.init()),
      redDie: InnerStore.of(DieRow.init()),
      eventDie: InnerStore.of(DieRow.init())
    }
  }

  public static reset({ whiteDie, redDie, eventDie }: State): void {
    whiteDie.setState(DieRow.init)
    redDie.setState(DieRow.init)
    eventDie.setState(DieRow.init)
  }
}

const ViewPlayerTile: React.VFC<{
  isCurrentPlayer: boolean
  player: Player
}> = React.memo(({ isCurrentPlayer, player }) => {
  return (
    <div
      key={player.id}
      className={cx(
        'flex-1 flex justify-center h-6 transition-[font-size] duration-300',
        isCurrentPlayer ? 'text-2xl' : 'text-5xl'
      )}
    >
      <Icon.User style={{ color: player.color.hex }} />
    </div>
  )
})

const ViewCurrentPlayerMarker: React.VFC<{
  isGamePaused: boolean
  currentTurnDurationMs: number
  currentTurnDurationSince: Date
  playersCount: number
  currentPlayerIndex: number
}> = React.memo(
  ({
    isGamePaused,
    currentTurnDurationMs,
    currentTurnDurationSince,
    playersCount,
    currentPlayerIndex
  }) => {
    const fraction = 100 / playersCount
    const currentTurnDuration = useEvery(
      now => {
        if (isGamePaused) {
          return formatDurationMs(currentTurnDurationMs)
        }

        const diffMs = differenceInMilliseconds(now, currentTurnDurationSince)

        return formatDurationMs(currentTurnDurationMs + diffMs)
      },
      {
        interval: 60,
        skip: isGamePaused
      }
    )

    return (
      <div
        className="absolute inset-0 transition-transform ease-out duration-300"
        style={{
          transform: `translateX(${pct(fraction * currentPlayerIndex)})`
        }}
      >
        <div
          className="flex flex-col h-full justify-end ring-inset ring-2 ring-gray-200 rounded overflow-hidden"
          style={{
            width: pct(fraction)
          }}
        >
          <span className="p-0.5 font-mono text-xs text-center text-gray-500 bg-gray-200">
            {currentTurnDuration}
          </span>
        </div>
      </div>
    )
  }
)

const ViewGamePlayers: React.VFC<{
  game: Game
}> = React.memo(({ game }) => {
  const prevTurn = game.turns[0]
  const currentPlayerIndex = React.useMemo(() => {
    return Math.max(
      0,
      game.players.findIndex(player => {
        return player.id === prevTurn?.player.nextPlayerId
      })
    )
  }, [game.players, prevTurn])

  return (
    <div className="flex relative pt-2 pb-7">
      <ViewCurrentPlayerMarker
        isGamePaused={game.isPaused}
        currentTurnDurationMs={game.currentTurnDurationMs}
        currentTurnDurationSince={game.currentTurnDurationSince}
        playersCount={game.players.length}
        currentPlayerIndex={currentPlayerIndex}
      />

      {game.players.map((player, index) => (
        <ViewPlayerTile
          key={player.id}
          isCurrentPlayer={index === currentPlayerIndex}
          player={player}
        />
      ))}
    </div>
  )
})

const ViewCompleteTurnButton: React.VFC<{
  state: State
}> = React.memo(({ state }) => {
  const whiteDie = useGetInnerState(state.whiteDie) ?? 0
  const redDie = useGetInnerState(state.redDie) ?? 0
  const eventDie = useGetInnerState(state.eventDie)

  return (
    <button
      type="submit"
      className={cx(
        'block w-20 h-20 border-2 rounded-full transition text-white text-5xl outline-none leading-none',
        'focus-visible:ring-4',
        {
          'bg-gray-400 ring-gray-300 border-gray-500': eventDie == null,
          'bg-yellow-400 ring-yellow-300 border-yellow-500':
            eventDie === 'yellow',
          'bg-blue-500 ring-blue-300 border-blue-600': eventDie === 'blue',
          'bg-green-500 ring-green-300 border-green-600': eventDie === 'green',
          'bg-gray-600 ring-gray-400 border-gray-800': eventDie === 'black'
        }
      )}
    >
      {whiteDie + redDie}
    </button>
  )
})

const ViewPauseGameButton: React.VFC<{
  gameId: number
  isGamePaused: boolean
}> = React.memo(({ gameId, isGamePaused }) => {
  const { pauseGame } = usePauseGame(gameId, {
    onError() {
      toast.error('Failed to pause game')
    }
  })
  const { resumeGame } = useResumeGame(gameId, {
    onError() {
      toast.error('Failed to resume game')
    }
  })

  return (
    <div className="relative">
      <span
        className={cx(
          'absolute h-14 w-14 p-2 box-content rounded-full border-gray-300 transition-colors duration-500',
          'left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2',
          isGamePaused
            ? 'border-opacity-80 border-[9900px]'
            : 'border-opacity-0'
        )}
      />

      <button
        type="button"
        className={cx(
          'flex justify-center items-center h-14 w-14 relative rounded-full border-2 text-2xl transition-colors duration-300',
          'outline-none focus-visible:ring-4',
          isGamePaused
            ? 'ring-green-200 border-green-400 bg-green-400 text-white'
            : 'ring-gray-300 border-gray-400 text-gray-400 bg-white'
        )}
        onClick={() => {
          if (isGamePaused) {
            resumeGame()
          } else {
            pauseGame()
          }
        }}
      >
        {isGamePaused ? (
          <Icon.Play className="translate-x-0.5" />
        ) : (
          <Icon.Pause />
        )}
      </button>
    </div>
  )
})

const ViewCompletedGame: React.VFC<{
  game: Game
}> = React.memo(() => {
  return null
})

const ViewOngoingGame: React.VFC<{
  game: Game
  store: InnerStore<State>
}> = React.memo(({ game, store }) => {
  const state = useGetInnerState(store)

  const { isLoading: isTurnCompleting, completeTurn } = useCompleteTurn(
    game.id,
    {
      onError() {
        toast.error('Failed to complete turn')
      },
      onSuccess() {
        State.reset(state)
      }
    }
  )
  const { isLoading: isGameCompleting, completeGame } = useCompleteGame(
    game.id,
    {
      onError() {
        toast.error('Failed to complete game')
      },
      onSuccess() {
        State.reset(state)
        toast.success('Game completed!')
      }
    }
  )

  const isMutating = isTurnCompleting || isGameCompleting

  return (
    <div className={cx('flex justify-center p-3 h-full overflow-hidden')}>
      <form
        className={cx(
          'space-y-2 w-full sm:max-w-md',
          'sm:p-3 sm:max-w-md sm:rounded-md sm:shadow-lg sm:border sm:border-gray-50'
        )}
        onSubmit={event => {
          event.preventDefault()

          if (isMutating) {
            return
          }

          const whiteDie = state.whiteDie.getState()
          const redDie = state.redDie.getState()
          const eventDie = state.eventDie.getState()

          if (game.winnerPlayerId != null) {
            toast.error('Game is already over')
          } else if (whiteDie == null || redDie == null || eventDie == null) {
            toast.error('Please select all dice')
          } else {
            completeTurn({
              whiteDie,
              redDie,
              eventDie
            })
          }
        }}
      >
        <ViewGamePlayers game={game} />

        <DieRow.ViewWhite
          name="white-dice"
          isReadonly={isMutating}
          store={state.whiteDie}
        />
        <DieRow.ViewRed
          name="red-dice"
          isReadonly={isMutating}
          store={state.redDie}
        />
        <DieRow.ViewEvent
          name="event-dice"
          isReadonly={isMutating}
          store={state.eventDie}
        />

        <div className="flex justify-center items-center gap-4">
          <ViewPauseGameButton gameId={game.id} isGamePaused={game.isPaused} />

          <ViewCompleteTurnButton state={state} />

          <button
            type="button"
            className={cx(
              'flex justify-center items-center h-14 w-14 rounded-full border-2 text-2xl transition-colors duration-300',
              'outline-none focus-visible:ring-4',
              'ring-gray-300 border-gray-400 text-gray-400 bg-white'
            )}
            onClick={() => {
              if (isMutating) {
                return
              }

              const whiteDie = state.whiteDie.getState()
              const redDie = state.redDie.getState()
              const eventDie = state.eventDie.getState()

              if (game.winnerPlayerId != null) {
                toast.error('Game is already completed')
              } else if (
                whiteDie == null ||
                redDie == null ||
                eventDie == null
              ) {
                toast.error('Please select all dice')
              } else {
                completeGame({
                  whiteDie,
                  redDie,
                  eventDie
                })
              }
            }}
          >
            {game.winnerPlayerId == null ? <Icon.Flag /> : <Icon.Flag />}
          </button>
        </div>
      </form>
    </div>
  )
})

export const View: React.VFC<{
  store: InnerStore<State>
}> = React.memo(({ store }) => {
  const params = useParams<'gameId'>()
  const gameId = Number(params.gameId)
  const { isLoading, error, game } = useQueryGame(gameId)

  if (isLoading) {
    // @TODO loading skeleton
    return null
  }

  if (error != null || game == null) {
    return <div>Something went wrong while loading the game</div>
  }

  if (game.winnerPlayerId != null) {
    return <ViewCompletedGame game={game} />
  }

  return <ViewOngoingGame game={game} store={store} />
})
