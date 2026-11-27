// Build-time renderer for the public pages, used by scripts/route-pages.mjs.
// Keep the provider tree the same as src/main.jsx so the browser can reuse
// the HTML instead of rebuilding it.
import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { InitialDataContext } from './lib/initialData.js'

/**
 * Renders the app for one URL to an HTML string.
 *
 * @param {string} url - path to render, e.g. '/catalog'
 * @param {object} [initialData] - data the page starts from (see initialData.js)
 */
// eslint-disable-next-line react/only-export-components -- build script, not a component module
export function render(url, initialData = {}) {
  return renderToString(
    <StrictMode>
      <InitialDataContext value={initialData}>
        <StaticRouter location={url}>
          <AuthProvider>
            <App />
          </AuthProvider>
        </StaticRouter>
      </InitialDataContext>
    </StrictMode>,
  )
}
