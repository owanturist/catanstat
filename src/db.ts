import Dexie from 'dexie'
import { differenceInMilliseconds } from 'date-fns'

import { ColorId, DieNumber, DieEvent } from './domain'

// P U B L I C   E N T I T I E S

export abstract class Game {
  abstract id: number
  abstract is_paused: boolean
  abstract total_duration_ms: number
  abstract current_turn_duration_ms: number
  abstract current_turn_duration_since: Date
  abstract start_time: Date
  abstract end_time: null | Date
  abstract players: ReadonlyArray<Player>
  abstract turns: ReadonlyArray<Turn>
}

export abstract class Player {
  abstract id: number
  abstract name: string
  abstract color: ColorId
}

export abstract class Dice {
  abstract white_die: DieNumber
  abstract red_die: DieNumber
  abstract event_die: DieEvent
}

export abstract class Turn extends Dice {
  abstract id: number
  abstract player_id: number
  abstract duration_ms: number
}

// D B   D E F I N I T I O N

const cast_id = <T>(payload: T): T & { id: number } => {
  return payload as T & { id: number }
}

abstract class GameEntity {
  abstract id: number
  abstract is_paused: boolean
  abstract total_duration_ms: number
  abstract current_turn_duration_ms: number
  abstract current_turn_duration_since: Date
  abstract start_time: Date
  abstract end_time: null | Date

  public static async get_by_id(game_id: number): Promise<GameEntity> {
    const game = await db.games.get(game_id)

    if (game == null) {
      return Promise.reject(new Error(`Game with id ${game_id} not found`))
    }

    return game
  }

  public static async get_current_player_id(game_id: number): Promise<number> {
    const prev_turn = await TurnEntity.get_last_turn_in_game(game_id)

    // no last turn - first player is next
    if (prev_turn == null) {
      const first_player = await PlayerEntity.get_first_player_in_game(game_id)

      return first_player.id
    }

    const prev_player = await PlayerEntity.get_by_id(prev_turn.player_id)

    return prev_player.next_player_id
  }
}

abstract class PlayerEntity extends Player {
  abstract game_id: number
  abstract next_player_id: number

  public static toPublic({
    game_id,
    next_player_id,
    ...player
  }: PlayerEntity): Player {
    return player
  }

  public static async get_by_id(player_id: number): Promise<PlayerEntity> {
    const player = await db.players.get(player_id)

    if (player == null) {
      return Promise.reject(new Error(`Player with id ${player_id} not found`))
    }

    return player
  }

  public static async get_first_player_in_game(
    game_id: number
  ): Promise<PlayerEntity> {
    const first_player = await db.players
      .where('game_id')
      .equals(game_id)
      .first()

    if (first_player == null) {
      return Promise.reject(new Error(`No players found for game ${game_id}`))
    }

    return first_player
  }
}

abstract class TurnEntity extends Turn {
  abstract game_id: number

  public static toPublic({ game_id, ...turn }: TurnEntity): Turn {
    return turn
  }

  public static async get_by_id(turn_id: number): Promise<TurnEntity> {
    const turn = await db.turns.get(turn_id)

    if (turn == null) {
      return Promise.reject(new Error(`Turn with id ${turn_id} not found`))
    }

    return turn
  }

  public static async get_last_turn_in_game(
    game_id: number
  ): Promise<null | Turn> {
    const turn = await db.turns.where('game_id').equals(game_id).last()

    return turn ?? null
  }
}

const db = new (class DB extends Dexie {
  public games!: Dexie.Table<GameEntity, number>
  public players!: Dexie.Table<PlayerEntity, number>
  public turns!: Dexie.Table<TurnEntity, number>

  public constructor() {
    super('Catan')

    this.version(1).stores({
      games: '++id',
      players: '++id, game_id, next_player_id',
      turns: '++id, game_id, player_id'
    })
  }
})()

/**
 * Creates players recursively until all players have been created
 */
const create_players = async (
  game_id: number,
  players: ReadonlyArray<PlayerPayload>
): Promise<void> => {
  const players_ids = await Promise.all(
    players.map(player => {
      return db.players.add(cast_id({ ...player, game_id, next_player_id: -1 }))
    })
  )

  for (let index = 1; index <= players_ids.length; index++) {
    const prev_player_id = players_ids[index - 1]!
    // the last iterable index will convert to 0
    const next_player_id = players_ids[index % players_ids.length]!

    await db.players.update(prev_player_id, { next_player_id })
  }
}

export const next_turn = async (game_id: number, dice: Dice): Promise<void> => {
  const game = await GameEntity.get_by_id(game_id)

  const now = new Date()
  const turn_duration_diff = game.is_paused
    ? 0
    : differenceInMilliseconds(now, game.current_turn_duration_since)
  const total_turn_duration = game.current_turn_duration_ms + turn_duration_diff

  await Promise.all([
    db.turns.add(
      cast_id({
        ...dice,
        game_id,
        player_id: await GameEntity.get_current_player_id(game_id),
        duration_ms: total_turn_duration
      })
    ),

    db.games.update(game_id, {
      is_paused: false,
      total_duration_ms: game.total_duration_ms + total_turn_duration,
      current_turn_duration_ms: 0,
      current_turn_duration_since: now
    })
  ])
}

export const get_game = async (game_id: number): Promise<Game> => {
  const [game, players, turns] = await Promise.all([
    GameEntity.get_by_id(game_id),
    db.players.where('game_id').equals(game_id).toArray(),
    db.turns.where('game_id').equals(game_id).toArray()
  ])

  return {
    ...game,
    players: players.map(PlayerEntity.toPublic),
    turns: turns.map(TurnEntity.toPublic)
  }
}

export interface PlayerPayload {
  name: string
  color: ColorId
}

export const start_game = async (
  players: ReadonlyArray<PlayerPayload>
): Promise<number> => {
  if (players.length < 2) {
    return Promise.reject(
      new Error('Not enough players, minimum 2 are required')
    )
  }

  const now = new Date()
  const game_id = await db.games.add(
    cast_id({
      // fake player id will be overridden when players are created
      is_paused: false,
      total_duration_ms: 0,
      current_turn_duration_ms: 0,
      current_turn_duration_since: now,
      start_time: now,
      end_time: null
    })
  )

  await create_players(game_id, players)

  return game_id
}
