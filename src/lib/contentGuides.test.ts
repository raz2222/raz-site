import { describe, expect, it } from "vitest"
import { CATEGORY_COVERS, CATEGORY_EN, contentGuides, type ContentGuide } from "./contentGuides"
import { guidesEn } from "./guidesEn"

// The daily routine writes these unattended, so this file is the reviewer: a
// guide that breaks a house rule fails `npm test`, and the routine is told not
// to push on a red run. Every rule here is one the existing articles already
// follow (see .claude/skills/raz-guide-writer/SKILL.md), so the generated ones
// stay indistinguishable from the rest of /guides.

const words = (paras: string[]) => paras.join(" ").split(/\s+/).filter(Boolean).length
const bodyWords = (g: { sections: { paragraphs: string[] }[] }) => words(g.sections.flatMap((s) => s.paragraphs))
const allText = (g: ContentGuide) => JSON.stringify(g)
const links = (g: { sections: { paragraphs: string[] }[] }) =>
  g.sections.flatMap((s) => s.paragraphs).flatMap((p) => [...p.matchAll(/\]\(([^)]+)\)/g)].map((m) => m[1]))

const PAGES = ["/services/web-design", "/services/ai-content", "/work"]
const GENERIC_HEADINGS = ["מבוא", "סיכום", "סיכום ומסקנות", "יתרונות", "חסרונות"]

describe.each(contentGuides.map((g) => [g.slug, g] as const))("content guide %s", (_slug, g) => {
  it("is 760 to 1,140 Hebrew words, and says so in read_time", () => {
    const n = bodyWords(g)
    expect(n).toBeGreaterThanOrEqual(760)
    expect(n).toBeLessThanOrEqual(1140)
    expect(g.read_time).toBe(`${Math.round(n / 190)} דקות קריאה`)
  })

  it("has the article shape: 7 to 9 sections of 2 to 3 paragraphs, 4 to 6 FAQ", () => {
    expect(g.sections.length).toBeGreaterThanOrEqual(7)
    expect(g.sections.length).toBeLessThanOrEqual(9)
    for (const s of g.sections) {
      expect(s.paragraphs.length).toBeGreaterThanOrEqual(2)
      expect(s.paragraphs.length).toBeLessThanOrEqual(3)
      expect(GENERIC_HEADINGS).not.toContain(s.heading.trim())
    }
    expect(g.faq.length).toBeGreaterThanOrEqual(4)
    expect(g.faq.length).toBeLessThanOrEqual(6)
  })

  it("mirrors the same shape in English", () => {
    expect(g.en.sections.length).toBe(g.sections.length)
    expect(g.en.faq.length).toBe(g.faq.length)
    expect(g.en.category).toBe(CATEGORY_EN[g.category])
    expect(g.en.readTime).toMatch(/^\d+ min read$/)
  })

  it("uses no em or en dashes anywhere", () => {
    expect(allText(g)).not.toMatch(/[–—]/)
  })

  it("has a clean English slug, a valid category and a one-line meta description", () => {
    expect(g.slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/)
    expect(Object.keys(CATEGORY_COVERS)).toContain(g.category)
    expect(["web-design", "ai-content", null]).toContain(g.related_service_slug)
    expect(g.meta_description.length).toBeGreaterThanOrEqual(90)
    expect(g.meta_description.length).toBeLessThanOrEqual(160)
    expect(g.date_published).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it("links 3 to 5 times, only to pages that are live by its own date", () => {
    const liveBy = new Set(guidesEn.filter((x) => x.datePublished <= g.date_published && x.slug !== g.slug).map((x) => x.slug))
    for (const [lang, ls] of [
      ["", links(g)],
      ["/en", links(g.en)],
    ] as const) {
      expect(ls.length).toBeGreaterThanOrEqual(3)
      expect(ls.length).toBeLessThanOrEqual(5)
      for (const l of ls) {
        const rest = lang ? l.slice(lang.length) : l
        expect(l.startsWith(lang)).toBe(true)
        const ok = PAGES.includes(rest) || (rest.startsWith("/guides/") && liveBy.has(rest.slice("/guides/".length)))
        expect(ok, `${g.slug} links to ${l}`).toBe(true)
      }
    }
  })

  it("never links to the automation guide, which is not a service Raz sells", () => {
    expect(allText(g)).not.toContain("business-automation-save-hours")
  })
})

describe("the content guide queue", () => {
  it("never reuses a slug or a date", () => {
    const slugs = guidesEn.map((g) => g.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
    const dates = contentGuides.map((g) => g.date_published)
    expect(new Set(dates).size).toBe(dates.length)
  })

  it("alternates a question one day and an informative guide the next", () => {
    for (let i = 1; i < contentGuides.length; i++) {
      expect(contentGuides[i].format, contentGuides[i].slug).not.toBe(contentGuides[i - 1].format)
    }
  })
})
