import type { StorybookConfig } from '@storybook/react-vite'

export default <StorybookConfig>{
  stories: ['../src/**/*.stories.mdx', '../src/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-essentials', '@storybook/addon-interactions'],
  framework: '@storybook/react-vite',
  features: {
    interactionsDebugger: true
  }
}
