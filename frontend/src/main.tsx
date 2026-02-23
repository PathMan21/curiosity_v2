import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { FontSizeProvider } from './helpers/ChangeStyle'

const container = document.getElementById('root')!
const root = createRoot(container)
root.render(
  <React.StrictMode>
    <FontSizeProvider>

    <App />
    </FontSizeProvider>
  </React.StrictMode>
)
