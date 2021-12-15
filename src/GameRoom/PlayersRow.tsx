import cx from 'classnames'
import React from 'react'
import { differenceInMilliseconds } from 'date-fns'

import { pct, formatDurationMs, useEvery } from '../utils'
import { Game, Player, PlayerID } from '../api'
import * as Icon from '../Icon'

const ViewPlayerTile: React.VFC<{
  isCurrentPlayer?: boolean
  isWinner?: boolean
  player: Player
}> = React.memo(({ isCurrentPlayer, player }) => (
  <div
    className={cx(
      'flex-1 flex justify-center h-6 transition-[font-size] duration-300',
      isCurrentPlayer ? 'text-3xl' : 'text-5xl'
    )}
  >
    <Icon.User style={{ color: player.color.hex }} />
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
    <ViewContainer>
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
