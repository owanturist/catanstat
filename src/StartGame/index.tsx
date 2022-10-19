import React from 'react'
import cx from 'classnames'

import { State } from './domain'
export { State } from './domain'

const LazyStartGame = React.lazy(() => import('./StartGame'))

export const View: React.FC<{
  state: State
}> = ({ state }) => (
  <div
    className={cx(
      'h-full flex flex-col items-center text-gray-700',
      'sm:py-3 sm:justify-center'
    )}
  >
    <div
      className={cx(
        'flex flex-col flex-1 max-h-full w-full bg-white border-gray-50',
        'xs:max-w-md xs:shadow-lg xs:border-x',
        'sm:grow-0 sm:rounded-md'
      )}
    >
      <React.Suspense fallback={null}>
        <LazyStartGame state={state} />
      </React.Suspense>
    </div>
  </div>
)
