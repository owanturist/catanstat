import React from 'react'
import { ChartData, ChartDataset, ChartOptions } from 'chart.js'
import { Radar } from 'react-chartjs-2'
import cx from 'classnames'

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

const joinSidesDistribution = <TSide,>(
  sides: ReadonlyArray<TSide>,
  distribution: Map<TSide, number>
): Array<number> => {
  return sides.map(side => distribution.get(side) ?? 0)
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
  },
  plugins: {
    datalabels: {
      display: false
    },
    tooltip: {
      callbacks: {
        title: () => '',
        label: ctx => {
          const value = ctx.dataset.data[ctx.dataIndex] ?? 0
          const formattedValue = value % 1 > 0 ? `~${value.toFixed(2)}` : value

          return `${ctx.dataset.label} ${ctx.label} side: ${formattedValue} times`
        }
      }
    }
  }
}

const DATASET_DEFAULTS: Partial<ChartDataset<'radar'>> = {
  pointRadius: 2,
  borderWidth: 1
}

const DIE_NUMBER_SIDES: Array<DieNumber> = [1, 2, 3, 4, 5, 6]

export const NumberDiceDistribution: React.VFC<{
  turns: ReadonlyArray<Turn>
}> = ({ turns }) => {
  const data = React.useMemo<ChartData<'radar'>>(() => {
    const turnsCount = turns.length
    const whiteDistribution = calcDieDistribution(
      turns,
      turn => turn.dice.whiteDie
    )
    const redDistribution = calcDieDistribution(turns, turn => turn.dice.redDie)

    return {
      labels: DIE_NUMBER_SIDES,
      datasets: [
        {
          ...DATASET_DEFAULTS,
          label: 'White die',
          borderColor: 'rgb(14, 165, 233)', // sky-500
          backgroundColor: 'rgba(14, 165, 233, 0.25)', // sky-500/25
          pointBackgroundColor: '#fff',
          data: joinSidesDistribution(DIE_NUMBER_SIDES, whiteDistribution)
        },
        {
          ...DATASET_DEFAULTS,
          label: 'Red die',
          borderColor: 'rgb(239, 68, 68)', // red-500
          backgroundColor: 'rgba(239, 68, 68, 0.25)', // red-500/25
          pointBackgroundColor: 'rgb(239, 68, 68)', // red-500
          data: joinSidesDistribution(DIE_NUMBER_SIDES, redDistribution)
        },
        {
          ...DATASET_DEFAULTS,
          label: 'Ideal',
          pointRadius: 0,
          borderDash: [10, 5],
          borderColor: 'rgb(17, 24, 39)', // gray-500
          pointBackgroundColor: 'rgb(17, 24, 39)', // gray-500
          backgroundColor: 'transparent',
          data: DIE_NUMBER_SIDES.map(() => turnsCount / 6)
        }
      ]
    }
  }, [turns])

  return <Radar data={data} options={CHART_OPTIONS} />
}

const DIE_EVENT_SIDES: Array<DieEvent> = ['blue', 'green', 'black', 'yellow']

const DIE_EVENT_COLORS: Record<DieEvent, string> = {
  yellow: cx('rgb(234, 179, 8)'), // yellow-500
  blue: cx('rgb(59, 130, 246)'), // blue-500
  green: cx('rgb(34, 197, 94)'), // green-500
  black: cx('rgb(107, 114, 128)') // gray-500
}

export const EventDieDistribution: React.VFC<{
  turns: ReadonlyArray<Turn>
}> = ({ turns }) => {
  const data = React.useMemo<ChartData<'radar'>>(() => {
    const turnsCount = turns.length
    const eventDistribution = calcDieDistribution(
      turns,
      turn => turn.dice.eventDie
    )

    return {
      labels: DIE_EVENT_SIDES,
      datasets: [
        {
          ...DATASET_DEFAULTS,
          label: 'Event die',
          borderColor: 'rgb(236, 72, 153)', // pink-500
          backgroundColor: 'rgba(236, 72, 153, 0.25)', // pink-500/25
          pointBackgroundColor(ctx) {
            const side = DIE_EVENT_SIDES[ctx.dataIndex] ?? 'black'

            return DIE_EVENT_COLORS[side]
          },
          pointBorderColor(ctx) {
            const side = DIE_EVENT_SIDES[ctx.dataIndex] ?? 'black'

            return DIE_EVENT_COLORS[side]
          },
          data: joinSidesDistribution(DIE_EVENT_SIDES, eventDistribution)
        },
        {
          ...DATASET_DEFAULTS,
          label: 'Ideal',
          pointRadius: 0,
          borderDash: [10, 5],
          borderColor: 'rgb(17, 24, 39)', // gray-500
          pointBackgroundColor: 'rgb(17, 24, 39)', // gray-500
          backgroundColor: 'transparent',
          data: DIE_EVENT_SIDES.map(side => {
            // black occupies 3 sides out of 6 on a cube
            return side === 'black' ? turnsCount / 2 : turnsCount / 6
          })
        }
      ]
    }
  }, [turns])

  return <Radar data={data} options={CHART_OPTIONS} />
}

export const NumberPerEventDiceDistribution: React.VFC<{
  turns: ReadonlyArray<Turn>
}> = ({ turns }) => {
  const data = React.useMemo<ChartData<'radar'>>(() => {
    const blueDistribution = calcDieDistribution(turns, ({ dice }) => {
      return dice.eventDie === 'blue' ? dice.redDie : null
    })
    const yellowDistribution = calcDieDistribution(turns, ({ dice }) => {
      return dice.eventDie === 'yellow' ? dice.redDie : null
    })
    const greenDistribution = calcDieDistribution(turns, ({ dice }) => {
      return dice.eventDie === 'green' ? dice.redDie : null
    })
    const blackDistribution = calcDieDistribution(turns, ({ dice }) => {
      return dice.eventDie === 'black' ? dice.redDie : null
    })

    return {
      labels: DIE_NUMBER_SIDES,
      datasets: [
        {
          ...DATASET_DEFAULTS,
          label: 'Blue events',
          borderColor: 'rgb(59, 130, 246)', // blue-500
          backgroundColor: 'rgba(59, 130, 246, 0.25)', // blue-500/25
          pointBackgroundColor: 'rgb(59, 130, 246)', // blue-500
          data: joinSidesDistribution(DIE_NUMBER_SIDES, blueDistribution)
        },
        {
          ...DATASET_DEFAULTS,
          label: 'Yellow events',
          borderColor: 'rgb(234, 179, 8)', // yellow-500
          backgroundColor: 'rgba(234, 179, 8, 0.25)', // yellow-500/25
          pointBackgroundColor: 'rgb(234, 179, 8)', // yellow-500
          data: joinSidesDistribution(DIE_NUMBER_SIDES, yellowDistribution)
        },
        {
          ...DATASET_DEFAULTS,
          label: 'Green events',
          borderColor: 'rgb(34, 197, 94)', // gray-500
          backgroundColor: 'rgba(34, 197, 94, 0.25)', // gray-500/25
          pointBackgroundColor: 'rgb(34, 197, 94)', // gray-500
          data: joinSidesDistribution(DIE_NUMBER_SIDES, greenDistribution)
        },
        {
          ...DATASET_DEFAULTS,
          label: 'Black events',
          borderColor: 'rgb(17, 24, 39)', // gray-500
          backgroundColor: 'rgba(17, 24, 39, 0.25)', // gray-500/25
          pointBackgroundColor: 'rgb(17, 24, 39)', // gray-500
          data: joinSidesDistribution(DIE_NUMBER_SIDES, blackDistribution)
        }
      ]
    }
  }, [turns])

  return <Radar data={data} options={CHART_OPTIONS} />
}
