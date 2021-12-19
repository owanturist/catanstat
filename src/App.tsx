import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from 'react-query'
import { Toaster } from 'react-hot-toast'
import { InnerStore } from 'react-inner-store'

import { Shell } from './Shell'
import * as StartGame from './StartGame'
import * as GameRoom from './GameRoom'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      retryOnMount: true
    }
  }
})

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

export const App: React.VFC = () => (
  <QueryClientProvider client={queryClient}>
    <Routes>
      <Route element={<Shell />}>
        <Route index element={<div>TODO home screen</div>} />

        <Route
          path="start"
          element={
            <LazyComponent
              init={() => ({
                store: InnerStore.of(StartGame.State.init())
              })}
              component={StartGame.View}
            />
          }
        />

        <Route path="game/:gameId">
          <Route
            index
            element={
              <LazyComponent
                init={() => ({
                  store: InnerStore.of(GameRoom.State.init())
                })}
                component={GameRoom.View}
              />
            }
          />

          <Route path="stat" element={<div>TODO game stat</div>} />
          <Route path="history" element={<div>TODO game history</div>} />
        </Route>
      </Route>

      <Route path="*" element={<div>TODO 404</div>} />
    </Routes>

    <Toaster position="top-right" />
  </QueryClientProvider>
)
