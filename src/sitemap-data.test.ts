import { describe, expect, it } from "vitest"
import { guidesEn, SUB_SERVICES_EN } from "./sitemap-data"

describe("sitemap-data re-exports (used by scripts/generate-sitemap.mjs)", () => {
  it("exposes the English guides list with slugs", () => {
    expect(guidesEn.length).toBeGreaterThan(0)
    for (const g of guidesEn) {
      expect(typeof g.slug).toBe("string")
      expect(g.slug.length).toBeGreaterThan(0)
    }
  })

  it("exposes the English sub-services list with slug + hubSlug", () => {
    expect(SUB_SERVICES_EN.length).toBeGreaterThan(0)
    for (const s of SUB_SERVICES_EN) {
      expect(typeof s.slug).toBe("string")
      expect(["web-design", "ai-content"]).toContain(s.hubSlug)
    }
  })
})
