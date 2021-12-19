import React from 'react'
import cx from 'classnames'
import { Outlet, Link, NavLink, useParams } from 'react-router-dom'
import { Menu } from '@headlessui/react'

import { castID } from './utils'
import { GameID } from './api'
import * as Icon from './Icon'

const ViewDropdownItem: React.FC<{
  to: string
  icon: React.ReactElement
}> = ({ to, icon, children }) => (
  <Menu.Item>
    {({ active }) => (
      <NavLink
        to={to}
        className={navProps =>
          cx(
            'flex gap-2 items-center w-full px-2 py-2 rounded-md text-sm transition-colors',
            active && 'bg-gray-100',
            navProps.isActive && 'text-blue-500',
            '2xs:text-base'
          )
        }
      >
        {React.cloneElement(icon, {
          className: cx('w-4 2xs:w-5')
        })}
        <span>{children}</span>
      </NavLink>
    )}
  </Menu.Item>
)

const ViewHeaderDropdown: React.VFC = React.memo(() => {
  const params = useParams<'gameId'>()

  if (params.gameId == null) {
    return null
  }

  const gameId = castID<GameID>(params.gameId)

  return (
    <Menu as="div" className="relative">
      <Menu.Button
        className={cx(
          'flex justify-center items-center w-6 h-6',
          'text-xs text-gray-600 border border-gray-300/0 ring-gray-300/50 rounded outline-none transition-colors',
          'focus-visible:ring-2',
          'hover:border-gray-300/100',
          '2xs:w-8 2xs:h-8 2xs:text-base',
          'xs:w-10 xs:h-10 xs:text-lg'
        )}
      >
        <Icon.Ellipsis />
      </Menu.Button>

      <Menu.Items
        className={cx(
          'absolute z-20 top-full right-0 w-56 mt-2 p-1',
          'text-gray-600 bg-white rounded-md shadow-lg ring-1 ring-black/5 outline-none',
          'xs:mt-3'
        )}
      >
        <ViewDropdownItem to={`/game/${gameId}/history`} icon={<Icon.Book />}>
          Game history
        </ViewDropdownItem>
        <ViewDropdownItem to={`/game/${gameId}/stat`} icon={<Icon.ChartPie />}>
          Game statistic
        </ViewDropdownItem>
      </Menu.Items>
    </Menu>
  )
})

export const Shell: React.VFC = React.memo(() => (
  <div className="h-full flex flex-col text-gray-900">
    <header className="bg-gray-100 flex justify-center">
      <div
        className={cx(
          'flex items-center p-2 w-full',
          'xs:p-3 xs:max-w-md xs:px-0'
        )}
      >
        <h1
          className={cx(
            'font-semibold tracking-wider text-gray-600',
            '2xs:text-xl',
            'xs:text-2xl'
          )}
        >
          <Link
            to="/"
            className="flex gap-2 items-center outline-none focus-visible:underline"
          >
            <Icon.Logo className="text-2xl 2xs:text-3xl xs:text-4xl" /> CATAN
          </Link>
        </h1>

        <div className="flex-1" />

        <ViewHeaderDropdown />
      </div>
    </header>

    <div className="flex-1 min-h-0">
      <Outlet />
    </div>
  </div>
))
