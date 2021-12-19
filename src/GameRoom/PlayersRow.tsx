import React from 'react'
import cx from 'classnames'
import { differenceInMilliseconds } from 'date-fns'
import Tooltip from '@tippyjs/react'

import { pct, formatDurationMs, useEvery } from '../utils'
import { GameStatusOngoing, Player, PlayerID } from '../api'
import * as Icon from '../Icon'

const ViewPlayerTile: React.VFC<{
  isCurrentPlayer?: boolean
  isWinner?: boolean
  player: Player
}> = React.memo(({ isCurrentPlayer, isWinner, player }) => {
  return (
    <div className="relative flex-1 flex justify-center">
      <Tooltip placement="bottom" offset={[0, 0]} content={player.name}>
        <div
          className={cx(
            'py-2 transition-[font-size] duration-300',
            isWinner === false && 'opacity-40',
            isCurrentPlayer ? 'text-2xl 2xs:text-3xl' : 'text-4xl 2xs:text-5xl'
          )}
          style={{ color: player.color.hex }}
        >
          <Icon.User />
        </div>
      </Tooltip>

      {isWinner && (
        <Icon.Trophy
          className={cx(
            'absolute bottom-0 ring-0 text-yellow-300 stroke-yellow-500 stroke-[20] text-2xl',
            'translate-x-3 -translate-y-2 rotate-[20deg]',
            '2xs:text-3xl 2xs:translate-x-4'
          )}
        />
      )}
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
          <span
            className={cx(
              'p-px font-mono text-2xs text-center text-gray-500 bg-gray-200',
              '2xs:p-0.5 2xs:text-xs'
            )}
          >
            {currentTurnDuration}
          </span>
        </div>
      </div>
    )
  }
)

const ViewContainer: React.FC = ({ children }) => (
  <div className="flex relative">{children}</div>
)

export const OngoingGame: React.VFC<{
  status: GameStatusOngoing
  players: ReadonlyArray<Player>
}> = React.memo(({ status, players }) => {
  const currentPlayerIndex = React.useMemo(
    () => players.map(player => player.id).indexOf(status.currentPlayer.id),
    [players, status.currentPlayer.id]
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
