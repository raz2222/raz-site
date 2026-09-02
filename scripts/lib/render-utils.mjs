// Pure helpers used by scripts/prerender.mjs, split out so they can be unit
// tested without needing a real Vite SSR build.
import TurndownService from "turndown"

export function stripTags(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

// Pulls out the <main id="main">...</main> content so the generated markdown
// covers the page's actual content instead of repeating nav/footer chrome on
// every page.
export function extractMain(html) {
  const match = html.match(/<main id="main">([\s\S]*?)<\/main>/)
  return match ? match[1] : html
}

function escapeAttr(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

// Rewrites the <head> of the built dist/index.html template for one route.
//
// The SSR pass can't produce these tags: useDocumentMeta/useHreflang set them
// by mutating `document` inside a useEffect, and React doesn't run effects
// during renderToString. Without this, every prerendered page would inherit
// the homepage's title/description/canonical.
export function patchHead(template, meta) {
  let html = template

  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeAttr(meta.title)}</title>`)
  html = html.replace(
    /<meta property="og:title" content="[^"]*"\s*\/?>/,
    `<meta property="og:title" content="${escapeAttr(meta.title)}" />`
  )

  if (meta.description) {
    const description = escapeAttr(meta.description)
    html = html.replace(
      /<meta name="description" content="[^"]*"\s*\/?>/,
      `<meta name="description" content="${description}" />`
    )
    html = html.replace(
      /<meta property="og:description" content="[^"]*"\s*\/?>/,
      `<meta property="og:description" content="${description}" />`
    )
  } else {
    // Drop them rather than leave the homepage's copy sitting under this
    // page's title. No description lets search engines derive one from the
    // content; a wrong one just misdescribes the page.
    html = html.replace(/\s*<meta name="description" content="[^"]*"\s*\/?>/, "")
    html = html.replace(/\s*<meta property="og:description" content="[^"]*"\s*\/?>/, "")
  }

  // Guides carry their own hero image and publish date; without these a shared
  // link previews with the homepage image, since social crawlers don't run the
  // JS that would otherwise set them.
  // Replace the tag when the template has one, otherwise insert it — a
  // replace-only patch fails silently if the template ever drops the tag.
  const upsert = (pattern, tag) =>
    pattern.test(html) ? html.replace(pattern, tag) : html.replace("</head>", `  ${tag}\n  </head>`)

  if (meta.image) {
    const image = escapeAttr(meta.image)
    html = upsert(
      /<meta property="og:image" content="[^"]*"\s*\/?>/,
      `<meta property="og:image" content="${image}" />`
    )
    html = upsert(
      /<meta name="twitter:image" content="[^"]*"\s*\/?>/,
      `<meta name="twitter:image" content="${image}" />`
    )
  }

  if (meta.publishedTime) {
    html = upsert(
      /<meta property="og:type" content="[^"]*"\s*\/?>/,
      `<meta property="og:type" content="article" />\n    <meta property="article:published_time" content="${escapeAttr(meta.publishedTime)}" />`
    )
  }

  html = html.replace(
    /<link rel="canonical" href="[^"]*"\s*\/?>/,
    `<link rel="canonical" href="${escapeAttr(meta.canonical)}" />`
  )
  html = html.replace(
    /<meta property="og:url" content="[^"]*"\s*\/?>/,
    `<meta property="og:url" content="${escapeAttr(meta.canonical)}" />`
  )

  if (meta.lang || meta.dir) {
    html = html.replace(
      /<html[^>]*>/,
      `<html lang="${escapeAttr(meta.lang ?? "he")}" dir="${escapeAttr(meta.dir ?? "rtl")}">`
    )
  }

  if (meta.alternates) {
    const site = "https://madebyraz.co.il"
    const links = [
      `<link rel="alternate" hreflang="he" href="${escapeAttr(site + meta.alternates.he)}" />`,
      `<link rel="alternate" hreflang="en" href="${escapeAttr(site + meta.alternates.en)}" />`,
      `<link rel="alternate" hreflang="x-default" href="${escapeAttr(site + meta.alternates.he)}" />`,
    ].join("\n    ")
    html = html.replace("</head>", `  ${links}\n  </head>`)
  }

  return html
}

const turndown = new TurndownService({ headingStyle: "atx", bulletListMarker: "-" })

export function htmlToMarkdown(html, { title, description, canonical } = {}) {
  const mainHtml = extractMain(html)
  const body = turndown.turndown(mainHtml).replace(/\n{3,}/g, "\n\n").trim()

  const header = [
    title ? `# ${title}` : null,
    description ? `> ${description}` : null,
    canonical ? `Canonical: ${canonical}` : null,
  ].filter(Boolean)

  return [header.join("\n\n"), "", "---", "", body, ""].join("\n")
}
