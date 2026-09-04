import { describe, expect, it } from "vitest"
import { projectTranslations, getProjectTranslation, translateProjectTitle } from "./projectTranslations"

/**
 * EnglishCaseStudy renders "Project not found" when a project has no
 * translation row, so a project that exists only in Supabase turns
 * /en/work/<slug> into a soft 404 while the sitemap still lists it. These
 * assertions keep the English side of a case study from silently going
 * missing the way the English guides once did.
 */
describe("project translations", () => {
  const clientWork = [
    "milk-x-cookies",
    "ironshield",
    "kiddoz",
    "real-estate-website",
  ]

  it.each(clientWork)("%s has an English translation", (slug) => {
    expect(getProjectTranslation(slug)).toBeDefined()
  })

  it("gives every translation the fields the English page reads", () => {
    for (const t of projectTranslations) {
      expect(t.category, t.slug).not.toBe("")
      expect(t.overview.length, t.slug).toBeGreaterThan(40)
      expect(t.challenges.length, t.slug).toBeGreaterThan(0)
      expect(t.solutions.length, t.slug).toBeGreaterThan(0)
    }
  })

  it("never leaves a challenge or solution without a body", () => {
    for (const t of projectTranslations) {
      for (const item of [...t.challenges, ...t.solutions]) {
        expect(item.title, `${t.slug}: ${item.title}`).not.toBe("")
        expect(item.description.length, `${t.slug}: ${item.title}`).toBeGreaterThan(40)
      }
    }
  })

  it("uses no slug twice", () => {
    const slugs = projectTranslations.map((t) => t.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  /** Raz's standing copy rule: the middle dot, never an em dash. */
  it("keeps em dashes out of the copy", () => {
    for (const t of projectTranslations) {
      const copy = [
        t.overview,
        ...t.challenges.flatMap((c) => [c.title, c.description]),
        ...t.solutions.flatMap((s) => [s.title, s.description]),
        ...t.results,
      ].join(" ")
      expect(copy, t.slug).not.toContain("—")
    }
  })
})

describe("translateProjectTitle", () => {
  it("gives the client work an English title", () => {
    for (const slug of ["milk-x-cookies", "ironshield", "kiddoz", "real-estate-website"]) {
      const title = translateProjectTitle(slug, "HEBREW FALLBACK")
      expect(title, slug).not.toBe("HEBREW FALLBACK")
      expect(/[֐-׿]/.test(title), `${slug} still renders Hebrew on /en`).toBe(false)
    }
  })

  it("falls back to the stored title when a project has no English name", () => {
    expect(translateProjectTitle("not-a-project", "Serve")).toBe("Serve")
  })
})
