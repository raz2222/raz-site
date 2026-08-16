const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined
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

// Call once on app boot. No-op until VITE_GA_MEASUREMENT_ID / VITE_META_PIXEL_ID are set —
// safe to ship before real IDs exist, and CSP (vercel.json) already allows both domains.
export function initAnalytics() {
  if (initialized) return
  initialized = true
  if (GA_ID) initGa4(GA_ID)
  if (PIXEL_ID) initMetaPixel(PIXEL_ID)
}

export function trackEvent(name: string, params?: Record<string, unknown>) {
  if (GA_ID && window.gtag) window.gtag("event", name, params)
  if (PIXEL_ID && window.fbq) window.fbq("trackCustom", name, params)
}
