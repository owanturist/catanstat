import { Impulse } from 'react-impulse'

import { Dice, DieEvent, DieNumber } from '../Die'

import * as DieRow from './DieRow'

export abstract class State {
  abstract readonly isMutating: Impulse<boolean>
  abstract readonly whiteDie: Impulse<DieRow.State<DieNumber>>
  abstract readonly redDie: Impulse<DieRow.State<DieNumber>>
  abstract readonly eventDie: Impulse<DieRow.State<DieEvent>>

  public static init(): State {
    return {
      isMutating: Impulse.of(false),
      whiteDie: Impulse.of(DieRow.init()),
      redDie: Impulse.of(DieRow.init()),
      eventDie: Impulse.of(DieRow.init())
    }
  }

  public static reset(
    { isMutating, whiteDie, redDie, eventDie }: State,
    dice?: Dice
  ): void {
    isMutating.setValue(false)
    whiteDie.setValue(dice?.whiteDie ?? DieRow.init)
    redDie.setValue(dice?.redDie ?? DieRow.init)
    eventDie.setValue(dice?.eventDie ?? DieRow.init)
  }

  public static toDice(state: State): null | Dice {
    const whiteDie = state.whiteDie.getValue()
    const redDie = state.redDie.getValue()
    const eventDie = state.eventDie.getValue()

    if (whiteDie == null || redDie == null || eventDie == null) {
      return null
    }

    return { whiteDie, redDie, eventDie }
  }
}
