import { describe, it, expect } from "vitest"
import {
  evaluateFacebookAction,
  instagramRemaining,
  isQuietHours,
  quietHoursEnd,
  textFingerprint,
  textSimilarity,
  warmupCap,
  type ActionRecord,
  type SocialLimits,
} from "./socialSafety"

const LIMITS: SocialLimits = {
  fb_daily_cap: 5,
  fb_group_cooldown_days: 7,
  fb_min_gap_minutes: 45,
  fb_value_ratio: 3,
  warmup_started_on: null,
}

// 12:00 Israel, well clear of quiet hours in either DST state.
const NOON = new Date("2026-09-07T09:00:00Z")

function action(overrides: Partial<ActionRecord> = {}): ActionRecord {
  return {
    action: "fb_comment",
    group_id: null,
    text_fingerprint: null,
    promotional: false,
    created_at: new Date(NOON.getTime() - 8 * 60 * 60 * 1000).toISOString(),
    ...overrides,
  }
}

describe("quiet hours", () => {
  it("is quiet at 02:00 Israel and open at midday", () => {
    expect(isQuietHours(new Date("2026-09-06T23:00:00Z"))).toBe(true) // 02:00 IDT
    expect(isQuietHours(NOON)).toBe(false)
  })

  it("ends at the next 08:00 Israel time", () => {
    const end = quietHoursEnd(new Date("2026-09-06T23:00:00Z"))
    const hour = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Jerusalem", hour: "2-digit", hour12: false }).format(end)
    expect(Number(hour)).toBe(8)
    expect(end.getTime()).toBeGreaterThan(Date.parse("2026-09-06T23:00:00Z"))
  })

  it("holds across the winter clock change, where a fixed offset would not", () => {
    // 23:30 Israel on the night the clocks go back.
    const end = quietHoursEnd(new Date("2026-10-24T20:30:00Z"))
    const hour = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Jerusalem", hour: "2-digit", hour12: false }).format(end)
    expect(Number(hour)).toBe(8)
  })
})

describe("warm-up ramp", () => {
  it("starts at one a day and reaches the real cap", () => {
    const warming: SocialLimits = { ...LIMITS, warmup_started_on: "2026-09-07" }
    expect(warmupCap(warming, new Date("2026-09-07T09:00:00Z"))).toBe(1)
    expect(warmupCap(warming, new Date("2026-09-13T09:00:00Z"))).toBe(3)
    expect(warmupCap(warming, new Date("2026-10-07T09:00:00Z"))).toBe(5)
  })

  it("is the full cap once the ramp is cleared", () => {
    expect(warmupCap(LIMITS, NOON)).toBe(5)
  })
})

describe("text fingerprinting", () => {
  it("ignores punctuation, emoji and links", () => {
    expect(textFingerprint("מוזמנים לפנות! 🙂 https://madebyraz.co.il")).toBe("מוזמנים לפנות")
  })

  it("scores the same paragraph as a near duplicate", () => {
    const a = textFingerprint("אני עושה סרטוני AI לעסקים, אפשר לדבר")
    const b = textFingerprint("אני עושה סרטוני AI לעסקים · אפשר לדבר!")
    expect(textSimilarity(a, b)).toBeGreaterThan(0.75)
  })
})

describe("evaluateFacebookAction", () => {
  const request = { groupId: "group-1", text: "תשובה ייחודית לפוסט הזה בלבד", promotional: false }

  it("allows a first comment of the day", () => {
    const verdict = evaluateFacebookAction(request, [], LIMITS, NOON)
    expect(verdict.allowed).toBe(true)
    expect(verdict.capToday).toBe(5)
    expect(verdict.usedToday).toBe(0)
  })

  it("refuses during quiet hours", () => {
    const verdict = evaluateFacebookAction(request, [], LIMITS, new Date("2026-09-06T23:00:00Z"))
    expect(verdict.allowed).toBe(false)
    expect(verdict.reason).toContain("שעות שקט")
  })

  it("refuses once the daily cap is spent", () => {
    const spent = Array.from({ length: 5 }, () => action({ created_at: new Date(NOON.getTime() - 3 * 60 * 60 * 1000).toISOString() }))
    const verdict = evaluateFacebookAction(request, spent, LIMITS, NOON)
    expect(verdict.allowed).toBe(false)
    expect(verdict.usedToday).toBe(5)
  })

  it("counts the day in Israel time, not UTC", () => {
    // 00:30 Israel · still 21:30 UTC the previous day.
    const now = new Date("2026-09-07T21:30:00Z")
    const earlier = action({ created_at: "2026-09-07T09:00:00Z" })
    const verdict = evaluateFacebookAction(request, [earlier], LIMITS, now)
    // Quiet hours block first; what matters is the count it reports.
    expect(verdict.usedToday).toBe(0)
  })

  it("enforces the gap between two comments", () => {
    const recent = [action({ created_at: new Date(NOON.getTime() - 10 * 60 * 1000).toISOString() })]
    const verdict = evaluateFacebookAction(request, recent, LIMITS, NOON)
    expect(verdict.allowed).toBe(false)
    expect(verdict.reason).toContain("45")
    expect(verdict.waitUntil).toBeInstanceOf(Date)
  })

  it("keeps a group on its cooldown", () => {
    const recent = [
      action({ group_id: "group-1", created_at: new Date(NOON.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString() }),
    ]
    const verdict = evaluateFacebookAction(request, recent, LIMITS, NOON)
    expect(verdict.allowed).toBe(false)
    expect(verdict.reason).toContain("קבוצה")
  })

  it("lets a group's own cooldown override the default", () => {
    const recent = [
      action({ group_id: "group-1", created_at: new Date(NOON.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString() }),
    ]
    const verdict = evaluateFacebookAction({ ...request, groupCooldownDays: 1 }, recent, LIMITS, NOON)
    expect(verdict.allowed).toBe(true)
  })

  it("refuses text already sent to another group", () => {
    const recent = [
      action({
        group_id: "group-2",
        text_fingerprint: textFingerprint("תשובה ייחודית לפוסט הזה בלבד"),
        created_at: new Date(NOON.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      }),
    ]
    const verdict = evaluateFacebookAction(request, recent, LIMITS, NOON)
    expect(verdict.allowed).toBe(false)
    expect(verdict.reason).toContain("זהה")
  })

  it("forgets a duplicate older than the window", () => {
    const recent = [
      action({
        group_id: "group-2",
        text_fingerprint: textFingerprint("תשובה ייחודית לפוסט הזה בלבד"),
        created_at: new Date(NOON.getTime() - 40 * 24 * 60 * 60 * 1000).toISOString(),
      }),
    ]
    expect(evaluateFacebookAction(request, recent, LIMITS, NOON).allowed).toBe(true)
  })

  it("holds a promotional reply until the helpful ones are paid back", () => {
    const recent = [
      action({ promotional: true, created_at: new Date(NOON.getTime() - 2 * 60 * 60 * 1000).toISOString() }),
    ]
    const verdict = evaluateFacebookAction({ ...request, promotional: true }, recent, LIMITS, NOON)
    expect(verdict.allowed).toBe(false)
    expect(verdict.reason).toContain("יחס ערך")
  })

  it("allows a promotional reply after three helpful ones", () => {
    const recent = [1, 2, 3].map((n) =>
      action({ created_at: new Date(NOON.getTime() - n * 2 * 60 * 60 * 1000).toISOString() })
    )
    expect(evaluateFacebookAction({ ...request, promotional: true }, recent, LIMITS, NOON).allowed).toBe(true)
  })

  it("does not let a helpful reply be blocked by the value ratio", () => {
    const recent = [
      action({ promotional: true, created_at: new Date(NOON.getTime() - 2 * 60 * 60 * 1000).toISOString() }),
    ]
    expect(evaluateFacebookAction(request, recent, LIMITS, NOON).allowed).toBe(true)
  })

  it("ignores Instagram publishes when pacing Facebook", () => {
    const recent = [action({ action: "ig_publish", created_at: new Date(NOON.getTime() - 60 * 1000).toISOString() })]
    expect(evaluateFacebookAction(request, recent, LIMITS, NOON).allowed).toBe(true)
  })
})

describe("instagramRemaining", () => {
  it("counts only publishes inside the last day", () => {
    const recent = [
      action({ action: "ig_publish", created_at: new Date(NOON.getTime() - 60 * 60 * 1000).toISOString() }),
      action({ action: "ig_publish", created_at: new Date(NOON.getTime() - 30 * 60 * 60 * 1000).toISOString() }),
    ]
    expect(instagramRemaining(recent, 2, NOON)).toBe(1)
  })

  it("never goes below zero", () => {
    const recent = [1, 2, 3].map(() => action({ action: "ig_publish", created_at: NOON.toISOString() }))
    expect(instagramRemaining(recent, 2, NOON)).toBe(0)
  })
})
