import React from 'react'
import { useNavigate } from 'react-router-dom'
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd'
import { InnerStore, useInnerState } from 'react-inner-store'
import cx from 'classnames'
import { toast } from 'react-hot-toast'

import * as Icon from '../Icon'
import { useStartGame } from '../api'

import { PlayerInfo, State } from './domain'

const ViewPlayer: React.VFC<{
  index: number
  player: PlayerInfo
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
          <label>
            <input
              type="checkbox"
              className="sr-only peer"
              name={`player-${player.color.id}-active`}
              checked={isActive}
              formNoValidate
              onChange={event => setIsActive(event.target.checked)}
            />
            <div
              className={cx(
                'flex justify-center items-center w-10 h-10 border rounded-md text-xl bg-white text-center text-gray-500 transition cursor-pointer',
                'hover:bg-gray-50 active:bg-gray-100',
                'ring-gray-200 peer-focus-visible:ring-2 peer-focus-visible:outline-none',
                'opacity-50 peer-checked:opacity-100'
              )}
              style={{
                color: player.color.hex
              }}
            >
              {isActive ? <Icon.User /> : <Icon.UserOff />}
            </div>
          </label>

          <input
            className={cx(
              'block flex-1 px-4 h-10 border rounded-md',
              'ring-gray-200 focus-visible:ring-2 focus-visible:outline-none',
              'read-only:opacity-50'
            )}
            type="text"
            name={`player-${player.color.id}-name`}
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

const StartGame: React.VFC<{
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
      <form
        className={cx(
          'flex flex-col flex-1 max-h-full p-2 w-full',
          'xs:p-3',
          'sm:grow-0 sm:space-y-3'
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
              className={cx(
                'flex-1 overflow-y-auto',
                '-mr-3 pr-2', // position scrollbar to the containers' edge
                '-m-1' // compensate items' padding to be align with divider
              )}
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
    </DragDropContext>
  )
})

export default StartGame
