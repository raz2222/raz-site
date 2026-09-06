import { afterEach, describe, expect, it, vi } from "vitest"
// Raw imports rather than fs: tests under src/ compile with vite/client types only, no node ones.
import html from "../../index.html?raw"
import vercelConfig from "../../vercel.json?raw"
import { applyConsent, syncStoredConsent, trackPageView } from "./analytics"

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
  // Storage is gated by Consent Mode inside gtag.js, not by skipping the send: a visitor
  // who has not opted in is still counted, via a cookieless ping.
  it("sends a page_view with the path and location whatever the consent state", () => {
    for (const consent of ["granted", "denied", null]) {
      const calls = setup({ consent })
      trackPageView("/guides/example")

      expect(calls).toHaveLength(1)
      const [event, name, params] = calls[0] as [string, string, Record<string, unknown>]
      expect(event).toBe("event")
      expect(name).toBe("page_view")
      expect(params.page_path).toBe("/guides/example")
      expect(params.page_location).toBe("https://madebyraz.co.il/guides/example")
      expect(params.page_title).toBe("Some page · RAZ")
    }
  })
})

describe("applyConsent", () => {
  it("updates all four Consent Mode v2 signals together", () => {
    for (const value of ["granted", "denied"] as const) {
      const calls = setup({ consent: null })
      applyConsent(value)

      expect(calls).toEqual([
        [
          "consent",
          "update",
          {
            ad_storage: value,
            ad_user_data: value,
            ad_personalization: value,
            analytics_storage: value,
          },
        ],
      ])
    }
  })
})

describe("syncStoredConsent", () => {
  it("re-applies a stored choice", () => {
    const calls = setup({ consent: "granted" })
    syncStoredConsent()
    expect(calls[0]?.[2]).toMatchObject({ analytics_storage: "granted" })
  })

  // Israel's Privacy Protection Law (Amendment 13) requires opt-in before non-essential
  // storage. Sending no update leaves index.html's denied default in force.
  it("leaves the denied default alone when nobody has answered the banner", () => {
    const calls = setup({ consent: null })
    syncStoredConsent()
    expect(calls).toHaveLength(0)
  })
})

// The gtag snippet is inline in index.html, and script-src carries no 'unsafe-inline' —
// only this hash lets it run. Editing the snippet without refreshing the hash would silently
// kill analytics in production, where a preview build shows nothing wrong.
describe("index.html gtag snippet", () => {
  it("configures the measurement ID with a denied Consent Mode default", () => {
    expect(html).toContain('gtag(\'config\', \'G-PZSEQGE53P\'')
    expect(html).toContain("https://www.googletagmanager.com/gtag/js?id=G-PZSEQGE53P")
    const consentDefault = html.indexOf("gtag('consent', 'default'")
    expect(consentDefault).toBeGreaterThan(-1)
    expect(consentDefault).toBeLessThan(html.indexOf("googletagmanager.com/gtag/js"))
    for (const signal of ["ad_storage", "ad_user_data", "ad_personalization", "analytics_storage"]) {
      expect(html).toMatch(new RegExp(`${signal}: 'denied'`))
    }
  })

  it("matches the CSP script-src hash in vercel.json", async () => {
    const inline = html.match(/<script>([\s\S]*?)<\/script>/)
    expect(inline).not.toBeNull()
    const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(inline![1]))
    const hash = `sha256-${btoa(String.fromCharCode(...new Uint8Array(digest)))}`
    expect(vercelConfig).toContain(`'${hash}'`)
  })
})
