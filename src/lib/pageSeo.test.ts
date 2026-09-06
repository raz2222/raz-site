import { describe, expect, it } from "vitest"
import { PAGE_SEO_DEFAULTS, resolvePageSeo } from "@/lib/pageSeo"

describe("resolvePageSeo", () => {
  it("uses what was typed in the admin", () => {
    const seo = resolvePageSeo("seo_about", { meta_title: "כותרת חדשה", meta_description: "תיאור חדש" })
    expect(seo.meta_title).toBe("כותרת חדשה")
    expect(seo.meta_description).toBe("תיאור חדש")
  })

  // An empty box means "leave it alone". Publishing an empty <title> because a
  // field was cleared would be a silent SEO regression.
  it("falls back to the shipped value for anything left empty", () => {
    const seo = resolvePageSeo("seo_about", { meta_title: "   ", meta_description: "" })
    expect(seo.meta_title).toBe(PAGE_SEO_DEFAULTS.seo_about.meta_title)
    expect(seo.meta_description).toBe(PAGE_SEO_DEFAULTS.seo_about.meta_description)
  })

  it("falls back with nothing stored at all", () => {
    expect(resolvePageSeo("seo_contact", null)).toEqual(PAGE_SEO_DEFAULTS.seo_contact)
    expect(resolvePageSeo("seo_contact", undefined)).toEqual(PAGE_SEO_DEFAULTS.seo_contact)
  })

  it("never returns an empty title, even for a page it does not know", () => {
    expect(resolvePageSeo("seo_nonexistent", null).meta_title.length).toBeGreaterThan(0)
  })

  // Every default must be a string the site already showed, never invented: it
  // appears in the admin as the current value, and one save publishes it.
  it("ships a title and a description for every page it covers", () => {
    for (const [key, seo] of Object.entries(PAGE_SEO_DEFAULTS)) {
      expect(seo.meta_title, key).not.toBe("")
      expect(seo.meta_description, key).not.toBe("")
      expect(seo.meta_title, key).not.toContain("—")
      expect(seo.meta_description, key).not.toContain("—")
    }
  })
})
