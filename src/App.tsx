import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from 'react-query'
import { Toaster } from 'react-hot-toast'
import { InnerStore } from 'react-inner-store'

import { Shell } from './Shell'
import * as StartGame from './StartGame'
import * as GameRoom from './GameRoom'
import { GameList } from './GamesList'
import { GameHistory } from './GameHistory'
import { GameStat } from './GameStat'

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
      <Route path="*" element={<Shell />}>
        <Route index element={<GameList />} />

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

          <Route path="stat" element={<GameStat />} />
          <Route path="history" element={<GameHistory />} />
        </Route>

        <Route path="*" element={<div>TODO 404</div>} />
      </Route>
    </Routes>

    <Toaster position="bottom-center" />
  </QueryClientProvider>
)
