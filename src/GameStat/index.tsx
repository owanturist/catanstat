import React from 'react'
import { Chart as ChartJS, ArcElement } from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import { useParams } from 'react-router-dom'

import { castID } from '../utils'
import { GameID, useQueryGame } from '../api'

import { TotalDurationChart } from './TotalDurationChart'

ChartJS.register(ArcElement, ChartDataLabels)

const ViewContainer: React.FC = ({ children }) => <div>{children}</div>

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
    </ViewContainer>
  )
})
