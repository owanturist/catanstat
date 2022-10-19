import type { Meta, StoryObj } from '@storybook/react'
import { Sweety } from 'react-sweety'

import StartGame from './StartGame'
import { State } from './domain'

const meta: Meta = {
  title: 'StartGame',
  component: StartGame
}

export default meta

export const Initial: StoryObj = {
  args: {
    store: Sweety.of(State.init())
  }
}

export const SomeDeselected: StoryObj = {
  args: {
    store: Sweety.of(State.init()).clone(state => {
      state.players[0]?.isActive.setState(false)
      state.players[3]?.isActive.setState(false)

      return state
    })
  }
}
