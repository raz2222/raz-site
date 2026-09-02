// Pure helpers for building sitemap.xml, split out so they can be unit
// tested without needing a real Supabase connection or Vite build.

function escapeXml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

export function buildSitemapXml(urls) {
  const lines = urls.map((u) => {
    const parts = [`<loc>${escapeXml(u.loc)}</loc>`]
    // lastmod tells Google a page's content actually changed, which is what
    // gets an already-submitted sitemap re-crawled quickly instead of on
    // Google's own slow schedule. W3C date format (YYYY-MM-DD) is what the
    // sitemap spec expects, so a full timestamp gets trimmed to its date.
    if (u.lastmod) parts.push(`<lastmod>${escapeXml(String(u.lastmod).slice(0, 10))}</lastmod>`)
    if (u.changefreq) parts.push(`<changefreq>${u.changefreq}</changefreq>`)
    if (u.priority !== undefined) parts.push(`<priority>${u.priority.toFixed(1)}</priority>`)
    return `  <url>${parts.join("")}</url>`
  })
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${lines.join("\n")}\n</urlset>\n`
}

// De-dupes by loc (last one wins) and drops entries with an empty/missing loc
// — cheap protection against a bad row (null slug, etc.) producing a broken
// or duplicate <url> entry.
export function dedupeUrls(urls) {
  const map = new Map()
  for (const u of urls) {
    if (!u.loc) continue
    map.set(u.loc, u)
  }
  return [...map.values()]
}
