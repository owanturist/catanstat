import React from 'react'
import { InnerStore, useInnerWatch, useSetInnerState } from 'react-inner-store'
import cx from 'classnames'
import shallow from 'shallowequal'

import * as Icon from '../Icon'
import { DieEvent, DieNumber } from '../domain'

export type State<TDie extends DieNumber | DieEvent> = null | TDie

export const init = <TDie extends DieNumber | DieEvent>(): State<TDie> => null

const ViewDie: <TDie extends DieNumber | DieEvent>(props: {
  icon: React.ReactElement
  name: string
  isReadonly: boolean
  value: TDie
  store: InnerStore<State<TDie>>
}) => ReturnType<React.VFC> = React.memo(
  ({ icon, name, isReadonly, value, store }) => {
    const setState = useSetInnerState(store)
    const [isChecked, isAnyDieSelected] = useInnerWatch(
      React.useCallback(() => {
        const die = store.getState()

        return [die === value, die != null]
      }, [value, store]),
      shallow
    )

    return (
      <label className="block cursor-pointer p-px">
        <input
          className="sr-only peer"
          type="radio"
          name={name}
          readOnly={isReadonly}
          value={value}
          checked={isChecked}
          onChange={() => setState(value)}
        />

        {React.cloneElement(icon, {
          className: cx(
            icon.props.className,
            isAnyDieSelected && 'opacity-25',
            'transition-opacity peer-checked:opacity-100 peer-focus-visible:ring rounded-lg'
          )
        })}
      </label>
    )
  }
)

const ViewDieRow: React.FC<{ name: string }> = ({ name, children }) => (
  <ol
    className="flex gap-2 justify-between text-5xl"
    role="radiogroup"
    aria-labelledby={name}
  >
    {children}
  </ol>
)

export interface DieRowProps<TDie extends DieNumber | DieEvent> {
  name: string
  isReadonly: boolean
  store: InnerStore<State<TDie>>
}

const NUMBER_DICE: ReadonlyArray<{
  value: DieNumber
  icon: React.ReactElement
}> = [
  { value: 1, icon: <Icon.DieOne /> },
  { value: 2, icon: <Icon.DieTwo /> },
  { value: 3, icon: <Icon.DieThree /> },
  { value: 4, icon: <Icon.DieFour /> },
  { value: 5, icon: <Icon.DieFive /> },
  { value: 6, icon: <Icon.DieSix /> }
]

export const ViewWhite: React.VFC<DieRowProps<DieNumber>> = React.memo(
  ({ name, isReadonly, store }) => (
    <ViewDieRow name={name}>
      {NUMBER_DICE.map(({ value, icon }) => (
        <ViewDie
          key={value}
          name={name}
          isReadonly={isReadonly}
          store={store}
          value={value}
          icon={React.cloneElement(icon, {
            className: cx('text-gray-100'),
            stroke: 'rgb(156, 163, 175)' // text-gray-400
          })}
        />
      ))}
    </ViewDieRow>
  )
)

export const ViewRed: React.VFC<DieRowProps<DieNumber>> = React.memo(
  ({ name, isReadonly, store }) => (
    <ViewDieRow name={name}>
      {NUMBER_DICE.map(({ value, icon }) => (
        <ViewDie
          key={value}
          name={name}
          isReadonly={isReadonly}
          store={store}
          value={value}
          icon={React.cloneElement(icon, {
            className: cx('text-red-500'),
            stroke: 'rgb(185, 28, 28)' // text-red-700
          })}
        />
      ))}
    </ViewDieRow>
  )
)

const EVENT_DICE: ReadonlyArray<[DieEvent, string, string]> = [
  ['yellow', cx('text-yellow-400'), /* text-yellow-500 */ 'rgb(245, 158, 11)'],
  ['blue', cx('text-blue-500'), /* text-blue-600 */ 'rgb(37, 99, 235)'],
  ['green', cx('text-green-500'), /* text-green-600 */ 'rgb(5, 150, 105)'],
  ['black', cx('text-gray-600'), /* text-gray-800 */ 'rgb(31, 41, 55)']
]

export const ViewEvent: React.VFC<DieRowProps<DieEvent>> = React.memo(
  ({ name, isReadonly, store }) => (
    <ViewDieRow name={name}>
      {/* placeholder left */}
      <Icon.DieClear className="text-gray-100" />

      {EVENT_DICE.map(([value, className, stroke]) => (
        <ViewDie
          key={value}
          name={name}
          isReadonly={isReadonly}
          store={store}
          value={value}
          icon={<Icon.DieClear className={className} stroke={stroke} />}
        />
      ))}

      {/* placeholder right */}
      <Icon.DieClear className="text-gray-100" />
    </ViewDieRow>
  )
)
