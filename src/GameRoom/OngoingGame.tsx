import cx from 'classnames'
import React from 'react'
import {
  InnerStore,
  useGetInnerState,
  useInnerState,
  useSetInnerState
} from 'react-inner-store'
import { toast } from 'react-hot-toast'

import {
  Game,
  useCompleteTurn,
  usePauseGame,
  useResumeGame,
  useCompleteGame,
  useAbortLastTurn,
  GameID
} from '../api'
import * as Icon from '../Icon'

import { State } from './domain'
import * as PlayersRow from './PlayersRow'
import * as DieRow from './DieRow'

const ViewCompleteTurnButton: React.VFC<{
  gameId: GameID
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
  gameId: GameID
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
          'absolute rounded-full bg-gray-50/80',
          'transition-[width,height] ease-in-out duration-500',
          'left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2 transform-gpu',
          isGamePaused ? 'w-[144vmax] h-[144vmax]' : 'h-0 w-0'
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
  gameId: GameID
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
  gameId: GameID
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

export const OngoingGame: React.VFC<{
  game: Game
  store: InnerStore<State>
}> = React.memo(({ game, store }) => {
  const state = useGetInnerState(store)
  const isMutating = useGetInnerState(state.isMutating)

  return (
    <>
      <PlayersRow.OngoingGame game={game} />

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
    </>
  )
})