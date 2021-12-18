import React from 'react'
import cx from 'classnames'
import { Outlet, Link } from 'react-router-dom'

import * as Icon from './Icon'

const ViewHeaderDropdown: React.FC = ({ children }) => {
  return <div>{children}</div>
}

export const Shell: React.VFC<{
  dropdown?: React.ReactNode
}> = ({ dropdown }) => (
  <div className="h-full flex flex-col">
    <header className="bg-gray-100 flex justify-center">
      <div className={cx('flex p-2 w-full', 'xs:p-3 xs:max-w-md xs:px-0')}>
        <h1
          className={cx(
            'font-semibold tracking-wider text-gray-600',
            'xs:text-xl',
            'sm:text-2xl'
          )}
        >
          <Link
            to="/"
            className="flex gap-2 items-center outline-none focus-visible:underline"
          >
            <Icon.Logo className="text-2xl xs:text-3xl sm:text-4xl" /> CATAN
          </Link>
        </h1>

        {dropdown && <ViewHeaderDropdown>{dropdown}</ViewHeaderDropdown>}
      </div>
    </header>

    <div className="flex-1 min-h-0">
      <Outlet />
    </div>
  </div>
)
