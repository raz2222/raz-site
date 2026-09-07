import { describe, expect, it } from "vitest"
import { DEFAULT_CODE_LENGTH, sanitizeCodeLength } from "./EmailCodeForm"

/** The login broke on exactly this: the form capped the input at six digits
 * because six is what every Supabase example shows, and this project issues
 * eight. The code was truncated on the way in and could never verify, and the
 * screen said "wrong code" about a code that was right. */
describe("sanitizeCodeLength", () => {
  it("takes the length the server reports", () => {
    expect(sanitizeCodeLength(8)).toBe(8)
    expect(sanitizeCodeLength(6)).toBe(6)
    expect(sanitizeCodeLength(10)).toBe(10)
  })

  it("falls back rather than capping the input below a real code", () => {
    for (const value of [undefined, null, "8", 0, 5, 11, 6.5, NaN]) {
      expect(sanitizeCodeLength(value)).toBe(DEFAULT_CODE_LENGTH)
    }
  })
})
