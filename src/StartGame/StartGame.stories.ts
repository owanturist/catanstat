import type { Meta, StoryObj } from '@storybook/react'

import { StartGame, StartGameProps } from './StartGame'
import { State } from './domain'

const meta: Meta = {
  title: 'StartGame',
  component: StartGame
}

export default meta

export const Initial: StoryObj<StartGameProps> = {
  args: {
    state: State.init()
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
