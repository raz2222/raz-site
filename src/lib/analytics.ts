// GA4 measurement IDs aren't secret — they're visible in every page load regardless — so a real
// default is fine here. The env var still wins when set, letting it be swapped without a code change.
import { getStoredConsent } from "./consent"

const GA_ID = (import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined) || "G-PZSEQGE53P"
const PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID as string | undefined

declare global {
  interface Window {
    dataLayer: unknown[]
    gtag: (...args: unknown[]) => void
    fbq: ((...args: unknown[]) => void) & { queue?: unknown[]; loaded?: boolean; version?: string }
    _fbq?: Window["fbq"]
  }
}

let initialized = false

function loadScript(src: string) {
  const script = document.createElement("script")
  script.async = true
  script.src = src
  document.head.appendChild(script)
}

function initGa4(id: string) {
  window.dataLayer = window.dataLayer || []
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer.push(args)
  }
  window.gtag("js", new Date())
  window.gtag("config", id, { anonymize_ip: true })
  loadScript(`https://www.googletagmanager.com/gtag/js?id=${id}`)
}

function initMetaPixel(id: string) {
  function fbq(...args: unknown[]) {
    fbq.queue!.push(args)
  }
  fbq.queue = [] as unknown[]
  fbq.loaded = true
  fbq.version = "2.0"
  window.fbq = fbq
  window._fbq = fbq
  loadScript("https://connect.facebook.net/en_US/fbevents.js")
  window.fbq("init", id)
  window.fbq("track", "PageView")
}

// Call once on app boot. GA4 is live by default (see GA_ID above); Meta Pixel stays a no-op
// until VITE_META_PIXEL_ID is set. CSP (vercel.json) already allows both domains.
export function initAnalytics() {
  if (initialized) return
  initialized = true
  if (GA_ID) initGa4(GA_ID)
  if (PIXEL_ID) initMetaPixel(PIXEL_ID)
}

// Google's official runtime opt-out flag — read by gtag.js before it sends anything,
// so this actually stops tracking even after the script has already loaded (the case
// when someone accepts, then later declines via "Cookie Settings" mid-session).
export function disableAnalytics() {
  if (GA_ID) (window as unknown as Record<string, boolean>)[`ga-disable-${GA_ID}`] = true
}

export function trackEvent(name: string, params?: Record<string, unknown>) {
  if (getStoredConsent() !== "granted") return
  if (GA_ID && window.gtag) window.gtag("event", name, params)
  if (PIXEL_ID && window.fbq) {
    window.fbq("trackCustom", name, params)
    // Also fire Meta's standard "Lead" event on every lead submission, in addition to the
    // custom one above -- ad delivery optimization only works reliably against standard events.
    if (name === "lead_submit") window.fbq("track", "Lead", params)
  }
}
