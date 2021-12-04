import { useQuery, useMutation } from 'react-query'

import { Color } from './domain'
import * as DB from './db'

export const useStartGame = ({
  onError,
  onSuccess
}: {
  onError(error: Error): void
  onSuccess(gameId: number): void
}): {
  isLoading: boolean
  startGame(players: ReadonlyArray<DB.PlayerPayload>): void
} => {
  const { mutate, isLoading } = useMutation<
    number,
    Error,
    ReadonlyArray<DB.PlayerPayload>
  >(DB.start_game, { onError, onSuccess })

  return {
    isLoading,
    startGame: mutate
  }
}

export interface Game {
  id: number
  isPaused: boolean
  totalDurationMs: number
  currentTurnDurationMs: number
  currentTurnDurationSince: Date
  startTime: Date
  endTime: null | Date
  players: ReadonlyArray<Player>
  turns: ReadonlyArray<Turn>
}

const decodeGame = (game: DB.Game): Game => {
  const players = game.players.map(decodePlayer)
  const playersMap = new Map(players.map(player => [player.id, player]))

  return {
    id: game.id,
    isPaused: game.is_paused,
    totalDurationMs: game.total_duration_ms,
    currentTurnDurationMs: game.current_turn_duration_ms,
    currentTurnDurationSince: game.current_turn_duration_since,
    startTime: game.start_time,
    endTime: game.end_time,
    players,
    turns: game.turns.map(turn => decodeTurn(turn, playersMap))
  }
}

export interface Player {
  id: number
  name: string
  color: Color
}

const decodePlayer = (player: DB.Player): Player => ({
  id: player.id,
  name: player.name,
  color: Color.fromId(player.color)
})

export interface Turn {
  id: number
  player: Player
  durationMs: number
  whiteDie: number
  redDie: number
  eventDie: string
}

const decodeTurn = (turn: DB.Turn, players: Map<number, Player>): Turn => ({
  id: turn.id,
  player: players.get(turn.player_id)!,
  durationMs: turn.duration_ms,
  whiteDie: turn.white_die,
  redDie: turn.red_die,
  eventDie: turn.event_die
})

export const useQueryGame = (
  gameId: number
): {
  isLoading: boolean
  game: null | Game
  error: null | Error
} => {
  const { data, isLoading, error } = useQuery<DB.Game, Error>({
    queryKey: ['games', gameId],
    queryFn: () => DB.get_game(gameId)
  })

  return {
    isLoading,
    game: data ? decodeGame(data) : null,
    error
  }
}
