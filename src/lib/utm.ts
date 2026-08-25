// Captures utm_* params from the URL a visitor first lands with and keeps them for the
// rest of the tab session, so a lead submitted several clicks/scrolls later (e.g. after
// reading the gift landing page) still carries the campaign that brought them in.
const STORAGE_KEY = "raz_utm_params"
const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const

export type UtmParams = Partial<Record<(typeof UTM_KEYS)[number], string>>

export function captureUtmParams(): UtmParams {
  const fromUrl: UtmParams = {}
  const search = new URLSearchParams(window.location.search)
  for (const key of UTM_KEYS) {
    const value = search.get(key)
    if (value) fromUrl[key] = value
  }

  if (Object.keys(fromUrl).length > 0) {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(fromUrl))
    return fromUrl
  }

  const stored = sessionStorage.getItem(STORAGE_KEY)
  if (!stored) return {}
  try {
    return JSON.parse(stored) as UtmParams
  } catch {
    return {}
  }
}
