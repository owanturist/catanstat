import { Impulse } from 'react-impulse'

import { Color } from '../Color'

export abstract class PlayerInfo {
  abstract readonly color: Color
  abstract readonly name: Impulse<string>
  abstract readonly isActive: Impulse<boolean>

  public static init(color: Color): PlayerInfo {
    return {
      color,
      name: Impulse.of(color.label),
      isActive: Impulse.of(true)
    }
  }
}

export abstract class State {
  abstract readonly players: Impulse<ReadonlyArray<PlayerInfo>>

  public static init(): State {
    return {
      players: Impulse.of([
        PlayerInfo.init(Color.red),
        PlayerInfo.init(Color.blue),
        PlayerInfo.init(Color.white),
        PlayerInfo.init(Color.yellow),
        PlayerInfo.init(Color.green),
        PlayerInfo.init(Color.brown)
      ] as ReadonlyArray<PlayerInfo>)
    }
  }

  public static move(
    sourceIndex: number,
    destinationIndex: number,
    state: State
  ): void {
    state.players.setValue(players => {
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
    return state.players.getValue().filter(player => player.isActive.getValue())
  }
}
