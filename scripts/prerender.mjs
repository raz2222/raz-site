// Runs after `vite build`. Server-renders routes with react-dom/server (via
// src/entry-server.tsx) so crawlers that don't execute JavaScript still see
// real content instead of an empty shell.
//
// The homepage is inlined into dist/index.html itself. Every other route gets
// its own dist/<route>/index.html, which Vercel serves before falling back to
// the SPA rewrite in vercel.json — so /guides/foo returns a real page with a
// real <title> instead of the homepage shell. The client still does a normal
// createRoot(...).render(...) on load, which replaces this markup: no
// hydration, no behavior change for real visitors.
//
// Content pages read from Supabase inside useEffect, which React never runs
// during renderToString, so their data is fetched here and injected via
// SsrDataContext. The <head> is patched separately (see patchHead), because
// useDocumentMeta sets those tags in an effect too.
import { createClient } from "@supabase/supabase-js"
import { build, loadEnv } from "vite"
import { readFile, writeFile, mkdir, rm } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"
import { stripTags, htmlToMarkdown, patchHead, extractMain } from "./lib/render-utils.mjs"

const root = path.resolve(fileURLToPath(import.meta.url), "../..")
const ssrOutDir = path.join(root, "dist-ssr")
const distDir = path.join(root, "dist")
const distIndexPath = path.join(distDir, "index.html")
const distIndexMdPath = path.join(distDir, "index.md")

const HOMEPAGE_TITLE = "Made by RAZ | סרטוני AI, פרסומות AI ובניית אתרים"
const HOMEPAGE_DESCRIPTION =
  "סרטוני AI, פרסומות וקריאייטיב למותגים, לצד עיצוב ופיתוח אתרים. מעל 200 אתרים ו־6 שנות ניסיון בדיגיטל. בואו ניצור משהו שאי אפשר להתעלם ממנו."

// A prerendered page with less text than this is almost certainly a loading
// or "not found" state — better to skip it than to ship it under a real title.
const MIN_TEXT_CHARS = 500

// Measured inside <main> only. The shared header/footer (nav, mega-menu, gift
// banner) is ~1,500 characters on its own, so a whole-document count would
// pass a page whose actual content failed to load.
const MIN_MAIN_TEXT_CHARS = 400

async function buildSsrBundle() {
  await build({
    root,
    build: {
      ssr: "src/entry-server.tsx",
      outDir: "dist-ssr",
      emptyOutDir: true,
      write: true,
    },
    logLevel: "warn",
  })
  return path.join(ssrOutDir, "entry-server.js")
}

// Mirrors the queries the client hooks make (hooks/useContent.ts,
// hooks/useProjects.ts) so server-rendered pages match what a visitor sees.
// Returns {} if Supabase is unavailable: English pages still prerender from
// static bundle content, and Hebrew content pages are skipped rather than
// shipped empty.
async function fetchSsrData() {
  const env = loadEnv("production", root, "")
  const supabaseUrl = env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const supabaseKey = env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseKey) {
    console.warn("Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY — prerendering static routes only.")
    return {}
  }

  const supabase = createClient(supabaseUrl, supabaseKey)
  const [guides, subServices, serviceHubs, faqGroups, projects] = await Promise.all([
    supabase.from("guides").select("*").order("date_published", { ascending: false }).order("sort_order", { ascending: true }),
    supabase.from("sub_services").select("*").order("sort_order", { ascending: true }),
    supabase.from("service_hubs").select("*").order("sort_order", { ascending: true }),
    supabase.from("faq_groups").select("*").order("sort_order", { ascending: true }),
    supabase.from("projects").select("*").order("sort_order", { ascending: true }),
  ])

  for (const result of [guides, subServices, serviceHubs, faqGroups, projects]) {
    if (result.error) throw result.error
  }

  return {
    guides: guides.data ?? [],
    subServices: subServices.data ?? [],
    serviceHubs: serviceHubs.data ?? [],
    faqGroups: faqGroups.data ?? [],
    projects: projects.data ?? [],
  }
}

const ROOT_PLACEHOLDER = '<div id="root"></div>'

/** Renders the homepage into dist/index.html (kept separate: it is the SPA shell). */
export async function prerenderHomepage(render, data, template) {
  const appHtml = render("/", data)

  const text = stripTags(appHtml)
  if (!/<h1[\s>]/i.test(appHtml)) {
    throw new Error("Prerender check failed for /: no <h1> found in server-rendered output.")
  }
  if (text.length < MIN_TEXT_CHARS) {
    throw new Error(`Prerender check failed for /: only ${text.length} chars of text (need ${MIN_TEXT_CHARS}+).`)
  }

  if (!template.includes(ROOT_PLACEHOLDER)) {
    throw new Error(`dist/index.html does not contain the expected ${ROOT_PLACEHOLDER} placeholder.`)
  }
  await writeFile(distIndexPath, template.replace(ROOT_PLACEHOLDER, `<div id="root">${appHtml}</div>`), "utf-8")

  return { appHtml, chars: text.length }
}

/**
 * Renders one route into dist/<route>/index.html with a route-correct <head>.
 * Returns null (and writes nothing) when the route has no resolvable metadata
 * or renders too little text — a missing snapshot just falls through to the
 * existing SPA rewrite, which is the current behavior anyway.
 */
export async function prerenderRoute(renderPage, url, data, template) {
  const { html, meta } = await renderPage(url, data)
  if (!meta) return null

  const text = stripTags(extractMain(html))
  if (text.length < MIN_MAIN_TEXT_CHARS) return null

  const patched = patchHead(template, meta)
  if (!patched.includes(ROOT_PLACEHOLDER)) {
    // Never write a snapshot whose body is whatever the template happened to
    // hold — that would ship one page's content under another page's title.
    throw new Error(`template for ${url} is missing the ${ROOT_PLACEHOLDER} placeholder.`)
  }
  const finalHtml = patched.replace(ROOT_PLACEHOLDER, `<div id="root">${html}</div>`)

  const outDir = path.join(distDir, url.replace(/^\//, ""))
  await mkdir(outDir, { recursive: true })
  await writeFile(path.join(outDir, "index.html"), finalHtml, "utf-8")
  return { url, chars: text.length }
}

async function main() {
  // This step only improves crawler-friendliness; it must never be able to
  // fail the actual deployment. If anything goes wrong, log it loudly and
  // fall back to the plain client-rendered dist/index.html that already
  // shipped before this script ran, instead of failing the build.
  try {
    const entryPath = await buildSsrBundle()
    const { render, renderPage, listPrerenderRoutes } = await import(pathToFileURL(entryPath).href)

    let data = {}
    try {
      data = await fetchSsrData()
    } catch (err) {
      console.warn("Could not fetch Supabase content — prerendering static routes only.")
      console.warn(err)
    }

    // Read the shell once, before the homepage pass inlines markup into it, so
    // every per-route snapshot starts from an empty #root rather than from
    // whatever the previous route left behind.
    const template = await readFile(distIndexPath, "utf-8")

    const { appHtml, chars } = await prerenderHomepage(render, data, template)
    console.log(`Prerendered "/" into dist/index.html (${chars} chars of visible text).`)

    const markdown = htmlToMarkdown(appHtml, {
      title: HOMEPAGE_TITLE,
      description: HOMEPAGE_DESCRIPTION,
      canonical: "https://madebyraz.co.il/",
    })
    await writeFile(distIndexMdPath, markdown, "utf-8")
    console.log(`Wrote dist/index.md (${markdown.length} chars) for markdown content negotiation.`)

    const routes = listPrerenderRoutes(data)
    const written = []
    const skipped = []
    for (const url of routes) {
      try {
        const result = await prerenderRoute(renderPage, url, data, template)
        if (result) written.push(result)
        else skipped.push(url)
      } catch (err) {
        skipped.push(url)
        console.warn(`  skipped ${url}: ${err.message}`)
      }
    }

    console.log(`Prerendered ${written.length}/${routes.length} additional routes into dist/<route>/index.html.`)
    if (skipped.length) {
      console.log(`Skipped ${skipped.length} (no metadata or too little content): ${skipped.slice(0, 10).join(", ")}${skipped.length > 10 ? "…" : ""}`)
    }
  } catch (err) {
    console.warn("Skipping prerender/markdown generation — build continues without it.")
    console.warn(err)
  } finally {
    await rm(ssrOutDir, { recursive: true, force: true })
  }
}

// Only run when executed directly (`node scripts/prerender.mjs`), not when
// imported for its exports.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main()
}
