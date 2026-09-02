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
      // show.html and ai.html are extra HTML shells for the show. and ai.
      // subdomains — same React app/entry as index.html, only the <head>
      // (title/meta/OG/canonical) differs, so that link-preview bots on
      // WhatsApp/Slack/Facebook/etc. (which read the static HTML, not the
      // client-side useDocumentMeta mutations) see each subdomain's own
      // identity instead of the main site's homepage branding.
      input: {
        main: path.resolve(import.meta.dirname, "index.html"),
        show: path.resolve(import.meta.dirname, "show.html"),
        ai: path.resolve(import.meta.dirname, "ai.html"),
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
