import { describe, expect, it } from "vitest"
import { candidateSlots, freeSlots, hebrewSlotLabel, jerusalemTime, localParts } from "../_lib/booking-slots.js"

describe("jerusalemTime", () => {
  it("is UTC+3 in summer", () => {
    expect(jerusalemTime(2026, 7, 14, 12, 0).toISOString()).toBe("2026-07-14T09:00:00.000Z")
  })

  it("is UTC+2 in winter", () => {
    expect(jerusalemTime(2026, 12, 14, 12, 0).toISOString()).toBe("2026-12-14T10:00:00.000Z")
  })

  /** Israel leaves summer time on the last Sunday of October in 2026 (the 25th). */
  it("reads the offset of the day itself, either side of the changeover", () => {
    expect(jerusalemTime(2026, 10, 22, 10, 0).toISOString()).toBe("2026-10-22T07:00:00.000Z")
    expect(jerusalemTime(2026, 10, 26, 10, 0).toISOString()).toBe("2026-10-26T08:00:00.000Z")
  })
})

describe("candidateSlots", () => {
  // Friday 9 October 2026, 15:00 in Israel.
  const friday = new Date("2026-10-09T12:00:00Z")

  it("skips Friday and Saturday and starts on Sunday", () => {
    const first = localParts(candidateSlots(friday)[0])
    expect(first).toMatchObject({ weekday: 0, day: 11, hour: 10, minute: 0 })
  })

  it("offers four slots on each of five working days", () => {
    const slots = candidateSlots(friday)
    expect(slots).toHaveLength(20)
    expect(new Set(slots.map((s) => localParts(s).weekday))).toEqual(new Set([0, 1, 2, 3, 4]))
  })

  it("never offers anything within twelve hours", () => {
    // Sunday 23:00 in Israel: Monday 10:00 is eleven hours away.
    const late = new Date("2026-10-11T20:00:00Z")
    const first = candidateSlots(late)[0]
    expect(first.getTime() - late.getTime()).toBeGreaterThanOrEqual(12 * 3_600_000)
    expect(localParts(first)).toMatchObject({ day: 12, hour: 12 })
  })

  it("keeps local times right across the changeover", () => {
    // Thursday 22 October: the window runs into the week summer time ends.
    const slots = candidateSlots(new Date("2026-10-22T06:00:00Z"))
    for (const s of slots) expect([10, 12, 14, 16]).toContain(localParts(s).hour)
  })
})

describe("freeSlots", () => {
  const friday = new Date("2026-10-09T12:00:00Z")

  it("removes a slot that already has a meeting", () => {
    const taken = jerusalemTime(2026, 10, 11, 12, 0)
    const free = freeSlots(friday, [taken])
    expect(free.some((s) => s.getTime() === taken.getTime())).toBe(false)
    expect(free).toHaveLength(19)
  })

  it("removes a slot a meeting overlaps without starting on it", () => {
    const free = freeSlots(friday, [jerusalemTime(2026, 10, 11, 12, 30)])
    expect(free).toHaveLength(19)
  })

  it("leaves the neighbouring slots alone", () => {
    expect(freeSlots(friday, [jerusalemTime(2026, 10, 11, 13, 0)])).toHaveLength(20)
  })
})

describe("hebrewSlotLabel", () => {
  it("reads as Raz would say it", () => {
    expect(hebrewSlotLabel(jerusalemTime(2026, 10, 13, 14, 0))).toBe("יום שלישי 13.10 · 14:00")
  })
})
