import React from 'react'
import cx from 'classnames'

const iconClassName = cx('block overflow-visible h-[1em]')

export const Drag: React.VFC = () => (
  <svg className={iconClassName} viewBox="0 0 16 16">
    <path
      fillRule="evenodd"
      fill="currentColor"
      d="M10 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-4 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm1-5a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 1a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm1-5a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM6 5a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"
    />
  </svg>
)

export const User: React.VFC = () => (
  <svg className={iconClassName} viewBox="0 0 512 512">
    <path
      fill="currentColor"
      d="M256 288c79.5 0 144-64.5 144-144S335.5 0 256 0 112 64.5 112 144s64.5 144 144 144zm128 32h-55.1c-22.2 10.2-46.9 16-72.9 16s-50.6-5.8-72.9-16H128C57.3 320 0 377.3 0 448v16c0 26.5 21.5 48 48 48h416c26.5 0 48-21.5 48-48v-16c0-70.7-57.3-128-128-128z"
    />
  </svg>
)

export const UserOff: React.VFC = () => (
  <svg className={iconClassName} viewBox="0 0 640 512">
    <path
      fill="currentColor"
      d="M633.8 458.1 389.6 269.3C433.8 244.7 464 198.1 464 144 464 64.5 399.5 0 320 0c-67.1 0-123 46.1-139 108.2L45.5 3.4C38.5-2 28.5-.8 23 6.2L3.4 31.4c-5.4 7-4.2 17 2.8 22.4l588.4 454.7c7 5.4 17 4.2 22.5-2.8l19.6-25.3c5.4-6.8 4.1-16.9-2.9-22.3zM198.4 320C124.2 320 64 380.2 64 454.4v9.6c0 26.5 21.5 48 48 48h382.2L245.8 320h-47.4z"
    />
  </svg>
)
