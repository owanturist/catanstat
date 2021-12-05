import cx from 'classnames'
import React from 'react'
import { useParams } from 'react-router-dom'
import { InnerStore, useGetInnerState, useInnerState } from 'react-inner-store'

import { useQueryGame } from '../api'
import * as Icon from '../Icon'
import { DieEvent, DieNumber } from '../domain'

export abstract class State {
  abstract readonly whiteDie: InnerStore<null | DieNumber>
  abstract readonly redDie: InnerStore<null | DieNumber>
  abstract readonly eventDie: InnerStore<null | DieEvent>

  public static init(): State {
    return {
      whiteDie: InnerStore.of<null | DieNumber>(null),
      redDie: InnerStore.of<null | DieNumber>(null),
      eventDie: InnerStore.of<null | DieEvent>(null)
    }
  }

  public static reset({ whiteDie, redDie, eventDie }: State): void {
    whiteDie.setState(null)
    redDie.setState(null)
    eventDie.setState(null)
  }
}

type Dice<TDie> = ReadonlyArray<{
  value: TDie
  icon: React.ReactElement
}>

const NUMBER_DICE: Dice<DieNumber> = [
  { value: 1, icon: <Icon.DieOne /> },
  { value: 2, icon: <Icon.DieTwo /> },
  { value: 3, icon: <Icon.DieThree /> },
  { value: 4, icon: <Icon.DieFour /> },
  { value: 5, icon: <Icon.DieFive /> },
  { value: 6, icon: <Icon.DieSix /> }
]

const WHITE_DICE = NUMBER_DICE.map(({ value, icon }) => ({
  value,
  icon: React.cloneElement(icon, { className: cx('text-gray-600') })
}))

const RED_DICE = NUMBER_DICE.map(({ value, icon }) => ({
  value,
  icon: React.cloneElement(icon, { className: cx('text-red-600') })
}))

const EVENT_DICE: Dice<DieEvent> = [
  { value: 'yellow', icon: <Icon.DieClear className="text-yellow-600" /> },
  { value: 'blue', icon: <Icon.DieClear className="text-blue-600" /> },
  { value: 'green', icon: <Icon.DieClear className="text-green-600" /> },
  { value: 'black', icon: <Icon.DieClear className="text-gray-800" /> },
  { value: 'black', icon: <Icon.DieClear className="text-gray-800" /> },
  { value: 'black', icon: <Icon.DieClear className="text-gray-800" /> }
]

const ViewDie = <TDie extends DieNumber | DieEvent>({
  isReadonly,
  dice,
  store
}: {
  isReadonly: boolean
  dice: Dice<TDie>
  store: InnerStore<null | TDie>
}): ReturnType<React.VFC> => {
  const [state, setState] = useInnerState(store)

  return (
    <ol className="flex justify-between text-6xl">
      {dice.map(({ value, icon }, index) => (
        <li key={index}>
          <label className={cx('block', state !== value && 'opacity-50')}>
            {icon}
            <input
              className="sr-only"
              type="radio"
              readOnly={isReadonly}
              value={value}
              checked={state === value}
              onChange={() => setState(value)}
            />
          </label>
        </li>
      ))}
    </ol>
  )
}

export const View: React.VFC<{
  store: InnerStore<State>
}> = React.memo(({ store }) => {
  const { gameId } = useParams<'gameId'>()
  const { isLoading, error, game } = useQueryGame(Number(gameId))
  const state = useGetInnerState(store)

  if (isLoading) {
    return null
  }

  if (error != null || game == null) {
    return <div>Something went wrong while loading the game</div>
  }

  const currentPlayer = game.turns[0]?.player ?? game.players[0]

  return (
    <div className="p-3 space-y-2">
      <div className="flex">
        {game.players.map(player => (
          <div
            key={player.id}
            className={cx(
              'flex-1 flex flex-col items-center p-3 border border-transparent transition-colors',
              currentPlayer?.id === player.id && 'border-gray-300'
            )}
          >
            <Icon.User
              className="text-2xl"
              style={{ color: player.color.hex }}
            />
          </div>
        ))}
      </div>

      <ViewDie isReadonly={false} dice={WHITE_DICE} store={state.whiteDie} />
      <ViewDie isReadonly={false} dice={RED_DICE} store={state.redDie} />
      <ViewDie isReadonly={false} dice={EVENT_DICE} store={state.eventDie} />
    </div>
  )
})
