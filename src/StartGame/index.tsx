import React from 'react'
import { InnerStore } from 'react-inner-store'
import cx from 'classnames'

import { LoadingScreen } from '../LoadingScreen'

import { State } from './domain'
export { State } from './domain'

const LazyStartGame = React.lazy(() => import('./StartGame'))

export const View: React.VFC<{
  store: InnerStore<State>
}> = React.memo(({ store }) => (
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
      <React.Suspense
        fallback={
          <div className="p-2 flex-1 flex justify-center xs:p-3">
            <LoadingScreen />
          </div>
        }
      >
        <LazyStartGame store={store} />
      </React.Suspense>
    </div>
  </div>
))
