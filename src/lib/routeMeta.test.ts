import { describe, expect, it } from "vitest"
import { resolveRouteMeta } from "./routeMeta"
import type { SsrData } from "./ssrData"

// Minimal row shapes — only the fields resolveRouteMeta reads.
const data = {
  guides: [{ slug: "example-guide", title: "מדריך לדוגמה", excerpt: "תקציר המדריך." }],
  subServices: [{ slug: "product-videos", hub_slug: "ai-content", title: "סרטוני מוצר", tagline: "תקציר השירות." }],
  serviceHubs: [{ slug: "ai-content", title: "יצירת תוכן ב-AI", hero_description: "תיאור ה-hub." }],
  projects: [{ slug: "second-skin", title: "Second Skin", overview: "סקירת הפרויקט." }],
} as unknown as SsrData

describe("resolveRouteMeta", () => {
  it("resolves a Hebrew static route with its own title and hreflang pair", () => {
    const meta = resolveRouteMeta("/about", data)
    // Asserting the exact marketing copy made this test fail every time a title
    // was rewritten, which is the opposite of useful. What has to hold is that
    // the route resolves a real title of its own and the rest of the envelope
    // is right.
    expect(meta?.title).toBeTruthy()
    expect(meta?.canonical).toBe("https://madebyraz.co.il/about")
    expect(meta?.lang).toBe("he")
    expect(meta?.dir).toBe("rtl")
    expect(meta?.alternates).toEqual({ he: "/about", en: "/en/about" })
  })

  it("marks English routes as ltr/en", () => {
    const meta = resolveRouteMeta("/en/about", data)
    expect(meta?.title).toBeTruthy()
    expect(meta?.title).not.toBe(resolveRouteMeta("/about", data)?.title)
    expect(meta?.lang).toBe("en")
    expect(meta?.dir).toBe("ltr")
  })

  it("gives every static route a title no other static route shares", () => {
    // Two pages under the same title compete for the same result and Google
    // picks one. /experiments and /en/experiments were both "AI Creative · RAZ".
    const paths = ["/", "/work", "/services", "/about", "/contact", "/guides", "/tutorials",
                   "/experiments", "/tools", "/ai-creative", "/web-development",
                   "/en", "/en/work", "/en/services", "/en/about", "/en/contact", "/en/experiments"]
    const titles = paths.map((p) => resolveRouteMeta(p, data)?.title).filter(Boolean)
    expect(new Set(titles).size).toBe(titles.length)
  })

  it("builds a Hebrew guide's metadata from the fetched row", () => {
    const meta = resolveRouteMeta("/guides/example-guide", data)
    expect(meta?.title).toBe("מדריך לדוגמה · RAZ")
    expect(meta?.description).toBe("תקציר המדריך.")
    expect(meta?.alternates).toEqual({ he: "/guides/example-guide", en: "/en/guides/example-guide" })
  })

  it("builds an English guide's metadata from the bundled static content", () => {
    // guidesEn ships in the bundle, so this resolves without any fetched data.
    const meta = resolveRouteMeta("/en/guides/website-cost-guide-2026", {})
    expect(meta?.title).toContain("· RAZ")
    expect(meta?.lang).toBe("en")
    expect(meta?.description).toBeTruthy()
  })

  it("builds sub-service and hub metadata from the fetched rows", () => {
    expect(resolveRouteMeta("/services/ai-content", data)?.title).toBe("יצירת תוכן ב-AI · RAZ")
    expect(resolveRouteMeta("/services/ai-content/product-videos", data)?.title).toBe("סרטוני מוצר · RAZ")
    expect(resolveRouteMeta("/services/ai-content/product-videos", data)?.description).toBe("תקציר השירות.")
  })

  it("builds case study metadata from the fetched project", () => {
    const meta = resolveRouteMeta("/work/second-skin", data)
    expect(meta?.title).toBe("Second Skin · RAZ")
    expect(meta?.description).toBe("סקירת הפרויקט.")
  })

  // The build script skips routes with null metadata rather than writing a
  // page under the homepage's title — this is what makes that safe.
  it("returns null when the content for a dynamic route is missing", () => {
    expect(resolveRouteMeta("/guides/does-not-exist", data)).toBeNull()
    expect(resolveRouteMeta("/guides/example-guide", {})).toBeNull()
    expect(resolveRouteMeta("/work/nope", data)).toBeNull()
  })

  it("returns null for unknown and private routes", () => {
    expect(resolveRouteMeta("/admin", data)).toBeNull()
    expect(resolveRouteMeta("/portal/quote/123", data)).toBeNull()
    expect(resolveRouteMeta("/nonsense", data)).toBeNull()
  })
})
