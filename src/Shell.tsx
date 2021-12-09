import React from 'react'
import { Outlet, Link } from 'react-router-dom'

export const Shell = React.memo(() => {
  return (
    <div className="h-full flex flex-col">
      <header className="bg-gray-100 flex justify-center">
        <div className="p-3 w-full sm:max-w-md sm:px-0">
          <h1 className="font-semibold text-xl tracking-wider text-gray-600 sm:text-2xl">
            <Link to="/" className="outline-none focus-visible:underline">
              CATAN statistics
            </Link>
          </h1>
        </div>
      </header>

      <div className="flex-1 min-h-0">
        <Outlet />
      </div>
    </div>
  )
})
