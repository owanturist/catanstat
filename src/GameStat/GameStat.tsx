import React from 'react'
import {
  Chart as ChartJS,
  BarController,
  LineController,
  PieController,
  Legend,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  CategoryScale,
  LinearScale,
  RadialLinearScale,
  Tooltip,
  Filler
} from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import cx from 'classnames'

import { Game } from '../api'

import { TurnsDurationChart } from './TurnsDurationChart'
import { TotalDurationChart } from './TotalDurationChart'
import { TurnsDistributionChart } from './TurnsDistributionChart'
import {
  NumberDiceDistribution,
  EventDieDistribution,
  NumberPerEventDiceDistribution
} from './DiceDistributionChart'

ChartJS.register(
  ArcElement,
  BarController,
  LineController,
  PieController,
  BarElement,
  PointElement,
  LineElement,
  Legend,
  ChartDataLabels,
  CategoryScale,
  LinearScale,
  RadialLinearScale,
  Tooltip,
  Filler,
  LineController
)

const ViewSection: React.FC<{
  title: React.ReactNode
  children: React.ReactNode
}> = ({ title, children }) => (
  <div>
    <h4
      className={cx(
        'mb-2 text-lg text-center font-bold',
        '2xs:text-xl',
        'xs:text-2xl'
      )}
    >
      {title}
    </h4>
    {children}
  </div>
)

export const GameStat: React.FC<{
  game: Game
}> = ({ game }) => (
  <>
    <ViewSection title="Total game duration">
      <TotalDurationChart game={game} />
    </ViewSection>

    <ViewSection title="Turns duration">
      <TurnsDurationChart game={game} />
    </ViewSection>

    <ViewSection title="Turns distribution">
      <TurnsDistributionChart turns={game.turns} />
    </ViewSection>

    <ViewSection title="White and Red dice distribution">
      <NumberDiceDistribution turns={game.turns} />
    </ViewSection>

    <ViewSection title="Event die distribution">
      <EventDieDistribution turns={game.turns} />
    </ViewSection>

    <ViewSection title="Red to Event dice distribution">
      <NumberPerEventDiceDistribution turns={game.turns} />
    </ViewSection>
  </>
)
