import { describe, expect, it } from "vitest"
import { englishGuideUrls, STATIC_URLS } from "./generate-sitemap.mjs"

describe("generate-sitemap STATIC_URLS", () => {
  it("has no duplicate locs", () => {
    const locs = STATIC_URLS.map((u) => u.loc)
    expect(new Set(locs).size).toBe(locs.length)
  })

  it("only lists https://madebyraz.co.il URLs", () => {
    for (const u of STATIC_URLS) {
      expect(u.loc.startsWith("https://madebyraz.co.il")).toBe(true)
    }
  })

  it("includes the homepage with priority 1.0", () => {
    const home = STATIC_URLS.find((u) => u.loc === "https://madebyraz.co.il/")
    expect(home?.priority).toBe(1.0)
  })
})

describe("englishGuideUrls", () => {
  const guidesEn = [{ slug: "live-one" }, { slug: "scheduled-one" }]

  it("only lists mirrors whose Hebrew original is published", () => {
    const urls = englishGuideUrls(guidesEn, new Set(["live-one"]))
    expect(urls.map((u) => u.loc)).toEqual(["https://madebyraz.co.il/en/guides/live-one"])
  })

  it("lists nothing when no Hebrew guide is published yet", () => {
    expect(englishGuideUrls(guidesEn, new Set())).toEqual([])
  })
})
