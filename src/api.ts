import { QueryKey, useQuery, useMutation, useQueryClient } from 'react-query'

import { Color, DieEvent, DieNumber } from './domain'
import { ID, castID } from './utils'
import * as DB from './db'

export const useStartGame = ({
  onError,
  onSuccess
}: {
  onError(error: Error): void
  onSuccess(gameId: GameID): void
}): {
  isLoading: boolean
  startGame(players: ReadonlyArray<DB.PlayerPayload>): void
} => {
  const { mutate, isLoading } = useMutation<
    number,
    Error,
    ReadonlyArray<DB.PlayerPayload>
  >(DB.start_game, {
    onError,
    onSuccess(gameId) {
      onSuccess(castID(gameId))
    }
  })

  return {
    isLoading,
    startGame: mutate
  }
}

export type GameID = ID<'@GAME@'>

export interface GameStatusOngoing {
  type: 'ONGOING'
  isPaused: boolean
  currentPlayerId: PlayerID
  currentTurnDurationMs: number
  currentTurnDurationSince: Date
}

export interface GameStatusCompleted {
  type: 'COMPLETED'
  winnerPlayerId: PlayerID
  endTime: Date
}

export type GameStatus = GameStatusOngoing | GameStatusCompleted

const decodeGameStatus = (
  game: DB.Game,
  turns: ReadonlyArray<Turn>
): GameStatus => {
  const lastTurn = turns[0]

  if (game.end_time != null && lastTurn != null) {
    return {
      type: 'COMPLETED',
      winnerPlayerId: castID(lastTurn.player.id),
      endTime: game.end_time
    }
  }

  return {
    type: 'ONGOING',
    isPaused: game.is_paused,
    currentPlayerId:
      lastTurn == null
        ? castID(game.players[0]!.id)
        : castID(lastTurn.player.nextPlayerId),
    currentTurnDurationMs: game.current_turn_duration_ms,
    currentTurnDurationSince: game.current_turn_duration_since
  }
}

export interface Game {
  id: GameID
  status: GameStatus
  totalDurationMs: number
  startTime: Date
  players: ReadonlyArray<Player>
  turns: ReadonlyArray<Turn>
}

const decodeGame = (game: DB.Game): Game => {
  const players = game.players.map(decodePlayer)
  const playersMap = new Map(players.map(player => [player.id, player]))
  const turns = game.turns.map(turn => decodeTurn(turn, playersMap))

  return {
    id: castID(game.id),
    status: decodeGameStatus(game, turns),
    totalDurationMs: game.total_duration_ms,
    startTime: game.start_time,
    players,
    turns
  }
}

export type PlayerID = ID<'@PLAYER@'>

export interface Player {
  id: PlayerID
  name: string
  color: Color
  nextPlayerId: PlayerID
}

const decodePlayer = (player: DB.Player): Player => ({
  id: castID(player.id),
  name: player.name,
  color: Color.fromID(player.color),
  nextPlayerId: castID(player.next_player_id)
})

export type TurnID = ID<'@TURN@'>

export interface Turn {
  id: TurnID
  player: Player
  durationMs: number
  whiteDie: number
  redDie: number
  eventDie: string
}

const decodeTurn = (turn: DB.Turn, players: Map<PlayerID, Player>): Turn => ({
  id: castID(turn.id),
  player: players.get(castID(turn.player_id))!,
  durationMs: turn.duration_ms,
  whiteDie: turn.white_die,
  redDie: turn.red_die,
  eventDie: turn.event_die
})

const gameQueryKey = (gameId: GameID): QueryKey => ['games', gameId]

export const useQueryGame = (
  gameId: GameID
): {
  isLoading: boolean
  game: null | Game
  error: null | Error
} => {
  const { data, isLoading, error } = useQuery<DB.Game, Error>({
    queryKey: gameQueryKey(gameId),
    queryFn: () => DB.get_game(Number(gameId))
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
  gameId: GameID,
  { onError, onSuccess }: ApiHookOptions
): {
  isLoading: boolean
  completeTurn(dice: Dice): void
} => {
  const queryClient = useQueryClient()
  const { mutate, isLoading } = useMutation<number, Error, Dice>(
    ({ whiteDie, redDie, eventDie }) => {
      return DB.next_turn(Number(gameId), {
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
  gameId: GameID,
  { onError, onSuccess }: ApiHookOptions<[Dice]>
): {
  isLoading: boolean
  abortLastTurn(): void
} => {
  const queryClient = useQueryClient()
  const { mutate, isLoading } = useMutation<DB.Dice, Error>(
    () => DB.abort_last_turn(Number(gameId)),
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
  gameId: GameID,
  { onError, onSuccess }: ApiHookOptions
): {
  isLoading: boolean
  completeGame(dice: Dice): void
} => {
  const queryClient = useQueryClient()
  const { mutate, isLoading } = useMutation<number, Error, Dice>(
    ({ whiteDie, redDie, eventDie }) => {
      return DB.complete_game(Number(gameId), {
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
  gameId: GameID,
  { onError, onSuccess }: ApiHookOptions
): {
  isLoading: boolean
  pauseGame(): void
} => {
  const queryClient = useQueryClient()
  const { mutate, isLoading } = useMutation<number, Error>(
    () => DB.pause_game(Number(gameId)),
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
  gameId: GameID,
  { onError, onSuccess }: ApiHookOptions
): {
  isLoading: boolean
  resumeGame(): void
} => {
  const queryClient = useQueryClient()
  const { mutate, isLoading } = useMutation<number, Error>(
    () => DB.resume_game(Number(gameId)),
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
