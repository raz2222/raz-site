import { describe, expect, it } from "vitest"
import { STATIC_URLS } from "./generate-sitemap.mjs"

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
