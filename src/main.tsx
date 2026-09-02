import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { initAnalytics } from './lib/analytics'
import { captureAttribution } from './lib/attribution'
import { getStoredConsent } from './lib/consent'

// Runs before the consent check on purpose: this reads the URL the visitor arrived on and
// keeps it in sessionStorage for the contact form. It is not tracking and sends nothing.
captureAttribution()

if (getStoredConsent() === "granted") initAnalytics()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
