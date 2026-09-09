import { describe, expect, it } from "vitest"
import { callerIp, isOverLimit, type LimitRule } from "../_lib/rate-limit.js"

const RULE: LimitRule = { bucket: "notify_lead", limit: 5, windowMinutes: 60 }

describe("isOverLimit", () => {
  it("lets the first request through", () => {
    expect(isOverLimit(0, RULE)).toBe(false)
  })

  it("lets through everything up to the limit", () => {
    expect(isOverLimit(4, RULE)).toBe(false)
  })

  /** The attempt being judged is counted before it is served, so the fifth
   * existing hit means this is the sixth. Counting after the send is the bug
   * the login endpoint documents: a request that fails every time would never
   * be throttled at all. */
  it("blocks once the window is full", () => {
    expect(isOverLimit(5, RULE)).toBe(true)
    expect(isOverLimit(500, RULE)).toBe(true)
  })
})

describe("callerIp", () => {
  it("takes the client from the front of the forwarding chain", () => {
    expect(callerIp("203.0.113.7, 70.41.3.18, 150.172.238.178")).toBe("203.0.113.7")
  })

  it("reads the header however Vercel hands it over", () => {
    expect(callerIp("203.0.113.7")).toBe("203.0.113.7")
    expect(callerIp([" 203.0.113.7 ", "other"])).toBe("203.0.113.7")
  })

  /** No address is not an address. Counting every such caller under one blank
   * key would throttle them as though they were one person. */
  it("is null when there is nothing to count", () => {
    expect(callerIp(undefined)).toBeNull()
    expect(callerIp("")).toBeNull()
    expect(callerIp("   ")).toBeNull()
  })
})
