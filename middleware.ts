import { next, rewrite } from "@vercel/edge"
import { wantsMarkdown } from "./src/lib/markdown-negotiation"
import { isKnownRoute } from "./src/lib/known-routes"

// Runs on every request. vercel.json's route whitelist still owns normal
// HTML routing (unchanged) — this only steps in for two things Vercel's
// static config can't do on its own:
// 1. Rewrite "/" to "/index.md" when Accept: text/markdown is sent (a
//    vercel.json rewrite "has" condition on the Accept header was tried
//    first but didn't reliably trigger per a live audit).
// 2. Return a real 404 with a genuine markdown body + Content-Type for any
//    path that isn't a known route — Vercel's implicit 404.html-fallback
//    convention gets the status code right but does not apply custom
//    headers configured for it in vercel.json (verified against a live
//    deployment: Content-Type stayed text/html regardless).
export const config = {
  matcher: "/:path*",
}

const SUBDOMAIN_HOSTS = new Set(["web.madebyraz.co.il", "ai.madebyraz.co.il"])
const HAS_FILE_EXTENSION = /\.[a-zA-Z0-9]+$/

const NOT_FOUND_BODY = `# 404 — הדף הזה לא קיים

הכתובת שביקשתם לא נמצאה באתר madebyraz.co.il. הנה כמה כתובות שכן קיימות:

- [Homepage](https://madebyraz.co.il/)
- [Sitemap](https://madebyraz.co.il/sitemap.xml)
- [Agent instructions (llms.txt)](https://madebyraz.co.il/llms.txt)
- [Guides index](https://madebyraz.co.il/guides)
`

export default function middleware(request: Request) {
  const url = new URL(request.url)
  const host = request.headers.get("host") ?? ""

  // The web./ai. subdomains render everything client-side by hostname, not
  // by path — every path there is valid, so never touch them here.
  if (SUBDOMAIN_HOSTS.has(host)) return next()

  // Static files (has a file extension, or lives under /assets/) — let
  // Vercel's normal filesystem serving handle these exactly as before.
  if (HAS_FILE_EXTENSION.test(url.pathname) || url.pathname.startsWith("/assets/")) {
    return next()
  }

  if (url.pathname === "/" && wantsMarkdown(request.headers.get("accept"))) {
    // Set Content-Type/Vary explicitly here rather than relying on
    // vercel.json's header rule for /index.md matching post-rewrite — it's
    // untested whether Vercel's header-source matching uses the original
    // request path ("/") or the rewritten destination in this case.
    return rewrite(new URL("/index.md", request.url), {
      headers: {
        "content-type": "text/markdown; charset=utf-8",
        vary: "Accept, Accept-Encoding",
      },
    })
  }

  if (!isKnownRoute(url.pathname)) {
    return new Response(NOT_FOUND_BODY, {
      status: 404,
      headers: {
        "content-type": "text/markdown; charset=utf-8",
        "x-robots-tag": "noindex, follow",
        "cache-control": "public, max-age=0, must-revalidate",
      },
    })
  }

  return next()
}
