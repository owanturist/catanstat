import React from 'react'
import {
  Chart as ChartJS,
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

import { castID } from '../utils'
import { GameID, useQueryGame } from '../api'

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
  ChartDataLabels,
  CategoryScale,
  LinearScale,
  RadialLinearScale,
  Tooltip,
  Filler
)

const ViewContainer: React.FC = ({ children }) => (
  <div className="max-h-full overflow-y-auto">{children}</div>
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
      <TotalDurationChart game={game} />
      <TurnsDistributionChart turns={game.turns} />
      <NumberDiceDistribution turns={game.turns} />
      <EventDieDistribution turns={game.turns} />
      <NumberPerEventDiceDistribution turns={game.turns} />
    </ViewContainer>
  )
})
