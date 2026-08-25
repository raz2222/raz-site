import { next, rewrite } from "@vercel/edge"
import { wantsMarkdown } from "./src/lib/markdown-negotiation"

// Only runs for "/" — vercel.json's route whitelist handles every other page
// and the 404 fallback unchanged. This exists solely so an agent requesting
// `Accept: text/markdown` on the homepage gets the markdown variant
// (dist/index.md, written by scripts/prerender.mjs) instead of the HTML
// shell. Vary: Accept/Accept-Encoding is set in vercel.json's headers for
// both "/" and "/index.md" so caches don't mix the two variants up.
export const config = {
  matcher: "/",
}

export default function middleware(request: Request) {
  if (wantsMarkdown(request.headers.get("accept"))) {
    return rewrite(new URL("/index.md", request.url))
  }
  return next()
}
