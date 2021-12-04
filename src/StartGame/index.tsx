import React from 'react'
import { useNavigate } from 'react-router-dom'
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd'
import { InnerStore, useInnerState } from 'react-inner-store'
import cx from 'classnames'
import { toast } from 'react-hot-toast'

import * as Icon from '../Icon'
import { Color } from '../domain'
import { useStartGame } from '../api'

abstract class Player {
  abstract readonly color: Color
  abstract readonly name: InnerStore<string>
  abstract readonly isActive: InnerStore<boolean>

  public static init(color: Color): Player {
    return {
      color,
      name: InnerStore.of(color.label),
      isActive: InnerStore.of<boolean>(true)
    }
  }
}

export abstract class State {
  abstract readonly players: ReadonlyArray<Player>

  public static init(): State {
    return {
      players: [
        Player.init(Color.red),
        Player.init(Color.blue),
        Player.init(Color.white),
        Player.init(Color.yellow),
        Player.init(Color.green),
        Player.init(Color.brown)
      ]
    }
  }

  public static move(
    sourceIndex: number,
    destinationIndex: number,
    state: State
  ): State {
    if (sourceIndex === destinationIndex) {
      return state
    }

    const players = state.players.slice()
    const source = players.splice(sourceIndex, 1)

    players.splice(destinationIndex, 0, ...source)

    return { ...state, players }
  }

  public static getActivePlayers(state: State): Array<Player> {
    return state.players.filter(player => player.isActive.getState())
  }
}

const ViewPlayer: React.VFC<{
  index: number
  player: Player
}> = React.memo(({ index, player }) => {
  const [name, setName] = useInnerState(player.name)
  const [isActive, setIsActive] = useInnerState(player.isActive)

  return (
    <Draggable draggableId={player.color.id} index={index}>
      {({ innerRef, draggableProps, dragHandleProps }, { isDragging }) => (
        <div
          ref={innerRef}
          className={cx(
            'flex flex-row gap-2 p-1 bg-white rounded-md transition-shadow',
            isDragging ? 'shadow-md' : 'shadow-none'
          )}
          {...draggableProps}
        >
          <label
            tabIndex={0}
            className={cx(
              'flex justify-center items-center w-10 h-10 border rounded-md text-xl bg-white text-center text-gray-500 transition-colors cursor-pointer',
              'hover:bg-gray-50 active:bg-gray-100',
              'ring-gray-200 focus-visible:ring-2 focus-visible:outline-none',
              !isActive && 'opacity-50'
            )}
            style={{
              color: player.color.hex
            }}
          >
            <input
              type="checkbox"
              className="sr-only"
              tabIndex={-1}
              checked={isActive}
              formNoValidate
              onChange={event => setIsActive(event.target.checked)}
            />
            {isActive ? <Icon.User /> : <Icon.UserOff />}
          </label>

          <input
            className={cx(
              'block flex-1 px-4 h-10 border rounded-md',
              'ring-gray-200 focus-visible:ring-2 focus-visible:outline-none',
              'read-only:opacity-50'
            )}
            type="text"
            placeholder={player.color.label}
            readOnly={!isActive}
            value={name}
            onChange={event => setName(event.target.value)}
          />

          <span
            className={cx(
              'flex justify-center items-center w-6 h-10 rounded-md text-xl text-center cursor-[grab] select-none transition-colors',
              'hover:text-gray-500',
              'ring-gray-200 focus-visible:ring-2 focus-visible:outline-none',
              isDragging ? 'text-gray-500' : 'text-gray-300'
            )}
            {...dragHandleProps}
          >
            <Icon.Drag />
          </span>
        </div>
      )}
    </Draggable>
  )
})

export const View: React.VFC<{
  store: InnerStore<State>
}> = React.memo(({ store }) => {
  const navigate = useNavigate()
  const [state, setState] = useInnerState(store)
  const { isLoading, startGame } = useStartGame({
    onError() {
      toast.error('Failed to start game')
    },
    onSuccess(gameId) {
      navigate(`/game/${gameId}`)
    }
  })

  return (
    <DragDropContext
      onDragEnd={({ source, destination }) => {
        if (destination != null) {
          setState(State.move(source.index, destination.index, state))
        }
      }}
    >
      <div
        className={cx(
          'h-full flex flex-col text-gray-700 justify-center items-center',
          'sm:py-4'
        )}
      >
        <form
          className={cx(
            'flex flex-col flex-1 max-h-full p-3 w-full bg-white space-y-3',
            'sm:flex-grow-0 sm:max-w-md sm:rounded-md sm:shadow-lg sm:border sm:border-gray-50'
          )}
          onSubmit={event => {
            event.preventDefault()

            if (isLoading) {
              return
            }

            const activePlayers = State.getActivePlayers(state)

            if (activePlayers.length < 2) {
              toast.error('Needs at least 2 players')
            } else {
              startGame(
                activePlayers.map(player => ({
                  color: player.color.id,
                  name: player.name.getState()
                }))
              )
            }
          }}
        >
          <Droppable droppableId="droppable">
            {provided => (
              <div
                ref={provided.innerRef}
                className="flex-1 -m-1 min-h-0 overflow-y-auto"
              >
                {state.players.map((player, index) => (
                  <ViewPlayer
                    key={player.color.id}
                    index={index}
                    player={player}
                  />
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>

          <div className="hidden sm:border-t sm:block" />

          <footer>
            <button
              type="submit"
              className={cx(
                'block w-full p-2 rounded-md border bg-white font-semibold transition-colors',
                'hover:bg-gray-50 active:bg-gray-100',
                'ring-gray-200 focus-visible:ring-2 focus-visible:outline-none'
              )}
            >
              Start Game
            </button>
          </footer>
        </form>
      </div>
    </DragDropContext>
  )
})
