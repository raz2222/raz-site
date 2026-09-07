import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { syncStoredConsent } from './lib/analytics'

// The tag itself is already running (index.html); this just re-applies a stored choice.
syncStoredConsent()

// Reaching this line means the bundle loaded, so the stale-build guard in
// index.html has done its job and must be cleared · otherwise it would sit in
// this tab forever and the next deploy would get a black screen with no reload.
try {
  sessionStorage.removeItem('raz-stale-build')
} catch {
  // Private mode, or a browser with storage blocked. Nothing to clear.
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
