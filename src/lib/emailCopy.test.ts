import { describe, expect, it } from "vitest"

/** Read through Vite rather than node:fs, so this file type-checks in the app
 * project like every other test instead of needing Node types pulled in. */
const apiSources = import.meta.glob("/api/**/*.ts", { query: "?raw", import: "default", eager: true }) as Record<
  string,
  string
>

/** The API routes are the one surface whose words leave the site entirely, and
 * until now the only code the test run never touched. Both rules below were
 * broken in production for a week with nothing to notice. */
describe("outgoing email", () => {
  // generate-image.ts is a prompt to an image model, not copy anyone reads.
  const files = Object.entries(apiSources).filter(([path]) => !path.endsWith("generate-image.ts"))

  it("has files to check", () => {
    expect(files.length).toBeGreaterThan(4)
  })

  // A quote went out subjected "הצעת מחיר — RAZ" because nothing checked the
  // no-em-dash rule outside src/.
  it("never uses an em dash", () => {
    expect(files.filter(([, source]) => source.includes("—")).map(([path]) => path)).toEqual([])
  })

  // The outage: Vercel compiles these to ESM, Node refuses a relative import
  // with no extension, and five endpoints exited on import and sent nothing.
  it("gives every relative import the extension Node requires", () => {
    const bad: string[] = []
    for (const [path, source] of files) {
      for (const match of source.matchAll(/from\s+"(\.[^"]*)"/g)) {
        if (!match[1].endsWith(".js")) bad.push(`${path}: ${match[1]}`)
      }
    }
    expect(bad).toEqual([])
  })
})
