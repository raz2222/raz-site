import { describe, expect, it } from "vitest"
import { caseStudyJsonLd } from "./caseStudySchema"
import type { ProjectRow } from "./supabase"

const base = {
  slug: "example", title: "Example", overview: null, year: null, category: null,
  tech_stack: null, ai_tools: null, client_name: null, role: null,
} as unknown as ProjectRow

describe("caseStudyJsonLd", () => {
  it("emits a CreativeWork with the canonical URL for its language", () => {
    expect(caseStudyJsonLd(base, "he").url).toBe("https://madebyraz.co.il/work/example")
    expect(caseStudyJsonLd(base, "en").url).toBe("https://madebyraz.co.il/en/work/example")
  })

  it("omits every field it has no real value for", () => {
    const ld = caseStudyJsonLd(base, "he") as Record<string, unknown>
    for (const k of ["description", "dateCreated", "genre", "keywords", "sourceOrganization", "creditText"]) {
      expect(ld).not.toHaveProperty(k)
    }
  })

  it("marks up the client and the role when they are real", () => {
    const ld = caseStudyJsonLd(
      { ...base, client_name: "Kiddoz", role: "ייעוץ ואפיון" } as ProjectRow, "he"
    ) as Record<string, unknown>
    expect(ld.sourceOrganization).toEqual({ "@type": "Organization", name: "Kiddoz" })
    expect(ld.creditText).toBe("ייעוץ ואפיון")
  })
})
