import cx from 'classnames'
import React from 'react'
import { useParams } from 'react-router-dom'
import {
  InnerStore,
  useGetInnerState,
  useInnerState,
  useSetInnerState
} from 'react-inner-store'
import { toast } from 'react-hot-toast'
import { differenceInMilliseconds } from 'date-fns'

import { pct, formatDurationMs, useEvery } from '../utils'
import {
  Game,
  Player,
  Dice,
  useCompleteTurn,
  useQueryGame,
  usePauseGame,
  useResumeGame,
  useCompleteGame,
  useAbortLastTurn
} from '../api'
import * as Icon from '../Icon'
import { DieEvent, DieNumber } from '../domain'

import * as DieRow from './DieRow'

export abstract class State {
  abstract readonly isMutating: InnerStore<boolean>
  abstract readonly whiteDie: InnerStore<DieRow.State<DieNumber>>
  abstract readonly redDie: InnerStore<DieRow.State<DieNumber>>
  abstract readonly eventDie: InnerStore<DieRow.State<DieEvent>>

  public static init(): State {
    return {
      isMutating: InnerStore.of<boolean>(false),
      whiteDie: InnerStore.of(DieRow.init()),
      redDie: InnerStore.of(DieRow.init()),
      eventDie: InnerStore.of(DieRow.init())
    }
  }

  public static reset(
    { isMutating, whiteDie, redDie, eventDie }: State,
    dice?: Dice
  ): void {
    isMutating.setState(false)
    whiteDie.setState(dice?.whiteDie ?? DieRow.init)
    redDie.setState(dice?.redDie ?? DieRow.init)
    eventDie.setState(dice?.eventDie ?? DieRow.init)
  }

  public static toDice(state: State): null | Dice {
    const whiteDie = state.whiteDie.getState()
    const redDie = state.redDie.getState()
    const eventDie = state.eventDie.getState()

    if (whiteDie == null || redDie == null || eventDie == null) {
      return null
    }

    return { whiteDie, redDie, eventDie }
  }
}

const ViewPlayerTile: React.VFC<{
  isCurrentPlayer: boolean
  player: Player
}> = React.memo(({ isCurrentPlayer, player }) => {
  return (
    <div
      className={cx(
        'flex-1 flex justify-center h-6 transition-[font-size] duration-300',
        isCurrentPlayer ? 'text-3xl' : 'text-5xl'
      )}
    >
      <Icon.User style={{ color: player.color.hex }} />
    </div>
  )
})

const ViewCurrentPlayerCaret: React.VFC<{
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
    <div className="flex relative pt-2 pb-8">
      <ViewCurrentPlayerCaret
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
  gameId: number
  state: State
}> = React.memo(({ gameId, state }) => {
  const setIsMutating = useSetInnerState(state.isMutating)
  const whiteDie = useGetInnerState(state.whiteDie) ?? 0
  const redDie = useGetInnerState(state.redDie) ?? 0
  const eventDie = useGetInnerState(state.eventDie)

  const { completeTurn } = useCompleteTurn(gameId, {
    onError() {
      setIsMutating(false)
      toast.error('Failed to complete turn')
    },
    onSuccess() {
      State.reset(state)
    }
  })

  return (
    <button
      type="button"
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
      onClick={() => {
        if (!state.isMutating.getState()) {
          const dice = State.toDice(state)

          if (dice == null) {
            toast.error('Please select all dice')
          } else {
            setIsMutating(true)
            completeTurn(dice)
          }
        }
      }}
    >
      <div
        className={cx(
          whiteDie > 0 && redDie > 0
            ? 'transition-[transform,opacity] scale-100 opacity-100'
            : 'scale-50 opacity-0'
        )}
      >
        {whiteDie + redDie}
      </div>
    </button>
  )
})

const ViewSecondaryButton: React.FC<{
  as?: string
  className?: string
  onClick?: VoidFunction
}> = ({ as: tagName = 'button', className, onClick, children }) => {
  return React.createElement(
    tagName,
    {
      className: cx(
        'flex justify-center items-center h-14 w-14 rounded-full border-2 text-2xl',
        'transition-colors duration-300',
        'outline-none focus-visible:ring-4',
        'ring-gray-300 border-gray-400 text-gray-400 bg-white',
        className
      ),
      onClick,
      // eslint-disable-next-line no-undefined
      type: tagName === 'button' ? 'button' : undefined
    },
    children
  )
}

const ViewPauseGameButton: React.VFC<{
  gameId: number
  isGamePaused: boolean
  isMutating: InnerStore<boolean>
}> = React.memo(({ gameId, isGamePaused, isMutating }) => {
  const [isMutatingBool, setIsMutating] = useInnerState(isMutating)

  const { pauseGame } = usePauseGame(gameId, {
    onError() {
      setIsMutating(false)
      toast.error('Failed to pause game')
    },
    onSuccess() {
      setIsMutating(false)
    }
  })
  const { resumeGame } = useResumeGame(gameId, {
    onError() {
      setIsMutating(false)
      toast.error('Failed to resume game')
    },
    onSuccess() {
      setIsMutating(false)
    }
  })

  return (
    <div className="block relative z-10">
      <span
        className={cx(
          'absolute h-14 w-14 box-content rounded-full bg-gray-50/80 transition-[padding] ease-in-out duration-500',
          'left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2 transform-gpu',
          isGamePaused ? ' p-[2000px]' : 'p-0'
        )}
      />

      <label>
        <input
          className="sr-only peer"
          type="checkbox"
          name="is-game-paused"
          checked={isGamePaused}
          readOnly={isMutatingBool}
          onChange={event => {
            if (event.target.checked) {
              pauseGame()
            } else {
              resumeGame()
            }
          }}
        />

        <ViewSecondaryButton
          as="span"
          className={cx(
            'relative overflow-hidden cursor-pointer',
            'peer-focus-visible:ring-4',
            'peer-checked:ring-green-200 peer-checked:border-green-500 peer-checked:bg-green-400 peer-checked:text-white'
          )}
        >
          <span>
            <span
              className={cx(
                'flex items-center w-[200%] h-full',
                'transition-transform ease-out duration-300',
                isGamePaused && '-translate-x-1/2'
              )}
            >
              <span className="flex justify-center flex-1">
                <Icon.Pause />
              </span>
              <span className="flex justify-center flex-1">
                <Icon.Play className="translate-x-0.5" />
              </span>
            </span>
          </span>
        </ViewSecondaryButton>
      </label>
    </div>
  )
})

const ViewCompleteGameButton: React.VFC<{
  gameId: number
  state: State
}> = React.memo(({ gameId, state }) => {
  const setIsMutating = useSetInnerState(state.isMutating)
  const { completeGame } = useCompleteGame(gameId, {
    onError() {
      setIsMutating(false)
      toast.error('Failed to complete game')
    },
    onSuccess() {
      State.reset(state)
      toast.success('Game completed!')
    }
  })

  return (
    <ViewSecondaryButton
      onClick={() => {
        if (!state.isMutating.getState()) {
          const dice = State.toDice(state)

          if (dice == null) {
            toast.error('Please select all dice')
          } else {
            setIsMutating(true)
            completeGame(dice)
          }
        }
      }}
    >
      <Icon.Flag />
    </ViewSecondaryButton>
  )
})

const ViewAbortTurnButton: React.VFC<{
  gameId: number
  hasTurns: boolean
  state: State
}> = React.memo(({ gameId, hasTurns, state }) => {
  const setIsMutating = useSetInnerState(state.isMutating)
  const { abortLastTurn } = useAbortLastTurn(gameId, {
    onError() {
      setIsMutating(false)
      toast.error('Failed to abort last turn')
    },
    onSuccess(dice) {
      State.reset(state, dice)
      toast.success('Aborted last turn!')
    }
  })

  return (
    <ViewSecondaryButton
      onClick={() => {
        if (!state.isMutating.getState()) {
          if (hasTurns) {
            setIsMutating(true)
            abortLastTurn()
          } else {
            toast.error('No turns to abort')
          }
        }
      }}
    >
      <Icon.Undo />
    </ViewSecondaryButton>
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
  const isMutating = useGetInnerState(state.isMutating)

  return (
    <div className={cx('flex justify-center p-3 h-full overflow-hidden')}>
      <form
        className={cx(
          'space-y-3 w-full sm:max-w-md',
          'sm:p-3 sm:max-w-md sm:rounded-md sm:shadow-lg sm:border sm:border-gray-50'
        )}
      >
        <ViewGamePlayers game={game} />

        <div className="space-y-2">
          <DieRow.ViewWhite
            name="white-dice"
            isDisabled={isMutating}
            store={state.whiteDie}
          />
          <DieRow.ViewRed
            name="red-dice"
            isDisabled={isMutating}
            store={state.redDie}
          />
          <DieRow.ViewEvent
            name="event-dice"
            isDisabled={isMutating}
            store={state.eventDie}
          />
        </div>

        <div className="flex justify-center items-center gap-4">
          <span className="w-14">{/* placeholder */}</span>

          <ViewPauseGameButton
            gameId={game.id}
            isGamePaused={game.isPaused}
            isMutating={state.isMutating}
          />

          <ViewCompleteTurnButton gameId={game.id} state={state} />

          <ViewAbortTurnButton
            gameId={game.id}
            hasTurns={game.turns.length > 0}
            state={state}
          />

          <ViewCompleteGameButton gameId={game.id} state={state} />
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

  if (game.endTime != null) {
    return <ViewCompletedGame game={game} />
  }

  return <ViewOngoingGame game={game} store={store} />
})
