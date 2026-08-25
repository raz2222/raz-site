// Re-exports the static English content lists so scripts/generate-sitemap.mjs
// (plain Node, can't import .ts directly) can read them via a small Vite SSR
// build, the same way src/entry-server.tsx is built for prerendering.
export { guidesEn } from "./lib/guidesEn"
export { SUB_SERVICES_EN } from "./lib/servicesEn"
