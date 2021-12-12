import { QueryKey, useQuery, useMutation, useQueryClient } from 'react-query'

import { Color, DieEvent, DieNumber } from './domain'
import * as DB from './db'

export const useStartGame = (options: {
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
  >(DB.start_game, options)

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
  nextPlayerId: number
}

const decodePlayer = (player: DB.Player): Player => ({
  id: player.id,
  name: player.name,
  color: Color.fromId(player.color),
  nextPlayerId: player.next_player_id
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

const gameQueryKey = (gameId: number): QueryKey => ['games', gameId]

export const useQueryGame = (
  gameId: number
): {
  isLoading: boolean
  game: null | Game
  error: null | Error
} => {
  const { data, isLoading, error } = useQuery<DB.Game, Error>({
    queryKey: gameQueryKey(gameId),
    queryFn: () => DB.get_game(gameId)
  })

  return {
    isLoading,
    game: data ? decodeGame(data) : null,
    error
  }
}

export interface Dice {
  whiteDie: DieNumber
  redDie: DieNumber
  eventDie: DieEvent
}

export interface ApiHookOptions<
  TArgs extends Array<unknown> = [],
  TError = Error
> {
  onError?(error: TError): void
  onSuccess?(...args: TArgs): void
}

export const useCompleteTurn = (
  gameId: number,
  { onError, onSuccess }: ApiHookOptions
): {
  isLoading: boolean
  completeTurn(dice: Dice): void
} => {
  const queryClient = useQueryClient()
  const { mutate, isLoading } = useMutation<number, Error, Dice>(
    ({ whiteDie, redDie, eventDie }) => {
      return DB.next_turn(gameId, {
        white_die: whiteDie,
        red_die: redDie,
        event_die: eventDie
      })
    },
    {
      onError,
      async onSuccess() {
        await queryClient.invalidateQueries(gameQueryKey(gameId))

        onSuccess?.()
      }
    }
  )

  return {
    isLoading,
    completeTurn: mutate
  }
}

export const useAbortLastTurn = (
  gameId: number,
  { onError, onSuccess }: ApiHookOptions<[Dice]>
): {
  isLoading: boolean
  abortLastTurn(): void
} => {
  const queryClient = useQueryClient()
  const { mutate, isLoading } = useMutation<DB.Dice, Error>(
    () => DB.abort_last_turn(gameId),
    {
      onError,
      async onSuccess(dice) {
        await queryClient.invalidateQueries(gameQueryKey(gameId))

        onSuccess?.({
          whiteDie: dice.white_die,
          redDie: dice.red_die,
          eventDie: dice.event_die
        })
      }
    }
  )

  return {
    isLoading,
    abortLastTurn: mutate
  }
}

export const useCompleteGame = (
  gameId: number,
  { onError, onSuccess }: ApiHookOptions
): {
  isLoading: boolean
  completeGame(dice: Dice): void
} => {
  const queryClient = useQueryClient()
  const { mutate, isLoading } = useMutation<number, Error, Dice>(
    ({ whiteDie, redDie, eventDie }) => {
      return DB.complete_game(gameId, {
        white_die: whiteDie,
        red_die: redDie,
        event_die: eventDie
      })
    },
    {
      onError,
      async onSuccess() {
        await queryClient.invalidateQueries(gameQueryKey(gameId))

        onSuccess?.()
      }
    }
  )

  return {
    isLoading,
    completeGame: mutate
  }
}

export const usePauseGame = (
  gameId: number,
  { onError, onSuccess }: ApiHookOptions
): {
  isLoading: boolean
  pauseGame(): void
} => {
  const queryClient = useQueryClient()
  const { mutate, isLoading } = useMutation<number, Error>(
    () => DB.pause_game(gameId),
    {
      onError,
      async onSuccess() {
        await queryClient.invalidateQueries(gameQueryKey(gameId))

        onSuccess?.()
      }
    }
  )

  return {
    isLoading,
    pauseGame: mutate
  }
}

export const useResumeGame = (
  gameId: number,
  { onError, onSuccess }: ApiHookOptions
): {
  isLoading: boolean
  resumeGame(): void
} => {
  const queryClient = useQueryClient()
  const { mutate, isLoading } = useMutation<number, Error>(
    () => DB.resume_game(gameId),
    {
      onError,
      async onSuccess() {
        await queryClient.invalidateQueries(gameQueryKey(gameId))

        onSuccess?.()
      }
    }
  )

  return {
    isLoading,
    resumeGame: mutate
  }
}
