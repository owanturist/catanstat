import type { Meta, StoryObj } from '@storybook/react'
import { within, userEvent, fireEvent } from '@storybook/testing-library'
import { expect } from '@storybook/jest'

import StartGame, { StartGameProps } from './StartGame'
import { State } from './domain'

const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

const meta: Meta = {
  title: 'StartGame',
  component: StartGame
}

export default meta

export const Initial: StoryObj<StartGameProps> = {
  args: {
    state: State.init()
  },
  play: async ({ canvasElement }) => {
    await sleep(1)

    const canvas = within(canvasElement)

    const [red, blue] = canvas.getAllByTestId('start-game-player-name')

    userEvent.clear(red!)
    await userEvent.type(red!, 'Anton', { delay: 50 })
    expect(red).toHaveValue('Anton')

    userEvent.clear(blue!)
    await userEvent.type(blue!, 'Artem', { delay: 50 })
    expect(blue).toHaveValue('Artem')

    const [, , white, yellow, green, brown] = canvas.getAllByTestId(
      'start-game-player-color'
    )

    userEvent.click(white!)
    userEvent.click(yellow!)
    userEvent.click(green!)
    userEvent.click(brown!)

    const [redDragHandle] = canvas.getAllByTestId(
      'start-game-player-drag-handle'
    )

    await drag(redDragHandle!, { delta: { y: 150 } })
  }
}

const state_SomeDeselected = State.init()

state_SomeDeselected.players.getValue().at(0)?.isActive.setValue(false)
state_SomeDeselected.players.getValue().at(3)?.isActive.setValue(false)

export const SomeDeselected: StoryObj<StartGameProps> = {
  args: {
    state: state_SomeDeselected
  }
}

interface Vector {
  x: number
  y: number
}

const getElementClientCenter = (element: Element): Vector => {
  const { left, top, width, height } = element.getBoundingClientRect()

  return {
    x: left + width / 2,
    y: top + height / 2
  }
}

async function drag(
  element: Element,
  {
    delta,
    duration = 500,
    steps = duration / 50
  }: {
    delta: Partial<Vector>
    steps?: number
    duration?: number
  }
): Promise<void> {
  const from = getElementClientCenter(element)
  const to = {
    x: from.x + (delta.x ?? 0),
    y: from.y + (delta.y ?? 0)
  }

  const step = {
    x: (to.x - from.x) / steps,
    y: (to.y - from.y) / steps
  }

  const current = {
    clientX: from.x,
    clientY: from.y
  }

  fireEvent.mouseEnter(element, current)
  fireEvent.mouseOver(element, current)
  fireEvent.mouseMove(element, current)
  fireEvent.mouseDown(element, current)

  for (let i = 0; i < steps; i++) {
    current.clientX += step.x
    current.clientY += step.y
    await sleep(duration / steps)
    fireEvent.mouseMove(element, current)
  }
  fireEvent.mouseUp(element, current)
  fireEvent.mouseLeave(element, current)
}
