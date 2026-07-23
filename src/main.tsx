import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { useKeyboardCapture } from './useKeyboardCapture'

function Root() {
  const active = (window as any).__arcadeEmuEmulatorActive === true
  useKeyboardCapture(active)
  return <App />
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
