import cx from 'classnames'
import React from 'react'
import { differenceInMilliseconds } from 'date-fns'

import { pct, formatDurationMs, useEvery } from '../utils'
import { GameStatusOngoing, Player, PlayerID } from '../api'
import * as Icon from '../Icon'

const ViewPlayerTile: React.VFC<{
  isCurrentPlayer?: boolean
  isWinner?: boolean
  player: Player
}> = React.memo(({ isCurrentPlayer, isWinner, player }) => (
  <div
    className={cx(
      'relative flex-1 flex justify-center h-6 transition-[font-size] duration-300',
      isCurrentPlayer ? 'text-3xl' : 'text-5xl'
    )}
  >
    <Icon.User
      className={cx(isWinner === false && 'opacity-40')}
      style={{ color: player.color.hex }}
    />
    {isWinner && (
      <Icon.Trophy
        className={cx(
          'absolute bottom-0 ring-0 text-yellow-300 stroke-yellow-500 stroke-[20] text-3xl',
          'translate-x-4 translate-y-5 rotate-[20deg]'
        )}
      />
    )}
  </div>
))

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

const ViewContainer: React.FC = ({ children }) => (
  <div className="flex relative pt-2 pb-8">{children}</div>
)

export const OngoingGame: React.VFC<{
  status: GameStatusOngoing
  players: ReadonlyArray<Player>
}> = React.memo(({ status, players }) => {
  const currentPlayerIndex = React.useMemo(
    () => players.map(player => player.id).indexOf(status.currentPlayerId),
    [players, status.currentPlayerId]
  )

  return (
    <ViewContainer>
      <ViewCurrentPlayerCaret
        isGamePaused={status.isPaused}
        currentTurnDurationMs={status.currentTurnDurationMs}
        currentTurnDurationSince={status.currentTurnDurationSince}
        playersCount={players.length}
        currentPlayerIndex={currentPlayerIndex}
      />

      {players.map((player, index) => (
        <ViewPlayerTile
          key={player.id}
          isCurrentPlayer={index === currentPlayerIndex}
          player={player}
        />
      ))}
    </ViewContainer>
  )
})

export const CompletedGame: React.VFC<{
  winnerId: PlayerID
  players: ReadonlyArray<Player>
}> = React.memo(({ winnerId, players }) => (
  <ViewContainer>
    {players.map(player => (
      <ViewPlayerTile
        key={player.id}
        isWinner={player.id === String(winnerId)}
        player={player}
      />
    ))}
  </ViewContainer>
))
