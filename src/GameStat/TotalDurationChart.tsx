import React from 'react'
import { ChartData, ChartOptions, Color } from 'chart.js'
import { Doughnut } from 'react-chartjs-2'
import {
  millisecondsToSeconds,
  secondsToMilliseconds,
  differenceInMilliseconds
} from 'date-fns'
import cx from 'classnames'
import { useImpulseMemo } from 'react-impulse'

import { sum, formatDurationMs, useEvery } from '../utils'
import { Game, PlayerID, Turn } from '../api'

const calcTotalPlayersDurationMs = (
  turns: ReadonlyArray<Turn>
): Map<PlayerID, number> => {
  const acc = new Map<PlayerID, number>()

  for (const turn of turns) {
    const prev = acc.get(turn.player.id) ?? 0

    acc.set(turn.player.id, prev + turn.durationMs)
  }

  return acc
}

const useCalcPlayersDuration = (game: Game): Array<number> => {
  const currentPlayerId =
    game.status.type === 'ONGOING' ? game.status.currentPlayer.id : null

  const playersDurationMs = useImpulseMemo(
    () => calcTotalPlayersDurationMs(game.turns),
    [game.turns]
  )

  const currentTurnDurationMs = useEvery(
    now => {
      if (game.status.type === 'COMPLETED') {
        return 0
      }

      if (game.status.isPaused) {
        return game.status.currentTurnDurationMs
      }

      const diffMs = differenceInMilliseconds(
        now,
        game.status.currentTurnDurationSince
      )

      const durationSec = millisecondsToSeconds(
        game.status.currentTurnDurationMs + diffMs
      )

      // floor to the nearest second in milliseconds
      return secondsToMilliseconds(durationSec)
    },
    {
      interval: 60,
      skip: game.status.type === 'COMPLETED' || game.status.isPaused
    }
  )

  return useImpulseMemo(() => {
    return game.players.map(player => {
      const baseDurationMs = playersDurationMs.get(player.id) ?? 0

      return currentPlayerId === player.id
        ? baseDurationMs + currentTurnDurationMs
        : baseDurationMs
    })
  }, [currentPlayerId, currentTurnDurationMs, game.players, playersDurationMs])
}

const DOUGHNUT_OPTIONS: ChartOptions<'doughnut'> = {
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      callbacks: {
        label: ctx => {
          const totalDurationMs = sum(ctx.dataset.data)
          const playerDurationMs = ctx.dataset.data[ctx.dataIndex] ?? 0
          const percent = (playerDurationMs / totalDurationMs) * 100

          return `${percent.toFixed(2)}%`
        }
      }
    },
    datalabels: {
      borderRadius: 4,
      labels: {
        name: {
          align: 'top',
          offset: 0,
          color: 'rgba(31, 41, 55, 0.75)', // gray-800/75
          backgroundColor(ctx) {
            return ctx.dataset.backgroundColor as Color
          },
          font: {
            size: 16,
            weight: 500
          },
          formatter(_value, ctx) {
            return ctx.chart.data.labels?.[ctx.dataIndex]
          }
        },
        value: {
          align: 'bottom',
          color: 'rgba(31, 41, 55, 0.75)', // gray-800/75
          backgroundColor(ctx) {
            return ctx.dataset.backgroundColor as Color
          },
          borderWidth: 1,
          borderColor: 'rgba(31, 41, 55, 0.25)', // gray-800/75
          font: {
            size: 12,
            family: 'monospace'
          },
          formatter: formatDurationMs,
          padding: {
            top: 2,
            left: 4,
            right: 4,
            bottom: 2
          }
        }
      }
    }
  }
}

export const TotalDurationChart: React.FC<{
  game: Game
}> = ({ game }) => {
  const playersDuration = useCalcPlayersDuration(game)
  const data = useImpulseMemo<ChartData<'doughnut'>>(
    () => ({
      labels: game.players.map(player => player.name),
      datasets: [
        {
          label: 'Players duration',
          borderWidth: 0,
          backgroundColor: game.players.map(player => player.color.hex),
          data: playersDuration.filter(duration => duration > 0)
        }
      ]
    }),
    [playersDuration, game.players]
  )
  const totalGameDurationMs = useImpulseMemo(
    () => sum(playersDuration),
    [playersDuration]
  )

  return (
    <div className="relative">
      <Doughnut data={data} options={DOUGHNUT_OPTIONS} />

      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span
          className={cx(
            'uppercase font-semibold text-sm text-gray-700',
            '2xs:text-base'
          )}
        >
          Game duration
        </span>
        <span
          className={cx(
            'px-1 py-0.5 font-mono text-xs text-center text-gray-500 bg-gray-200 rounded',
            '2xs:text-sm'
          )}
        >
          {formatDurationMs(totalGameDurationMs)}
        </span>
      </div>
    </div>
  )
}
