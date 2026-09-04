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

  /**
   * The prerender step only emits /tutorials once a tutorial exists. Listing it
   * here as well pointed the sitemap at a route with no prerendered HTML, so
   * Google fetched an empty shell and had thin content handed to it. The index
   * is added alongside the guide rows instead, on the day it has one.
   */
  it("leaves /tutorials out until a tutorial is published", () => {
    expect(STATIC_URLS.map((u) => u.loc)).not.toContain("https://madebyraz.co.il/tutorials")
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
