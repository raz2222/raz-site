import path from "node:path"
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      // show.html is a second HTML shell for show.madebyraz.co.il — same
      // React app/entry as index.html, only the <head> (title/meta/OG,
      // English + noindex) differs, so that link-preview bots on Slack/
      // Twitter/etc. (which read the static HTML, not the client-side
      // useDocumentMeta mutations) see the showcase's own identity instead
      // of the main site's Hebrew branding.
      input: {
        main: path.resolve(import.meta.dirname, "index.html"),
        show: path.resolve(import.meta.dirname, "show.html"),
      },
    },
  },
  test: {
    environment: "node",
    // Supabase's client just needs a well-formed URL/key to construct; no
    // network call happens at import time or during SSR (data fetching only
    // runs inside useEffect, which never executes in renderToString).
    env: {
      VITE_SUPABASE_URL: "https://example.supabase.co",
      VITE_SUPABASE_ANON_KEY: "test-anon-key",
    },
  },
})
