import { describe, expect, it } from "vitest"
import { isAllowedHost } from "../send-login-code.js"

/** The host decides where a sign-in link points, and the link is emailed to
 * whoever's address was typed. Anything this accepts by mistake is a working
 * session handed to a stranger. */
describe("isAllowedHost", () => {
  it("accepts the site's own domains", () => {
    expect(isAllowedHost("madebyraz.co.il")).toBe(true)
    expect(isAllowedHost("www.madebyraz.co.il")).toBe(true)
    expect(isAllowedHost("MadeByRaz.co.il")).toBe(true)
  })

  it("accepts a local machine, port and all", () => {
    expect(isAllowedHost("localhost:5173")).toBe(true)
    expect(isAllowedHost("127.0.0.1:3000")).toBe(true)
  })

  it("accepts a preview of this project", () => {
    expect(isAllowedHost("raz-site-git-main-raz.vercel.app")).toBe(true)
    expect(isAllowedHost("raz-site.vercel.app")).toBe(true)
  })

  /** Someone else's Vercel deployment is still someone else's. */
  it("refuses another project on the same platform", () => {
    expect(isAllowedHost("evil.vercel.app")).toBe(false)
    expect(isAllowedHost("raz-site.evil.vercel.app")).toBe(false)
  })

  it("refuses a domain that merely contains the real one", () => {
    expect(isAllowedHost("madebyraz.co.il.evil.com")).toBe(false)
    expect(isAllowedHost("evil.com")).toBe(false)
    expect(isAllowedHost("notmadebyraz.co.il")).toBe(false)
  })

  /** The port is not part of the decision, so it cannot be used to smuggle a
   * second hostname past the comparison. */
  it("judges the hostname and not the port", () => {
    expect(isAllowedHost("evil.com:443")).toBe(false)
  })
})
