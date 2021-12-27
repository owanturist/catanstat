import React from 'react'
import {
  Chart as ChartJS,
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
import { useParams } from 'react-router-dom'
import cx from 'classnames'

import { castID } from '../utils'
import { GameID, useQueryGame } from '../api'

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
  BarElement,
  PointElement,
  LineElement,
  Legend,
  ChartDataLabels,
  CategoryScale,
  LinearScale,
  RadialLinearScale,
  Tooltip,
  Filler
)

const ViewSection: React.FC<{
  title: React.ReactNode
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

const ViewContainer: React.FC = ({ children }) => (
  <div className="h-full overflow-y-auto text-gray-700 mx-auto">
    <div
      className={cx(
        'p-2 mx-auto space-y-4 bg-white border-gray-50',
        '2xs:space-y-6',
        'xs:max-w-md xs:p-3 xs:shadow-lg xs:border'
      )}
    >
      {children}
    </div>
  </div>
)

export const GameStat: React.VFC = React.memo(() => {
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
    </ViewContainer>
  )
})
