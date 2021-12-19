import cx from 'classnames'
import React from 'react'

const iconClassName = cx(
  'block overflow-visible h-[1em] leading-none pointer-events-none'
)

export type IconProps = Omit<
  React.SVGProps<SVGSVGElement>,
  'children' | 'viewBox'
>

export const Drag: React.VFC<IconProps> = props => (
  <svg
    {...props}
    className={cx(iconClassName, props.className)}
    viewBox="0 0 16 16"
  >
    <path
      fill="currentColor"
      d="M10 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-4 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm1-5a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 1a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm1-5a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM6 5a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"
    />
  </svg>
)

export const User: React.VFC<IconProps> = props => (
  <svg
    {...props}
    className={cx(iconClassName, props.className)}
    viewBox="0 0 512 512"
  >
    <path
      fill="currentColor"
      d="M256 288c79.5 0 144-64.5 144-144S335.5 0 256 0 112 64.5 112 144s64.5 144 144 144zm128 32h-55.1c-22.2 10.2-46.9 16-72.9 16s-50.6-5.8-72.9-16H128C57.3 320 0 377.3 0 448v16c0 26.5 21.5 48 48 48h416c26.5 0 48-21.5 48-48v-16c0-70.7-57.3-128-128-128z"
    />
  </svg>
)

export const UserOff: React.VFC<IconProps> = props => (
  <svg
    {...props}
    className={cx(iconClassName, props.className)}
    viewBox="0 0 640 512"
  >
    <path
      fill="currentColor"
      d="M633.8 458.1 389.6 269.3C433.8 244.7 464 198.1 464 144 464 64.5 399.5 0 320 0c-67.1 0-123 46.1-139 108.2L45.5 3.4C38.5-2 28.5-.8 23 6.2L3.4 31.4c-5.4 7-4.2 17 2.8 22.4l588.4 454.7c7 5.4 17 4.2 22.5-2.8l19.6-25.3c5.4-6.8 4.1-16.9-2.9-22.3zM198.4 320C124.2 320 64 380.2 64 454.4v9.6c0 26.5 21.5 48 48 48h382.2L245.8 320h-47.4z"
    />
  </svg>
)

export const Pause: React.VFC<IconProps> = props => (
  <svg
    {...props}
    className={cx(iconClassName, props.className)}
    viewBox="0 0 448 512"
  >
    <path
      fill="currentColor"
      d="M144 479H48c-26.5 0-48-21.5-48-48V79c0-26.5 21.5-48 48-48h96c26.5 0 48 21.5 48 48v352c0 26.5-21.5 48-48 48zm304-48V79c0-26.5-21.5-48-48-48h-96c-26.5 0-48 21.5-48 48v352c0 26.5 21.5 48 48 48h96c26.5 0 48-21.5 48-48z"
    />
  </svg>
)

export const Play: React.VFC<IconProps> = props => (
  <svg
    {...props}
    className={cx(iconClassName, props.className)}
    viewBox="0 0 448 512"
  >
    <path
      fill="currentColor"
      d="M424.4 214.7 72.4 6.6C43.8-10.3 0 6.1 0 47.9V464c0 37.5 40.7 60.1 72.4 41.3l352-208c31.4-18.5 31.5-64.1 0-82.6z"
    />
  </svg>
)

export const Flag: React.VFC<IconProps> = props => (
  <svg
    {...props}
    className={cx(iconClassName, props.className)}
    viewBox="0 0 512 512"
  >
    <path
      fill="currentColor"
      d="M243.2 189.9V258c26.1 5.9 49.3 15.6 73.6 22.3v-68.2c-26-5.8-49.4-15.5-73.6-22.2zm223.3-123c-34.3 15.9-76.5 31.9-117 31.9C296 98.8 251.7 64 184.3 64c-25 0-47.3 4.4-68 12 2.8-7.3 4.1-15.2 3.6-23.6C118.1 24 94.8 1.2 66.3 0A56 56 0 0 0 32 101.9V488c0 13.3 10.7 24 24 24h16c13.3 0 24-10.7 24-24v-94.4c28.3-12.1 63.6-22.1 114.4-22.1 53.6 0 97.8 34.8 165.2 34.8 48.2 0 86.7-16.3 122.5-40.9 8.7-6 13.8-15.8 13.8-26.4V95.9c.1-23.3-24.2-38.8-45.4-29zM169.6 325.5c-25.8 2.7-50 8.2-73.6 16.6v-70.5c26.2-9.3 47.5-15 73.6-17.4zM464 191c-23.6 9.8-46.3 19.5-73.6 23.9V286c24.8-3.4 51.4-11.8 73.6-26v70.5c-25.1 16.1-48.5 24.7-73.6 27.1V286c-27 3.7-47.9 1.5-73.6-5.6v67.4c-23.9-7.4-47.3-16.7-73.6-21.3V258c-19.7-4.4-40.8-6.8-73.6-3.8v-70c-22.4 3.1-44.6 10.2-73.6 20.9v-70.5c33.2-12.2 50.1-19.8 73.6-22v71.6c27-3.7 48.4-1.3 73.6 5.7v-67.4c23.7 7.4 47.2 16.7 73.6 21.3v68.4c23.7 5.3 47.6 6.9 73.6 2.7V143c27-4.8 52.3-13.6 73.6-22.5z"
    />
  </svg>
)

export const Undo: React.VFC<IconProps> = props => (
  <svg
    {...props}
    className={cx(iconClassName, props.className)}
    viewBox="0 0 512 512"
  >
    <path
      fill="currentColor"
      d="M255.54 8A247.16 247.16 0 0 0 84.68 76.69l-35.7-35.72C33.84 25.85 8 36.56 8 57.94V192a24 24 0 0 0 24 24h134.06c21.38 0 32.09-25.85 16.97-40.97l-41.75-41.75A166.78 166.78 0 0 1 254.51 88c92.4-.8 170.28 73.97 169.48 169.44C423.24 348 349.82 424 256 424c-41.13 0-80-14.68-110.63-41.56A11.98 11.98 0 0 0 129 383l-39.66 39.66a12.02 12.02 0 0 0 .48 17.43A247.09 247.09 0 0 0 256 504c136.97 0 248-111.03 248-248C504 119.2 392.35 7.75 255.54 8z"
    />
  </svg>
)

export const Times: React.VFC<IconProps> = props => (
  <svg
    {...props}
    className={cx(iconClassName, props.className)}
    viewBox="0 0 352 512"
  >
    <path
      fill="currentColor"
      d="m242.72 256 100.07-100.07a31.46 31.46 0 0 0 0-44.48l-22.24-22.24a31.46 31.46 0 0 0-44.48 0L176 189.28 75.93 89.21a31.46 31.46 0 0 0-44.48 0L9.21 111.45a31.46 31.46 0 0 0 0 44.48L109.28 256 9.21 356.07a31.46 31.46 0 0 0 0 44.48l22.24 22.24a31.46 31.46 0 0 0 44.48 0L176 322.72l100.07 100.07a31.46 31.46 0 0 0 44.48 0l22.24-22.24a31.46 31.46 0 0 0 0-44.48L242.72 256z"
    />
  </svg>
)

export const Trophy: React.VFC<IconProps> = props => (
  <svg
    {...props}
    className={cx(iconClassName, props.className)}
    viewBox="0 0 576 512"
  >
    <path
      fill="currentColor"
      d="M552 64H448V24c0-13.3-10.7-24-24-24H152c-13.3 0-24 10.7-24 24v40H24C10.7 64 0 74.7 0 88v56c0 35.7 22.5 72.4 61.9 100.7 31.5 22.7 69.8 37.1 110 41.7C203.3 338.5 240 360 240 360v72h-48c-35.3 0-64 20.7-64 56v12c0 6.6 5.4 12 12 12h296c6.6 0 12-5.4 12-12v-12c0-35.3-28.7-56-64-56h-48v-72s36.7-21.5 68.1-73.6c40.3-4.6 78.6-19 110-41.7 39.3-28.3 61.9-65 61.9-100.7V88c0-13.3-10.7-24-24-24zM99.3 192.8C74.9 175.2 64 155.6 64 144v-16h64.2c1 32.6 5.8 61.2 12.8 86.2-15.1-5.2-29.2-12.4-41.7-21.4zM512 144c0 16.1-17.7 36.1-35.3 48.8-12.5 9-26.7 16.2-41.8 21.4 7-25 11.8-53.6 12.8-86.2H512v16z"
    />
  </svg>
)

export const Ellipsis: React.VFC<IconProps> = props => (
  <svg
    {...props}
    className={cx(iconClassName, props.className)}
    viewBox="0 0 192 512"
  >
    <path
      fill="currentColor"
      d="M96 184c39.8 0 72 32.2 72 72s-32.2 72-72 72-72-32.2-72-72 32.2-72 72-72zM24 80c0 39.8 32.2 72 72 72s72-32.2 72-72S135.8 8 96 8 24 40.2 24 80zm0 352c0 39.8 32.2 72 72 72s72-32.2 72-72-32.2-72-72-72-72 32.2-72 72z"
    />
  </svg>
)

export const ChartPie: React.VFC<IconProps> = props => (
  <svg
    {...props}
    className={cx(iconClassName, props.className)}
    viewBox="0 0 544 512"
  >
    <path
      fill="currentColor"
      d="M527.79 288H290.5l158.03 158.03c6.04 6.04 15.98 6.53 22.19.68a239.5 239.5 0 0 0 73.13-140.86c1.34-9.46-6.51-17.85-16.06-17.85zm-15.83-64.8C503.72 103.74 408.26 8.28 288.8.04 279.68-.59 272 7.1 272 16.24V240h223.77c9.14 0 16.82-7.68 16.19-16.8zM224 288V50.71c0-9.55-8.39-17.4-17.84-16.06C86.99 51.49-4.1 155.6.14 280.37 4.5 408.51 114.83 513.59 243.03 511.98a238.14 238.14 0 0 0 135.26-44.03c7.9-5.6 8.42-17.23 1.57-24.08L224 288z"
    />
  </svg>
)

export const Book: React.VFC<IconProps> = props => (
  <svg
    {...props}
    className={cx(iconClassName, props.className)}
    viewBox="0 0 448 512"
  >
    <path
      fill="currentColor"
      d="M448 360V24c0-13.3-10.7-24-24-24H96C43 0 0 43 0 96v320c0 53 43 96 96 96h328c13.3 0 24-10.7 24-24v-16c0-7.5-3.5-14.3-8.9-18.7-4.2-15.4-4.2-59.3 0-74.7 5.4-4.3 8.9-11.1 8.9-18.6zM128 134c0-3.3 2.7-6 6-6h212c3.3 0 6 2.7 6 6v20c0 3.3-2.7 6-6 6H134c-3.3 0-6-2.7-6-6v-20zm0 64c0-3.3 2.7-6 6-6h212c3.3 0 6 2.7 6 6v20c0 3.3-2.7 6-6 6H134c-3.3 0-6-2.7-6-6v-20zm253.4 250H96c-17.7 0-32-14.3-32-32 0-17.6 14.4-32 32-32h285.4c-1.9 17.1-1.9 46.9 0 64z"
    />
  </svg>
)

export const Logo: React.VFC<IconProps> = props => (
  <svg
    {...props}
    className={cx(iconClassName, props.className)}
    viewBox="0 0 192 128"
  >
    <path
      fill="currentColor"
      d="M35 16.19 61 1.16a4 4 0 0 1 4 0l26 15.03a4 4 0 0 1 2 3.46V50.2a4 4 0 0 1-2 3.47L65 68.69a4 4 0 0 1-4 0L35 53.66a4 4 0 0 1-2-3.47V19.65a4 4 0 0 1 2-3.46Zm66 0 26-15.03a4 4 0 0 1 4 0l26 15.03a4 4 0 0 1 2 3.46V50.2a4 4 0 0 1-2 3.47l-26 15.03a4 4 0 0 1-4 0l-26-15.03a4 4 0 0 1-2-3.47V19.65a4 4 0 0 1 2-3.46Zm-7 42.97L68 74.19a4 4 0 0 0-2 3.46v30.54a4 4 0 0 0 2 3.47l26 15.03a4 4 0 0 0 4 0l26-15.03a4 4 0 0 0 2-3.47V77.65a4 4 0 0 0-2-3.46L98 59.16a4 4 0 0 0-4 0Zm40 15.03 26-15.03a4 4 0 0 1 4 0l26 15.03a4 4 0 0 1 2 3.46v30.54a4 4 0 0 1-2 3.47l-26 15.03a4 4 0 0 1-4 0l-26-15.03a4 4 0 0 1-2-3.47V77.65a4 4 0 0 1 2-3.46ZM28 59.16 2 74.19a4 4 0 0 0-2 3.46v30.54a4 4 0 0 0 2 3.47l26 15.03a4 4 0 0 0 4 0l26-15.03a4 4 0 0 0 2-3.47V77.65a4 4 0 0 0-2-3.46L32 59.16a4 4 0 0 0-4 0Z"
    />
  </svg>
)

export const DieClear: React.VFC<IconProps> = props => (
  <svg
    {...props}
    className={cx(iconClassName, props.className)}
    viewBox="0 0 448 448"
  >
    <path
      fill="currentColor"
      d="M384 0H64A64 64 0 0 0 0 64v320a64 64 0 0 0 64 64h320a64 64 0 0 0 64-64V64a64 64 0 0 0-64-64zM224 64z"
    />
  </svg>
)

export const DieOne: React.VFC<IconProps> = props => (
  <svg
    {...props}
    className={cx(iconClassName, props.className)}
    viewBox="0 0 448 448"
  >
    <path
      fill="currentColor"
      d="M384 0H64A64 64 0 0 0 0 64v320a64 64 0 0 0 64 64h320a64 64 0 0 0 64-64V64a64 64 0 0 0-64-64zM224 256a32 32 0 1 1 0-64 32 32 0 0 1 0 64z"
    />
  </svg>
)

export const DieTwo: React.VFC<IconProps> = props => (
  <svg
    {...props}
    className={cx(iconClassName, props.className)}
    viewBox="0 0 448 448"
  >
    <path
      fill="currentColor"
      d="M384 0H64A64 64 0 0 0 0 64v320a64 64 0 0 0 64 64h320a64 64 0 0 0 64-64V64a64 64 0 0 0-64-64zM128 160a32 32 0 1 1 0-64 32 32 0 0 1 0 64zm192 192a32 32 0 1 1 0-64 32 32 0 0 1 0 64z"
    />
  </svg>
)

export const DieThree: React.VFC<IconProps> = props => (
  <svg
    {...props}
    className={cx(iconClassName, props.className)}
    viewBox="0 0 448 448"
  >
    <path
      fill="currentColor"
      d="M384 0H64A64 64 0 0 0 0 64v320a64 64 0 0 0 64 64h320a64 64 0 0 0 64-64V64a64 64 0 0 0-64-64zM128 160a32 32 0 1 1 0-64 32 32 0 0 1 0 64zm96 96a32 32 0 1 1 0-64 32 32 0 0 1 0 64zm96 96a32 32 0 1 1 0-64 32 32 0 0 1 0 64z"
    />
  </svg>
)

export const DieFour: React.VFC<IconProps> = props => (
  <svg
    {...props}
    className={cx(iconClassName, props.className)}
    viewBox="0 0 448 448"
  >
    <path
      fill="currentColor"
      d="M384 0H64A64 64 0 0 0 0 64v320a64 64 0 0 0 64 64h320a64 64 0 0 0 64-64V64a64 64 0 0 0-64-64zM128 352a32 32 0 1 1 0-64 32 32 0 0 1 0 64zm0-192a32 32 0 1 1 0-64 32 32 0 0 1 0 64zm192 192a32 32 0 1 1 0-64 32 32 0 0 1 0 64zm0-192a32 32 0 1 1 0-64 32 32 0 0 1 0 64z"
    />
  </svg>
)

export const DieFive: React.VFC<IconProps> = props => (
  <svg
    {...props}
    className={cx(iconClassName, props.className)}
    viewBox="0 0 448 448"
  >
    <path
      fill="currentColor"
      d="M384 0H64A64 64 0 0 0 0 64v320a64 64 0 0 0 64 64h320a64 64 0 0 0 64-64V64a64 64 0 0 0-64-64zM128 352a32 32 0 1 1 0-64 32 32 0 0 1 0 64zm0-192a32 32 0 1 1 0-64 32 32 0 0 1 0 64zm96 96a32 32 0 1 1 0-64 32 32 0 0 1 0 64zm96 96a32 32 0 1 1 0-64 32 32 0 0 1 0 64zm0-192a32 32 0 1 1 0-64 32 32 0 0 1 0 64z"
    />
  </svg>
)

export const DieSix: React.VFC<IconProps> = props => (
  <svg
    {...props}
    className={cx(iconClassName, props.className)}
    viewBox="0 0 448 448"
  >
    <path
      fill="currentColor"
      d="M384 0H64A64 64 0 0 0 0 64v320a64 64 0 0 0 64 64h320a64 64 0 0 0 64-64V64a64 64 0 0 0-64-64zM128 352a32 32 0 1 1 0-64 32 32 0 0 1 0 64zm0-96a32 32 0 1 1 0-64 32 32 0 0 1 0 64zm0-96a32 32 0 1 1 0-64 32 32 0 0 1 0 64zm192 192a32 32 0 1 1 0-64 32 32 0 0 1 0 64zm0-96a32 32 0 1 1 0-64 32 32 0 0 1 0 64zm0-96a32 32 0 1 1 0-64 32 32 0 0 1 0 64z"
    />
  </svg>
)
