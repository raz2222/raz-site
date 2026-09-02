import { afterEach, describe, expect, it, vi } from "vitest"
import { trackPageView } from "./analytics"

const CONSENT_KEY = "raz_cookie_consent"

function setup({ consent }: { consent: string | null }) {
  const calls: unknown[][] = []
  const store: Record<string, string> = {}
  if (consent) store[CONSENT_KEY] = consent

  vi.stubGlobal("localStorage", {
    getItem: (k: string) => store[k] ?? null,
    setItem: (k: string, v: string) => {
      store[k] = v
    },
    removeItem: (k: string) => delete store[k],
  })
  vi.stubGlobal("document", { title: "Some page · RAZ" })
  vi.stubGlobal("window", {
    gtag: (...args: unknown[]) => calls.push(args),
    location: { href: "https://madebyraz.co.il/guides/example" },
  })
  return calls
}

afterEach(() => vi.unstubAllGlobals())

describe("trackPageView", () => {
  it("sends a page_view with the path and location when consent is granted", () => {
    const calls = setup({ consent: "granted" })
    trackPageView("/guides/example")

    expect(calls).toHaveLength(1)
    const [event, name, params] = calls[0] as [string, string, Record<string, unknown>]
    expect(event).toBe("event")
    expect(name).toBe("page_view")
    expect(params.page_path).toBe("/guides/example")
    expect(params.page_location).toBe("https://madebyraz.co.il/guides/example")
  })

  // Israel's Privacy Protection Law (Amendment 13) requires opt-in before any
  // non-essential tracking, so this must stay silent without explicit consent.
  it("sends nothing when consent is denied or not yet given", () => {
    expect(setup({ consent: "denied" })).toHaveLength(0)
    trackPageView("/guides/example")
    expect(setup({ consent: null })).toHaveLength(0)
    trackPageView("/guides/example")
  })
})
