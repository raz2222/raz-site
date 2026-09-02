import { match } from "path-to-regexp"

// Mirrors vercel.json's rewrite whitelist exactly (kept in sync by
// tests/vercel-routes.test.mjs). middleware.ts uses this to serve a real,
// markdown 404 for genuinely unknown paths: Vercel's implicit
// 404.html-fallback convention returns a real 404 status, but does not
// apply the custom Content-Type/X-Robots-Tag headers configured for it in
// vercel.json (verified against a live deployment), so middleware handles
// the response directly instead for the "full credit" markdown-body bonus.
export const KNOWN_ROUTE_PATTERNS = [
  "/",
  "/gift",
  "/work",
  "/work/:slug",
  "/experiments",
  "/faq",
  "/guides",
  "/guides/:slug",
  "/services",
  "/services/web-design",
  "/services/ai-content",
  "/services/:hubSlug/:subSlug",
  "/ai-creative",
  "/web-development",
  "/about",
  "/contact",
  "/privacy",
  "/terms",
  "/thank-you",
  "/en/thank-you",
  "/tools",
  "/en",
  "/en/services",
  "/en/contact",
  "/en/faq",
  "/en/about",
  "/en/work",
  "/en/work/:slug",
  "/en/guides",
  "/en/guides/:slug",
  "/en/experiments",
  "/en/services/web-design",
  "/en/services/ai-content",
  "/en/services/:hubSlug/:subSlug",
  "/admin",
  "/admin/clients",
  "/admin/price-book",
  "/admin/ai-experience",
  "/admin/quotes",
  "/admin/quotes/:id",
  "/admin/services",
  "/admin/projects",
  "/admin/guides",
  "/admin/faq",
  "/admin/pages",
  "/portal",
  "/portal/quote/:id",
]

const matchers = KNOWN_ROUTE_PATTERNS.map((pattern) => match(pattern, { end: true }))

export function isKnownRoute(pathname: string): boolean {
  return matchers.some((m) => m(pathname) !== false)
}
