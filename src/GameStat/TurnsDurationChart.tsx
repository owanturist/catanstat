import React from 'react'
import { ChartData, ChartOptions } from 'chart.js'
import { Chart } from 'react-chartjs-2'
import {
  millisecondsToSeconds,
  secondsToMilliseconds,
  differenceInMilliseconds
} from 'date-fns'

import { formatDurationMs, useEvery } from '../utils'
import { Game } from '../api'

const calcMovingAverage = (
  turnsDuration: ReadonlyArray<number>
): Array<number> => {
  const acc = new Array<number>()
  let sumDuration = 0

  for (const duration of turnsDuration) {
    sumDuration += duration
    acc.push(sumDuration / (acc.length + 1))
  }

  return acc
}

const useCalcTurnsDuration = (game: Game): Array<number> => {
  const currentTurnDurationMs = useEvery(
    now => {
      if (game.status.type === 'COMPLETED') {
        return null
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

  return React.useMemo(() => {
    // safe to mutate here
    const turnsDuration = game.turns.map(turn => turn.durationMs).reverse()

    if (currentTurnDurationMs != null) {
      turnsDuration.push(currentTurnDurationMs)
    }

    return turnsDuration
  }, [currentTurnDurationMs, game.turns])
}

const CHART_OPTIONS: ChartOptions = {
  responsive: true,
  aspectRatio: 4 / 3,
  interaction: {
    intersect: false,
    mode: 'index'
  },
  scales: {
    y: {
      beginAtZero: true,
      suggestedMax: 1000 * 60, // 1 minute

      ticks: {
        callback: value => formatDurationMs(Number(value))
      }
    }
  },
  plugins: {
    legend: {
      display: false
    },
    datalabels: {
      display: false
    },
    tooltip: {
      callbacks: {
        title([firstDataset]) {
          if (firstDataset == null) {
            return ''
          }

          return `Turn #${firstDataset.label}`
        },

        label: ctx => {
          const value = ctx.dataset.data[ctx.dataIndex] ?? 0

          return formatDurationMs(Number(value))
        }
      }
    }
  }
}

export const TurnsDurationChart: React.VFC<{
  game: Game
}> = React.memo(({ game }) => {
  const turnsDuration = useCalcTurnsDuration(game)
  const data = React.useMemo<ChartData>(
    () => ({
      labels: turnsDuration.map((_, index) => index + 1),
      datasets: [
        {
          type: 'line',
          cubicInterpolationMode: 'monotone',
          label: 'Moving average',
          pointRadius: 0,
          borderWidth: 3,
          borderColor: 'rgb(236, 72, 153)', // pink-500
          pointBackgroundColor: 'rgb(236, 72, 153)', // pink-500
          pointBorderWidth: 0,
          data: calcMovingAverage(turnsDuration)
        },
        {
          type: 'bar',
          label: 'Turns duration',
          borderWidth: 0,
          data: turnsDuration,
          borderRadius: {
            topLeft: 99,
            topRight: 99
          },
          backgroundColor(ctx) {
            const player = game.players[ctx.dataIndex % game.players.length]

            if (player == null) {
              return 'transparent'
            }

            return player.color.hex
          },
          pointBorderWidth: 0
        }
      ]
    }),
    [game.players, turnsDuration]
  )

  return <Chart type="bar" data={data} options={CHART_OPTIONS} />
})
