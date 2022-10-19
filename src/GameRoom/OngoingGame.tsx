import cx from 'classnames'
import React from 'react'
import { Impulse, watch } from 'react-impulse'
import { toast } from 'react-hot-toast'

import {
  GameID,
  GameStatusOngoing,
  Player,
  useCompleteTurn,
  usePauseGame,
  useResumeGame,
  useCompleteGame,
  useAbortLastTurn
} from '../api'
import * as Icon from '../Icon'
import { OngoingGamePlayers } from '../GamePlayers'

import { State } from './domain'
import * as DieRow from './DieRow'

const ViewCompleteTurnButton: React.FC<{
  gameId: GameID
  state: State
}> = watch(({ gameId, state }) => {
  const whiteDie = state.whiteDie.getValue() ?? 0
  const redDie = state.redDie.getValue() ?? 0
  const eventDie = state.eventDie.getValue()

  const { completeTurn } = useCompleteTurn(gameId, {
    onError() {
      state.isMutating.setValue(false)
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
        'block w-16 h-16 border-2 rounded-full transition text-white text-4xl outline-none leading-none',
        '2xs:h-20 2xs:w-20 2xs:text-5xl',
        'focus-visible:ring-4',
        {
          'bg-gray-400 ring-gray-400/50 border-gray-500': eventDie == null,
          'bg-yellow-400 ring-yellow-400/50 border-yellow-500':
            eventDie === 'yellow',
          'bg-blue-500 ring-blue-500/50 border-blue-600': eventDie === 'blue',
          'bg-green-500 ring-green-500/50 border-green-600':
            eventDie === 'green',
          'bg-gray-600 ring-gray-600/50 border-gray-800': eventDie === 'black'
        }
      )}
      onClick={() => {
        if (!state.isMutating.getValue()) {
          const dice = State.toDice(state)

          if (dice == null) {
            toast.error('Please select all dice')
          } else {
            state.isMutating.setValue(true)
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
  children: React.ReactNode
}> = ({ as: tagName = 'button', className, onClick, children }) => {
  return React.createElement(
    tagName,
    {
      className: cx(
        'flex justify-center items-center h-12 w-12 rounded-full border-2 text-xl',
        'transition-colors duration-300',
        'outline-none focus-visible:ring-4',
        'ring-gray-400/50 border-gray-400 text-gray-400 bg-white',
        '2xs:h-14 2xs:w-14 2xs:text-2xl',
        className
      ),
      onClick,
      // eslint-disable-next-line no-undefined
      type: tagName === 'button' ? 'button' : undefined
    },
    children
  )
}

const ViewPauseGameButton: React.FC<{
  gameId: GameID
  isGamePaused: boolean
  isMutating: Impulse<boolean>
}> = ({ gameId, isGamePaused, isMutating }) => {
  const { pauseGame } = usePauseGame(gameId, {
    onError() {
      isMutating.setValue(false)
      toast.error('Failed to pause game')
    },
    onSuccess() {
      isMutating.setValue(false)
    }
  })
  const { resumeGame } = useResumeGame(gameId, {
    onError() {
      isMutating.setValue(false)
      toast.error('Failed to resume game')
    },
    onSuccess() {
      isMutating.setValue(false)
    }
  })

  return (
    <div className="block relative z-10">
      <span
        className={cx(
          'absolute rounded-full bg-gray-50/80',
          'transition-[width,height] ease-in-out duration-500',
          'left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2 transform-gpu',
          isGamePaused ? 'w-[200vmax] h-[200vmax]' : 'h-0 w-0'
        )}
      />

      <label>
        <input
          className="sr-only peer"
          type="checkbox"
          name="is-game-paused"
          checked={isGamePaused}
          readOnly={isMutating.getValue()}
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
            'peer-checked:ring-green-400/50 peer-checked:border-green-500 peer-checked:bg-green-400 peer-checked:text-white'
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
}

const ViewCompleteGameButton: React.FC<{
  gameId: GameID
  state: State
}> = ({ gameId, state }) => {
  const { completeGame } = useCompleteGame(gameId, {
    onError() {
      state.isMutating.setValue(false)
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
        if (!state.isMutating.getValue()) {
          const dice = State.toDice(state)

          if (dice == null) {
            toast.error('Please select all dice')
          } else {
            state.isMutating.setValue(true)
            completeGame(dice)
          }
        }
      }}
    >
      <Icon.Flag />
    </ViewSecondaryButton>
  )
}

const ViewAbortTurnButton: React.FC<{
  gameId: GameID
  hasTurns: boolean
  state: State
}> = ({ gameId, hasTurns, state }) => {
  const { abortLastTurn } = useAbortLastTurn(gameId, {
    onError() {
      state.isMutating.setValue(false)
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
        if (!state.isMutating.getValue()) {
          if (hasTurns) {
            state.isMutating.setValue(true)
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
}

export const OngoingGame: React.FC<{
  gameId: GameID
  status: GameStatusOngoing
  players: ReadonlyArray<Player>
  hasTurns: boolean
  state: State
}> = watch(({ gameId, status, players, hasTurns, state }) => {
  const isMutating = state.isMutating.getValue()

  return (
    <>
      <OngoingGamePlayers status={status} players={players} />

      <div className={cx('mt-1 space-y-1', 'xs:mt-2 xs:space-y-2')}>
        <DieRow.ViewWhite
          name="white-dice"
          isDisabled={isMutating}
          state={state.whiteDie}
        />
        <DieRow.ViewRed
          name="red-dice"
          isDisabled={isMutating}
          state={state.redDie}
        />
        <DieRow.ViewEvent
          name="event-dice"
          isDisabled={isMutating}
          state={state.eventDie}
        />
      </div>

      <div
        className={cx(
          'flex justify-center items-center gap-2 mt-2',
          'xs:gap-3 xs:mt-3',
          'sm:gap-4 sm:mt-4'
        )}
      >
        <span className="w-12 2xs:w-14">{/* placeholder */}</span>

        <ViewPauseGameButton
          gameId={gameId}
          isGamePaused={status.isPaused}
          isMutating={state.isMutating}
        />

        <ViewCompleteTurnButton gameId={gameId} state={state} />

        <ViewAbortTurnButton
          gameId={gameId}
          hasTurns={hasTurns}
          state={state}
        />

        <ViewCompleteGameButton gameId={gameId} state={state} />
      </div>
    </>
  )
})
