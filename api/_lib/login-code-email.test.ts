import { describe, expect, it } from "vitest"
import { loginCodeEmail, loginCodeSubject, normalizeEmail } from "./login-code-email.js"

describe("normalizeEmail", () => {
  it("lowercases and trims", () => {
    expect(normalizeEmail("  Raz@MadeByRaz.co.il ")).toBe("raz@madebyraz.co.il")
  })

  it("rejects anything that is not an address", () => {
    for (const value of ["", "raz", "raz@", "@madebyraz.co.il", "raz@localhost", "a b@c.co", null, 7, undefined]) {
      expect(normalizeEmail(value)).toBeNull()
    }
  })

  it("rejects an address long enough to be an attack rather than a typo", () => {
    expect(normalizeEmail(`${"a".repeat(250)}@b.co`)).toBeNull()
  })
})

describe("loginCodeEmail", () => {
  const built = loginCodeEmail("482915", "https://beobkcttzwiqcawrprgg.supabase.co/auth/v1/verify?token=x", "admin")

  it("leads with the code in the subject, where a phone shows it first", () => {
    expect(loginCodeSubject("482915").startsWith("482915")).toBe(true)
    expect(built.subject).toBe(loginCodeSubject("482915"))
  })

  it("carries the code and the link in both parts", () => {
    expect(built.html).toContain("482915")
    expect(built.html).toContain("auth/v1/verify?token=x")
    expect(built.text).toContain("482915")
    expect(built.text).toContain("auth/v1/verify?token=x")
  })

  it("says which door it opens", () => {
    expect(loginCodeEmail("1", "https://x", "admin").text).toContain("לניהול האתר")
    expect(loginCodeEmail("1", "https://x", "portal").text).toContain("לפורטל הלקוחות")
  })

  // The no-em-dash rule is enforced across all of api/ by src/lib/emailCopy.test.ts.

  it("escapes the link rather than letting it close the attribute", () => {
    const injected = loginCodeEmail("1", 'https://x/"><script>alert(1)</script>', "portal")
    expect(injected.html).not.toContain("<script>")
    expect(injected.html).toContain("&quot;")
  })
})
