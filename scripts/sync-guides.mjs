// Inserts the Hebrew half of every content/guides/*.json into the `guides`
// table, before the prerender reads that table.
//
// This is how the daily writing routine publishes. A scheduled session cannot
// attach the Supabase connector (rejected at the API level), but it can push to
// main, and a push to main is a production build, which holds the service key.
// So the routine commits a file and this step turns it into a row.
//
// Three rules, each load-bearing:
// - Insert only. `on_conflict=slug` with ignore-duplicates means a row that
//   already exists is never touched, so an edit Raz makes in the admin is never
//   overwritten by the file it came from.
// - Only guides still in the queue (dated after today, Israel time). A guide
//   that is already live and was deleted in the admin stays deleted.
// - Fail soft. No service key (a laptop, a preview, the GitHub Action) or no
//   network means the step logs and the build carries on, the same way the
//   prerender and the sitemap already behave.
import { readdir, readFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const dir = path.join(root, "content/guides")

export const COVERS = {
  "אתרים ופיתוח": "/images/guides/cover-web-dev.png",
  "ויז'ואל ותוכן AI": "/images/guides/cover-ai-visual.png",
  "שדרוג אתרים": "/images/guides/cover-site-upgrades.png",
}

export function israelToday(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jerusalem" }).format(now)
}

export function toRow(g, sortOrder) {
  return {
    slug: g.slug,
    kind: "article",
    title: g.title,
    excerpt: g.excerpt,
    meta_description: g.meta_description,
    category: g.category,
    image: COVERS[g.category],
    read_time: g.read_time,
    date_published: g.date_published,
    related_service_slug: g.related_service_slug ?? null,
    sections: g.sections,
    faq: g.faq,
    sort_order: sortOrder,
  }
}

async function loadFiles() {
  const names = (await readdir(dir).catch(() => [])).filter((n) => n.endsWith(".json")).sort()
  const guides = []
  for (const n of names) guides.push(JSON.parse(await readFile(path.join(dir, n), "utf-8")))
  return guides.sort((a, b) => a.date_published.localeCompare(b.date_published))
}

async function main() {
  const url = process.env.VITE_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    console.log("sync-guides: no service key in this build, skipping (expected outside a production deploy).")
    return
  }
  const today = israelToday()
  const queued = (await loadFiles()).filter((g) => g.date_published > today)
  if (!queued.length) {
    console.log("sync-guides: no queued guide files.")
    return
  }

  const headers = { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" }
  const existing = await fetch(`${url}/rest/v1/guides?select=slug,sort_order`, { headers }).then((r) => {
    if (!r.ok) throw new Error(`read guides: ${r.status}`)
    return r.json()
  })
  const have = new Set(existing.map((r) => r.slug))
  let next = Math.max(-1, ...existing.map((r) => r.sort_order ?? -1)) + 1
  const rows = queued.filter((g) => !have.has(g.slug)).map((g) => toRow(g, next++))
  if (!rows.length) {
    console.log(`sync-guides: all ${queued.length} queued guide files are already in the table.`)
    return
  }

  const res = await fetch(`${url}/rest/v1/guides?on_conflict=slug`, {
    method: "POST",
    headers: { ...headers, Prefer: "resolution=ignore-duplicates,return=minimal" },
    body: JSON.stringify(rows),
  })
  if (!res.ok) throw new Error(`insert guides: ${res.status} ${await res.text()}`)
  console.log(`sync-guides: inserted ${rows.map((r) => `${r.slug} (${r.date_published})`).join(", ")}`)
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main().catch((err) => {
    console.warn(`sync-guides: skipped, ${err.message}`)
  })
}
