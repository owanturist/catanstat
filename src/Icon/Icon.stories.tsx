import React from 'react'
import type { StoryFn } from '@storybook/react'

import * as Icons from './index'

export default {}

export const AllIcons: StoryFn<{
  color: string
  size: number
}> = ({ color, size }) => {
  const [query, setQuery] = React.useState('')
  const icons = React.useMemo(() => {
    if (query === '') {
      return Object.entries(Icons)
    }

    return Object.entries(Icons).filter(([name]) =>
      name.toLocaleLowerCase().includes(query.toLocaleLowerCase())
    )
  }, [query])

  return (
    <div className="space-y-2">
      <input
        className="border rounded px-2 py-1 focus-within:ring outline-none"
        type="search"
        placeholder="filter the icons"
        value={query}
        onChange={event => setQuery(event.target.value)}
      />

      {icons.length > 0 ? (
        <div className="flex flex-row flex-wrap gap-3">
          {icons.map(([name, Icon]) => (
            <div key={name} className="border rounded">
              <div className="p-2">
                <Icon className="mx-auto" style={{ color, fontSize: size }} />
              </div>
              <div className="border-t py-1 px-2 text-center bg-gray-50">
                {name}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div>No icons found</div>
      )}
    </div>
  )
}

AllIcons.args = {
  color: '#444',
  size: 64
}
