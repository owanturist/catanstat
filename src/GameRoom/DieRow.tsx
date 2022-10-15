import React from 'react'
import { Sweety, useWatchSweety, useSetSweetyState } from 'react-sweety'
import cx from 'classnames'
import shallow from 'shallowequal'

import {
  DieEvent,
  DieEventIcon,
  DieNumber,
  DieNumberColor,
  DieNumberIcon,
  DiePlaceholderIcon
} from '../Die'

export type State<TDie extends DieNumber | DieEvent> = null | TDie

export const init = <TDie extends DieNumber | DieEvent>(): State<TDie> => null

const ViewDie: <TDie extends DieNumber | DieEvent>(props: {
  icon: React.ReactElement
  name: string
  isDisabled: boolean
  value: TDie
  store: Sweety<State<TDie>>
}) => ReturnType<React.VFC> = React.memo(
  ({ icon, name, isDisabled, value, store }) => {
    const setState = useSetSweetyState(store)
    const [isChecked, isAnyDieSelected] = useWatchSweety(
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

const ViewDieRow: React.FC<{
  name: string
  children: React.ReactNode
}> = ({ name, children }) => (
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
  store: Sweety<State<TDie>>
}

const NUMBER_DICE: ReadonlyArray<DieNumber> = [1, 2, 3, 4, 5, 6]

const ViewDieNumber: React.VFC<
  { color: DieNumberColor } & DieRowProps<DieNumber>
> = ({ color, name, isDisabled, store }) => (
  <ViewDieRow name={name}>
    {NUMBER_DICE.map(value => (
      <ViewDie
        key={value}
        name={name}
        isDisabled={isDisabled}
        store={store}
        value={value}
        icon={<DieNumberIcon color={color} side={value} />}
      />
    ))}
  </ViewDieRow>
)

export const ViewWhite: React.VFC<DieRowProps<DieNumber>> = React.memo(
  props => <ViewDieNumber color="white" {...props} />
)

export const ViewRed: React.VFC<DieRowProps<DieNumber>> = React.memo(props => (
  <ViewDieNumber color="red" {...props} />
))

const EVENT_DICE: ReadonlyArray<DieEvent> = ['yellow', 'blue', 'green', 'black']

export const ViewEvent: React.VFC<DieRowProps<DieEvent>> = React.memo(
  ({ name, isDisabled, store }) => (
    <ViewDieRow name={name}>
      {/* placeholder left */}
      <DiePlaceholderIcon className="!h-auto text-gray-100" />

      {EVENT_DICE.map(value => (
        <ViewDie
          key={value}
          name={name}
          isDisabled={isDisabled}
          store={store}
          value={value}
          icon={<DieEventIcon side={value} />}
        />
      ))}

      {/* placeholder right */}
      <DiePlaceholderIcon className="!h-auto text-gray-100" />
    </ViewDieRow>
  )
)
