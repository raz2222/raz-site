import { describe, expect, it } from "vitest"
import { faqPageJsonLd } from "./faqSchema"

describe("faqPageJsonLd", () => {
  it("builds a FAQPage with one Question per item", () => {
    const ld = faqPageJsonLd([
      { q: "כמה עולה סרטון UGC?", a: "בין 800 ל-3,000 שקל." },
      { q: "כמה זמן זה לוקח?", a: "שלושה עד חמישה ימי עבודה." },
    ])
    expect(ld["@type"]).toBe("FAQPage")
    expect(ld.mainEntity).toHaveLength(2)
    expect(ld.mainEntity[0]).toEqual({
      "@type": "Question",
      name: "כמה עולה סרטון UGC?",
      acceptedAnswer: { "@type": "Answer", text: "בין 800 ל-3,000 שקל." },
    })
  })

  it("survives an empty list without inventing entries", () => {
    expect(faqPageJsonLd([]).mainEntity).toEqual([])
  })
})
