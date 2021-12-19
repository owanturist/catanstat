import React from 'react'
import cx from 'classnames'

import * as Icon from './Icon'

export type DieNumber = 1 | 2 | 3 | 4 | 5 | 6
export type DieNumberColor = 'white' | 'red'

const DIE_NUMBER_ICONS: Record<DieNumber, React.ReactElement> = {
  1: <Icon.DieOne />,
  2: <Icon.DieTwo />,
  3: <Icon.DieThree />,
  4: <Icon.DieFour />,
  5: <Icon.DieFive />,
  6: <Icon.DieSix />
}

const DIE_NUMBER_COLORS: Record<DieNumberColor, string> = {
  white: cx('text-gray-100 stroke-gray-400 ring-gray-400/50'),
  red: cx('text-red-500 stroke-red-700 ring-red-500/50')
}

export const DieNumberIcon: React.VFC<{
  className?: string
  color: DieNumberColor
  side: DieNumber
}> = React.memo(({ className, color, side }) => {
  return React.cloneElement(DIE_NUMBER_ICONS[side], {
    className: cx(DIE_NUMBER_COLORS[color], className)
  })
})

export type DieEvent = 'yellow' | 'blue' | 'green' | 'black'

const DIE_EVENT_COLORS: Record<DieEvent, string> = {
  yellow: cx('text-yellow-400 ring-yellow-400/50 stroke-yellow-500'),
  blue: cx('text-blue-500 ring-blue-500/50 stroke-blue-600'),
  green: cx('text-green-500 ring-green-500/50 stroke-green-600'),
  black: cx('text-gray-600 ring-gray-600/50 stroke-gray-800')
}

export const DieEventIcon: React.VFC<{
  className?: string
  side: DieEvent
}> = React.memo(({ className, side }) => {
  return <Icon.DieClear className={cx(DIE_EVENT_COLORS[side], className)} />
})

export const DiePlaceholderIcon: React.VFC<{
  className?: string
}> = React.memo(({ className }) => (
  <Icon.DieClear className={cx('text-gray-100 stroke-gray-300', className)} />
))
