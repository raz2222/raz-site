import { describe, expect, it } from "vitest"
import { parseCount } from "../push.js"

/** The number on the app icon comes out of a PostgREST header rather than a
 * body, and getting it wrong is silent: a bad parse would either clear a badge
 * that should show a number, or leave a stale one on the icon for days. */
describe("parseCount", () => {
  it("reads the total out of a content-range", () => {
    expect(parseCount("0-0/7")).toBe(7)
  })

  it("reads a zero total, so a read inbox clears the badge", () => {
    expect(parseCount("*/0")).toBe(0)
  })

  it("returns undefined when the count is unknown, rather than guessing zero", () => {
    expect(parseCount(null)).toBeUndefined()
    expect(parseCount("0-0/*")).toBeUndefined()
    expect(parseCount("")).toBeUndefined()
    expect(parseCount("nonsense")).toBeUndefined()
  })
})
