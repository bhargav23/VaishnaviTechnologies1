import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import '@fontsource-variable/inter/wght.css'
import '@fontsource/inter-tight/latin-600.css'
import '@fontsource/inter-tight/latin-700.css'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { initAnalytics } from './lib/analytics.js'
import { InitialDataContext, readInitialData } from './lib/initialData.js'

initAnalytics()

const container = document.getElementById('root')
const app = (
  <StrictMode>
    <InitialDataContext value={readInitialData()}>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </InitialDataContext>
  </StrictMode>
)

// Ad and campaign tags don't change what a page shows.
const TRACKING_PARAM = /^(utm_|gclid$|gbraid$|wbraid$|fbclid$|msclkid$)/

// Public pages arrive prerendered (scripts/route-pages.mjs). Reuse that HTML
// when it was rendered for exactly this page; otherwise (e.g. /inquire?degree=phd,
// which pre-selects a degree) render from scratch, which replaces it.
function canHydrate() {
  const { pathname, search } = window.location
  const params = [...new URLSearchParams(search).keys()]
  return (
    container.dataset.prerenderedPath === pathname &&
    params.every((name) => TRACKING_PARAM.test(name))
  )
}

if (canHydrate()) {
  hydrateRoot(container, app)
} else {
  createRoot(container).render(app)
}
