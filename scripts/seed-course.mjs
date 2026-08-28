#!/usr/bin/env node
/**
 * Seed / refresh course_lessons + course_lesson_content from the Markdown
 * drafts in the higgsfield-course repo.
 *
 *   node scripts/seed-course.mjs                 # upsert into Supabase
 *   node scripts/seed-course.mjs --emit-sql      # print SQL, touch nothing
 *   node scripts/seed-course.mjs --dry-run       # parse + report, no writes
 *
 * Env for the default (write) mode:
 *   SUPABASE_URL                 (or VITE_SUPABASE_URL from .env)
 *   SUPABASE_SERVICE_ROLE_KEY    service_role key — RLS is owner-only
 *   COURSE_CONTENT_DIR           default: ../../higgsfield-course (sibling of Projects/)
 *
 * Also copies resources/*.md into public/course/resources/ so the per-lesson
 * download links resolve.
 *
 * Idempotent: upserts by slug, safe to re-run after draft edits.
 */
import { readFileSync, readdirSync, mkdirSync, copyFileSync, existsSync, writeFileSync } from "node:fs"
import { join, dirname, basename } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = join(__dirname, "..")
const CONTENT_DIR =
  process.env.COURSE_CONTENT_DIR ||
  [join(REPO_ROOT, "..", "..", "higgsfield-course"), join(REPO_ROOT, "..", "higgsfield-course")].find(
    (p) => existsSync(join(p, "modules"))
  ) ||
  join(REPO_ROOT, "..", "..", "higgsfield-course")
const MODULES_DIR = join(CONTENT_DIR, "modules")
const RESOURCES_SRC = join(CONTENT_DIR, "resources")
const RESOURCES_DEST = join(REPO_ROOT, "public", "course", "resources")

const MODE = process.argv.includes("--emit-sql")
  ? "sql"
  : process.argv.includes("--dry-run")
    ? "dry"
    : "write"

const RESOURCE_LABELS = {
  "model-picker.md": "בוחר מודל — מה לבחור למה",
  "prompt-structure-cheatsheet.md": "מבנה פרומפט — צ׳יטשיט",
  "camera-vocabulary.md": "אוצר מילים למצלמה",
  "consistency-checklist.md": "צ׳קליסט עקביות דמות/לוקיישן",
  "shot-list-template.md": "תבנית shot list",
  "credits-planner.md": "מחשבון קרדיטים לפרויקט",
}

// ---------------------------------------------------------------- parsing

function parseFrontmatter(raw) {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/)
  if (!m) throw new Error("no frontmatter")
  const fm = {}
  for (const line of m[1].split("\n")) {
    const i = line.indexOf(":")
    if (i === -1) continue
    const key = line.slice(0, i).trim()
    let val = line.slice(i + 1).trim()
    if (val.length >= 2 && val[0] === '"' && val[val.length - 1] === '"') val = val.slice(1, -1)
    fm[key] = val
  }
  return { fm, body: m[2] }
}

/** First paragraph under "## מטרת השיעור". */
function extractSummary(body) {
  const m = body.match(/##\s*מטרת השיעור\s*\n+([\s\S]*?)(\n\s*\n|\n#{2,3}\s|\n---)/)
  if (!m) return null
  return m[1].replace(/\s+/g, " ").trim() || null
}

/** Ordered unique list of downloadable resources referenced in the body. */
function extractResources(body) {
  const seen = new Set()
  const out = []
  const re = /`resources\/([a-z0-9-]+\.md)`/g
  let m
  while ((m = re.exec(body)) !== null) {
    const name = m[1]
    if (seen.has(name)) continue
    seen.add(name)
    out.push({ label: RESOURCE_LABELS[name] || name.replace(/\.md$/, ""), url: `/course/resources/${name}` })
  }
  return out
}

/** Strip production-only sections ("מה להקליט…", "משאבים") and trailing rules. */
function studentBody(body) {
  const lines = body.split("\n")
  const kept = []
  let skipping = false
  for (const line of lines) {
    const h = line.match(/^##\s+(.*)$/)
    if (h) {
      const title = h[1].trim()
      skipping = title.startsWith("מה להקליט") || title === "משאבים"
      if (skipping) continue
    }
    if (!skipping) kept.push(line)
  }
  return kept.join("\n").replace(/\n{3,}/g, "\n\n").replace(/(\n\s*---\s*)+\s*$/, "").trim()
}

function walk(dir) {
  const out = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name)
    if (entry.isDirectory()) out.push(...walk(p))
    else if (entry.name.endsWith(".md")) out.push(p)
  }
  return out.sort()
}

function loadLessons() {
  const files = walk(MODULES_DIR)
  return files.map((path) => {
    const raw = readFileSync(path, "utf8")
    const { fm, body } = parseFrontmatter(raw)
    return {
      slug: fm.slug,
      module_no: Number(fm.module_no),
      lesson_no: Number(fm.lesson_no),
      order_index: Number(fm.order_index),
      title_he: fm.title_he,
      summary_he: extractSummary(body),
      duration_min: fm.duration_min ? Number(fm.duration_min) : null,
      is_free: fm.is_free === "true",
      published: fm.published === "true",
      resources: extractResources(body),
      body_he: studentBody(body),
      video_url: null,
      _file: path,
    }
  })
}

// ---------------------------------------------------------------- resources copy

function copyResources() {
  if (!existsSync(RESOURCES_SRC)) {
    console.warn(`! resources dir not found: ${RESOURCES_SRC}`)
    return
  }
  mkdirSync(RESOURCES_DEST, { recursive: true })
  for (const name of readdirSync(RESOURCES_SRC)) {
    if (!name.endsWith(".md")) continue
    copyFileSync(join(RESOURCES_SRC, name), join(RESOURCES_DEST, name))
  }
  console.log(`✓ copied ${Object.keys(RESOURCE_LABELS).length} resource files -> public/course/resources/`)
}

// ---------------------------------------------------------------- emitters

function sqlLiteral(v) {
  if (v === null || v === undefined) return "null"
  if (typeof v === "number") return String(v)
  if (typeof v === "boolean") return v ? "true" : "false"
  return `$$${String(v)}$$`
}

function emitSql(lessons) {
  const parts = []
  for (const l of lessons) {
    parts.push(`-- ${l.slug}
with up as (
  insert into public.course_lessons
    (slug, module_no, lesson_no, order_index, title_he, summary_he, duration_min, is_free, published, resources)
  values (${sqlLiteral(l.slug)}, ${l.module_no}, ${l.lesson_no}, ${l.order_index},
          ${sqlLiteral(l.title_he)}, ${sqlLiteral(l.summary_he)}, ${sqlLiteral(l.duration_min)},
          ${l.is_free}, ${l.published}, ${sqlLiteral(JSON.stringify(l.resources))}::jsonb)
  on conflict (slug) do update set
    module_no = excluded.module_no, lesson_no = excluded.lesson_no,
    order_index = excluded.order_index, title_he = excluded.title_he,
    summary_he = excluded.summary_he, duration_min = excluded.duration_min,
    is_free = excluded.is_free, published = excluded.published,
    resources = excluded.resources
  returning id
)
insert into public.course_lesson_content (lesson_id, slug, body_he)
select id, ${sqlLiteral(l.slug)}, ${sqlLiteral(l.body_he)} from up
on conflict (lesson_id) do update set body_he = excluded.body_he;`)
  }
  return parts.join("\n\n")
}

async function writeToSupabase(lessons) {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    console.error("Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY. Use --emit-sql to run it by hand.")
    process.exit(1)
  }
  const { createClient } = await import("@supabase/supabase-js")
  const db = createClient(url, key, { auth: { persistSession: false } })

  for (const l of lessons) {
    const { _file, body_he, video_url, ...meta } = l
    const { data, error } = await db
      .from("course_lessons")
      .upsert(meta, { onConflict: "slug" })
      .select("id")
      .single()
    if (error) throw new Error(`${l.slug}: ${error.message}`)

    const payload = { lesson_id: data.id, slug: l.slug, body_he }
    // Only set video_url when the draft carries one, so admin edits survive re-seeds.
    if (video_url) payload.video_url = video_url
    const { error: cErr } = await db
      .from("course_lesson_content")
      .upsert(payload, { onConflict: "lesson_id" })
    if (cErr) throw new Error(`${l.slug} content: ${cErr.message}`)
    console.log(`✓ ${l.slug}`)
  }
}

// ---------------------------------------------------------------- main

const lessons = loadLessons()
console.log(`Parsed ${lessons.length} lessons from ${MODULES_DIR}`)
for (const l of lessons) {
  console.log(
    `  ${String(l.order_index).padStart(2, "0")} ${l.slug}  ` +
      `mod ${l.module_no}  ${l.is_free ? "free" : "paid"}  ` +
      `${l.resources.length} files  ${l.body_he.length}b body`
  )
}

if (MODE === "sql") {
  const sql = emitSql(lessons)
  const outFile = process.env.SEED_SQL_OUT
  if (outFile) {
    writeFileSync(outFile, sql + "\n")
    console.error(`\nSQL written to ${outFile}`)
  } else {
    process.stdout.write("\n" + sql + "\n")
  }
  copyResources()
} else if (MODE === "dry") {
  copyResources()
  console.log("\n(dry run — nothing written to the database)")
} else {
  copyResources()
  await writeToSupabase(lessons)
  console.log("\nDone.")
}
