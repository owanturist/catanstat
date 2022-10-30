import React from 'react'
import { Link } from 'react-router-dom'
import cx from 'classnames'

const styleLink = cx(
  'outline-none text-blue-500 transition-colors',
  'hover:text-blue-700',
  'focus-within:underline'
)

export const NotFound: React.VFC = () => (
  <div className="h-full text-gray-700">
    <div
      className={cx(
        'flex flex-col items-center justify-center h-full min-h-full mx-auto p-2 text-center border-gray-50',
        'xs:max-w-md xs:p-3 xs:border-x xs:shadow-lg'
      )}
    >
      <h1 className={cx('text-2xl font-bold', '2xs:text-3xl', 'xs:text-4xl')}>
        404
      </h1>
      <h2 className={cx('text-lg font-bold', '2xs:text-xl', 'xs:text-2xl')}>
        Page not found
      </h2>
      <p className={cx('mt-1 text-sm', '2xs:text-base', 'xs:text-lg')}>
        The page you are looking for does not exist.
        <br />
        <Link to="/" className={styleLink}>
          Go to the homepage
        </Link>{' '}
        or{' '}
        <Link to="/start" className={styleLink}>
          start a new game
        </Link>
        .
      </p>
    </div>
  </div>
)
