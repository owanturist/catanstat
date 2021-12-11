import cx from 'classnames'
import React from 'react'
import { useParams } from 'react-router-dom'
import { InnerStore, useGetInnerState } from 'react-inner-store'
import { toast } from 'react-hot-toast'
import { differenceInMilliseconds } from 'date-fns'

import { formatDurationMs, useEvery } from '../utils'
import {
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
        'block w-20 h-20 rounded-full transition text-white text-5xl outline-none leading-none',
        'focus-visible:ring-4',
        {
          'bg-gray-400 ring-gray-300': eventDie == null,
          'bg-yellow-400 ring-yellow-200': eventDie === 'yellow',
          'bg-blue-500 ring-blue-300': eventDie === 'blue',
          'bg-green-500 ring-green-300': eventDie === 'green',
          'bg-gray-600 ring-gray-400': eventDie === 'black'
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

export const View: React.VFC<{
  store: InnerStore<State>
}> = React.memo(({ store }) => {
  const state = useGetInnerState(store)
  const params = useParams<'gameId'>()
  const gameId = Number(params.gameId)
  const { isLoading, error, game } = useQueryGame(gameId)
  const { isLoading: isTurnCompleting, completeTurn } = useCompleteTurn(
    gameId,
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
    gameId,
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

  const isTurnReadonly = isTurnCompleting || isGameCompleting

  const duration = useEvery(
    now => {
      if (game == null) {
        return formatDurationMs(0)
      }

      if (game.isPaused) {
        return formatDurationMs(game.currentTurnDurationMs)
      }

      const diffMs = differenceInMilliseconds(
        now,
        game.currentTurnDurationSince
      )

      return formatDurationMs(game.currentTurnDurationMs + diffMs)
    },
    {
      interval: 60,
      skip: game?.isPaused ?? true
    }
  )

  if (isLoading) {
    // @TODO loading skeleton
    return null
  }

  if (error != null || game == null) {
    return <div>Something went wrong while loading the game</div>
  }

  // it is either
  // 1. winner
  // 2. next player of latest (previous) turn
  // 3. the first game player
  const currentPlayerId =
    game.winnerPlayerId ??
    game.turns[0]?.player.nextPlayerId ??
    game.players[0]?.id

  return (
    <div className={cx('flex justify-center p-3 h-full overflow-hidden')}>
      <form
        className={cx(
          'space-y-2 w-full sm:max-w-md',
          'sm:p-3 sm:max-w-md sm:rounded-md sm:shadow-lg sm:border sm:border-gray-50'
        )}
        onSubmit={event => {
          event.preventDefault()

          if (isTurnReadonly) {
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
        <div className="flex">
          {game.players.map(player => (
            <div
              key={player.id}
              className={cx(
                'flex-1 flex flex-col items-center p-3 border border-transparent transition-colors',
                currentPlayerId === player.id && 'border-gray-300'
              )}
            >
              <Icon.User
                className="text-2xl"
                style={{ color: player.color.hex }}
              />

              {currentPlayerId === player.id && <span>{duration}</span>}
            </div>
          ))}
        </div>

        <DieRow.ViewWhite
          name="white-dice"
          isReadonly={isTurnReadonly}
          store={state.whiteDie}
        />
        <DieRow.ViewRed
          name="red-dice"
          isReadonly={isTurnReadonly}
          store={state.redDie}
        />
        <DieRow.ViewEvent
          name="event-dice"
          isReadonly={isTurnReadonly}
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
              if (isTurnReadonly) {
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
