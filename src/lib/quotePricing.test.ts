import { describe, expect, it } from "vitest"
import { buildPaymentSchedule } from "./quotePricing"
import { amountDueNow } from "./contracts"

describe("buildPaymentSchedule", () => {
  it("keeps the preset wordings exactly as they were", () => {
    expect(buildPaymentSchedule(10000, "100% מראש")).toEqual([{ label: "תשלום מלא", amount: 10000 }])
    expect(buildPaymentSchedule(10000, "50% / 50%")).toEqual([
      { label: "50% מקדמה", amount: 5000 },
      { label: "50% לפני השקה", amount: 5000 },
    ])
    expect(buildPaymentSchedule(10000, "40% / 30% / 30%")).toEqual([
      { label: "40% מקדמה", amount: 4000 },
      { label: "30% באמצע הפרויקט", amount: 3000 },
      { label: "30% לפני השקה", amount: 3000 },
    ])
  })

  // The bug this exists to prevent. These are the terms saved in the price book
  // settings, so they are on every quote and contract built from the default,
  // and they matched none of the presets above.
  it("splits terms written by hand", () => {
    expect(buildPaymentSchedule(6000, "50% מקדמה / 50% לפני השקה")).toEqual([
      { label: "50% מקדמה", amount: 3000 },
      { label: "50% לפני השקה", amount: 3000 },
    ])
  })

  it("gives the remainder to the last instalment so the schedule always adds up", () => {
    const schedule = buildPaymentSchedule(999, "33% מקדמה / 33% באמצע / 34% בסיום")
    expect(schedule.reduce((sum, s) => sum + s.amount, 0)).toBe(999)
    expect(schedule).toHaveLength(3)
  })

  // A retainer is one payment a month, and "custom" means Raz will say it in
  // words. Neither should be invented into instalments.
  it("leaves terms with no percentages as a single row", () => {
    expect(buildPaymentSchedule(6000, "חודשי")).toEqual([{ label: "חודשי", amount: 6000 }])
    expect(buildPaymentSchedule(6000, "מותאם אישית")).toEqual([{ label: "מותאם אישית", amount: 6000 }])
    expect(buildPaymentSchedule(6000, "שוטף + 30")).toEqual([{ label: "שוטף + 30", amount: 6000 }])
  })

  it("does not split percentages that do not add up to the whole", () => {
    expect(buildPaymentSchedule(6000, "50% מקדמה / 30% בסיום")).toEqual([
      { label: "50% מקדמה / 30% בסיום", amount: 6000 },
    ])
  })
})

describe("what the client is told to pay", () => {
  // amountDueNow reads the first row of the schedule and PaymentInstructions
  // shows it the moment a contract is signed. Before the fix above this said
  // the full 6,000 on a contract whose own terms are 50% up front.
  it("asks for the advance, not the whole sum", () => {
    const contract = {
      total: 6000,
      payment_schedule: buildPaymentSchedule(6000, "50% מקדמה / 50% לפני השקה"),
    } as Parameters<typeof amountDueNow>[0]
    expect(amountDueNow(contract)).toEqual({ label: "50% מקדמה", amount: 3000 })
  })
})
