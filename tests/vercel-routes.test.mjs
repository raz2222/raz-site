// Regression guard for the "agent-friendly 404s" fix: vercel.json now
// whitelists every real app route instead of blanket-rewriting everything to
// /index.html. If a new <Route path="..."> is added to src/App.tsx without a
// matching vercel.json rewrite, this test fails loudly instead of the route
// silently 404ing in production.
import { describe, expect, it } from "vitest"
import { readFile } from "node:fs/promises"
import path from "node:path"

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

  it("has a public/404.html so unmatched paths get a real 404 status", async () => {
    const notFoundHtml = await readFile(path.join(root, "public/404.html"), "utf-8")
    expect(notFoundHtml).toContain("sitemap.xml")
    expect(notFoundHtml).toContain("llms.txt")
  })
})

describe("markdown content negotiation config", () => {
  it("rewrites Accept: text/markdown requests for / to /index.md, before the plain html rewrite", async () => {
    const config = await readVercelConfig()
    const mdRuleIndex = config.rewrites.findIndex(
      (r) => r.source === "/" && r.has?.some((h) => h.key === "accept")
    )
    const htmlRuleIndex = config.rewrites.findIndex((r) => r.source === "/" && !r.has)
    expect(mdRuleIndex).toBeGreaterThanOrEqual(0)
    expect(htmlRuleIndex).toBeGreaterThanOrEqual(0)
    expect(mdRuleIndex).toBeLessThan(htmlRuleIndex)
  })

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
})
