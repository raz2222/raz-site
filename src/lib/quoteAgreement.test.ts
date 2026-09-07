import { describe, expect, it } from "vitest"
import { isAgreementFrozen, quoteAgreementSubject, resolveQuoteAgreement } from "./quoteAgreement"
import { PROVIDER_DEFAULTS } from "./contracts"
import type { ClientRow, ContractTemplateRow, QuoteRow } from "./supabase"

const template = {
  id: "tpl-1",
  slug: "ai_creative",
  name: "הסכם הפקת תוכן AI",
  sections: [
    { heading: "התמורה", body: "התמורה בגין השירות היא {{total}}, בתנאי {{payment_terms}}." },
    { heading: "הצדדים", body: "בין {{provider_business_name}} לבין {{client_display}}." },
  ],
} as unknown as ContractTemplateRow

const client = { id: "c1", name: "דנה כהן", email: "dana@example.com", company: "סטודיו דנה" } as ClientRow

const provider = { ...PROVIDER_DEFAULTS, provider_business_name: "MADE BY RAZ" }

function quote(over: Partial<QuoteRow> = {}): Partial<QuoteRow> {
  return {
    client_id: "c1",
    client_name: "דנה כהן",
    client_email: "dana@example.com",
    title: "5 סרטוני פרסום קצרים",
    currency: "ILS",
    payment_terms: "50% מקדמה / 50% לפני השקה",
    status: "draft",
    ...over,
  }
}

describe("isAgreementFrozen", () => {
  // Sending is the moment RLS lets the client read the quote, so it is the
  // moment the words they will read stop moving.
  it("is open while the quote is still being written", () => {
    expect(isAgreementFrozen("draft")).toBe(false)
    expect(isAgreementFrozen("ready")).toBe(false)
    expect(isAgreementFrozen(null)).toBe(false)
  })

  it("is shut from the moment it goes out", () => {
    for (const status of ["sent", "viewed", "approved", "signed", "deposit_paid", "completed"] as const) {
      expect(isAgreementFrozen(status), status).toBe(true)
    }
  })
})

describe("resolveQuoteAgreement", () => {
  it("renders the clauses against this quote's client and money", () => {
    const { template_id, sections } = resolveQuoteAgreement({
      quote: quote(),
      template,
      client,
      total: 6000,
      provider,
    })
    expect(template_id).toBe("tpl-1")
    expect(sections[0].body).toContain("6,000")
    expect(sections[0].body).toContain("50% מקדמה / 50% לפני השקה")
    expect(sections[1].body).toContain("MADE BY RAZ")
    expect(sections[1].body).toContain("סטודיו דנה")
    // A token left visible is a bug that can be seen; a blanked one is not.
    expect(sections.some((s) => s.body.includes("{{"))).toBe(false)
  })

  // The whole point of the snapshot: the client signed particular words.
  it("keeps what was sent once the quote has gone out", () => {
    const stored = [{ heading: "התמורה", body: "התמורה בגין השירות היא ‏1,800 ₪." }]
    const { sections } = resolveQuoteAgreement({
      quote: quote({ status: "signed", template_id: "tpl-1", sections: stored }),
      template,
      client,
      total: 99999,
      provider,
    })
    expect(sections).toEqual(stored)
  })

  // templateSlugForItems returns null when what is being sold gives no signal,
  // and an empty agreement is better than the wrong one.
  it("produces nothing when no template applies", () => {
    expect(resolveQuoteAgreement({ quote: quote(), template: null, client, total: 6000, provider })).toEqual({
      template_id: null,
      sections: [],
    })
  })
})

describe("quoteAgreementSubject", () => {
  it("leaves the contract-only fields empty rather than inventing them", () => {
    const subject = quoteAgreementSubject(quote(), client, 6000)
    expect(subject.timeline).toBeNull()
    expect(subject.start_date).toBeNull()
    expect(subject.client_company).toBe("סטודיו דנה")
  })
})
