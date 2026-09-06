import { describe, expect, it } from "vitest"
import {
  PROVIDER_DEFAULTS,
  clientDisplayName,
  contractVariables,
  fillVariables,
  isContractLocked,
  nextContractNumber,
  renderSections,
  scheduleTotal,
} from "@/lib/contracts"

const party = {
  client_name: "דנה כהן",
  client_company: "סטודיו דנה בע\"מ",
  client_id_number: "515123456",
  client_address: "הרצל 1, תל אביב",
  client_email: "dana@example.com",
  client_phone: "050-0000000",
}

describe("clientDisplayName", () => {
  it("joins the parts that exist", () => {
    expect(clientDisplayName(party)).toBe('דנה כהן, סטודיו דנה בע"מ, ח.פ / ת.ז 515123456')
  })

  it("falls back to the name alone for a private client", () => {
    expect(clientDisplayName({ client_name: "דנה כהן", client_company: null, client_id_number: null })).toBe("דנה כהן")
  })
})

describe("fillVariables", () => {
  it("substitutes known tokens, with or without spaces", () => {
    expect(fillVariables("היי {{client_name}} ו-{{ client_name }}", { client_name: "דנה" })).toBe("היי דנה ו-דנה")
  })

  it("leaves an unknown token visible rather than blanking it", () => {
    expect(fillVariables("{{typo}}", { client_name: "דנה" })).toBe("{{typo}}")
  })

  it("renders an empty known value as empty", () => {
    expect(fillVariables("[{{client_company}}]", { client_company: "" })).toBe("[]")
  })
})

describe("contractVariables", () => {
  it("formats money and dates the way the document shows them", () => {
    const vars = contractVariables(
      {
        ...party,
        title: "אתר תדמית",
        total: 12000,
        currency: "ILS",
        payment_terms: "50% / 50%",
        timeline: "3 שבועות",
        start_date: "2026-09-10",
      },
      PROVIDER_DEFAULTS
    )
    expect(vars.total).toContain("12,000")
    expect(vars.start_date).toBe(new Date("2026-09-10").toLocaleDateString("he-IL"))
    expect(vars.provider_business_name).toBe("MADE BY RAZ")
  })

  it("leaves a missing start date empty rather than printing Invalid Date", () => {
    const vars = contractVariables(
      { ...party, title: "x", total: 0, currency: "ILS", payment_terms: null, timeline: null, start_date: null },
      PROVIDER_DEFAULTS
    )
    expect(vars.start_date).toBe("")
  })
})

describe("renderSections", () => {
  it("fills both headings and bodies", () => {
    const rendered = renderSections(
      [{ heading: "הסכם עם {{client_name}}", body: "בהיקף {{total}}" }],
      { client_name: "דנה", total: "₪12,000" }
    )
    expect(rendered[0]).toEqual({ heading: "הסכם עם דנה", body: "בהיקף ₪12,000" })
  })
})

describe("nextContractNumber", () => {
  it("pads the running number and stamps the year", () => {
    const number = nextContractNumber({ contract_number_prefix: "HZ-", next_contract_number: 7 })
    expect(number).toBe(`HZ-${new Date().getFullYear()}-007`)
  })
})

describe("scheduleTotal", () => {
  it("sums the instalments", () => {
    expect(scheduleTotal([{ label: "מקדמה", amount: 6000 }, { label: "סיום", amount: 6000 }])).toBe(12000)
  })
})

describe("isContractLocked", () => {
  it("locks only once signed", () => {
    expect(isContractLocked("signed")).toBe(true)
    expect(isContractLocked("sent")).toBe(false)
    expect(isContractLocked("draft")).toBe(false)
  })
})
