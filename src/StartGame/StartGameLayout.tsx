import React, { HTMLAttributes } from 'react'
import cx from 'classnames'

import { Drag as IconDrag } from '../Icon'

export const StartGameForm: React.FC<{
  onSubmit?: VoidFunction
  footer: React.ReactNode
  children: React.ReactNode
}> = ({ onSubmit, footer, children }) => (
  <form
    className={cx(
      'flex flex-col flex-1 p-2 max-h-full w-full space-y-3',
      'xs:p-3',
      'sm:grow-0'
    )}
    onSubmit={event => {
      event.preventDefault()

      onSubmit?.()
    }}
  >
    {children}

    <div className="hidden sm:border-t sm:block" />

    <footer>{footer}</footer>
  </form>
)

export const PlayersList = React.forwardRef<
  HTMLDivElement,
  { children: React.ReactNode }
>(({ children }, ref) => (
  <div
    ref={ref}
    className={cx(
      'flex-1 overflow-y-auto',
      '-mr-3 pr-2', // position scrollbar to the containers' edge
      '-m-1' // compensate items' padding to be align with divider
    )}
  >
    {children}
  </div>
))

export const PlayerItem = React.forwardRef<
  HTMLDivElement,
  {
    isDragging?: boolean
    dragHandleProps?: HTMLAttributes<HTMLSpanElement>
    children: React.ReactNode
  }
>(({ isDragging, children, dragHandleProps, ...props }, ref) => (
  <div
    ref={ref}
    className={cx(
      'flex flex-row gap-2 p-1 bg-white rounded-md transition-shadow',
      isDragging ? 'shadow-md' : 'shadow-none'
    )}
    {...props}
  >
    {children}

    <span
      className={cx(
        'flex flex-shrink-0 justify-center items-center w-6 h-10 rounded-md text-xl text-center select-none transition-colors',
        dragHandleProps != null && [
          'cursor-[grab]',
          'hover:text-gray-500',
          'ring-gray-200 focus-visible:ring-2 focus-visible:outline-none'
        ],
        isDragging ? 'text-gray-500' : 'text-gray-300'
      )}
      {...dragHandleProps}
    >
      <IconDrag />
    </span>
  </div>
))
