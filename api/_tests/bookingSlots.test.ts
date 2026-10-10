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
  const busy = (h: number, m: number, minutes: number) => {
    const start = jerusalemTime(2026, 10, 11, h, m)
    return { start, end: new Date(start.getTime() + minutes * 60_000) }
  }

  it("removes a slot that already has a meeting", () => {
    const free = freeSlots(friday, [busy(12, 0, 45)])
    expect(free.some((s) => s.getTime() === jerusalemTime(2026, 10, 11, 12, 0).getTime())).toBe(false)
    expect(free).toHaveLength(19)
  })

  it("removes a slot a long event runs into", () => {
    // 09:00 to 10:30 covers the 10:00 call.
    expect(freeSlots(friday, [busy(9, 0, 90)])).toHaveLength(19)
  })

  it("keeps a buffer either side", () => {
    // Ends 09:50: ten minutes before the 10:00 call is too tight.
    expect(freeSlots(friday, [busy(9, 0, 50)])).toHaveLength(19)
    // Starts 10:35: the 20-minute call ends 10:20, fifteen minutes clear.
    expect(freeSlots(friday, [busy(10, 35, 30)])).toHaveLength(20)
  })

  it("leaves the neighbouring slots alone", () => {
    expect(freeSlots(friday, [busy(13, 0, 30)])).toHaveLength(20)
  })

  it("an all-day busy block removes the whole day", () => {
    const start = jerusalemTime(2026, 10, 11, 0, 0)
    const end = jerusalemTime(2026, 10, 12, 0, 0)
    const free = freeSlots(friday, [{ start, end }])
    expect(free).toHaveLength(16)
    expect(free.every((s) => localParts(s).day !== 11)).toBe(true)
  })
})

describe("hebrewSlotLabel", () => {
  it("reads as Raz would say it", () => {
    expect(hebrewSlotLabel(jerusalemTime(2026, 10, 13, 14, 0))).toBe("יום שלישי 13.10 · 14:00")
  })
})
