import { Menu } from '@headlessui/react'
import cx from 'classnames'
import React from 'react'
import {
  Routes,
  Route,
  Link,
  NavLink,
  Outlet,
  useParams
} from 'react-router-dom'
import Tooltip from '@tippyjs/react'

import { GameID } from './api'
import * as Icon from './Icon'
import { castID } from './utils'

const styleTool = cx(
  'flex justify-center items-center w-6 h-6',
  'text-xs text-gray-600 border border-gray-300/0 ring-gray-300/50 rounded outline-none transition-colors',
  'focus-visible:ring-2',
  'hover:border-gray-300/100',
  '2xs:w-8 2xs:h-8 2xs:text-base',
  'xs:w-10 xs:h-10 xs:text-lg'
)

const ViewDropdownItem: React.FC<{
  to: string
  icon: React.ReactElement
  children: React.ReactNode
}> = ({ to, icon, children }) => (
  <Menu.Item>
    {({ active: isMenuItemActive }) => (
      // the span wrapper fixes a bug in headless ui when it stringifies the className function
      <div>
        <NavLink
          to={to}
          className={({ isActive: isLinkActive }) => {
            return cx(
              'flex gap-2 items-center w-full px-2 py-2 rounded-md text-sm transition-colors',
              isMenuItemActive && 'bg-gray-100',
              isLinkActive && 'text-blue-500',
              '2xs:text-base'
            )
          }}
        >
          {React.cloneElement(icon, {
            className: cx('w-4 2xs:w-5')
          })}
          <span>{children}</span>
        </NavLink>
      </div>
    )}
  </Menu.Item>
)

const ViewHeaderDropdown: React.FC = () => {
  const params = useParams<'gameId'>()
  const gameId = castID<GameID>(params.gameId!)

  return (
    <Menu as="div" className="relative">
      <Menu.Button as="button" type="button" className={styleTool}>
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
}

const ViewBackToGameButton: React.FC = () => {
  const params = useParams<'gameId'>()
  const gameId = castID<GameID>(params.gameId!)

  return (
    <Tooltip content="Back to game">
      <Link to={`/game/${gameId}`} className={styleTool}>
        <Icon.ArrowLeft />
      </Link>
    </Tooltip>
  )
}

const ViewStartGame: React.FC = () => (
  <Tooltip content="Start new game">
    <Link to="/start" className={styleTool}>
      <Icon.Plus />
    </Link>
  </Tooltip>
)

export const Shell: React.FC = () => (
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

        <div className="flex-1 h-6 2xs:h-8 xs:h-10" />

        <div className="flex gap-1">
          <Routes>
            <Route index element={<ViewStartGame />} />

            <Route
              path="game/:gameId"
              element={
                <>
                  <Outlet />
                  <ViewHeaderDropdown />
                </>
              }
            >
              <Route path="*" element={<ViewBackToGameButton />} />
            </Route>
          </Routes>
        </div>
      </div>
    </header>

    <div className="flex-1 min-h-0">
      <Outlet />
    </div>
  </div>
)
