import { readFileSync, statSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

/** supabase-js must not be on the first-paint path.
 *
 * It is 204KB · 53KB gzipped · and it was the largest thing every visitor
 * downloaded and evaluated before the page could do anything, because the hooks
 * that read the site's own copy imported it at the top of the file. Nothing on
 * the public site needs it to paint: every page is prerendered to static HTML
 * and each hook starts from that or from the SSR payload, so the client only
 * ever refreshes what is already on screen. It is imported inside effects now,
 * through `getSupabase()`.
 *
 * That is one line in seven files, and one careless `import { supabase }` at the
 * top of any component the homepage renders puts all 204KB back with nothing to
 * show for it. Nobody would notice: the site would work exactly the same, only
 * slower. So the import graph is walked here the way the bundler walks it, and
 * this fails if the entry can reach the client synchronously again.
 */

const SRC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "src")
const ENTRY = path.join(SRC, "main.tsx")
const CLIENT = path.join(SRC, "lib/supabase.ts")

/** Static imports only · `import type` is erased at compile time and
 * `import(...)` is the whole point of the exercise. */
// The clause may not itself contain `import`, or a side-effect line like
// `import "./index.css"` is swallowed together with the statement after it and
// the real specifier is lost. That bug made an earlier version of this test
// walk four files and pass on a graph it had never looked at.
const STATIC_IMPORT = /^[ \t]*import\s+(?!type\b)((?:(?!\bimport\b)[^;])*?)\s*from\s*['"]([^'"]+)['"]/gm

function resolveSpec(spec, from) {
  let base
  if (spec.startsWith("@/")) base = path.join(SRC, spec.slice(2))
  else if (spec.startsWith(".")) base = path.resolve(path.dirname(from), spec)
  else return null

  // "" first, because a specifier can already carry its extension · `./App.tsx`
  // is written that way in main.tsx, and skipping it hid the entire graph.
  for (const ext of ["", ".ts", ".tsx", "/index.ts", "/index.tsx"]) {
    const candidate = base + ext
    try {
      if (statSync(candidate).isFile()) return candidate
    } catch {
      /* keep trying */
    }
  }
  return null
}

function staticDeps(file) {
  const source = readFileSync(file, "utf-8")
  const out = []
  for (const [, clause, spec] of source.matchAll(STATIC_IMPORT)) {
    if (/^\{\s*type\b/.test(clause.trim())) continue
    const resolved = resolveSpec(spec, file)
    if (resolved) out.push(resolved)
  }
  return out
}

/** The shortest chain from the entry to the client, for a failure message that
 * names the file to fix rather than just the fact. */
function pathToClient() {
  const seen = new Set([ENTRY])
  const queue = [[ENTRY]]
  while (queue.length > 0) {
    const chain = queue.shift()
    for (const dep of staticDeps(chain[chain.length - 1])) {
      if (dep === CLIENT) return [...chain, dep]
      if (seen.has(dep)) continue
      seen.add(dep)
      queue.push([...chain, dep])
    }
  }
  return null
}

describe("the first-paint bundle", () => {
  it("cannot reach supabase-js synchronously from the entry", () => {
    const chain = pathToClient()
    expect(
      chain,
      chain
        ? `supabase-js is back on the critical path:\n  ${chain
            .map((f) => path.relative(SRC, f))
            .join("\n  → ")}\nImport it inside the effect with getSupabase() instead.`
        : ""
    ).toBeNull()
  })

  it("walks the whole graph, so the check above cannot pass by accident", () => {
    // A resolver that quietly returns nothing makes the assertion above green
    // and worthless · which is exactly what happened once. Assert the walk
    // reaches a real page deep in the tree, not just that it ran.
    const reached = new Set([ENTRY])
    const stack = [ENTRY]
    while (stack.length > 0) {
      for (const dep of staticDeps(stack.pop())) {
        if (!reached.has(dep)) {
          reached.add(dep)
          stack.push(dep)
        }
      }
    }
    expect(reached.size).toBeGreaterThan(50)
    expect(reached).toContain(path.join(SRC, "hooks/useSiteContent.ts"))
  })
})
