import { describe, expect, it } from "vitest"

/** Read through Vite rather than node:fs, so this file type-checks in the app
 * project like every other test instead of needing Node types pulled in · the
 * same reason emailCopy.test.ts reads the API routes that way. */
const files = import.meta.glob("/{index.html,vercel.json}", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>

/** An inline script whose hash is missing from the CSP does not fail loudly ·
 * the browser refuses to run it and says so only in a console nobody has open.
 * The stale-build recovery in index.html is exactly the script that must not
 * quietly stop running: it is what turns a black screen into a reload. */
describe("inline scripts in index.html", () => {
  const html = files["/index.html"]
  const csp = files["/vercel.json"]

  // JSON-LD is data, not script, and carries no hash.
  const inline = [
    ...html.matchAll(/<script(?![^>]*\ssrc=)(?![^>]*type="application\/ld\+json")[^>]*>([\s\S]*?)<\/script>/g),
  ].map(([, body]) => body)

  it("finds the scripts it is meant to be checking", () => {
    expect(inline.length).toBe(2)
  })

  it("has every one of them allowed by the CSP", async () => {
    for (const body of inline) {
      expect(csp, `no CSP hash for an inline script starting: ${body.trim().slice(0, 60)}`).toContain(
        await sha256Base64(body)
      )
    }
  })

  it("still carries the stale-build recovery, which is the point of the exercise", () => {
    expect(inline.some((body) => body.includes("raz-stale-build"))).toBe(true)
  })
})

async function sha256Base64(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value))
  return `sha256-${btoa(String.fromCharCode(...new Uint8Array(digest)))}`
}
