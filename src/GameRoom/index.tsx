import cx from 'classnames'
import React from 'react'
import { useParams } from 'react-router-dom'
import { InnerStore, useGetInnerState, useInnerState } from 'react-inner-store'
import { toast } from 'react-hot-toast'
import { formatDistanceStrict, subMilliseconds } from 'date-fns'

import {
  useCompleteGameTurn,
  useQueryGame,
  usePauseGame,
  useResumeGame
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
    className: cx('text-red-600'),
    stroke: 'rgb(153, 27, 27)' // text-red-800
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
        'block w-28 h-28 rounded-full transition text-white text-7xl outline-none leading-none',
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
  const { isLoading: isTurnCompleting, completeGameTurn } = useCompleteGameTurn(
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

  const [now, setNow] = React.useState(() => new Date())

  React.useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 300)

    return () => clearInterval(interval)
  }, [])

  if (isLoading) {
    return null
  }

  if (error != null || game == null) {
    return <div>Something went wrong while loading the game</div>
  }

  const currentPlayer = game.turns[0]?.player ?? game.players[0]

  return (
    <div className="p-3">
      <form
        className="space-y-2"
        onSubmit={event => {
          event.preventDefault()

          if (isTurnCompleting) {
            return
          }

          const whiteDie = state.whiteDie.getState()
          const redDie = state.redDie.getState()
          const eventDie = state.eventDie.getState()

          if (whiteDie == null || redDie == null || eventDie == null) {
            toast.error('Please select all dice')
          } else {
            completeGameTurn({
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

              {currentPlayer?.id === player.id && (
                <span>
                  {formatDistanceStrict(
                    subMilliseconds(
                      game.currentTurnDurationSince,
                      game.currentTurnDurationMs
                    ),
                    game.isPaused ? game.currentTurnDurationSince : now
                  )}
                </span>
              )}
            </div>
          ))}
        </div>

        <ViewDie
          name="white-dice"
          isReadonly={isTurnCompleting}
          dice={WHITE_DICE}
          store={state.whiteDie}
        />
        <ViewDie
          name="red-dice"
          isReadonly={isTurnCompleting}
          dice={RED_DICE}
          store={state.redDie}
        />
        <ViewDie
          name="event-dice"
          isReadonly={isTurnCompleting}
          dice={EVENT_DICE}
          store={state.eventDie}
        />

        <div className="flex justify-center">
          <button
            type="button"
            className="p-3 bg-gray-300"
            onClick={() => {
              if (game.isPaused) {
                resumeGame()
              } else {
                pauseGame()
              }
            }}
          >
            {game.isPaused ? 'Resume' : 'Pause'}
          </button>
          <ViewCompleteTurnButton state={state} />
        </div>
      </form>
    </div>
  )
})
