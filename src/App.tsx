import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from 'react-query'
import { Toaster } from 'react-hot-toast'
import { InnerStore } from 'react-inner-store'

import * as StartGame from './StartGame'

const queryClient = new QueryClient()

const LazyComponent = <TProps,>({
  init,
  component
}: {
  init(): TProps
  component: React.FC<TProps>
}): React.ReactElement => {
  const propsRef = React.useRef<TProps>()

  if (propsRef.current == null) {
    propsRef.current = init()
  }

  return React.createElement(component, propsRef.current)
}

export const App: React.VFC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Routes>
        <Route path="/" element={<div>TODO home screen</div>} />
        <Route
          path="/start"
          element={
            <LazyComponent
              init={() => ({
                store: InnerStore.of(StartGame.State.init())
              })}
              component={StartGame.View}
            />
          }
        />
        <Route path="/game" element={<div>TODO game</div>} />
        <Route path="*" element={<div>TODO 404</div>} />
      </Routes>

      <Toaster position="top-right" />
    </QueryClientProvider>
  )
}
