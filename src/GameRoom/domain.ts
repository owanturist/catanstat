import { Sweety } from 'react-sweety'

import { Dice, DieEvent, DieNumber } from '../Die'

import * as DieRow from './DieRow'

export abstract class State {
  abstract readonly isMutating: Sweety<boolean>
  abstract readonly whiteDie: Sweety<DieRow.State<DieNumber>>
  abstract readonly redDie: Sweety<DieRow.State<DieNumber>>
  abstract readonly eventDie: Sweety<DieRow.State<DieEvent>>

  public static init(): State {
    return {
      isMutating: Sweety.of(false),
      whiteDie: Sweety.of(DieRow.init()),
      redDie: Sweety.of(DieRow.init()),
      eventDie: Sweety.of(DieRow.init())
    }
  }

  public static reset(
    { isMutating, whiteDie, redDie, eventDie }: State,
    dice?: Dice
  ): void {
    isMutating.setState(false)
    whiteDie.setState(dice?.whiteDie ?? DieRow.init)
    redDie.setState(dice?.redDie ?? DieRow.init)
    eventDie.setState(dice?.eventDie ?? DieRow.init)
  }

  public static toDice(state: State): null | Dice {
    const whiteDie = state.whiteDie.getState()
    const redDie = state.redDie.getState()
    const eventDie = state.eventDie.getState()

    if (whiteDie == null || redDie == null || eventDie == null) {
      return null
    }

    return { whiteDie, redDie, eventDie }
  }
}
