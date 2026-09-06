// The gtag snippet lives in index.html as static HTML, not here. This module never loads,
// injects or blocks it — it only tells the already-running tag what storage the visitor
// has agreed to, via Consent Mode v2.
import { getStoredConsent, type ConsentValue } from "./consent"

const PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID as string | undefined

declare global {
  interface Window {
    dataLayer: unknown[]
    gtag: (...args: unknown[]) => void
    fbq: ((...args: unknown[]) => void) & { queue?: unknown[]; loaded?: boolean; version?: string }
    _fbq?: Window["fbq"]
  }
}

const CONSENT_SIGNALS = ["ad_storage", "ad_user_data", "ad_personalization", "analytics_storage"] as const

function consentPayload(value: ConsentValue) {
  return Object.fromEntries(CONSENT_SIGNALS.map((signal) => [signal, value]))
}

let pixelInitialized = false

function initMetaPixel(id: string) {
  if (pixelInitialized) return
  pixelInitialized = true
  function fbq(...args: unknown[]) {
    fbq.queue!.push(args)
  }
  fbq.queue = [] as unknown[]
  fbq.loaded = true
  fbq.version = "2.0"
  window.fbq = fbq
  window._fbq = fbq
  const script = document.createElement("script")
  script.async = true
  script.src = "https://connect.facebook.net/en_US/fbevents.js"
  document.head.appendChild(script)
  window.fbq("init", id)
  window.fbq("track", "PageView")
}

// index.html defaults every consent signal to denied, so until this runs gtag.js sends
// cookieless pings: traffic is measured, but nothing is written to the device. Amendment 13
// to Israel's Privacy Protection Law (in force Aug 14, 2025) bars storing identifiers before
// an explicit opt-in, and "denied" is exactly that state — the old approach instead set
// `ga-disable-*`, which silenced measurement entirely for everyone who never answered.
export function applyConsent(value: ConsentValue) {
  if (window.gtag) window.gtag("consent", "update", consentPayload(value))
  // Meta's pixel has no Consent Mode equivalent, so it stays unloaded until consent is given.
  if (value === "granted" && PIXEL_ID) initMetaPixel(PIXEL_ID)
}

// Called once on boot to re-apply a choice made on an earlier visit. Someone who has not
// answered the banner yet is left on the denied default set in index.html.
export function syncStoredConsent() {
  const stored = getStoredConsent()
  if (stored) applyConsent(stored)
}

// gtag('config') in index.html sends exactly one page_view, at load. This is a single-page
// app, so every in-site navigation after that would go uncounted. Called by
// usePageViewTracking on route change (it skips the first location, which config covered).
export function trackPageView(path: string) {
  if (!window.gtag) return
  window.gtag("event", "page_view", {
    page_path: path,
    page_location: window.location.href,
    page_title: document.title,
  })
}

export function trackEvent(name: string, params?: Record<string, unknown>) {
  if (window.gtag) window.gtag("event", name, params)
  if (PIXEL_ID && window.fbq) {
    window.fbq("trackCustom", name, params)
    // Also fire Meta's standard "Lead" event on every lead submission, in addition to the
    // custom one above -- ad delivery optimization only works reliably against standard events.
    if (name === "lead_submit") window.fbq("track", "Lead", params)
  }
}
