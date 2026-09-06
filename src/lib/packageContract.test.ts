import { describe, expect, it } from "vitest"
import { TEMPLATE_FOR_PACKAGE, contractFieldsFromPackage, templateSlugForItems } from "@/lib/packageContract"
import { CALL_PACKAGES } from "@/lib/callScript"

describe("templateSlugForItems", () => {
  // The bug this exists for: an AI video quote produced a contract about
  // hosting, domains and handing over a website.
  it("writes an AI production agreement for AI work", () => {
    expect(templateSlugForItems([{ category: "ai_content" }, { category: "ai_content" }])).toBe("ai_creative")
    expect(templateSlugForItems([{ category: "creative" }])).toBe("ai_creative")
  })

  it("writes a website agreement for website work", () => {
    expect(templateSlugForItems([{ category: "websites" }, { category: "seo" }])).toBe("website")
  })

  it("treats anything billed monthly as a retainer, whatever it contains", () => {
    expect(templateSlugForItems([{ category: "ai_content", recurring: true }])).toBe("retainer")
    expect(templateSlugForItems([{ category: "websites", recurring: true }])).toBe("retainer")
  })

  it("goes with the majority when a quote mixes categories", () => {
    expect(
      templateSlugForItems([{ category: "ai_content" }, { category: "ai_content" }, { category: "websites" }])
    ).toBe("ai_creative")
  })

  // Guessing wrong here means emailing someone the wrong agreement. An empty
  // clause list and a picker is the smaller failure.
  it("refuses to guess on an even split", () => {
    expect(templateSlugForItems([{ category: "ai_content" }, { category: "websites" }])).toBeNull()
  })

  it("refuses to guess with no items or no recognisable category", () => {
    expect(templateSlugForItems([])).toBeNull()
    expect(templateSlugForItems([{ category: null }, { category: "something_new" }])).toBeNull()
  })
})

describe("contractFieldsFromPackage", () => {
  it("carries the package's own numbers, not a retyped copy", () => {
    for (const key of ["pilot", "monthly"] as const) {
      const fields = contractFieldsFromPackage(key)
      expect(fields.total).toBe(CALL_PACKAGES[key].price)
      expect(fields.title).toBe(CALL_PACKAGES[key].name)
      expect(fields.package_key).toBe(key)
    }
  })

  it("puts each package on the agreement that fits it", () => {
    expect(TEMPLATE_FOR_PACKAGE.pilot).toBe("ai_creative")
    expect(TEMPLATE_FOR_PACKAGE.monthly).toBe("retainer")
  })

  it("never writes an em dash into contract copy", () => {
    for (const key of ["pilot", "monthly"] as const) {
      expect(contractFieldsFromPackage(key).scope).not.toContain("—")
    }
  })
})
