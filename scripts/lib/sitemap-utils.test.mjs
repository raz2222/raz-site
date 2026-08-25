import { describe, expect, it } from "vitest"
import { buildSitemapXml, dedupeUrls } from "./sitemap-utils.mjs"

describe("buildSitemapXml", () => {
  it("produces a valid urlset with loc, changefreq, and priority", () => {
    const xml = buildSitemapXml([
      { loc: "https://madebyraz.co.il/", changefreq: "weekly", priority: 1 },
      { loc: "https://madebyraz.co.il/work/foo", priority: 0.7 },
    ])
    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>')
    expect(xml).toContain("<urlset")
    expect(xml).toContain("<loc>https://madebyraz.co.il/</loc>")
    expect(xml).toContain("<changefreq>weekly</changefreq>")
    expect(xml).toContain("<priority>1.0</priority>")
    expect(xml).toContain("<loc>https://madebyraz.co.il/work/foo</loc>")
  })

  it("omits changefreq/priority when not given", () => {
    const xml = buildSitemapXml([{ loc: "https://madebyraz.co.il/x" }])
    expect(xml).not.toContain("changefreq")
    expect(xml).not.toContain("priority")
  })

  it("escapes special XML characters in the loc", () => {
    const xml = buildSitemapXml([{ loc: "https://madebyraz.co.il/guides/a&b" }])
    expect(xml).toContain("a&amp;b")
    expect(xml).not.toContain("a&b<")
  })
})

describe("dedupeUrls", () => {
  it("drops entries with a missing loc", () => {
    const urls = dedupeUrls([{ loc: "https://x/1" }, { loc: "" }, { loc: undefined }])
    expect(urls).toEqual([{ loc: "https://x/1" }])
  })

  it("keeps the last entry when the same loc appears twice", () => {
    const urls = dedupeUrls([
      { loc: "https://x/1", priority: 0.5 },
      { loc: "https://x/1", priority: 0.9 },
    ])
    expect(urls).toEqual([{ loc: "https://x/1", priority: 0.9 }])
  })
})
