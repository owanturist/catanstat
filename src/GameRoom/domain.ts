import { InnerStore } from 'react-inner-store'

import { Dice, DieEvent, DieNumber } from '../Die'

import * as DieRow from './DieRow'

export abstract class State {
  abstract readonly isMutating: InnerStore<boolean>
  abstract readonly whiteDie: InnerStore<DieRow.State<DieNumber>>
  abstract readonly redDie: InnerStore<DieRow.State<DieNumber>>
  abstract readonly eventDie: InnerStore<DieRow.State<DieEvent>>

  public static init(): State {
    return {
      isMutating: InnerStore.of<boolean>(false),
      whiteDie: InnerStore.of(DieRow.init()),
      redDie: InnerStore.of(DieRow.init()),
      eventDie: InnerStore.of(DieRow.init())
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
