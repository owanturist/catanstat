import React from 'react'
import cx from 'classnames'

import logo from './assets/logo.svg'

export const LoadingScreen: React.VFC<{
  className?: string
}> = React.memo(({ className }) => (
  <img
    src={logo}
    className={cx('w-full animate-pulse', className)}
    alt="logo"
  />
))
