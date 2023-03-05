import { Meta, StoryObj } from '@storybook/react'
import React from 'react'

import {
  SkeletonText,
  SkeletonRect,
  SkeletonCircle,
  SkeletonTextProps,
  SkeletonRectProps,
  SkeletonCircleProps
} from '.'

const meta: Meta<{
  fontSize: number
}> = {
  title: 'Skeleton',
  argTypes: {
    fontSize: {
      control: 'number'
    }
  },
  decorators: [
    (Component, { args }) => (
      <div className="bg-purple-400" style={{ fontSize: args.fontSize }}>
        <Component />
      </div>
    )
  ]
}

export default meta

export const SingleLineText: StoryObj<SkeletonTextProps> = {
  render: props => <SkeletonText {...props} />,
  args: {
    count: 1
  }
}

export const MultiLineText: StoryObj<SkeletonTextProps> = {
  render: props => <SkeletonText {...props} />,
  args: {
    count: 3
  }
}

export const Rect: StoryObj<SkeletonRectProps> = {
  render: props => <SkeletonRect {...props} />,
  args: {
    width: 200,
    height: 100
  }
}
export const Circle: StoryObj<SkeletonCircleProps> = {
  render: props => <SkeletonCircle {...props} />,
  args: {
    size: 200
  }
}
