import { describe, expect, it } from "vitest"
import { CALL_PACKAGES } from "@/lib/callScript"
import {
  PILOT_TOPUP,
  PILOT_WINDOW_DAYS,
  pilotUrgency,
  pilotWindow,
  pilotWindowLabel,
  todayIso,
} from "@/lib/pilotWindow"

const signedPilot = { package_key: "pilot" as const, status: "signed" as const, pilot_delivered_at: "2026-09-01" }

describe("pilotWindow", () => {
  it("counts nothing for a contract that is not a pilot", () => {
    expect(pilotWindow({ ...signedPilot, package_key: "monthly" }, "2026-09-02").state).toBe("none")
    expect(pilotWindow({ ...signedPilot, package_key: null }, "2026-09-02").state).toBe("none")
  })

  it("counts nothing until the pilot is actually signed", () => {
    for (const status of ["draft", "sent", "viewed", "cancelled"] as const) {
      expect(pilotWindow({ ...signedPilot, status }, "2026-09-02").state).toBe("none")
    }
  })

  // The whole point of the delivery date: a client signs before the video
  // exists, so a window measured from the signature could run out before they
  // had anything to judge.
  it("waits for delivery before starting the clock", () => {
    expect(pilotWindow({ ...signedPilot, pilot_delivered_at: null }, "2026-09-30").state).toBe("awaiting_delivery")
  })

  it("gives the full window on the day of delivery", () => {
    const w = pilotWindow(signedPilot, "2026-09-01")
    expect(w).toEqual({ state: "open", daysLeft: PILOT_WINDOW_DAYS, deadline: "2026-09-08" })
  })

  it("counts down a day at a time", () => {
    expect(pilotWindow(signedPilot, "2026-09-02")).toMatchObject({ state: "open", daysLeft: 6 })
    expect(pilotWindow(signedPilot, "2026-09-07")).toMatchObject({ state: "open", daysLeft: 1 })
  })

  it("keeps the window open on its final day, and closes it the day after", () => {
    expect(pilotWindow(signedPilot, "2026-09-08")).toMatchObject({ state: "open", daysLeft: 0 })
    expect(pilotWindow(signedPilot, "2026-09-09")).toEqual({ state: "expired", deadline: "2026-09-08" })
  })

  // Two local midnights are not always 24 hours apart. Israel's clocks go back
  // on 2026-10-25, and a window spanning it must still be seven days.
  it("is not shortened by a daylight-saving change", () => {
    const acrossDst = { ...signedPilot, pilot_delivered_at: "2026-10-22" }
    expect(pilotWindow(acrossDst, "2026-10-29")).toMatchObject({ state: "open", daysLeft: 0 })
    expect(pilotWindow(acrossDst, "2026-10-30")).toMatchObject({ state: "expired" })
  })

  it("survives a delivery date that arrives as a full timestamp", () => {
    expect(pilotWindow({ ...signedPilot, pilot_delivered_at: "2026-09-01T00:00:00+03:00" }, "2026-09-04")).toMatchObject({
      state: "open",
      daysLeft: 4,
    })
  })
})

describe("the offer's arithmetic", () => {
  // The number Raz says on the phone, the one on the offer card and the one the
  // follow-up contract charges are all this subtraction.
  it("derives the top-up from the two prices rather than repeating it", () => {
    expect(PILOT_TOPUP).toBe(4200)
    expect(PILOT_TOPUP).toBe(CALL_PACKAGES.monthly.price - CALL_PACKAGES.pilot.price)
  })

  it("prints the same number on the pilot card", () => {
    expect(CALL_PACKAGES.pilot.meta).toContain(PILOT_TOPUP.toLocaleString("he-IL"))
  })
})

describe("pilotWindowLabel", () => {
  it("says nothing where there is nothing to count", () => {
    expect(pilotWindowLabel({ state: "none" })).toBeNull()
  })

  it("reads as a sentence at every boundary", () => {
    expect(pilotWindowLabel({ state: "open", daysLeft: 0, deadline: "2026-09-08" })).toBe("היום האחרון לקיזוז הפיילוט")
    expect(pilotWindowLabel({ state: "open", daysLeft: 1, deadline: "2026-09-08" })).toBe("נשאר יום אחד לקיזוז הפיילוט")
    expect(pilotWindowLabel({ state: "open", daysLeft: 5, deadline: "2026-09-08" })).toBe("נשארו 5 ימים לקיזוז הפיילוט")
  })

  it("never uses an em dash", () => {
    const labels = [
      pilotWindowLabel({ state: "awaiting_delivery" }),
      pilotWindowLabel({ state: "open", daysLeft: 3, deadline: "2026-09-08" }),
      pilotWindowLabel({ state: "expired", deadline: "2026-09-08" }),
    ]
    for (const label of labels) expect(label).not.toContain("—")
  })
})

describe("pilotUrgency", () => {
  it("puts what is about to run out first, and undelivered pilots behind live ones", () => {
    const rows = [
      { state: "expired" as const, deadline: "2026-09-01" },
      { state: "awaiting_delivery" as const },
      { state: "open" as const, daysLeft: 6, deadline: "2026-09-08" },
      { state: "open" as const, daysLeft: 0, deadline: "2026-09-02" },
    ]
    const ordered = [...rows].sort((a, b) => pilotUrgency(a) - pilotUrgency(b)).map((r) => r.state)
    expect(ordered).toEqual(["open", "open", "awaiting_delivery", "expired"])
  })
})

describe("todayIso", () => {
  it("reads the local calendar day, not the UTC one", () => {
    // 00:30 on the 7th in a +03:00 zone is still the 6th in UTC. The window is
    // counted in the calendar the person is looking at.
    const localMidnightish = new Date("2026-09-06T21:30:00Z")
    const offsetMinutes = localMidnightish.getTimezoneOffset()
    const expected = new Date(localMidnightish.getTime() - offsetMinutes * 60_000).toISOString().slice(0, 10)
    expect(todayIso(localMidnightish)).toBe(expected)
  })

  it("returns a plain YYYY-MM-DD", () => {
    expect(todayIso()).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})
