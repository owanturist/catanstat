import Dexie from 'dexie'

const cast_id = <T>(payload: T): T & { id: number } => {
  return payload as T & { id: number }
}

interface GameEntity {
  id: number
  players_count: number
  turns_count: number
  start_time: Date
  end_time: null | Date
}

interface PlayerEntity {
  id: number
  game_id: number
  name: string
  color: string
}

interface TurnEntity {
  id: number
  game_id: number
  player_id: number
  white_die: null | number
  red_die: null | number
  event_die: null | string
}

interface TurnStatusEntity {
  id: number
  turn_id: number
  is_paused: boolean
  start_time: Date
  end_time: null | Date
}

const db = new (class DB extends Dexie {
  public games!: Dexie.Table<GameEntity, number>
  public players!: Dexie.Table<PlayerEntity, number>
  public turns!: Dexie.Table<TurnEntity, number>
  public turn_statuses!: Dexie.Table<TurnStatusEntity, number>

  public constructor() {
    super('Catan')

    this.version(1).stores({
      games: '++id',
      players: '++id, game_id',
      turns: '++id, game_id, player_id',
      turn_statuses: '++id, turn_id'
    })
  }
})()

export interface Turn {
  id: number
  white_die: number | null
  red_die: number | null
  event_die: string | null
  is_paused: boolean
  duration_ms: number
  duration_since: Date
}

export interface Player {
  id: number
  name: string
  color: string
}

export interface Game {
  id: number
  start_time: Date
  end_time: null | Date
  players: ReadonlyArray<Player>
  turns: ReadonlyArray<Turn>
}

/**
 * Creates new not paused turn
 */
const start_new_turn = async ({
  game_id,
  player_id
}: {
  game_id: number
  player_id: number
}): Promise<number> => {
  const game = await get_game_entity(game_id)

  await db.games.update(game_id, {
    turns_count: game.turns_count + 1
  })

  return db.turns
    .add(
      cast_id({
        game_id,
        player_id,
        white_die: null,
        red_die: null,
        event_die: null
      })
    )
    .then(turn_id => {
      return db.turn_statuses.add(
        cast_id({
          turn_id,
          is_paused: false,
          start_time: game.turns_count === 0 ? game.start_time : new Date(),
          end_time: null
        })
      )
    })
}

const get_turn_status = (
  turn_id: number
): Promise<Pick<Turn, 'is_paused' | 'duration_ms' | 'duration_since'>> => {
  return db.turn_statuses
    .where('turn_id')
    .equals(turn_id)
    .toArray()
    .then(turn_statuses => {
      let is_paused = false
      let duration_ms = 0
      // it always gets re-defined
      let duration_since = new Date()

      for (const status of turn_statuses) {
        if (status.end_time == null) {
          // only the last turn status is has no end time
          is_paused = status.is_paused
          duration_since = status.start_time
        } else {
          duration_ms += status.end_time.getTime() - status.start_time.getTime()
        }
      }

      return { is_paused, duration_ms, duration_since }
    })
}

const get_game_entity = (game_id: number): Promise<GameEntity> => {
  return db.games.get(game_id).then(game => {
    if (game == null) {
      return Promise.reject(new Error(`Game with id ${game_id} not found`))
    }

    return game
  })
}

export const get_game = (game_id: number): Promise<null | Game> => {
  return Promise.all([
    get_game_entity(game_id).then(
      ({ players_count, turns_count, ...game }) => game
    ),

    db.players
      .where('game_id')
      .equals(game_id)
      .toArray()
      .then(players => players.map(({ game_id: _, ...player }) => player)),

    db.turns
      .where('game_id')
      .equals(game_id)
      .toArray()
      .then(turns => {
        return Promise.all(
          turns.map(({ game_id: _, player_id, ...turn }) =>
            get_turn_status(turn.id).then(status => ({ ...turn, ...status }))
          )
        )
      })
  ]).then(([game, players, turns]) => ({ ...game, players, turns }))
}

export interface PlayerPayload {
  name: string
  color: string
}

export const start_game = async (
  players: ReadonlyArray<PlayerPayload>
): Promise<number> => {
  if (players.length < 2) {
    return Promise.reject(
      new Error('Not enough players, minimum 2 are required')
    )
  }

  const start_time = new Date()
  const game_id = await db.games.add(
    cast_id({
      players_count: players.length,
      turns_count: 0,
      start_time,
      end_time: null
    })
  )

  const [first_player, ...rest_players] = players.map(player =>
    db.players.add(cast_id({ game_id, ...player }))
  )

  await Promise.all([
    start_new_turn({
      game_id,
      player_id: await first_player!
    }),

    Promise.all(rest_players)
  ])

  return game_id
}
