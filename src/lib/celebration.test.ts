import { describe, expect, it } from "vitest"
import { MAX_CELEBRATION_AGE_DAYS, celebrationFloor, shouldCelebrate } from "@/lib/celebration"

const now = new Date("2026-09-06T12:00:00Z")
const iso = (daysAgo: number) => new Date(now.getTime() - daysAgo * 86_400_000).toISOString()

describe("shouldCelebrate", () => {
  it("celebrates a signature that arrived since this device last looked", () => {
    expect(shouldCelebrate(iso(1), iso(3), now)).toBe(true)
  })

  it("does not celebrate the same signature twice", () => {
    const signedAt = iso(1)
    expect(shouldCelebrate(signedAt, signedAt, now)).toBe(false)
  })

  it("does not celebrate one this device already watched go by", () => {
    expect(shouldCelebrate(iso(3), iso(1), now)).toBe(false)
  })

  // A browser with no memory of its own: a fresh phone, a cleared cache, a
  // private window. It should celebrate this week's deal and stay quiet about
  // one from last year.
  it("celebrates a recent signature on a device that has never celebrated", () => {
    expect(shouldCelebrate(iso(2), null, now)).toBe(true)
  })

  it("stays quiet about an old signature on a device that has never celebrated", () => {
    expect(shouldCelebrate(iso(MAX_CELEBRATION_AGE_DAYS + 1), null, now)).toBe(false)
  })

  it("ignores a watermark older than the window rather than reopening a year of history", () => {
    expect(shouldCelebrate(iso(200), iso(400), now)).toBe(false)
    expect(shouldCelebrate(iso(2), iso(400), now)).toBe(true)
  })

  it("handles a missing signature date without throwing", () => {
    expect(shouldCelebrate(null, null, now)).toBe(false)
    expect(shouldCelebrate(undefined, iso(1), now)).toBe(false)
  })

  it("ignores a clock-skewed future date", () => {
    expect(shouldCelebrate(iso(-1), null, now)).toBe(false)
  })
})

describe("celebrationFloor", () => {
  it("uses the window when there is no watermark", () => {
    expect(celebrationFloor(null, now)).toBe(iso(MAX_CELEBRATION_AGE_DAYS))
  })

  it("uses the watermark when it is inside the window", () => {
    expect(celebrationFloor(iso(2), now)).toBe(iso(2))
  })
})
