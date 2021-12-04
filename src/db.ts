import Dexie from 'dexie'
import { differenceInMilliseconds } from 'date-fns'

import { Color } from './domain'

// P U B L I C   E N T I T I E S

export abstract class Turn {
  abstract id: number
  abstract white_die: null | number
  abstract red_die: null | number
  abstract event_die: null | string
  abstract is_paused: boolean
  abstract duration_ms: number
  abstract duration_since: Date
}

export abstract class Player {
  abstract id: number
  abstract name: string
  abstract color: Color['id']
}

export abstract class Game {
  abstract id: number
  abstract start_time: Date
  abstract end_time: null | Date
  abstract players: ReadonlyArray<Player>
  abstract turns: ReadonlyArray<Turn>
}

// D B   D E F I N I T I O N

const cast_id = <T>(payload: T): T & { id: number } => {
  return payload as T & { id: number }
}

abstract class GameEntity {
  abstract id: number
  abstract current_turn_id: number
  abstract start_time: Date
  abstract end_time: null | Date
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
}

abstract class TurnEntity extends Turn {
  abstract game_id: number
  abstract player_id: number
  abstract prev_turn_id: null | number

  public static toPublic({
    game_id,
    player_id,
    prev_turn_id,
    ...turn
  }: TurnEntity): Turn {
    return turn
  }
}

const db = new (class DB extends Dexie {
  public games!: Dexie.Table<GameEntity, number>
  public players!: Dexie.Table<PlayerEntity, number>
  public turns!: Dexie.Table<TurnEntity, number>

  public constructor() {
    super('Catan')

    this.version(1).stores({
      games: '++id, current_turn_id',
      players: '++id, game_id, next_player_id',
      turns: '++id, game_id, player_id, prev_turn_id'
    })
  }
})()

/**
 * Creates players recursively until all players have been created
 */
const create_players = async (
  game_id: number,
  players: ReadonlyArray<PlayerPayload>
): Promise<number> => {
  const create_next_player = async (index: number): Promise<number> => {
    const current_player = players[index]

    // ends of recursion on the last player so return fake id and override it later
    if (current_player == null) {
      return Promise.resolve(-1)
    }

    return await db.players.add(
      cast_id({
        game_id,
        ...current_player,
        next_player_id: await create_next_player(index + 1)
      })
    )
  }

  const first_player_id = await create_next_player(0)
  const last_player = await db.players.where('game_id').equals(game_id).last()

  if (last_player == null) {
    throw new Error(`No players created in game ${game_id}`)
  }

  await db.players.update(last_player.id, {
    next_player_id: first_player_id
  })

  return first_player_id
}

const create_turn = async ({
  game_id,
  player_id,
  prev_turn_id = null,
  start_time = new Date()
}: {
  game_id: number
  player_id: number
  prev_turn_id?: null | number
  start_time?: Date
}): Promise<number> => {
  const next_turn_id = await db.turns.add(
    cast_id({
      game_id,
      player_id,
      prev_turn_id,
      white_die: null,
      red_die: null,
      event_die: null,
      is_paused: false,
      duration_ms: 0,
      duration_since: start_time
    })
  )

  await db.games.update(game_id, {
    current_turn_id: next_turn_id
  })

  return next_turn_id
}

/**
 * Creates next turn, finishes previous.
 */
export const next_turn = async (
  game_id: number,
  dice: {
    white_die: number
    red_die: number
    event_die: string
  }
): Promise<number> => {
  const game = await get_game_by_id(game_id)

  // following turns
  const current_turn = await db.turns.get(game.current_turn_id)

  if (current_turn == null) {
    throw new Error(
      `Previous turn with id ${game.current_turn_id} not found in game ${game_id}`
    )
  }

  const current_player = await db.players.get(current_turn.player_id)

  if (current_player == null) {
    throw new Error(
      `Player with id ${current_turn.player_id} not found in game ${game_id}`
    )
  }

  const now = new Date()
  const current_turn_diff_duration = current_turn.is_paused
    ? 0
    : differenceInMilliseconds(now, current_turn.duration_since)

  await db.turns.update(current_turn.id, {
    ...dice,
    is_paused: false,
    duration_since: now,
    duration_ms: current_turn.duration_ms + current_turn_diff_duration
  })

  return create_turn({
    game_id,
    player_id: current_player.next_player_id,
    prev_turn_id: current_turn.id,
    start_time: now
  })
}

const get_game_by_id = (game_id: number): Promise<GameEntity> => {
  return db.games.get(game_id).then(game => {
    if (game == null) {
      return Promise.reject(new Error(`Game with id ${game_id} not found`))
    }

    return game
  })
}

export const get_game = (game_id: number): Promise<null | Game> => {
  return Promise.all([
    get_game_by_id(game_id),
    db.players.where('game_id').equals(game_id).toArray(),
    db.turns.where('game_id').equals(game_id).toArray()
  ]).then(([{ current_turn_id, ...game }, players, turns]) => ({
    ...game,
    players: players.map(PlayerEntity.toPublic),
    turns: turns.map(TurnEntity.toPublic)
  }))
}

export interface PlayerPayload {
  name: string
  color: Color['id']
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
      // fake id will be replaced by first turn
      current_turn_id: -1,
      start_time: now,
      end_time: null
    })
  )

  const first_player_id = await create_players(game_id, players)

  // create first turn
  await create_turn({
    game_id,
    player_id: first_player_id,
    start_time: now
  })

  return game_id
}
