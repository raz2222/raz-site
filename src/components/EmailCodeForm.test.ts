import { describe, expect, it } from "vitest"
import { DEFAULT_CODE_LENGTH, sanitizeCodeLength, verifyErrorMessage } from "./EmailCodeForm"

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

/** Supabase answers a wrong code and an old one with one sentence. The screen
 * pulled "expired" out of it and announced expiry, so a truncated code read as
 * a timing problem and the real fault stayed hidden for two rounds. */
describe("verifyErrorMessage", () => {
  it("never claims expiry on a sentence that also means 'wrong'", () => {
    const message = verifyErrorMessage("Token has expired or is invalid")
    expect(message).toContain("לא נכון")
    expect(message).toContain("לא בתוקף")
  })

  it("points at the newest email, since asking again kills the last code", () => {
    expect(verifyErrorMessage("Token has expired or is invalid")).toContain("האחרון")
  })

  it("says so when the wall is the rate limit, not the code", () => {
    expect(verifyErrorMessage("Request rate limit reached")).toContain("ניסיונות")
  })

  it("falls back rather than guessing at an answer it does not recognise", () => {
    expect(verifyErrorMessage(undefined)).toContain("בקש קוד חדש")
    expect(verifyErrorMessage("something else entirely")).toContain("בקש קוד חדש")
  })
})
