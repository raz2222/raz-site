// Records which ad or link brought someone to the site, so a lead that arrives later
// in the visit can still be traced back to it.
//
// This is deliberately NOT part of analytics.ts and is NOT gated behind cookie consent.
// Nothing here talks to Meta, Google or any third party: the values are read from the
// URL the visitor arrived on, kept in sessionStorage (gone when the tab closes), and
// only ever leave the browser attached to a form the person chose to submit or a
// WhatsApp message they chose to open. It's the digital equivalent of "how did you
// hear about us?" on the contact form, which is why it doesn't need opt-in.
//
// Meta's Pixel reporting is consent-gated and will always undercount. This is the
// first-party record that doesn't, and it's what the leads table should be trusted on.

const STORAGE_KEY = "raz_attribution"

// fbclid is Meta's own click ID, appended to the landing URL on every ad click. Keeping it
// makes an individual lead traceable to a click in Ads Manager even when the Pixel never fired.
const URL_PARAMS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "fbclid"] as const

export type Attribution = {
  source?: string
  medium?: string
  campaign?: string
  content?: string
  term?: string
  fbclid?: string
  landing_page?: string
  referrer?: string
  captured_at?: string
}

function readStored(): Attribution | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as unknown
    return parsed && typeof parsed === "object" ? (parsed as Attribution) : null
  } catch {
    return null
  }
}

// Call once on app boot, before anything renders.
//
// Only writes when the current URL actually carries campaign params. Without that guard the
// first in-site navigation (which has no query string) would wipe the source of the visit.
// When a *new* set of params shows up mid-session the visitor clicked a second ad, so the
// newer click wins.
export function captureAttribution() {
  try {
    const params = new URLSearchParams(window.location.search)
    const found: Record<string, string> = {}
    for (const key of URL_PARAMS) {
      const value = params.get(key)
      if (value) found[key] = value.slice(0, 200)
    }
    if (Object.keys(found).length === 0) return

    const attribution: Attribution = {
      source: found.utm_source,
      medium: found.utm_medium,
      campaign: found.utm_campaign,
      content: found.utm_content,
      term: found.utm_term,
      fbclid: found.fbclid,
      landing_page: window.location.pathname,
      referrer: document.referrer || undefined,
      captured_at: new Date().toISOString(),
    }
    for (const key of Object.keys(attribution) as (keyof Attribution)[]) {
      if (attribution[key] === undefined) delete attribution[key]
    }
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(attribution))
  } catch {
    // Private browsing modes can throw on sessionStorage. Losing attribution is
    // never a reason to break the page.
  }
}

export function getAttribution(): Attribution | null {
  return readStored()
}

// A short, human-readable source label for the prefilled WhatsApp message, so a
// conversation that starts in WhatsApp (where no pixel or analytics can follow it)
// still says which ad it came from. Returns null for organic visits, which keeps
// the tag off messages from people who found the site on their own.
export function attributionTag(): string | null {
  const a = getAttribution()
  if (!a) return null
  const parts = [a.source, a.campaign, a.content].filter(Boolean)
  return parts.length > 0 ? parts.join(" · ") : null
}
