import { describe, expect, it } from "vitest"
import { isKnownRoute } from "./known-routes"

describe("isKnownRoute", () => {
  it("matches static routes", () => {
    expect(isKnownRoute("/")).toBe(true)
    expect(isKnownRoute("/about")).toBe(true)
    expect(isKnownRoute("/en/guides")).toBe(true)
  })

  it("matches dynamic single-segment routes", () => {
    expect(isKnownRoute("/work/luxury-residence")).toBe(true)
    expect(isKnownRoute("/guides/what-is-vibe-coding")).toBe(true)
    expect(isKnownRoute("/en/work/anything")).toBe(true)
  })

  it("matches dynamic two-segment routes", () => {
    expect(isKnownRoute("/services/web-design/site-design")).toBe(true)
    expect(isKnownRoute("/en/services/ai-content/product-videos")).toBe(true)
  })

  it("rejects a dynamic route with too many segments", () => {
    expect(isKnownRoute("/work/one/two")).toBe(false)
  })

  it("rejects genuinely unknown paths", () => {
    expect(isKnownRoute("/some-path-that-does-not-exist")).toBe(false)
    expect(isKnownRoute("/wp-admin")).toBe(false)
    expect(isKnownRoute("/work-but-not-quite")).toBe(false)
  })

  it("matches admin/portal routes (gated client-side, not in the sitemap, but still real)", () => {
    expect(isKnownRoute("/admin")).toBe(true)
    expect(isKnownRoute("/admin/quotes/123")).toBe(true)
    expect(isKnownRoute("/portal/quote/abc")).toBe(true)
  })
})
