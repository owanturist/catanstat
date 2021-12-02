import React from 'react'
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd'
import { InnerStore, useInnerState } from 'react-inner-store'
import cx from 'classnames'

import * as Icon from '../Icon'
import { Color } from '../domain'

abstract class Player {
  abstract readonly color: Color
  abstract readonly defaultName: string
  abstract readonly name: InnerStore<string>
  abstract readonly isActive: InnerStore<boolean>

  public static init(color: Color, name: string): Player {
    return {
      color,
      defaultName: name,
      name: InnerStore.of(name),
      isActive: InnerStore.of<boolean>(true)
    }
  }
}

export abstract class State {
  abstract readonly players: ReadonlyArray<Player>

  public static init(): State {
    return {
      players: [
        Player.init(Color.Red, 'Red'),
        Player.init(Color.Blue, 'Blue'),
        Player.init(Color.White, 'White'),
        Player.init(Color.Yellow, 'Yellow'),
        Player.init(Color.Green, 'Green'),
        Player.init(Color.Brown, 'Brown')
      ]
    }
  }

  public static move(
    sourceIndex: number,
    destinationIndex: number,
    state: State
  ): State {
    const source = state.players[sourceIndex]

    if (source == null) {
      return state
    }

    const players = state.players
      .filter((_, index) => index !== sourceIndex)
      .flatMap((player, index) => {
        if (index === destinationIndex) {
          return [source, player]
        }

        return player
      })

    return { ...state, players }
  }
}

const ViewPlayer: React.VFC<{
  index: number
  player: Player
}> = React.memo(({ index, player }) => {
  const [name, setName] = useInnerState(player.name)
  const [isActive, setIsActive] = useInnerState(player.isActive)

  return (
    <Draggable key={player.color} draggableId={player.color} index={index}>
      {({ innerRef, draggableProps, dragHandleProps }, { isDragging }) => (
        <div
          ref={innerRef}
          className={cx(
            'flex flex-row gap-2 p-2 pr-1 bg-white rounded-md transition-shadow',
            isDragging ? 'shadow-md' : 'shadow-none'
          )}
          {...draggableProps}
        >
          <label
            tabIndex={0}
            className={cx(
              'flex justify-center items-center w-10 h-10 border rounded-md text-xl bg-white text-center text-gray-500 transition-colors cursor-pointer',
              'hover:bg-gray-50 active:bg-gray-100',
              'focus-visible:ring-2 focus-visible:outline-none',
              !isActive && 'opacity-50'
            )}
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
              'focus-visible:ring-2 focus-visible:outline-none',
              'read-only:opacity-50'
            )}
            type="text"
            placeholder={player.defaultName}
            readOnly={!isActive}
            value={name}
            onChange={event => setName(event.target.value)}
          />

          <span
            className={cx(
              'flex justify-center items-center w-10 h-10 rounded-md text-xl text-center cursor-[grab] transition-colors',
              'hover:text-gray-500',
              'focus-visible:ring-2 focus-visible:outline-none',
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
  const [state, setState] = useInnerState(store)

  return (
    <DragDropContext
      onDragEnd={({ source, destination }) => {
        if (destination != null) {
          setState(State.move(source.index, destination.index, state))
        }
      }}
    >
      <div className="h-screen w-screen flex justify-center items-center text-gray-700">
        <Droppable droppableId="droppable">
          {provided => (
            <div
              ref={provided.innerRef}
              className="p-2 rounded-md shadow-lg w-full max-w-md"
            >
              {state.players.map((player, index) => (
                <ViewPlayer key={player.color} index={index} player={player} />
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </div>
    </DragDropContext>
  )
})
