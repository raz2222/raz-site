// Runs after `vite build`. public/sitemap.xml was a hand-maintained static
// file that drifted out of sync with real content (guides/case
// studies/sub-services are managed in Supabase via the admin panel, not by
// editing this repo) — dozens of real guide URLs were missing from it. This
// regenerates dist/sitemap.xml from the actual live data on every deploy, so
// it can't go stale again.
//
// Fails soft: if Supabase is unreachable or env vars are missing, it leaves
// the static dist/sitemap.xml that `vite build` already copied from
// public/sitemap.xml untouched and logs a warning, instead of failing the
// build or shipping a broken/empty sitemap.
import { createClient } from "@supabase/supabase-js"
import { build, loadEnv } from "vite"
import { writeFile, rm } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"
import { buildSitemapXml, dedupeUrls } from "./lib/sitemap-utils.mjs"

const root = path.resolve(fileURLToPath(import.meta.url), "../..")
const dataOutDir = path.join(root, "dist-sitemap-data")
const distSitemapPath = path.join(root, "dist", "sitemap.xml")
const BASE = "https://madebyraz.co.il"

export const STATIC_URLS = [
  { loc: `${BASE}/`, changefreq: "weekly", priority: 1.0 },
  { loc: `${BASE}/work`, changefreq: "weekly", priority: 0.9 },
  { loc: `${BASE}/services`, changefreq: "monthly", priority: 0.8 },
  { loc: `${BASE}/services/web-design`, changefreq: "monthly", priority: 0.9 },
  { loc: `${BASE}/services/ai-content`, changefreq: "monthly", priority: 0.9 },
  { loc: `${BASE}/ai-creative`, changefreq: "monthly", priority: 0.9 },
  { loc: `${BASE}/web-development`, changefreq: "monthly", priority: 0.9 },
  { loc: `${BASE}/about`, changefreq: "monthly", priority: 0.6 },
  { loc: `${BASE}/faq`, changefreq: "monthly", priority: 0.6 },
  { loc: `${BASE}/contact`, changefreq: "monthly", priority: 0.7 },
  { loc: `${BASE}/guides`, changefreq: "weekly", priority: 0.8 },
  { loc: `${BASE}/privacy`, changefreq: "yearly", priority: 0.3 },
  { loc: `${BASE}/terms`, changefreq: "yearly", priority: 0.3 },
  { loc: `${BASE}/tools`, changefreq: "monthly", priority: 0.5 },
  { loc: `${BASE}/experiments`, changefreq: "monthly", priority: 0.4 },
  { loc: `${BASE}/en`, changefreq: "monthly", priority: 0.5 },
  { loc: `${BASE}/en/services`, changefreq: "monthly", priority: 0.5 },
  { loc: `${BASE}/en/services/web-design`, changefreq: "monthly", priority: 0.5 },
  { loc: `${BASE}/en/services/ai-content`, changefreq: "monthly", priority: 0.5 },
  { loc: `${BASE}/en/experiments`, changefreq: "monthly", priority: 0.3 },
  { loc: `${BASE}/en/contact`, changefreq: "monthly", priority: 0.4 },
  { loc: `${BASE}/en/faq`, changefreq: "monthly", priority: 0.4 },
  { loc: `${BASE}/en/about`, changefreq: "monthly", priority: 0.4 },
  { loc: `${BASE}/en/work`, changefreq: "weekly", priority: 0.5 },
  { loc: `${BASE}/en/guides`, changefreq: "weekly", priority: 0.5 },
]

async function loadStaticEnglishData() {
  await build({
    root,
    build: {
      ssr: "src/sitemap-data.ts",
      outDir: "dist-sitemap-data",
      emptyOutDir: true,
      write: true,
    },
    logLevel: "warn",
  })
  const mod = await import(pathToFileURL(path.join(dataOutDir, "sitemap-data.js")).href)
  return mod
}

async function fetchSupabaseUrls() {
  const env = loadEnv("production", root, "")
  const supabaseUrl = env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const supabaseKey = env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY — can't fetch dynamic sitemap URLs.")
  }
  const supabase = createClient(supabaseUrl, supabaseKey)
  const urls = []

  const { data: projects, error: projectsError } = await supabase.from("projects").select("slug")
  if (projectsError) throw projectsError
  for (const p of projects ?? []) {
    if (!p.slug) continue
    urls.push({ loc: `${BASE}/work/${p.slug}`, priority: 0.7 })
    urls.push({ loc: `${BASE}/en/work/${p.slug}`, priority: 0.4 })
  }

  const { data: guides, error: guidesError } = await supabase.from("guides").select("slug, updated_at")
  if (guidesError) throw guidesError
  for (const g of guides ?? []) {
    if (!g.slug) continue
    urls.push({ loc: `${BASE}/guides/${g.slug}`, lastmod: g.updated_at, changefreq: "monthly", priority: 0.6 })
  }

  const { data: subServices, error: subServicesError } = await supabase.from("sub_services").select("slug, hub_slug")
  if (subServicesError) throw subServicesError
  for (const s of subServices ?? []) {
    if (!s.slug || !s.hub_slug) continue
    urls.push({ loc: `${BASE}/services/${s.hub_slug}/${s.slug}`, changefreq: "monthly", priority: 0.7 })
  }

  return urls
}

export async function buildAllUrls() {
  const [supabaseUrls, { guidesEn, SUB_SERVICES_EN }] = await Promise.all([
    fetchSupabaseUrls(),
    loadStaticEnglishData(),
  ])

  const englishStaticUrls = [
    ...guidesEn.map((g) => ({ loc: `${BASE}/en/guides/${g.slug}`, changefreq: "monthly", priority: 0.5 })),
    ...SUB_SERVICES_EN.map((s) => ({
      loc: `${BASE}/en/services/${s.hubSlug}/${s.slug}`,
      changefreq: "monthly",
      priority: 0.4,
    })),
  ]

  return dedupeUrls([...STATIC_URLS, ...supabaseUrls, ...englishStaticUrls])
}

async function main() {
  try {
    const urls = await buildAllUrls()
    const xml = buildSitemapXml(urls)
    await writeFile(distSitemapPath, xml, "utf-8")
    console.log(`Wrote dist/sitemap.xml with ${urls.length} URLs (from Supabase + static content).`)
  } catch (err) {
    console.warn("Skipping sitemap regeneration — keeping the static public/sitemap.xml as shipped.")
    console.warn(err)
  } finally {
    // rm can still reject (ENOTEMPTY) if the SSR build is flushing files into
    // this directory as we remove it — `force` only suppresses ENOENT. An
    // uncaught rejection here would fail the deploy over leftover scratch
    // files, which is exactly what this script promises never to do.
    await rm(dataOutDir, { recursive: true, force: true }).catch((err) => {
      console.warn(`Could not clean up ${dataOutDir}:`, err.message)
    })
  }
}

// Only run when executed directly (`node scripts/generate-sitemap.mjs`), not
// when imported — scripts/generate-sitemap.test.mjs imports STATIC_URLS.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main()
}
