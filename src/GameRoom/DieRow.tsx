import React from 'react'
import { Impulse, useImpulseValue } from 'react-impulse'
import cx from 'classnames'

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

const ViewDie = <TDie extends DieNumber | DieEvent>({
  icon,
  name,
  isDisabled,
  value,
  state
}: {
  icon: React.ReactElement
  name: string
  isDisabled: boolean
  value: TDie
  state: Impulse<State<TDie>>
}): ReturnType<React.FC> => {
  const selectedValue = useImpulseValue(state)

  return (
    <label className="cursor-pointer">
      <input
        className="sr-only peer"
        type="radio"
        name={name}
        disabled={isDisabled}
        value={value}
        checked={selectedValue === value}
        onChange={() => state.setValue(value)}
      />

      {React.cloneElement(icon, {
        className: cx(
          icon.props.className,
          selectedValue != null && 'opacity-25',
          '!h-auto transition-opacity rounded-lg stroke-[12]',
          'peer-checked:opacity-100 peer-focus-visible:ring-4'
        )
      })}
    </label>
  )
}

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
  state: Impulse<State<TDie>>
}

const NUMBER_DICE: ReadonlyArray<DieNumber> = [1, 2, 3, 4, 5, 6]

const ViewDieNumber: React.FC<
  { color: DieNumberColor } & DieRowProps<DieNumber>
> = ({ color, name, isDisabled, state }) => (
  <ViewDieRow name={name}>
    {NUMBER_DICE.map(value => (
      <ViewDie
        key={value}
        name={name}
        isDisabled={isDisabled}
        state={state}
        value={value}
        icon={<DieNumberIcon color={color} side={value} />}
      />
    ))}
  </ViewDieRow>
)

export const ViewWhite: React.FC<DieRowProps<DieNumber>> = props => (
  <ViewDieNumber color="white" {...props} />
)

export const ViewRed: React.FC<DieRowProps<DieNumber>> = props => (
  <ViewDieNumber color="red" {...props} />
)

const EVENT_DICE: ReadonlyArray<DieEvent> = ['yellow', 'blue', 'green', 'black']

export const ViewEvent: React.FC<DieRowProps<DieEvent>> = ({
  name,
  isDisabled,
  state
}) => (
  <ViewDieRow name={name}>
    {/* placeholder left */}
    <DiePlaceholderIcon className="!h-auto text-gray-100" />

    {EVENT_DICE.map(value => (
      <ViewDie
        key={value}
        name={name}
        isDisabled={isDisabled}
        state={state}
        value={value}
        icon={<DieEventIcon side={value} />}
      />
    ))}

    {/* placeholder right */}
    <DiePlaceholderIcon className="!h-auto text-gray-100" />
  </ViewDieRow>
)
