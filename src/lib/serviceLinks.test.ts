import { describe, expect, it } from "vitest"
import { SUB_SERVICES_EN } from "@/lib/servicesEn"

// Five pages shipped with no sibling linking to them, and nothing caught it:
// they were reachable from the hub listing, so every page rendered fine and
// looked correct. A sub-service nothing links to is one Google has little
// reason to crawl again, which is the whole point of building the cluster.
describe("sub-service internal links", () => {
  const slugs = new Set(SUB_SERVICES_EN.map((s) => s.slug))

  it("every relatedSlug resolves to a real sub-service", () => {
    const broken = SUB_SERVICES_EN.flatMap((s) =>
      s.relatedSlugs.filter((r) => !slugs.has(r)).map((r) => `${s.slug} -> ${r}`)
    )
    expect(broken).toEqual([])
  })

  it("no sub-service links to itself", () => {
    const selfLinks = SUB_SERVICES_EN.filter((s) => s.relatedSlugs.includes(s.slug)).map((s) => s.slug)
    expect(selfLinks).toEqual([])
  })

  it("every sub-service is linked to by at least one sibling", () => {
    const linkedTo = new Set(SUB_SERVICES_EN.flatMap((s) => s.relatedSlugs))
    const orphans = SUB_SERVICES_EN.filter((s) => !linkedTo.has(s.slug)).map((s) => s.slug)
    expect(orphans).toEqual([])
  })
})
