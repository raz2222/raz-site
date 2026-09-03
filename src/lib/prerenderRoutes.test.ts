import { describe, expect, it } from "vitest"
import { listPrerenderRoutes } from "./prerenderRoutes"
import type { SsrData } from "./ssrData"

const data = {
  guides: [{ slug: "example-guide" }],
  subServices: [{ slug: "product-videos", hub_slug: "ai-content" }],
  serviceHubs: [{ slug: "ai-content" }],
  faqGroups: [{ id: "1" }],
  projects: [{ slug: "second-skin" }],
} as unknown as SsrData

describe("listPrerenderRoutes", () => {
  it("always includes routes whose content is static in the bundle", () => {
    const routes = listPrerenderRoutes({})
    expect(routes).toContain("/about")
    expect(routes).toContain("/contact")
    expect(routes).toContain("/en")
    expect(routes).toContain("/en/services")
    expect(routes).toContain("/en/guides/website-cost-guide-2026")
  })

  // Prerendering these without their data would ship a page that is empty
  // apart from nav chrome, under a real title — worse than not prerendering.
  it("omits Supabase-backed routes when the data was not fetched", () => {
    const routes = listPrerenderRoutes({})
    expect(routes).not.toContain("/guides")
    expect(routes).not.toContain("/work")
    expect(routes).not.toContain("/services")
    expect(routes).not.toContain("/faq")
    expect(routes.some((r) => r.startsWith("/guides/"))).toBe(false)
    // /work/serve is the one case study that is its own page with bundled
    // copy, so it prerenders with or without Supabase. Every other project
    // page comes from a row and must stay out.
    expect(routes.filter((r) => r.startsWith("/work/"))).toEqual(["/work/serve"])
  })

  it("includes Supabase-backed routes once the data is present", () => {
    const routes = listPrerenderRoutes(data)
    expect(routes).toContain("/guides")
    expect(routes).toContain("/guides/example-guide")
    expect(routes).toContain("/work")
    expect(routes).toContain("/work/second-skin")
    expect(routes).toContain("/en/work/second-skin")
    expect(routes).toContain("/services")
    expect(routes).toContain("/services/ai-content")
    expect(routes).toContain("/services/ai-content/product-videos")
    expect(routes).toContain("/faq")
  })

  it("never includes the homepage, private, or noindex routes", () => {
    const routes = listPrerenderRoutes(data)
    expect(routes).not.toContain("/")
    expect(routes).not.toContain("/gift")
    expect(routes).not.toContain("/thank-you")
    expect(routes.some((r) => r.startsWith("/admin"))).toBe(false)
    expect(routes.some((r) => r.startsWith("/portal"))).toBe(false)
  })

  it("returns no duplicates", () => {
    const routes = listPrerenderRoutes(data)
    expect(routes.length).toBe(new Set(routes).size)
  })
})
