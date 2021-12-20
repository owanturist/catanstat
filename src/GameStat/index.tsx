import React from 'react'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartData
} from 'chart.js'
import { Pie } from 'react-chartjs-2'
import { useParams } from 'react-router-dom'
import {
  millisecondsToSeconds,
  secondsToMilliseconds,
  differenceInMilliseconds
} from 'date-fns'

import { castID, useEvery } from '../utils'
import { Game, GameID, PlayerID, Turn, useQueryGame } from '../api'

ChartJS.register(ArcElement, Tooltip, Legend)

const calcTotalPlayersDurationMs = (
  turns: ReadonlyArray<Turn>
): Map<PlayerID, number> => {
  const acc = new Map<PlayerID, number>()

  for (const turn of turns) {
    const prev = acc.get(turn.player.id) ?? 0

    acc.set(turn.player.id, prev + turn.durationMs)
  }

  return acc
}

const useCalcTotalDuration = (
  game: Game
): ChartData<'pie', ReadonlyArray<number>, string> => {
  const currentPlayerId =
    game.status.type === 'ONGOING' ? game.status.currentPlayer.id : null

  const playersDurationMs = React.useMemo(
    () => calcTotalPlayersDurationMs(game.turns),
    [game.turns]
  )

  const currentTurnDurationMs = useEvery(
    now => {
      if (game.status.type === 'COMPLETED') {
        return 0
      }

      if (game.status.isPaused) {
        return game.status.currentTurnDurationMs
      }

      const diffMs = differenceInMilliseconds(
        now,
        game.status.currentTurnDurationSince
      )

      const durationSec = millisecondsToSeconds(
        game.status.currentTurnDurationMs + diffMs
      )

      // floor to the nearest second in milliseconds
      return secondsToMilliseconds(durationSec)
    },
    {
      interval: 60,
      skip: game.status.type === 'COMPLETED' || game.status.isPaused
    }
  )

  return React.useMemo(
    () => ({
      labels: game.players.map(player => player.name),
      datasets: [
        {
          label: 'Players duration',
          backgroundColor: game.players.map(player => player.color.hex),
          data: game.players.map(player => {
            const baseDurationMs = playersDurationMs.get(player.id) ?? 0

            return currentPlayerId === player.id
              ? baseDurationMs + currentTurnDurationMs
              : baseDurationMs
          })
        }
      ]
    }),
    [currentPlayerId, currentTurnDurationMs, game.players, playersDurationMs]
  )
}

const ViewTotalDuration: React.VFC<{
  game: Game
}> = React.memo(({ game }) => {
  const data = useCalcTotalDuration(game)

  return (
    <div>
      <Pie data={data} />
    </div>
  )
})

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
      <ViewTotalDuration game={game} />
    </ViewContainer>
  )
})
