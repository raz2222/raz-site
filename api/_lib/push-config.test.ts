import { describe, expect, it } from "vitest"
import { isQuietHours } from "./push-config.js"

/** "No notifications that wake him" is a standing rule, not a nicety: nothing
 * should push to Raz's phone between roughly 22:00 and 08:00 Israel time. The
 * row is still written and the badge still counts it. */
describe("isQuietHours", () => {
  // Israel is UTC+3 in September (DST) and UTC+2 in January.
  it("is quiet through the night, in local terms", () => {
    expect(isQuietHours(new Date("2026-09-07T19:30:00Z"))).toBe(true) // 22:30 local
    expect(isQuietHours(new Date("2026-09-07T23:00:00Z"))).toBe(true) // 02:00 local
    expect(isQuietHours(new Date("2026-09-07T04:30:00Z"))).toBe(true) // 07:30 local
  })

  it("is awake through the working day", () => {
    expect(isQuietHours(new Date("2026-09-07T05:30:00Z"))).toBe(false) // 08:30 local
    expect(isQuietHours(new Date("2026-09-07T12:00:00Z"))).toBe(false) // 15:00 local
    expect(isQuietHours(new Date("2026-09-07T18:45:00Z"))).toBe(false) // 21:45 local
  })

  // A fixed +3 offset would put this an hour out for half the year, which is
  // the whole reason this reads the zone rather than adding hours.
  it("follows the clock change rather than a fixed offset", () => {
    expect(isQuietHours(new Date("2026-01-15T20:30:00Z"))).toBe(true) // 22:30 local, winter
    expect(isQuietHours(new Date("2026-01-15T19:30:00Z"))).toBe(false) // 21:30 local, winter
  })
})
