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
