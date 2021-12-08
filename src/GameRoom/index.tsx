import cx from 'classnames'
import React from 'react'
import { useParams } from 'react-router-dom'
import { InnerStore, useGetInnerState, useInnerState } from 'react-inner-store'
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

export abstract class State {
  abstract readonly whiteDie: InnerStore<null | DieNumber>
  abstract readonly redDie: InnerStore<null | DieNumber>
  abstract readonly eventDie: InnerStore<null | DieEvent>

  public static init(): State {
    return {
      whiteDie: InnerStore.of<null | DieNumber>(null),
      redDie: InnerStore.of<null | DieNumber>(null),
      eventDie: InnerStore.of<null | DieEvent>(null)
    }
  }

  public static reset({ whiteDie, redDie, eventDie }: State): void {
    whiteDie.setState(null)
    redDie.setState(null)
    eventDie.setState(null)
  }
}

type Dice<TDie> = ReadonlyArray<{
  placeholder?: boolean
  value: TDie
  icon: React.ReactElement
}>

const NUMBER_DICE: Dice<DieNumber> = [
  { value: 1, icon: <Icon.DieOne /> },
  { value: 2, icon: <Icon.DieTwo /> },
  { value: 3, icon: <Icon.DieThree /> },
  { value: 4, icon: <Icon.DieFour /> },
  { value: 5, icon: <Icon.DieFive /> },
  { value: 6, icon: <Icon.DieSix /> }
]

const WHITE_DICE = NUMBER_DICE.map(({ value, icon }) => ({
  value,
  icon: React.cloneElement(icon, {
    className: cx('text-gray-100'),
    stroke: 'rgb(156, 163, 175)' // text-gray-400
  })
}))

const RED_DICE = NUMBER_DICE.map(({ value, icon }) => ({
  value,
  icon: React.cloneElement(icon, {
    className: cx('text-red-500'),
    stroke: 'rgb(185, 28, 28)' // text-red-700
  })
}))

const EVENT_DICE: Dice<DieEvent> = [
  {
    placeholder: true,
    value: 'black',
    icon: <Icon.DieClear className="text-gray-100" />
  },
  {
    value: 'yellow',
    icon: (
      <Icon.DieClear
        className="text-yellow-400"
        stroke="rgb(245, 158, 11)" // text-yellow-500
      />
    )
  },
  {
    value: 'blue',
    icon: (
      <Icon.DieClear
        className="text-blue-500"
        stroke="rgb(37, 99, 235)" // text-blue-600
      />
    )
  },
  {
    value: 'green',
    icon: (
      <Icon.DieClear
        className="text-green-500"
        stroke="rgb(5, 150, 105)" // text-green-600
      />
    )
  },
  {
    value: 'black',
    icon: (
      <Icon.DieClear
        className="text-gray-600"
        stroke="rgb(31, 41, 55)" // text-gray-800
      />
    )
  },
  {
    placeholder: true,
    value: 'black',
    icon: <Icon.DieClear className="text-gray-100" />
  }
]

const ViewDie = <TDie extends DieNumber | DieEvent>({
  isReadonly,
  name,
  dice,
  store
}: {
  isReadonly: boolean
  name: string
  dice: Dice<TDie>
  store: InnerStore<null | TDie>
}): ReturnType<React.VFC> => {
  const [state, setState] = useInnerState(store)

  return (
    <ol
      className="flex gap-2 justify-between text-5xl"
      role="radiogroup"
      aria-labelledby={name}
    >
      {dice.map(({ placeholder, value, icon }, index) => (
        <li key={index}>
          {placeholder ? (
            icon
          ) : (
            <label className="block cursor-pointer p-px">
              <input
                className="sr-only peer"
                type="radio"
                name={name}
                readOnly={isReadonly}
                value={value}
                checked={state === value}
                onChange={() => setState(value)}
              />

              {React.cloneElement(icon, {
                className: cx(
                  icon.props.className,
                  state != null && 'opacity-25',
                  'transition-opacity peer-checked:opacity-100 peer-focus-visible:ring rounded-lg'
                )
              })}
            </label>
          )}
        </li>
      ))}
    </ol>
  )
}

const ViewCompleteTurnButton: React.VFC<{
  state: State
}> = React.memo(({ state }) => {
  const whiteDie = useGetInnerState(state.whiteDie)
  const redDie = useGetInnerState(state.redDie)
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
      {(whiteDie ?? 0) + (redDie ?? 0)}
    </button>
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

  const { pauseGame } = usePauseGame(gameId, {
    onError() {
      toast.error('Failed to pause game')
    },
    onSuccess() {
      toast.success('Game paused')
    }
  })
  const { resumeGame } = useResumeGame(gameId, {
    onError() {
      toast.error('Failed to resume game')
    },
    onSuccess() {
      toast.success('Game resumed')
    }
  })

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
    return null
  }

  if (error != null || game == null) {
    return <div>Something went wrong while loading the game</div>
  }

  const currentPlayer = game.turns[0]?.player ?? game.players[0]

  return (
    <div className="p-3 h-full overflow-hidden">
      <form
        className="space-y-2"
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
                currentPlayer?.id === player.id && 'border-gray-300'
              )}
            >
              <Icon.User
                className="text-2xl"
                style={{ color: player.color.hex }}
              />

              {currentPlayer?.id === player.id && <span>{duration}</span>}
            </div>
          ))}
        </div>

        <ViewDie
          name="white-dice"
          isReadonly={isTurnReadonly}
          dice={WHITE_DICE}
          store={state.whiteDie}
        />
        <ViewDie
          name="red-dice"
          isReadonly={isTurnReadonly}
          dice={RED_DICE}
          store={state.redDie}
        />
        <ViewDie
          name="event-dice"
          isReadonly={isTurnReadonly}
          dice={EVENT_DICE}
          store={state.eventDie}
        />

        <div className="flex justify-center items-center gap-4">
          <div className="relative">
            <span
              className={cx(
                'absolute h-14 w-14 p-2 box-content rounded-full border-gray-300 transition-colors duration-500',
                'left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2',
                game.isPaused && game.winnerPlayerId == null
                  ? 'border-opacity-80 border-[9900px]'
                  : 'border-opacity-0'
              )}
            />

            <button
              type="button"
              className={cx(
                'flex justify-center items-center h-14 w-14 relative rounded-full border-2 text-2xl transition-colors duration-300',
                'outline-none focus-visible:ring-4',
                game.isPaused && game.winnerPlayerId == null
                  ? 'ring-green-200 border-green-400 bg-green-400 text-white'
                  : 'ring-gray-300 border-gray-400 text-gray-400 bg-white'
              )}
              onClick={() => {
                if (game.isPaused && game.winnerPlayerId == null) {
                  resumeGame()
                } else {
                  pauseGame()
                }
              }}
            >
              {game.isPaused && game.winnerPlayerId == null ? (
                <Icon.Play className="translate-x-0.5" />
              ) : (
                <Icon.Pause />
              )}
            </button>
          </div>

          <ViewCompleteTurnButton state={state} />

          <button
            type="button"
            className={cx(
              'flex justify-center items-center h-14 w-14 relative rounded-full border-2 text-2xl transition-colors duration-300',
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
