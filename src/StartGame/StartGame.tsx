import React from 'react'
import { useNavigate } from 'react-router-dom'
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd'
import { watch } from 'react-impulse'
import cx from 'classnames'
import { toast } from 'react-hot-toast'

import * as Icon from '../Icon'
import { useStartGame } from '../api'

import { PlayerInfo, State } from './domain'
import { PlayerItem, PlayersList, StartGameForm } from './StartGameLayout'

const ViewPlayer: React.FC<{
  index: number
  player: PlayerInfo
}> = watch(({ index, player }) => {
  const isActive = player.isActive.getValue()
  const name = player.name.getValue()

  return (
    <Draggable draggableId={player.color.id} index={index}>
      {({ innerRef, draggableProps, dragHandleProps }, { isDragging }) => (
        <PlayerItem
          ref={innerRef}
          isDragging={isDragging}
          dragHandleProps={dragHandleProps}
          {...draggableProps}
        >
          <label>
            <input
              type="checkbox"
              className="sr-only peer"
              name={`player-${player.color.id}-active`}
              checked={isActive}
              formNoValidate
              onChange={event => player.isActive.setValue(event.target.checked)}
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
            onChange={event => player.name.setValue(event.target.value)}
          />
        </PlayerItem>
      )}
    </Draggable>
  )
})

export interface StartGameProps {
  state: State
}

const StartGame: React.FC<StartGameProps> = watch(({ state }) => {
  const players = state.players.getValue()
  const navigate = useNavigate()
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
          State.move(source.index, destination.index, state)
        }
      }}
    >
      <StartGameForm
        onSubmit={() => {
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
                name: player.name.getValue()
              }))
            )
          }
        }}
        footer={
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
        }
      >
        <Droppable droppableId="droppable">
          {provided => (
            <PlayersList ref={provided.innerRef}>
              {players.map((player, index) => (
                <ViewPlayer
                  key={player.color.id}
                  index={index}
                  player={player}
                />
              ))}
              {provided.placeholder}
            </PlayersList>
          )}
        </Droppable>
      </StartGameForm>
    </DragDropContext>
  )
})

export default StartGame
