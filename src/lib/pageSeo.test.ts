import { describe, expect, it } from "vitest"
import { PAGE_SEO_DEFAULTS, resolvePageSeo } from "@/lib/pageSeo"
import { resolveRouteMeta, SEO_KEY_FOR_ROUTE } from "@/lib/routeMeta"
// @ts-expect-error plain JS build helper, no types
import { patchHead } from "../../scripts/lib/render-utils.mjs"
import indexHtml from "../../index.html?raw"

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

// The defect this exists to prevent: the admin showed "עליי · RAZ" as the
// page's current title while Google had been given a different one, so opening
// the editor and pressing save would silently have replaced a working title
// with a weaker one. One string per page, and this proves it stays that way.
describe("the admin's defaults are the strings crawlers already have", () => {
  it("matches the prerendered head for every editable route", () => {
    for (const [route, key] of Object.entries(SEO_KEY_FOR_ROUTE)) {
      const shipped = resolveRouteMeta(route, {})
      expect(shipped, `${route} has no prerenderable metadata`).not.toBeNull()
      expect(PAGE_SEO_DEFAULTS[key]?.meta_title, `${key} title`).toBe(shipped?.title)
      expect(PAGE_SEO_DEFAULTS[key]?.meta_description, `${key} description`).toBe(shipped?.description)
    }
  })

  // The homepage's head is index.html's own file rather than a generated
  // snapshot, so its default has to match that file and not just routeMeta.
  it("matches index.html for the homepage", () => {
    expect(indexHtml).toContain(`<title>${PAGE_SEO_DEFAULTS.seo_home.meta_title}</title>`)
    expect(indexHtml).toContain(`content="${PAGE_SEO_DEFAULTS.seo_home.meta_description}"`)
  })

  // With nothing written in the admin, the build must leave the homepage's
  // <head> exactly as it shipped. Anything else would be this change quietly
  // rewriting the site's most important page.
  it("leaves index.html byte-identical when nothing is written", () => {
    const meta = resolveRouteMeta("/", {})
    expect(patchHead(indexHtml, meta!)).toBe(indexHtml)
  })

  it("rewrites index.html once something is written", () => {
    const meta = resolveRouteMeta("/", { pageSeo: { seo_home: { meta_title: "כותרת חדשה" } } } as never)
    expect(patchHead(indexHtml, meta!)).toContain("<title>כותרת חדשה</title>")
  })
})
