import React from 'react'
import { ChartData, ChartOptions } from 'chart.js'
import { Radar } from 'react-chartjs-2'

import { range } from '../utils'
import { Turn } from '../api'
import { DieEvent, DieNumber } from '../Die'

const calcDieDistribution = <TSide,>(
  turns: ReadonlyArray<Turn>,
  transform: (turn: Turn) => TSide | null
): Map<TSide, number> => {
  const acc = new Map<TSide, number>()

  for (const turn of turns) {
    const side = transform(turn)

    if (side != null) {
      const prev = acc.get(side) ?? 0

      acc.set(side, prev + 1)
    }
  }

  return acc
}

const CHART_OPTIONS: ChartOptions<'radar'> = {
  responsive: true,
  interaction: {
    intersect: false,
    mode: 'nearest'
  },
  scales: {
    r: {
      beginAtZero: true,
      ticks: {
        stepSize: 1,
        maxTicksLimit: 10
      },
      pointLabels: {
        font: {
          size: 12
        }
      }
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
    const sides = range(1, 7) as Array<DieNumber>

    return {
      labels: sides,
      datasets: [
        {
          label: 'White die',
          pointRadius: 2,
          borderWidth: 1,
          borderColor: 'rgb(14, 165, 233)', // sky-500
          backgroundColor: 'rgba(14, 165, 233, 0.25)', // sky-500/25
          pointBackgroundColor: '#fff',
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
          borderColor: 'rgb(17, 24, 39)', // gray-500
          pointBackgroundColor: 'rgb(17, 24, 39)', // gray-500
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

export const EventDieDistribution: React.VFC<{
  turns: ReadonlyArray<Turn>
}> = React.memo(({ turns }) => {
  const data = React.useMemo<ChartData<'radar'>>(() => {
    const turnsCount = turns.length
    const eventDistribution = calcDieDistribution(
      turns,
      turn => turn.dice.eventDie
    )
    const sides: Array<DieEvent> = ['blue', 'green', 'black', 'yellow']

    return {
      labels: sides,
      datasets: [
        {
          label: 'Event die',
          pointRadius: 2,
          borderWidth: 1,
          borderColor: 'rgb(107, 114, 128)', // gray-500
          backgroundColor: 'rgba(107, 114, 128, 0.25)', // gray-500/25
          pointBackgroundColor(ctx) {
            const side = sides[ctx.dataIndex]

            if (side === 'yellow') {
              return 'rgb(234, 179, 8)' // yellow-500
            }

            if (side === 'blue') {
              return 'rgb(59, 130, 246)' // blue-500
            }

            if (side === 'green') {
              return 'rgb(34, 197, 94)' // green-500
            }

            return 'rgb(107, 114, 128)' // gray-500
          },
          pointBorderColor(ctx) {
            const side = sides[ctx.dataIndex]

            if (side === 'yellow') {
              return 'rgb(234, 179, 8)' // yellow-500
            }

            if (side === 'blue') {
              return 'rgb(59, 130, 246)' // blue-500
            }

            if (side === 'green') {
              return 'rgb(34, 197, 94)' // green-500
            }

            return 'rgb(107, 114, 128)' // gray-500
          },
          data: sides.map(side => eventDistribution.get(side) ?? 0),
          datalabels: {
            display: false
          }
        },
        {
          label: 'Ideal',
          pointRadius: 0,
          borderWidth: 1,
          borderDash: [10, 5],
          borderColor: 'rgb(17, 24, 39)', // gray-500
          pointBackgroundColor: 'rgb(17, 24, 39)', // gray-500
          backgroundColor: 'transparent',
          data: sides.map(side =>
            side === 'black' ? turnsCount / 2 : turnsCount / 6
          ),
          datalabels: {
            display: false
          }
        }
      ]
    }
  }, [turns])

  return <Radar data={data} options={CHART_OPTIONS} />
})

export const NumberPerEventDiceDistribution: React.VFC<{
  turns: ReadonlyArray<Turn>
}> = React.memo(({ turns }) => {
  const data = React.useMemo<ChartData<'radar'>>(() => {
    const blueDistribution = calcDieDistribution(turns, turn =>
      turn.dice.eventDie === 'blue' ? turn.dice.redDie : null
    )
    const yellowDistribution = calcDieDistribution(turns, turn =>
      turn.dice.eventDie === 'yellow' ? turn.dice.redDie : null
    )
    const greenDistribution = calcDieDistribution(turns, turn =>
      turn.dice.eventDie === 'green' ? turn.dice.redDie : null
    )
    const blackDistribution = calcDieDistribution(turns, turn =>
      turn.dice.eventDie === 'black' ? turn.dice.redDie : null
    )
    const sides = range(1, 7) as Array<DieNumber>

    return {
      labels: sides,
      datasets: [
        {
          label: 'Blue events',
          pointRadius: 2,
          borderWidth: 1,
          borderColor: 'rgb(59, 130, 246)', // blue-500
          backgroundColor: 'rgba(59, 130, 246, 0.25)', // blue-500/25
          pointBackgroundColor: 'rgb(59, 130, 246)', // blue-500
          data: sides.map(side => blueDistribution.get(side) ?? 0),
          datalabels: {
            display: false
          }
        },
        {
          label: 'Yellow events',
          pointRadius: 2,
          borderWidth: 1,
          borderColor: 'rgb(234, 179, 8)', // yellow-500
          backgroundColor: 'rgba(234, 179, 8, 0.25)', // yellow-500/25
          pointBackgroundColor: 'rgb(234, 179, 8)', // yellow-500
          data: sides.map(side => yellowDistribution.get(side) ?? 0),
          datalabels: {
            display: false
          }
        },
        {
          label: 'Green events',
          pointRadius: 2,
          borderWidth: 1,
          borderColor: 'rgb(34, 197, 94)', // gray-500
          backgroundColor: 'rgba(34, 197, 94, 0.25)', // gray-500/25
          pointBackgroundColor: 'rgb(34, 197, 94)', // gray-500
          data: sides.map(side => greenDistribution.get(side) ?? 0),
          datalabels: {
            display: false
          }
        },
        {
          label: 'Black events',
          pointRadius: 2,
          borderWidth: 1,
          borderColor: 'rgb(17, 24, 39)', // gray-500
          backgroundColor: 'rgba(17, 24, 39, 0.25)', // gray-500/25
          pointBackgroundColor: 'rgb(17, 24, 39)', // gray-500
          data: sides.map(side => blackDistribution.get(side) ?? 0),
          datalabels: {
            display: false
          }
        }
      ]
    }
  }, [turns])

  return <Radar data={data} options={CHART_OPTIONS} />
})
