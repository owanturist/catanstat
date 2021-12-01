import React from 'react'

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
    <div className="bg-gray-200 p-3">
      <h1>Hello World {count}</h1>
    </div>
  )
}
