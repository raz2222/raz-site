// Cookie/analytics consent storage. Amendment 13 to Israel's Privacy Protection Law
// (in force Aug 14, 2025) removed "silent consent" — non-essential tracking (GA4, Meta
// Pixel) may only start after an explicit, opt-in choice. Nothing here fires analytics;
// callers decide what to do with the stored value.
export type ConsentValue = "granted" | "denied"

const CONSENT_KEY = "raz_cookie_consent"

export function getStoredConsent(): ConsentValue | null {
  const value = localStorage.getItem(CONSENT_KEY)
  return value === "granted" || value === "denied" ? value : null
}

export function storeConsent(value: ConsentValue) {
  localStorage.setItem(CONSENT_KEY, value)
  window.dispatchEvent(new CustomEvent("cookie-consent-change", { detail: value }))
}

export function clearConsent() {
  localStorage.removeItem(CONSENT_KEY)
  window.dispatchEvent(new Event("open-cookie-settings"))
}
