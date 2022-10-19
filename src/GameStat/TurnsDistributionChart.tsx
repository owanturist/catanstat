import React from 'react'
import { ChartData, ChartOptions } from 'chart.js'
import { Chart } from 'react-chartjs-2'
import { useImpulseMemo } from 'react-impulse'

import { range } from '../utils'
import { Turn } from '../api'

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

const CHART_OPTIONS: ChartOptions = {
  responsive: true,
  aspectRatio: 4 / 3,
  interaction: {
    intersect: false,
    mode: 'index'
  },
  scales: {
    x: {
      beginAtZero: false
    },
    y: {
      beginAtZero: true
    }
  },
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      callbacks: {
        title: ([firstItem]) => {
          if (firstItem == null) {
            return ''
          }

          return `Combination ${firstItem.label}`
        },
        label: ctx => {
          const value = Number(ctx.dataset.data[ctx.dataIndex] ?? 0)
          const lowerBound = Math.floor(value)
          const upperBound = Math.ceil(value)

          if (lowerBound === upperBound) {
            return `${ctx.dataset.label} ${value} times`
          }

          return `${ctx.dataset.label} ${lowerBound} - ${upperBound} times`
        }
      }
    }
  }
}

export const TurnsDistributionChart: React.FC<{
  turns: ReadonlyArray<Turn>
}> = ({ turns }) => {
  const data = useImpulseMemo<ChartData>(() => {
    const turnsCount = turns.length
    const turnsDistribution = calcTurnsDistribution(turns)
    const combinations = range(2, 13)

    return {
      labels: combinations,
      datasets: [
        {
          type: 'line',
          label: 'Ideal distribution',
          pointRadius: 0,
          borderDash: [10, 5],
          borderWidth: 3,
          borderColor: 'rgb(96, 165, 250)', // blue-500
          pointBackgroundColor: 'rgb(96, 165, 250)', // blue-500
          pointBorderWidth: 0,
          data: combinations
            .map(combination => {
              const ideal = IDEAL_DISTRIBUTION.get(combination) ?? 0

              return turnsCount * ideal
            })
            .filter(count => count > 0),
          datalabels: {
            display: false
          }
        },
        {
          type: 'bar',
          label: 'Real distribution',
          borderWidth: 0,
          data: combinations.map(
            combination => turnsDistribution.get(combination) ?? 0
          ),
          borderRadius: {
            topLeft: 99,
            topRight: 99
          },
          backgroundColor: 'rgb(236, 72, 153)', // pink-500
          pointBorderWidth: 0,
          datalabels: {
            anchor: 'end',
            align: 'bottom',
            color: '#fff',
            font: {
              weight: 500
            },
            formatter: (value: number) => (value > 0 ? value : null)
          }
        }
      ]
    }
  }, [turns])

  return <Chart type="bar" data={data} options={CHART_OPTIONS} />
}
