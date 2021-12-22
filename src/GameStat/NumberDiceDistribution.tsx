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
  responsive: true
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
          // pointRadius: 3,
          // borderWidth: 3,
          borderColor: 'rgb(96, 165, 250)', // blue-500
          backgroundColor: 'rgb(96, 165, 250)', // blue-500/50
          data: sides.map(side => whiteDistribution.get(side) ?? 0)
        },
        {
          label: 'Red die',
          // pointRadius: 3,
          // borderWidth: 3,
          borderColor: 'rgb(239, 68, 68)', // red-500
          backgroundColor: 'rgb(239, 68, 68)', // red-500/50
          data: sides.map(side => redDistribution.get(side) ?? 0)
        },
        {
          label: 'Ideal',
          // pointRadius: 3,
          // borderWidth: 3,
          borderColor: 'rgb(34, 197, 94)', // green-500
          backgroundColor: 'rgb(34, 197, 94)', // red-500/50
          data: sides.map(() => turnsCount / 6),
          datalabels: {
            formatter: (value: number) => value.toFixed(1)
          }
        }
      ]
    }
  }, [turns])

  return <Radar data={data} options={CHART_OPTIONS} />
})
