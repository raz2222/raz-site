import { describe, expect, it } from "vitest"
import { SECTIONS } from "./guideSections"
import { KNOWN_ROUTE_PATTERNS } from "./known-routes"

describe("guide sections", () => {
  it("keeps the blog on /guides so the indexed URLs never move", () => {
    expect(SECTIONS.blog.path).toBe("/guides")
    expect(SECTIONS.blog.kind).toBe("article")
  })

  it("gives tutorials their own path and kind", () => {
    expect(SECTIONS.tutorials.path).toBe("/tutorials")
    expect(SECTIONS.tutorials.kind).toBe("tutorial")
  })

  it("never lets two sections share a path or a kind", () => {
    const paths = Object.values(SECTIONS).map((s) => s.path)
    const kinds = Object.values(SECTIONS).map((s) => s.kind)
    expect(new Set(paths).size).toBe(paths.length)
    expect(new Set(kinds).size).toBe(kinds.length)
  })

  it("routes every section, index and article alike", () => {
    for (const s of Object.values(SECTIONS)) {
      expect(KNOWN_ROUTE_PATTERNS).toContain(s.path)
      expect(KNOWN_ROUTE_PATTERNS).toContain(`${s.path}/:slug`)
    }
  })
})
