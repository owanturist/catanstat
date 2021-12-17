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
  isDisabled: boolean
  value: TDie
  store: InnerStore<State<TDie>>
}) => ReturnType<React.VFC> = React.memo(
  ({ icon, name, isDisabled, value, store }) => {
    const setState = useSetInnerState(store)
    const [isChecked, isAnyDieSelected] = useInnerWatch(
      React.useCallback(() => {
        const die = store.getState()

        return [die === value, die != null]
      }, [value, store]),
      shallow
    )

    return (
      <label className="cursor-pointer">
        <input
          className="sr-only peer"
          type="radio"
          name={name}
          disabled={isDisabled}
          value={value}
          checked={isChecked}
          onChange={() => setState(value)}
        />

        {React.cloneElement(icon, {
          className: cx(
            icon.props.className,
            isAnyDieSelected && 'opacity-25',
            '!h-auto transition-opacity rounded-lg stroke-[12]',
            'peer-checked:opacity-100 peer-focus-visible:ring-4'
          )
        })}
      </label>
    )
  }
)

const ViewDieRow: React.FC<{ name: string }> = ({ name, children }) => (
  <ol
    className="flex gap-1 justify-between xs:gap-2"
    role="radiogroup"
    aria-labelledby={name}
  >
    {React.Children.map(children, (child, index) => (
      <li
        key={React.isValidElement(child) ? child.key : index}
        className="flex-1 p-px"
      >
        {child}
      </li>
    ))}
  </ol>
)

export interface DieRowProps<TDie extends DieNumber | DieEvent> {
  name: string
  isDisabled: boolean
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
  ({ name, isDisabled, store }) => (
    <ViewDieRow name={name}>
      {NUMBER_DICE.map(({ value, icon }) => (
        <ViewDie
          key={value}
          name={name}
          isDisabled={isDisabled}
          store={store}
          value={value}
          icon={React.cloneElement(icon, {
            className: cx('text-gray-100 stroke-gray-400 ring-gray-300')
          })}
        />
      ))}
    </ViewDieRow>
  )
)

export const ViewRed: React.VFC<DieRowProps<DieNumber>> = React.memo(
  ({ name, isDisabled: isReadonly, store }) => (
    <ViewDieRow name={name}>
      {NUMBER_DICE.map(({ value, icon }) => (
        <ViewDie
          key={value}
          name={name}
          isDisabled={isReadonly}
          store={store}
          value={value}
          icon={React.cloneElement(icon, {
            className: cx('text-red-500 stroke-red-700 ring-red-300')
          })}
        />
      ))}
    </ViewDieRow>
  )
)

const EVENT_DICE: ReadonlyArray<[DieEvent, string]> = [
  ['yellow', cx('text-yellow-400 ring-yellow-300 stroke-yellow-500')],
  ['blue', cx('text-blue-500 ring-blue-300 stroke-blue-600')],
  ['green', cx('text-green-500 ring-green-300 stroke-green-600')],
  ['black', cx('text-gray-600 ring-gray-400 stroke-gray-800')]
]

export const ViewEvent: React.VFC<DieRowProps<DieEvent>> = React.memo(
  ({ name, isDisabled: isReadonly, store }) => (
    <ViewDieRow name={name}>
      {/* placeholder left */}
      <Icon.DieClear className="!h-auto text-gray-100" />

      {EVENT_DICE.map(([value, className]) => (
        <ViewDie
          key={value}
          name={name}
          isDisabled={isReadonly}
          store={store}
          value={value}
          icon={<Icon.DieClear className={className} />}
        />
      ))}

      {/* placeholder right */}
      <Icon.DieClear className="!h-auto text-gray-100" />
    </ViewDieRow>
  )
)
