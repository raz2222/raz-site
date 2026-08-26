// Regression guard for the "agent-friendly 404s" fix: vercel.json now
// whitelists every real app route instead of blanket-rewriting everything to
// /index.html. If a new <Route path="..."> is added to src/App.tsx without a
// matching vercel.json rewrite, this test fails loudly instead of the route
// silently 404ing in production.
import { describe, expect, it } from "vitest"
import { readFile } from "node:fs/promises"
import path from "node:path"
import { KNOWN_ROUTE_PATTERNS } from "../src/lib/known-routes.ts"

const root = path.resolve(import.meta.dirname, "..")

async function readAppRoutePaths() {
  const appSource = await readFile(path.join(root, "src/App.tsx"), "utf-8")
  const matches = [...appSource.matchAll(/<Route\s+path="([^"]+)"/g)].map((m) => m[1])
  // "*" is the client-side NotFound fallback, not a real page to whitelist.
  return matches.filter((p) => p !== "*")
}

async function readVercelConfig() {
  const raw = await readFile(path.join(root, "vercel.json"), "utf-8")
  return JSON.parse(raw)
}

describe("vercel.json route rewrites stay in sync with src/App.tsx", () => {
  it("has a rewrite destination for every <Route path> in App.tsx", async () => {
    const appPaths = await readAppRoutePaths()
    const config = await readVercelConfig()
    const rewriteSources = new Set(config.rewrites.map((r) => r.source))

    const missing = appPaths.filter((p) => !rewriteSources.has(p))
    expect(missing, `Routes missing from vercel.json rewrites: ${missing.join(", ")}`).toEqual([])
  })

  it("does not blanket-rewrite every path to index.html anymore (the soft-404 bug)", async () => {
    const config = await readVercelConfig()
    const catchAll = config.rewrites.find(
      (r) => (r.source === "/(.*)" || r.source === "/:path*") && !r.has
    )
    expect(catchAll, "found an unconditional catch-all rewrite, which reintroduces soft 404s").toBeUndefined()
  })

  it("still passes every path through for the web./ai. subdomains, keyed by host", async () => {
    const config = await readVercelConfig()
    for (const host of ["web.madebyraz.co.il", "ai.madebyraz.co.il"]) {
      const rule = config.rewrites.find((r) => r.has?.some((h) => h.type === "host" && h.value === host))
      expect(rule, `missing subdomain passthrough rewrite for ${host}`).toBeTruthy()
      expect(rule.destination).toBe("/index.html")
    }
  })

  it("permanently redirects www.madebyraz.co.il to the apex domain, path preserved (avoids duplicate-content indexing)", async () => {
    const config = await readVercelConfig()
    const rule = config.redirects.find((r) => r.has?.some((h) => h.type === "host" && h.value === "www.madebyraz.co.il"))
    expect(rule, "missing www -> apex redirect").toBeTruthy()
    expect(rule.permanent).toBe(true)
    expect(rule.destination).toBe("https://madebyraz.co.il/$1")
    // Regression guard: an earlier version of this rule used the named-param
    // wildcard "/:path*", which Vercel's own docs never use for a "match
    // literally everything, including the bare root" pattern (only "/(.*)"
    // is used for that) — every :path*/:match* example in their docs has a
    // fixed prefix before the wildcard. That mismatch meant www.madebyraz.co.il
    // redirected correctly for every sub-path but silently failed to redirect
    // "/" itself, so the homepage served unstyled directly from the www host
    // (relative asset URLs cross-origin-redirected to the apex, which broke
    // the stylesheet load) while every other page worked fine — reported
    // directly against production. Assert the fixed regex-style pattern
    // matches the bare root the way Vercel's path-to-regexp implementation
    // actually requires.
    expect(rule.source).toBe("/(.*)")
    // Vercel compiles a regex-style source like this directly as an anchored
    // regular expression (not through the named-param path-to-regexp
    // compiler used elsewhere in this file/known-routes.ts, which rejects
    // raw capture groups like "(.*)" outright) — so verify it the same way.
    const pattern = new RegExp(`^${rule.source}$`)
    expect(pattern.test("/"), "www -> apex redirect must match the bare root path").toBe(true)
    expect(pattern.test("/guides/some-slug")).toBe(true)
  })

  it("has a styled public/404.html fail-safe (middleware.ts is the primary 404 handler) with links to sitemap/llms.txt/guides", async () => {
    const notFound = await readFile(path.join(root, "public/404.html"), "utf-8")
    expect(notFound).toContain("<!doctype html>")
    expect(notFound).toContain("sitemap.xml")
    expect(notFound).toContain("llms.txt")
  })

  it("src/lib/known-routes.ts's whitelist matches vercel.json's rewrite sources exactly", async () => {
    // middleware.ts's 404 handling and vercel.json's rewrites must agree on
    // what's a real route, or a path could 200 via one and 404 via the
    // other depending on which layer resolves it first.
    const config = await readVercelConfig()
    const vercelSources = new Set(config.rewrites.filter((r) => !r.has).map((r) => r.source))
    const knownRoutes = new Set(KNOWN_ROUTE_PATTERNS)

    const missingFromKnownRoutes = [...vercelSources].filter((s) => !knownRoutes.has(s))
    const missingFromVercel = [...knownRoutes].filter((s) => !vercelSources.has(s))
    expect(missingFromKnownRoutes, "in vercel.json but not known-routes.ts").toEqual([])
    expect(missingFromVercel, "in known-routes.ts but not vercel.json").toEqual([])
  })
})

describe("markdown content negotiation config", () => {
  it("declares Vary: Accept on both the / and /index.md responses", async () => {
    const config = await readVercelConfig()
    for (const source of ["/", "/index.md"]) {
      const rule = config.headers.find((h) => h.source === source)
      const vary = rule?.headers.find((h) => h.key === "Vary")?.value ?? ""
      expect(vary, `missing Vary: Accept on ${source}`).toContain("Accept")
    }
  })

  it("serves /index.md as text/markdown", async () => {
    const config = await readVercelConfig()
    const rule = config.headers.find((h) => h.source === "/index.md")
    const contentType = rule?.headers.find((h) => h.key === "Content-Type")?.value ?? ""
    expect(contentType).toContain("text/markdown")
  })

  it("no longer relies on a vercel.json rewrite 'has' condition for markdown negotiation (middleware.ts owns it now)", async () => {
    const config = await readVercelConfig()
    const staleRule = config.rewrites.find((r) => r.source === "/" && r.has?.some((h) => h.key === "accept"))
    expect(staleRule, "found a leftover Accept-header rewrite rule in vercel.json").toBeUndefined()
  })
})
