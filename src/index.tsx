import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

import { App } from './App'

// React.StrictMode is gone due to beautiful-dnd incompatibility
// https://github.com/atlassian/react-beautiful-dnd/issues/2407#issuecomment-1137221247
createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
)
