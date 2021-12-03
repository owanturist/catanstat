/* eslint-disable no-undefined */

import Dexie from 'dexie'

interface GameEntity {
  id: number
  players_count: number
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
      turns: '++id, game_id',
      turn_statuses: '++id, turn_id'
    })
  }
})()

export interface Turn {
  id: number
  whiteDie: number | null
  redDie: number | null
  eventDie: string | null
  isPaused: boolean
  durationMs: number
  durationSince: Date
}

export interface Player {
  id: number
  name: string
  color: string
}

export interface Game {
  id: number
  startTime: Date
  endTime: null | Date
  players: ReadonlyArray<Player>
  turns: ReadonlyArray<Turn>
}

const getTurnStatus = (
  turnId: number
): Promise<{
  is_paused: boolean
  duration_ms: number
  duration_since: null | Date
}> => {
  return db.turn_statuses
    .where('turn_id')
    .equals(turnId)
    .toArray()
    .then(turnStatuses => {
      let is_paused = false
      let duration_ms = 0
      let duration_since: null | Date = null

      for (const turnStatus of turnStatuses) {
        if (turnStatus.end_time == null) {
          // only the last turn status is has no end time
          is_paused = turnStatus.is_paused
          duration_since = turnStatus.start_time
        } else {
          duration_ms +=
            turnStatus.end_time.getTime() - turnStatus.start_time.getTime()
        }
      }

      return { is_paused, duration_ms, duration_since }
    })
}

export const getGame = (gameId: number): Promise<null | Game> => {
  return Promise.all([
    db.games.get(gameId),
    db.players.where('game_id').equals(gameId).toArray(),
    db.turns
      .where('game_id')
      .equals(gameId)
      .toArray()
      .then(turns => {
        return Promise.all(
          turns.map(turn =>
            getTurnStatus(turn.id).then(turnStatus => ({
              ...turn,
              ...turnStatus
            }))
          )
        )
      })
  ]).then(([game, players, turns]) => {
    if (game == null) {
      return null
    }

    return {
      id: game.id,
      startTime: game.start_time,
      endTime: game.end_time,
      players: players.map(player => ({
        id: player.id,
        name: player.name,
        color: player.color
      })),
      turns: turns.map(turn => ({
        id: turn.id,
        whiteDie: turn.white_die,
        redDie: turn.red_die,
        eventDie: turn.event_die,
        isPaused: turn.is_paused,
        durationMs: turn.duration_ms,
        durationSince: turn.duration_since ?? game.start_time
      }))
    }
  })
}

export interface PlayerPayload {
  name: string
  color: string
}

export const startGame = async (
  players: ReadonlyArray<PlayerPayload>
): Promise<number> => {
  const game_id = await db.games.add({
    id: undefined!,
    players_count: players.length,
    start_time: new Date(),
    end_time: null
  })

  await Promise.all(
    players.map(({ name, color }) => {
      return db.players.add({ id: undefined!, game_id, name, color })
    })
  )

  return game_id
}
