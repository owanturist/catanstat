import React from 'react'
import cx from 'classnames'

import logo from './assets/logo.svg'

export const LoadingScreen: React.VFC<{
  className?: string
}> = React.memo(({ className }) => {
  const [isRendered, setIsRendered] = React.useState(false)

  React.useEffect(() => {
    setIsRendered(true)
  }, [])

  return (
    <img
      src={logo}
      className={cx(
        'w-full animate-pulse opacity-0 transition-opacity duration-500 ease-in-out aspect-[196/132]',
        isRendered && 'opacity-100',
        className
      )}
      alt="logo"
    />
  )
})
