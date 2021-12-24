import React from 'react'
import { ChartData, ChartOptions } from 'chart.js'
import { Radar } from 'react-chartjs-2'

import { range } from '../utils'
import { Turn } from '../api'
import { DieNumber } from '../Die'

const calcDieDistribution = (
  turns: ReadonlyArray<Turn>,
  transform: (turn: Turn) => DieNumber
): Map<number, number> => {
  const acc = new Map<number, number>()

  for (const turn of turns) {
    const side = transform(turn)
    const prev = acc.get(side) ?? 0

    acc.set(side, prev + 1)
  }

  return acc
}

const CHART_OPTIONS: ChartOptions<'radar'> = {
  responsive: true,
  interaction: {
    intersect: false,
    mode: 'index'
  },
  scales: {
    r: {
      beginAtZero: true,
      ticks: {
        display: false
      },
      pointLabels: {
        font: {
          size: 12
        }
      }
    }
  },
  plugins: {
    tooltip: {
      // enabled: false
    }
  }
}

export const NumberDiceDistribution: React.VFC<{
  turns: ReadonlyArray<Turn>
}> = React.memo(({ turns }) => {
  const data = React.useMemo<ChartData<'radar'>>(() => {
    const turnsCount = turns.length
    const whiteDistribution = calcDieDistribution(
      turns,
      turn => turn.dice.whiteDie
    )
    const redDistribution = calcDieDistribution(turns, turn => turn.dice.redDie)
    const sides = range(1, 7)

    return {
      labels: sides,
      datasets: [
        {
          label: 'White die',
          pointRadius: 2,
          borderWidth: 1,
          borderColor: 'rgb(96, 165, 250)', // blue-500
          backgroundColor: 'rgba(96, 165, 250, 0.25)', // blue-500/25
          pointBackgroundColor: 'rgb(96, 165, 250)', // blue-500
          data: sides.map(side => whiteDistribution.get(side) ?? 0),
          datalabels: {
            display: false
          }
        },
        {
          label: 'Red die',
          pointRadius: 2,
          borderWidth: 1,
          borderColor: 'rgb(239, 68, 68)', // red-500
          backgroundColor: 'rgba(239, 68, 68, 0.2)', // red-500/25
          pointBackgroundColor: 'rgb(239, 68, 68)', // red-500
          data: sides.map(side => redDistribution.get(side) ?? 0),
          datalabels: {
            display: false
          }
        },
        {
          label: 'Ideal',
          pointRadius: 0,
          borderWidth: 1,
          borderDash: [10, 5],
          borderColor: 'rgb(34, 197, 94)', // green-500
          backgroundColor: 'transparent',
          data: sides.map(() => turnsCount / 6),
          datalabels: {
            display: false
          }
        }
      ]
    }
  }, [turns])

  return <Radar data={data} options={CHART_OPTIONS} />
})
