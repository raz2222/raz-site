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
