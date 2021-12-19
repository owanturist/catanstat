import React from 'react'
import { useParams } from 'react-router-dom'
import cx from 'classnames'
import { differenceInMilliseconds } from 'date-fns'

import { Dice, DieEventIcon, DieNumberIcon, DiePlaceholderIcon } from '../Die'
import { Game, GameID, Player, useQueryGame } from '../api'
import { castID, formatDurationMs, useEvery } from '../utils'
import * as Icon from '../Icon'

const ViewContainer: React.FC = ({ children }) => (
  <div className="h-full overflow-y-auto text-gray-700 mx-auto">
    <div className={cx('mx-auto', 'xs:max-w-md')}>{children}</div>
  </div>
)

const ViewDie: React.VFC<{
  die?: React.ReactElement
}> = ({ die = <DiePlaceholderIcon className="animate-pulse" /> }) => {
  return React.cloneElement(die, {
    className: cx(die.props.className, 'stroke-[24]')
  })
}

const ViewDice: React.VFC<{
  dice?: Dice
}> = React.memo(({ dice }) => (
  <div className="flex gap-1 text-2xl">
    <ViewDie
      die={dice && <DieNumberIcon color="white" side={dice.whiteDie} />}
    />
    <ViewDie die={dice && <DieNumberIcon color="red" side={dice.redDie} />} />
    <ViewDie die={dice && <DieEventIcon side={dice.eventDie} />} />
  </div>
))

const ViewTableCell: React.FC<{
  className?: string
}> = ({ className, children }) => (
  <td className={cx('p-2', className)}>{children}</td>
)

const ViewTableRow: React.VFC<{
  order: number
  player: Player
  dice?: Dice
  duration: string
}> = React.memo(({ order, player, dice, duration }) => (
  <tr className="even:bg-gray-50">
    <ViewTableCell className="text-right">
      <span className="mono text-gray-400 text-sm 2xs:text-base">{order}</span>
    </ViewTableCell>

    <ViewTableCell>
      <span className="flex items-center gap-2">
        <Icon.User
          className="text-xl 2xs:text-2xl"
          style={{ color: player.color.hex }}
        />
        {player.name}
      </span>
    </ViewTableCell>

    <ViewTableCell>
      <ViewDice dice={dice} />
    </ViewTableCell>

    <ViewTableCell className="text-right">
      <span
        className={cx(
          'px-1 py-0.5 font-mono text-xs text-center text-gray-500 bg-gray-200 rounded',
          '2xs:text-sm'
        )}
      >
        {duration}
      </span>
    </ViewTableCell>
  </tr>
))

const ViewCurrentTableRow: React.VFC<{
  order: number
  player: Player
  isGamePaused: boolean
  currentTurnDurationMs: number
  currentTurnDurationSince: Date
}> = React.memo(
  ({
    order,
    player,
    isGamePaused,
    currentTurnDurationMs,
    currentTurnDurationSince
  }) => {
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
      <ViewTableRow
        order={order}
        player={player}
        duration={currentTurnDuration}
      />
    )
  }
)

const ViewTableHeaderCell: React.FC<{
  className?: string
}> = ({ className, children }) => (
  <th
    className={cx(
      // should stick individual th as a workaround with sticky tables
      // see https://css-tricks.com/position-sticky-and-table-headers
      'sticky top-0 z-10',
      'p-2 text-left text-xs font-medium bg-gray-600 text-gray-200 uppercase tracking-wider',
      '2xs:text-sm',
      className
    )}
  >
    {children}
  </th>
)

const ViewHistoryTable: React.VFC<{
  game: Game
}> = React.memo(({ game }) => {
  const turnsCount = game.turns.length

  return (
    <table className="w-full border-collapse xs:border-x">
      <thead>
        <tr>
          <ViewTableHeaderCell className="border-l-gray-600 xs:border-l">
            #
          </ViewTableHeaderCell>
          <ViewTableHeaderCell className="w-full">Player</ViewTableHeaderCell>
          <ViewTableHeaderCell className="text-center">
            Dice
          </ViewTableHeaderCell>
          <ViewTableHeaderCell className="text-right border-gray-600 xs:border-r">
            Duration
          </ViewTableHeaderCell>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {game.status.type === 'ONGOING' && (
          <ViewCurrentTableRow
            order={turnsCount + 1}
            player={game.status.currentPlayer}
            isGamePaused={game.status.isPaused}
            currentTurnDurationMs={game.status.currentTurnDurationMs}
            currentTurnDurationSince={game.status.currentTurnDurationSince}
          />
        )}

        {game.turns.map((turn, index) => (
          <ViewTableRow
            key={turn.id}
            order={turnsCount - index}
            player={turn.player}
            dice={turn.dice}
            duration={formatDurationMs(turn.durationMs)}
          />
        ))}
      </tbody>
    </table>
  )
})

export const GameHistory: React.VFC = React.memo(() => {
  const params = useParams<'gameId'>()
  const gameId = castID<GameID>(params.gameId!)
  const { isLoading, error, game } = useQueryGame(gameId)

  if (isLoading) {
    return null
  }

  if (error != null) {
    return (
      <ViewContainer>Something went wrong while loading the game</ViewContainer>
    )
  }

  if (game == null) {
    return <ViewContainer>Game not found</ViewContainer>
  }

  return (
    <ViewContainer>
      <ViewHistoryTable game={game} />
    </ViewContainer>
  )
})
