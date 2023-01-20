import React from 'react'
import cx from 'classnames'

import { range } from '../utils'

const commonClassName = cx('bg-gray-200 animate-glow leading-none select-none')

export interface SkeletonTextProps {
  count?: number
}

/**
 * Text skeleton fills all possible width
 * simulating text height of content.
 *
 * @param [count=1] optional count of text rows
 */
export const SkeletonText: React.FC<SkeletonTextProps> = ({ count = 1 }) => {
  if (count <= 0) {
    return null
  }

  return (
    <>
      {range(0, count).map((_, i) => (
        <span
          key={i}
          className={cx(commonClassName, 'inline-block w-full rounded')}
        >
          &zwnj;
        </span>
      ))}
    </>
  )
}

interface SkeletonBlockProps {
  className?: string
  inline?: boolean
  circle?: boolean
  width: number | string
  height: number | string
}

const SkeletonBlock: React.FC<SkeletonBlockProps> = ({
  className,
  inline,
  circle,
  width,
  height
}) => (
  <span
    className={cx(
      commonClassName,
      'text-[0] align-top',
      inline ? 'inline-block' : 'block',
      circle ? 'rounded-full' : 'rounded',
      className
    )}
    style={{ width, height }}
  />
)

export type SkeletonRectProps = Omit<SkeletonBlockProps, 'circle'>

/**
 * Rectangle shape skeleton
 *
 * @param [className] optional class attribute
 * @param [inline] use display 'inline' instead of 'block'
 * @param width px in number or any other value via string
 * @param height px in number or any other value via string
 */
export const SkeletonRect: React.FC<SkeletonRectProps> = SkeletonBlock

export interface SkeletonCircleProps
  extends Omit<SkeletonBlockProps, 'circle' | 'width' | 'height'> {
  size: number | string
}
/**
 * Circle shape skeleton
 *
 * @param [className] optional class attribute
 * @param [inline] use display 'inline' instead of 'block'
 * @param size px in number or any other value via string
 */
export const SkeletonCircle: React.FC<SkeletonCircleProps> = ({
  className,
  inline,
  size
}) => (
  <SkeletonBlock
    className={className}
    circle
    inline={inline}
    width={size}
    height={size}
  />
)
