// Runs after `vite build`. Server-renders the homepage with react-dom/server
// (via src/entry-server.tsx) and inlines the resulting markup into the built
// dist/index.html, so crawlers that don't execute JavaScript still see real
// content (an <h1> and 500+ characters of text) instead of an empty shell.
// The client still does a normal `createRoot(...).render(...)` on load, which
// replaces this markup — no hydration, no behavior change for real visitors.
import { build } from "vite"
import { readFile, writeFile, rm } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"
import { stripTags, htmlToMarkdown } from "./lib/render-utils.mjs"

const root = path.resolve(fileURLToPath(import.meta.url), "../..")
const ssrOutDir = path.join(root, "dist-ssr")
const distDir = path.join(root, "dist")
const distIndexPath = path.join(distDir, "index.html")
const distIndexMdPath = path.join(distDir, "index.md")

const HOMEPAGE_TITLE = "Made by RAZ | סרטוני AI, פרסומות AI ובניית אתרים"
const HOMEPAGE_DESCRIPTION =
  "סרטוני AI, פרסומות וקריאייטיב למותגים, לצד עיצוב ופיתוח אתרים. מעל 200 אתרים ו־6 שנות ניסיון בדיגיטל. בואו ניצור משהו שאי אפשר להתעלם ממנו."

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

export async function prerenderRoute(url) {
  const entryPath = await buildSsrBundle()
  const { render } = await import(pathToFileURL(entryPath).href)
  const appHtml = render(url)

  const text = stripTags(appHtml)
  if (!/<h1[\s>]/i.test(appHtml)) {
    throw new Error(`Prerender check failed for ${url}: no <h1> found in server-rendered output.`)
  }
  if (text.length < 500) {
    throw new Error(
      `Prerender check failed for ${url}: only ${text.length} chars of text (need 500+).`
    )
  }

  const template = await readFile(distIndexPath, "utf-8")
  if (!template.includes('<div id="root"></div>')) {
    throw new Error('dist/index.html does not contain the expected <div id="root"></div> placeholder.')
  }
  const finalHtml = template.replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`)
  await writeFile(distIndexPath, finalHtml, "utf-8")

  return { appHtml, chars: text.length }
}

async function main() {
  // This step only improves crawler-friendliness (SSR homepage + markdown
  // variant); it must never be able to fail the actual deployment. If
  // anything goes wrong (e.g. a preview environment missing Supabase env
  // vars that the SSR bundle needs at import time), log it loudly and fall
  // back to the plain client-rendered dist/index.html that already shipped
  // before this script ran, instead of failing the build.
  try {
    const { appHtml, chars } = await prerenderRoute("/")
    console.log(`Prerendered "/" into dist/index.html (${chars} chars of visible text).`)

    const markdown = htmlToMarkdown(appHtml, {
      title: HOMEPAGE_TITLE,
      description: HOMEPAGE_DESCRIPTION,
      canonical: "https://madebyraz.co.il/",
    })
    await writeFile(distIndexMdPath, markdown, "utf-8")
    console.log(`Wrote dist/index.md (${markdown.length} chars) for markdown content negotiation.`)
  } catch (err) {
    console.warn("Skipping homepage prerender/markdown generation — build continues without it.")
    console.warn(err)
  } finally {
    await rm(ssrOutDir, { recursive: true, force: true })
  }
}

main()
