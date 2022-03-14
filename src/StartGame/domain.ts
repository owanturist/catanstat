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
      isActive: Sweety.of<boolean>(true)
    }
  }
}

export abstract class State {
  abstract readonly players: ReadonlyArray<PlayerInfo>

  public static init(): State {
    return {
      players: [
        PlayerInfo.init(Color.red),
        PlayerInfo.init(Color.blue),
        PlayerInfo.init(Color.white),
        PlayerInfo.init(Color.yellow),
        PlayerInfo.init(Color.green),
        PlayerInfo.init(Color.brown)
      ]
    }
  }

  public static move(
    sourceIndex: number,
    destinationIndex: number,
    state: State
  ): State {
    if (sourceIndex === destinationIndex) {
      return state
    }

    const players = state.players.slice()
    const source = players.splice(sourceIndex, 1)

    players.splice(destinationIndex, 0, ...source)

    return { ...state, players }
  }

  public static getActivePlayers(state: State): Array<PlayerInfo> {
    return state.players.filter(player => player.isActive.getState())
  }
}
