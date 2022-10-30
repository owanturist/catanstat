import { Sweety } from 'react-sweety'

import { Color } from '../Color'

export abstract class PlayerInfo {
  abstract readonly color: Color
  abstract readonly name: Sweety<string>
  abstract readonly isActive: Sweety<boolean>

  public static init(color: Color): PlayerInfo {
    return {
      color,
      name: Sweety.of(color.label),
      isActive: Sweety.of(true)
    }
  }
}

export abstract class State {
  abstract readonly players: Sweety<ReadonlyArray<PlayerInfo>>

  public static init(): State {
    return {
      players: Sweety.of<ReadonlyArray<PlayerInfo>>([
        PlayerInfo.init(Color.red),
        PlayerInfo.init(Color.blue),
        PlayerInfo.init(Color.white),
        PlayerInfo.init(Color.yellow),
        PlayerInfo.init(Color.green),
        PlayerInfo.init(Color.brown)
      ])
    }
  }

  public static move(
    sourceIndex: number,
    destinationIndex: number,
    state: State
  ): void {
    state.players.setState(players => {
      if (sourceIndex === destinationIndex) {
        return players
      }

      const clone = players.slice()
      const source = clone.splice(sourceIndex, 1)

      clone.splice(destinationIndex, 0, ...source)

      return clone
    })
  }

  public static getActivePlayers(state: State): Array<PlayerInfo> {
    return state.players.getState().filter(player => player.isActive.getState())
  }
}
