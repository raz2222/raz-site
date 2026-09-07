import { describe, expect, it } from "vitest"
import { targetFor, titleFor } from "../push.js"

/** Tapping a notification should land on the thing it is about, not on a
 * dashboard the reader then has to search. */
describe("targetFor", () => {
  it("opens the people list for a lead", () => {
    expect(targetFor({ lead_id: "l1" })).toBe("/admin/clients")
  })

  it("opens the quote that was signed", () => {
    expect(targetFor({ quote_id: "q1" })).toBe("/admin/quotes/q1")
  })

  it("falls back to the dashboard when it is about neither", () => {
    expect(targetFor({})).toBe("/admin")
    expect(targetFor({ lead_id: null, quote_id: null })).toBe("/admin")
  })
})

describe("titleFor", () => {
  it("says which of the two things happened", () => {
    expect(titleFor("lead_new")).toBe("ליד חדש")
    expect(titleFor("quote_signed")).toContain("חתם")
  })

  it("does not invent a title for a kind it has never seen", () => {
    expect(titleFor("something_new")).toBe("RAZ")
    expect(titleFor(undefined)).toBe("RAZ")
  })
})
