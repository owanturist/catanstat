import React from 'react'
import cx from 'classnames'

const iconClassName = cx('block overflow-visible h-[1em] leading-none')

export type IconProps = Omit<
  React.SVGProps<SVGSVGElement>,
  'children' | 'viewBox'
>

export const Drag: React.VFC<IconProps> = ({ className, ...props }) => (
  <svg className={cx(iconClassName, className)} viewBox="0 0 16 16" {...props}>
    <path
      fillRule="evenodd"
      fill="currentColor"
      d="M10 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-4 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm1-5a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 1a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm1-5a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM6 5a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"
    />
  </svg>
)

export const User: React.VFC<IconProps> = ({ className, ...props }) => (
  <svg
    className={cx(iconClassName, className)}
    viewBox="0 0 512 512"
    {...props}
  >
    <path
      fill="currentColor"
      d="M256 288c79.5 0 144-64.5 144-144S335.5 0 256 0 112 64.5 112 144s64.5 144 144 144zm128 32h-55.1c-22.2 10.2-46.9 16-72.9 16s-50.6-5.8-72.9-16H128C57.3 320 0 377.3 0 448v16c0 26.5 21.5 48 48 48h416c26.5 0 48-21.5 48-48v-16c0-70.7-57.3-128-128-128z"
    />
  </svg>
)

export const UserOff: React.VFC<IconProps> = ({ className, ...props }) => (
  <svg
    className={cx(iconClassName, className)}
    viewBox="0 0 640 512"
    {...props}
  >
    <path
      fill="currentColor"
      d="M633.8 458.1 389.6 269.3C433.8 244.7 464 198.1 464 144 464 64.5 399.5 0 320 0c-67.1 0-123 46.1-139 108.2L45.5 3.4C38.5-2 28.5-.8 23 6.2L3.4 31.4c-5.4 7-4.2 17 2.8 22.4l588.4 454.7c7 5.4 17 4.2 22.5-2.8l19.6-25.3c5.4-6.8 4.1-16.9-2.9-22.3zM198.4 320C124.2 320 64 380.2 64 454.4v9.6c0 26.5 21.5 48 48 48h382.2L245.8 320h-47.4z"
    />
  </svg>
)

export const Pause: React.VFC<IconProps> = ({ className, ...props }) => (
  <svg
    className={cx(iconClassName, className)}
    viewBox="0 0 448 512"
    {...props}
  >
    <path
      fill="currentColor"
      d="M144 479H48c-26.5 0-48-21.5-48-48V79c0-26.5 21.5-48 48-48h96c26.5 0 48 21.5 48 48v352c0 26.5-21.5 48-48 48zm304-48V79c0-26.5-21.5-48-48-48h-96c-26.5 0-48 21.5-48 48v352c0 26.5 21.5 48 48 48h96c26.5 0 48-21.5 48-48z"
    />
  </svg>
)

export const Play: React.VFC<IconProps> = ({ className, ...props }) => (
  <svg
    className={cx(iconClassName, className)}
    viewBox="0 0 448 512"
    {...props}
  >
    <path
      fill="currentColor"
      d="M424.4 214.7 72.4 6.6C43.8-10.3 0 6.1 0 47.9V464c0 37.5 40.7 60.1 72.4 41.3l352-208c31.4-18.5 31.5-64.1 0-82.6z"
    />
  </svg>
)

export const Flag: React.VFC<IconProps> = ({ className, ...props }) => (
  <svg
    className={cx(iconClassName, className)}
    viewBox="0 0 512 512"
    {...props}
  >
    <path
      fill="currentColor"
      d="M243.2 189.9V258c26.1 5.9 49.3 15.6 73.6 22.3v-68.2c-26-5.8-49.4-15.5-73.6-22.2zm223.3-123c-34.3 15.9-76.5 31.9-117 31.9C296 98.8 251.7 64 184.3 64c-25 0-47.3 4.4-68 12 2.8-7.3 4.1-15.2 3.6-23.6C118.1 24 94.8 1.2 66.3 0A56 56 0 0 0 32 101.9V488c0 13.3 10.7 24 24 24h16c13.3 0 24-10.7 24-24v-94.4c28.3-12.1 63.6-22.1 114.4-22.1 53.6 0 97.8 34.8 165.2 34.8 48.2 0 86.7-16.3 122.5-40.9 8.7-6 13.8-15.8 13.8-26.4V95.9c.1-23.3-24.2-38.8-45.4-29zM169.6 325.5c-25.8 2.7-50 8.2-73.6 16.6v-70.5c26.2-9.3 47.5-15 73.6-17.4zM464 191c-23.6 9.8-46.3 19.5-73.6 23.9V286c24.8-3.4 51.4-11.8 73.6-26v70.5c-25.1 16.1-48.5 24.7-73.6 27.1V286c-27 3.7-47.9 1.5-73.6-5.6v67.4c-23.9-7.4-47.3-16.7-73.6-21.3V258c-19.7-4.4-40.8-6.8-73.6-3.8v-70c-22.4 3.1-44.6 10.2-73.6 20.9v-70.5c33.2-12.2 50.1-19.8 73.6-22v71.6c27-3.7 48.4-1.3 73.6 5.7v-67.4c23.7 7.4 47.2 16.7 73.6 21.3v68.4c23.7 5.3 47.6 6.9 73.6 2.7V143c27-4.8 52.3-13.6 73.6-22.5z"
    />
  </svg>
)

export const Undo: React.VFC<IconProps> = ({ className, ...props }) => (
  <svg
    className={cx(iconClassName, className)}
    viewBox="0 0 512 512"
    {...props}
  >
    <path
      fill="currentColor"
      d="M255.54 8A247.16 247.16 0 0 0 84.68 76.69l-35.7-35.72C33.84 25.85 8 36.56 8 57.94V192a24 24 0 0 0 24 24h134.06c21.38 0 32.09-25.85 16.97-40.97l-41.75-41.75A166.78 166.78 0 0 1 254.51 88c92.4-.8 170.28 73.97 169.48 169.44C423.24 348 349.82 424 256 424c-41.13 0-80-14.68-110.63-41.56A11.98 11.98 0 0 0 129 383l-39.66 39.66a12.02 12.02 0 0 0 .48 17.43A247.09 247.09 0 0 0 256 504c136.97 0 248-111.03 248-248C504 119.2 392.35 7.75 255.54 8z"
    />
  </svg>
)

const DEFAULT_DIE_STROKE_WIDTH = 12

export const DieClear: React.VFC<IconProps> = ({
  className,
  stroke,
  strokeWidth = DEFAULT_DIE_STROKE_WIDTH,
  ...props
}) => (
  <svg
    className={cx(iconClassName, className)}
    viewBox="0 0 448 448"
    {...props}
  >
    <path
      fill="currentColor"
      stroke={stroke}
      strokeWidth={strokeWidth}
      d="M384 0H64A64 64 0 0 0 0 64v320a64 64 0 0 0 64 64h320a64 64 0 0 0 64-64V64a64 64 0 0 0-64-64zM224 64z"
    />
  </svg>
)

export const DieOne: React.VFC<IconProps> = ({
  className,
  stroke,
  strokeWidth = DEFAULT_DIE_STROKE_WIDTH,
  ...props
}) => (
  <svg
    className={cx(iconClassName, className)}
    viewBox="0 0 448 448"
    {...props}
  >
    <path
      fill="currentColor"
      stroke={stroke}
      strokeWidth={strokeWidth}
      d="M384 0H64A64 64 0 0 0 0 64v320a64 64 0 0 0 64 64h320a64 64 0 0 0 64-64V64a64 64 0 0 0-64-64zM224 256a32 32 0 1 1 0-64 32 32 0 0 1 0 64z"
    />
  </svg>
)

export const DieTwo: React.VFC<IconProps> = ({
  className,
  stroke,
  strokeWidth = DEFAULT_DIE_STROKE_WIDTH,
  ...props
}) => (
  <svg
    className={cx(iconClassName, className)}
    viewBox="0 0 448 448"
    {...props}
  >
    <path
      fill="currentColor"
      stroke={stroke}
      strokeWidth={strokeWidth}
      d="M384 0H64A64 64 0 0 0 0 64v320a64 64 0 0 0 64 64h320a64 64 0 0 0 64-64V64a64 64 0 0 0-64-64zM128 160a32 32 0 1 1 0-64 32 32 0 0 1 0 64zm192 192a32 32 0 1 1 0-64 32 32 0 0 1 0 64z"
    />
  </svg>
)

export const DieThree: React.VFC<IconProps> = ({
  className,
  stroke,
  strokeWidth = DEFAULT_DIE_STROKE_WIDTH,
  ...props
}) => (
  <svg
    className={cx(iconClassName, className)}
    viewBox="0 0 448 448"
    {...props}
  >
    <path
      fill="currentColor"
      stroke={stroke}
      strokeWidth={strokeWidth}
      d="M384 0H64A64 64 0 0 0 0 64v320a64 64 0 0 0 64 64h320a64 64 0 0 0 64-64V64a64 64 0 0 0-64-64zM128 160a32 32 0 1 1 0-64 32 32 0 0 1 0 64zm96 96a32 32 0 1 1 0-64 32 32 0 0 1 0 64zm96 96a32 32 0 1 1 0-64 32 32 0 0 1 0 64z"
    />
  </svg>
)

export const DieFour: React.VFC<IconProps> = ({
  className,
  stroke,
  strokeWidth = DEFAULT_DIE_STROKE_WIDTH,
  ...props
}) => (
  <svg
    className={cx(iconClassName, className)}
    viewBox="0 0 448 448"
    {...props}
  >
    <path
      fill="currentColor"
      stroke={stroke}
      strokeWidth={strokeWidth}
      d="M384 0H64A64 64 0 0 0 0 64v320a64 64 0 0 0 64 64h320a64 64 0 0 0 64-64V64a64 64 0 0 0-64-64zM128 352a32 32 0 1 1 0-64 32 32 0 0 1 0 64zm0-192a32 32 0 1 1 0-64 32 32 0 0 1 0 64zm192 192a32 32 0 1 1 0-64 32 32 0 0 1 0 64zm0-192a32 32 0 1 1 0-64 32 32 0 0 1 0 64z"
    />
  </svg>
)

export const DieFive: React.VFC<IconProps> = ({
  className,
  stroke,
  strokeWidth = DEFAULT_DIE_STROKE_WIDTH,
  ...props
}) => (
  <svg
    className={cx(iconClassName, className)}
    viewBox="0 0 448 448"
    {...props}
  >
    <path
      fill="currentColor"
      stroke={stroke}
      strokeWidth={strokeWidth}
      d="M384 0H64A64 64 0 0 0 0 64v320a64 64 0 0 0 64 64h320a64 64 0 0 0 64-64V64a64 64 0 0 0-64-64zM128 352a32 32 0 1 1 0-64 32 32 0 0 1 0 64zm0-192a32 32 0 1 1 0-64 32 32 0 0 1 0 64zm96 96a32 32 0 1 1 0-64 32 32 0 0 1 0 64zm96 96a32 32 0 1 1 0-64 32 32 0 0 1 0 64zm0-192a32 32 0 1 1 0-64 32 32 0 0 1 0 64z"
    />
  </svg>
)

export const DieSix: React.VFC<IconProps> = ({
  className,
  stroke,
  strokeWidth = DEFAULT_DIE_STROKE_WIDTH,
  ...props
}) => (
  <svg
    className={cx(iconClassName, className)}
    viewBox="0 0 448 448"
    {...props}
  >
    <path
      fill="currentColor"
      stroke={stroke}
      strokeWidth={strokeWidth}
      d="M384 0H64A64 64 0 0 0 0 64v320a64 64 0 0 0 64 64h320a64 64 0 0 0 64-64V64a64 64 0 0 0-64-64zM128 352a32 32 0 1 1 0-64 32 32 0 0 1 0 64zm0-96a32 32 0 1 1 0-64 32 32 0 0 1 0 64zm0-96a32 32 0 1 1 0-64 32 32 0 0 1 0 64zm192 192a32 32 0 1 1 0-64 32 32 0 0 1 0 64zm0-96a32 32 0 1 1 0-64 32 32 0 0 1 0 64zm0-96a32 32 0 1 1 0-64 32 32 0 0 1 0 64z"
    />
  </svg>
)
