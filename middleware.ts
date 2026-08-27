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
const SHOWCASE_HOST = "show.madebyraz.co.il"
const HAS_FILE_EXTENSION = /\.[a-zA-Z0-9]+$/

// Markdown variant — served to agents/tools that explicitly ask for it via
// Accept: text/markdown (see wantsMarkdown below).
const NOT_FOUND_MARKDOWN = `# 404 — הדף הזה לא קיים

הכתובת שביקשתם לא נמצאה באתר madebyraz.co.il. הנה כמה כתובות שכן קיימות:

- [Homepage](https://madebyraz.co.il/)
- [Sitemap](https://madebyraz.co.il/sitemap.xml)
- [Agent instructions (llms.txt)](https://madebyraz.co.il/llms.txt)
- [Guides index](https://madebyraz.co.il/guides)
`

// HTML variant — served to everyone else (real browsers). A real human
// landing on a 404 should see the site's normal look, not raw markdown text.
const NOT_FOUND_HTML = `<!doctype html>
<html lang="he" dir="rtl">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="robots" content="noindex, follow" />
    <title>404 — הדף לא נמצא · RAZ</title>
    <link rel="icon" type="image/svg+xml" href="/favicon.svg?v=5" />
    <style>
      :root { color-scheme: dark; }
      body {
        margin: 0;
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #0a0a0a;
        color: #f4f3ee;
        font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
      }
      main {
        max-width: 40rem;
        padding: 2rem;
        text-align: center;
      }
      h1 { font-size: 1.5rem; margin: 0 0 0.75rem; }
      p { color: #a3a39c; line-height: 1.6; }
      ul { list-style: none; padding: 0; margin: 1.5rem 0 0; display: flex; flex-direction: column; gap: 0.5rem; }
      a { color: #d1fe17; text-decoration: underline; text-underline-offset: 3px; }
    </style>
  </head>
  <body>
    <main>
      <h1>404 — הדף הזה לא קיים</h1>
      <p>הכתובת שביקשתם לא נמצאה באתר madebyraz.co.il. הנה כמה כתובות שכן קיימות:</p>
      <ul>
        <li><a href="/">Homepage — https://madebyraz.co.il/</a></li>
        <li><a href="/sitemap.xml">Sitemap — https://madebyraz.co.il/sitemap.xml</a></li>
        <li><a href="/llms.txt">Agent instructions — https://madebyraz.co.il/llms.txt</a></li>
        <li><a href="/guides">Guides index — https://madebyraz.co.il/guides</a></li>
      </ul>
    </main>
  </body>
</html>
`

export default function middleware(request: Request) {
  const url = new URL(request.url)
  const host = request.headers.get("host") ?? ""

  // The web./ai. subdomains render everything client-side by hostname, not
  // by path — every path there is valid, so never touch them here.
  if (SUBDOMAIN_HOSTS.has(host)) return next()

  // The judge-facing show. subdomain is the same "render everything
  // client-side by hostname" pattern, plus a standing noindex — it exists to
  // be reviewed, not to be found in search results.
  if (host === SHOWCASE_HOST) {
    return next({ headers: { "x-robots-tag": "noindex, follow" } })
  }

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
    const serveMarkdown = wantsMarkdown(request.headers.get("accept"))
    return new Response(serveMarkdown ? NOT_FOUND_MARKDOWN : NOT_FOUND_HTML, {
      status: 404,
      headers: {
        "content-type": serveMarkdown ? "text/markdown; charset=utf-8" : "text/html; charset=utf-8",
        "x-robots-tag": "noindex, follow",
        "cache-control": "public, max-age=0, must-revalidate",
      },
    })
  }

  return next()
}
