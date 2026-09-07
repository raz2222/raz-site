import { readdirSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

/** Vercel's Hobby plan allows twelve Serverless Functions per deployment, and
 * it refuses at the deploy step · `exceeded_serverless_functions_per_deployment`
 * · *after* the build has already reported success. Three deploys failed that
 * way with a clean build log and production quietly kept serving the previous
 * version, which is the worst shape a failure can take: invisible from
 * everything anyone actually looks at.
 *
 * So the count is asserted here instead. Adding a thirteenth endpoint fails a
 * test on the machine that wrote it, rather than a deployment nobody reads.
 *
 * What counts is what the zero-config Node builder picks up: every source file
 * under `api/`, at any depth, whose path has no segment starting with `_` or
 * `.`. A `.test.ts` file is not special to Vercel · `api/push.test.ts` was
 * deployed as a function at `/api/push.test`, and was the thirteenth. That is
 * why the tests for these endpoints live in `api/_tests/`.
 */

const API_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const SOURCE = /\.(ts|tsx|js|mjs|jsx)$/
const LIMIT = 12

function deployedFunctions(dir: string, prefix = ""): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name.startsWith("_") || entry.name.startsWith(".")) return []
    const here = prefix ? `${prefix}/${entry.name}` : entry.name
    if (entry.isDirectory()) return deployedFunctions(path.join(dir, entry.name), here)
    return SOURCE.test(entry.name) ? [here] : []
  })
}

describe("serverless function count", () => {
  it("stays within the twelve the Hobby plan allows", () => {
    const functions = deployedFunctions(API_DIR).sort()
    expect(functions.length, `deployed as functions:\n${functions.join("\n")}`).toBeLessThanOrEqual(
      LIMIT
    )
  })

  it("does not deploy a test file as an endpoint", () => {
    expect(deployedFunctions(API_DIR).filter((file) => file.includes(".test."))).toEqual([])
  })
})
