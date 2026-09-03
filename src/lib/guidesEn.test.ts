import { describe, expect, it } from "vitest"
import { guidesEn, publishedGuidesEn } from "./guidesEn"

describe("publishedGuidesEn", () => {
  it("excludes guides dated in the future", () => {
    const slugs = publishedGuidesEn("2026-01-01").map((g) => g.slug)
    expect(slugs).toEqual([])
  })

  it("includes a guide on the exact day it publishes", () => {
    const earliest = guidesEn.reduce((a, b) => (a.datePublished <= b.datePublished ? a : b))
    const slugs = publishedGuidesEn(earliest.datePublished).map((g) => g.slug)
    expect(slugs).toContain(earliest.slug)
  })

  it("never leaks an unpublished guide to any caller", () => {
    const today = "2026-09-03"
    for (const g of publishedGuidesEn(today)) {
      expect(g.datePublished <= today).toBe(true)
    }
  })
})
