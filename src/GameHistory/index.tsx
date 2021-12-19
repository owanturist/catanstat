import React from 'react'
import { useParams } from 'react-router-dom'
import cx from 'classnames'
import { differenceInMilliseconds } from 'date-fns'

import { DieNumber, DieEvent } from '../domain'
import { Dice, Game, GameID, Player, useQueryGame } from '../api'
import { castID, formatDurationMs, useEvery } from '../utils'
import * as Icon from '../Icon'

const ViewContainer: React.FC = ({ children }) => (
  <div
    className={cx(
      'h-full overflow-y-auto text-gray-700 mx-auto',
      'sm:max-w-md'
    )}
  >
    {children}
  </div>
)

const DIE_NUMBER_ICONS: Record<DieNumber, React.ReactElement> = {
  1: <Icon.DieOne />,
  2: <Icon.DieTwo />,
  3: <Icon.DieThree />,
  4: <Icon.DieFour />,
  5: <Icon.DieFive />,
  6: <Icon.DieSix />
}

const DIE_EVENT_COLORS: Record<DieEvent, string> = {
  yellow: cx('text-yellow-400 stroke-yellow-500'),
  blue: cx('text-blue-500 stroke-blue-600'),
  green: cx('text-green-500 stroke-green-600'),
  black: cx('text-gray-600 stroke-gray-800')
}

const DIE_PLACEHOLDER = (
  <Icon.DieClear className="text-gray-100 stroke-gray-300 stroke-[24]" />
)

const ViewDiceTemplate: React.VFC<{
  whiteDie?: React.ReactElement
  redDie?: React.ReactElement
  eventDie?: React.ReactElement
}> = ({
  whiteDie = DIE_PLACEHOLDER,
  redDie = DIE_PLACEHOLDER,
  eventDie = DIE_PLACEHOLDER
}) => (
  <span className="flex gap-1 text-xl">
    {whiteDie}
    {redDie}
    {eventDie}
  </span>
)

const ViewDice: React.VFC<Dice> = React.memo(
  ({ whiteDie, redDie, eventDie }) => (
    <ViewDiceTemplate
      whiteDie={React.cloneElement(DIE_NUMBER_ICONS[whiteDie], {
        className: cx('text-gray-100 stroke-gray-400 stroke-[24]')
      })}
      redDie={React.cloneElement(DIE_NUMBER_ICONS[redDie], {
        className: cx('text-red-500 stroke-red-700 stroke-[24]')
      })}
      eventDie={
        <Icon.DieClear
          className={cx(DIE_EVENT_COLORS[eventDie], 'stroke-[24]')}
        />
      }
    />
  )
)

const ViewTableHeaderCell: React.FC<{
  className?: string
}> = ({ className, children }) => (
  <th
    className={cx(
      // should stick individual th as a workaround with sticky tables
      // see https://css-tricks.com/position-sticky-and-table-headers
      'sticky top-0',
      'p-2 text-left text-xs font-medium bg-gray-600 text-gray-200 uppercase tracking-wider',
      className
    )}
  >
    {children}
  </th>
)

const ViewTableRow: React.VFC<{
  order: number
  player: Player
  dice?: Dice
  duration: string
}> = React.memo(({ order, player, dice, duration }) => (
  <tr className="even:bg-gray-50">
    <td className="px-2 py-1 text-right">
      <span className="mono text-sm text-gray-400">{order}</span>
    </td>
    <td className="px-2 py-1">
      <span className="flex items-center gap-2">
        <Icon.User style={{ color: player.color.hex }} />
        {player.name}
      </span>
    </td>
    <td className="px-2 py-1">
      {dice ? <ViewDice {...dice} /> : <ViewDiceTemplate />}
    </td>
    <td className="px-2 py-1 text-right">
      <span
        className={cx(
          'px-1 py-0.5 font-mono text-xs text-center text-gray-500 bg-gray-200 rounded'
        )}
      >
        {duration}
      </span>
    </td>
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

const ViewHistoryTable: React.VFC<{
  game: Game
}> = React.memo(({ game }) => {
  const turnsCount = game.turns.length

  return (
    <table className="relative border-collapse">
      <thead>
        <tr>
          <ViewTableHeaderCell>#</ViewTableHeaderCell>
          <ViewTableHeaderCell className="w-full">Player</ViewTableHeaderCell>
          <ViewTableHeaderCell className="text-center">
            Dice
          </ViewTableHeaderCell>
          <ViewTableHeaderCell className="text-right">
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
