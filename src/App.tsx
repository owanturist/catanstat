import React from 'react'
import { Routes, Route, Outlet } from 'react-router-dom'

const Template: React.VFC = () => (
  <div>
    <h1>Template</h1>
    <Outlet />
  </div>
)

export const App: React.VFC = () => {
  const [count, setCount] = React.useState(0)

  React.useEffect(() => {
    const intervalId = setInterval(() => {
      setCount(x => x + 1)
    }, 1000)

    return () => {
      clearInterval(intervalId)
    }
  }, [])

  return (
    <div className="bg-gray-200 p-3 text-red-500">
      <h1>Hello World {count}</h1>
      <Routes>
        <Route element={<Template />}>
          <Route index element={<div>Home</div>} />
          <Route path="about" element={<div>About</div>} />
        </Route>
      </Routes>
    </div>
  )
}
