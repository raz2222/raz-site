// A snapshot of the site's editable content, committed next to the code.
//
// Everything a visitor reads lives in Supabase, not in this repository: the
// guides, the case studies, the service pages, the FAQ. A bad UPDATE in the
// admin, a dropped table, or a lapsed project would take all of it with no
// copy anywhere. The build already runs nightly with database credentials, so
// it writes the snapshot too and git keeps every previous version for free.
//
// One gap, deliberately left open: this reads with the public anon key, so it
// captures exactly what a visitor can see. Guides dated in the future are
// hidden by the `public_read_guides` policy and are therefore absent from the
// snapshot — the drip queue is the one thing here with no copy. Closing it
// needs a key that bypasses RLS, which is a decision about blast radius that
// belongs to Raz, not to this script. MANIFEST records the gap on every run so
// it cannot be quietly forgotten.
//
// TABLES is an allowlist and must stay one. The repository is public, and the
// same database holds leads, clients, signed quotes and the price book. A
// denylist would leak all of those the moment someone adds a table; this way
// a new table is invisible here until a person deliberately adds its name and
// says why it is safe to publish.
import { createClient } from "@supabase/supabase-js"
import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"

const TABLES = [
  "guides",
  "projects",
  "sub_services",
  "service_hubs",
  "faq_groups",
  "site_content",
  "ai_talents",
  "ai_products",
  "ai_campaign_combinations",
  "course_lessons",
  "course_lesson_content",
]

const OUT_DIR = "backups/content"

// Row order from Postgres is not stable between runs, and neither is key order
// across driver versions. Without both, every snapshot is a diff of the whole
// file and the history stops being readable.
function stabilise(rows) {
  const sorted = [...rows].sort((a, b) => String(a.id ?? a.slug ?? "").localeCompare(String(b.id ?? b.slug ?? "")))
  return sorted.map((row) => Object.fromEntries(Object.keys(row).sort().map((k) => [k, row[k]])))
}

async function main() {
  const url = process.env.VITE_SUPABASE_URL
  const key = process.env.VITE_SUPABASE_ANON_KEY
  if (!url || !key) {
    console.error("backup-content: no Supabase credentials, refusing to write a partial snapshot.")
    process.exit(1)
  }

  const supabase = createClient(url, key)
  await mkdir(OUT_DIR, { recursive: true })

  const manifest = {
    taken_at: new Date().toISOString(),
    read_as: "anon",
    known_gap: "Read with the public anon key, so guides dated in the future are excluded by RLS. Scheduled, unpublished articles are not backed up here.",
    tables: {},
  }

  for (const table of TABLES) {
    const { data, error } = await supabase.from(table).select("*")
    // Never overwrite a good snapshot with a broken read. A backup that fails
    // silently is worse than no backup, because it is trusted.
    if (error) {
      console.error(`backup-content: could not read ${table}: ${error.message}`)
      process.exit(1)
    }
    const rows = stabilise(data ?? [])
    await writeFile(path.join(OUT_DIR, `${table}.json`), JSON.stringify(rows, null, 2) + "\n", "utf8")
    manifest.tables[table] = rows.length
    console.log(`backup-content: ${table} — ${rows.length} rows`)
  }

  await writeFile(path.join(OUT_DIR, "MANIFEST.json"), JSON.stringify(manifest, null, 2) + "\n", "utf8")
  console.log(`backup-content: wrote ${TABLES.length} tables to ${OUT_DIR}`)
}

main()
