import React from 'react'
import { ChartOptions, Color } from 'chart.js'
import { Bar } from 'react-chartjs-2'
import {
  millisecondsToSeconds,
  secondsToMilliseconds,
  differenceInMilliseconds
} from 'date-fns'
import cx from 'classnames'

import { sum, formatDurationMs, useEvery, range } from '../utils'
import { Game, PlayerID, Turn } from '../api'

const IDEAL_DISTRIBUTION = new Map(
  [
    [2, 1], //  1+1
    [3, 2], //  1+2 2+1
    [4, 3], //  1+3 2+2 3+1
    [5, 4], //  1+4 2+3 3+2 4+1
    [6, 5], //  1+5 2+4 3+3 4+2 5+1
    [7, 6], //  1+6 2+5 3+4 4+3 5+2 6+1
    [8, 5], //  2+6 3+5 4+4 5+3 6+2
    [9, 4], //  3+6 4+5 5+4 6+3
    [10, 3], // 4+6 5+5 6+4
    [11, 2], // 5+6 6+5
    [12, 1] //  6+6
    // total:   36
  ].map(([key, value]) => [key, value! / 36])
)

const calcTurnsDistribution = (
  turns: ReadonlyArray<Turn>
): Map<number, number> => {
  const acc = new Map<number, number>()

  for (const turn of turns) {
    const combination = turn.dice.whiteDie + turn.dice.redDie
    const prev = acc.get(combination) ?? 0

    acc.set(combination, prev + 1)
  }

  return acc
}

const DOUGHNUT_OPTIONS: ChartOptions<'doughnut'> = {
  events: [],
  plugins: {
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
          backgroundColor: 'rgb(229, 231, 235)', // gray-200
          color: 'rgb(107, 114, 128)', // gray-500
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

export const TurnsDistributionChart: React.VFC<{
  turns: ReadonlyArray<Turn>
}> = React.memo(({ turns }) => {
  const data = React.useMemo(() => {
    const turnsDistribution = calcTurnsDistribution(turns)
    const combinations = range(2, 13)

    return {
      labels: combinations,
      datasets: [
        {
          label: 'Turns distribution',
          borderWidth: 0,
          data: combinations.map(
            combination => turnsDistribution.get(combination) ?? 0
          )
        }
      ]
    }
  }, [turns])

  return (
    <Bar
      data={data}
      options={{
        responsive: true,
        scales: {
          x: {
            stacked: true,
            beginAtZero: false
          },
          y: {
            stacked: true,
            beginAtZero: true
          }
        }
      }}
    />
  )
})
