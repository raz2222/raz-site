import { StrictMode } from "react"
import { renderToString } from "react-dom/server"
import { StaticRouter } from "react-router-dom"
import App from "./App"

// Used only at build time (scripts/prerender.mjs) to produce a static HTML
// snapshot of a route for crawlers that don't execute JavaScript. The client
// still hydrates normally via src/main.tsx's createRoot(...).render(...),
// which replaces this markup — so runtime behavior is unaffected.
export function render(url: string) {
  return renderToString(
    <StrictMode>
      <StaticRouter location={url}>
        <App />
      </StaticRouter>
    </StrictMode>
  )
}
