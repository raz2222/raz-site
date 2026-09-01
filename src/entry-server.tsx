import { StrictMode } from "react"
import { renderToString } from "react-dom/server"
import { renderToReadableStream } from "react-dom/server.edge"
import { StaticRouter } from "react-router-dom"
import App from "./App"
import { SsrDataContext, type SsrData } from "./lib/ssrData"
import { resolveRouteMeta, type RouteMeta } from "./lib/routeMeta"

// Used only at build time (scripts/prerender.mjs) to produce a static HTML
// snapshot of a route for crawlers that don't execute JavaScript. The client
// still renders normally via src/main.tsx's createRoot(...).render(...),
// which replaces this markup — so runtime behavior is unaffected.
//
// `data` carries content pre-fetched from Supabase by the build script.
// Without it, every content page would server-render its loading state,
// because React does not run effects during renderToString.
function tree(url: string, data: SsrData) {
  return (
    <StrictMode>
      <SsrDataContext.Provider value={data}>
        <StaticRouter location={url}>
          <App />
        </StaticRouter>
      </SsrDataContext.Provider>
    </StrictMode>
  )
}

export function render(url: string, data: SsrData = {}) {
  return renderToString(tree(url, data))
}

/**
 * Renders a route, waiting for React.lazy page chunks to resolve.
 *
 * Every page except Home is lazy-loaded in App.tsx, and renderToString emits
 * Suspense fallbacks instead of waiting — it would return an empty document
 * for all of them. renderToPipeableStream's onAllReady fires only once every
 * boundary has resolved, which is what a static snapshot needs.
 */
export async function renderAsync(url: string, data: SsrData = {}): Promise<string> {
  const stream = await renderToReadableStream(tree(url, data))
  // Resolves once every Suspense boundary (i.e. every lazy page chunk) has
  // settled, so the snapshot holds the finished page rather than fallbacks.
  await stream.allReady
  return await new Response(stream).text()
}

// Re-exported so scripts/prerender.mjs gets the route list from the same SSR
// bundle instead of running a second Vite build for it.
export { listPrerenderRoutes } from "./lib/prerenderRoutes"

export type RenderedPage = { html: string; meta: RouteMeta | null }

/** Renders a route and resolves the <head> tags the build script should apply. */
export async function renderPage(url: string, data: SsrData = {}): Promise<RenderedPage> {
  return { html: await renderAsync(url, data), meta: resolveRouteMeta(url, data) }
}
