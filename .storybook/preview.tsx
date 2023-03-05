import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClientProvider, QueryClient } from 'react-query'

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/
    }
  }
}

const queryCache = new QueryClient()

export const decorators = [
  (Story: React.FC) => (
    <QueryClientProvider client={queryCache}>
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    </QueryClientProvider>
  )
]
