import { afterEach, describe, expect, it, vi } from "vitest"
import { attributionTag, captureAttribution, getAttribution } from "./attribution"
import { whatsappHref } from "./whatsapp"

function setup({ search, referrer = "" }: { search: string; referrer?: string }) {
  const store: Record<string, string> = {}
  vi.stubGlobal("sessionStorage", {
    getItem: (k: string) => store[k] ?? null,
    setItem: (k: string, v: string) => {
      store[k] = v
    },
    removeItem: (k: string) => delete store[k],
  })
  vi.stubGlobal("window", { location: { search, pathname: "/" } })
  vi.stubGlobal("document", { referrer })
  return store
}

afterEach(() => vi.unstubAllGlobals())

describe("captureAttribution", () => {
  it("records campaign params from the landing URL", () => {
    setup({ search: "?utm_source=instagram&utm_medium=paid&utm_campaign=web-leads&utm_content=reel-a&fbclid=abc123" })
    captureAttribution()

    const a = getAttribution()
    expect(a?.source).toBe("instagram")
    expect(a?.medium).toBe("paid")
    expect(a?.campaign).toBe("web-leads")
    expect(a?.content).toBe("reel-a")
    expect(a?.fbclid).toBe("abc123")
  })

  // The first in-site navigation has no query string. Writing on every call would
  // erase the source of the visit before the person ever reaches the contact form.
  it("keeps an earlier capture when the current URL has no campaign params", () => {
    setup({ search: "?utm_source=instagram&utm_campaign=web-leads" })
    captureAttribution()
    vi.stubGlobal("window", { location: { search: "", pathname: "/contact" } })
    captureAttribution()

    expect(getAttribution()?.source).toBe("instagram")
  })

  it("stores nothing for an organic visit", () => {
    setup({ search: "" })
    captureAttribution()
    expect(getAttribution()).toBeNull()
    expect(attributionTag()).toBeNull()
  })
})

describe("whatsappHref", () => {
  it("prefills an opener and the campaign tag for a visitor who came from an ad", () => {
    setup({ search: "?utm_source=instagram&utm_campaign=web-leads&utm_content=reel-a" })
    captureAttribution()

    const decoded = decodeURIComponent(whatsappHref())
    expect(decoded).toContain("[instagram · web-leads · reel-a]")
    expect(decoded).toContain("היי רז")
  })

  it("keeps a page-specific message and appends the tag to it", () => {
    setup({ search: "?utm_source=instagram" })
    captureAttribution()

    const decoded = decodeURIComponent(whatsappHref({ message: "היי רז, לגבי סרטון AI" }))
    expect(decoded).toContain("היי רז, לגבי סרטון AI")
    expect(decoded).toContain("[instagram]")
  })

  it("leaves the link untouched for an organic visitor with no page message", () => {
    setup({ search: "" })
    expect(whatsappHref()).toBe("https://wa.me/972506944443")
  })

  it("does not produce a second query string when the base URL already has one", () => {
    setup({ search: "?utm_source=instagram" })
    captureAttribution()

    const href = whatsappHref({ baseUrl: "https://wa.me/972506944443?text=old" })
    expect(href.match(/\?/g)).toHaveLength(1)
  })
})
