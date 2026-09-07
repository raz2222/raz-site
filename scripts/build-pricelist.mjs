#!/usr/bin/env node
/**
 * Renders docs/pricelist/ai-video-pricelist.html to the PDF Raz sends clients.
 *
 * The HTML is self contained · Rubik's Hebrew and Latin subsets are inlined as
 * base64, so the file renders identically with no network and no fonts
 * installed. Change a price in the HTML, run this, and the PDF is current.
 *
 * Chromium is deliberately not a dependency, the same way ffmpeg is not: this
 * looks for a browser already on the machine and says so if there is none, so a
 * normal build and Vercel never install one.
 *
 *   node scripts/build-pricelist.mjs
 */
import { execFileSync } from "node:child_process"
import { existsSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const source = resolve(root, "docs/pricelist/ai-video-pricelist.html")
const output = resolve(root, "docs/pricelist/madebyraz-ai-video-pricelist.pdf")

const candidates = [
  process.env.CHROME_PATH,
  "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
].filter(Boolean)

const chrome = candidates.find((path) => existsSync(path))
if (!chrome) {
  console.error("No Chrome or Chromium found. Set CHROME_PATH to a browser binary and run again.")
  process.exit(1)
}

execFileSync(
  chrome,
  [
    "--headless",
    "--disable-gpu",
    "--no-sandbox",
    // The inlined fonts use font-display:block, so text is invisible until they
    // decode. Without this the screenshot can win the race and print blank.
    "--virtual-time-budget=8000",
    "--no-pdf-header-footer",
    `--print-to-pdf=${output}`,
    `file://${source}`,
  ],
  { stdio: "inherit" }
)

console.log(`Wrote ${output}`)
