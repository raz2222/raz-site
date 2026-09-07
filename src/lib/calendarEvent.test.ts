import { describe, expect, it } from "vitest"
import { googleCalendarUrl, icsFile, scopingCallEvent, toCalendarStamp } from "./calendarEvent"

const when = new Date("2026-09-14T11:30:00.000Z")

describe("toCalendarStamp", () => {
  it("is UTC basic format, which needs no timezone field", () => {
    expect(toCalendarStamp(when)).toBe("20260914T113000Z")
  })
})

describe("googleCalendarUrl", () => {
  const url = googleCalendarUrl({ title: "שיחת אפיון · דנה", start: when, minutes: 45 })

  it("books the right window", () => {
    expect(new URL(url).searchParams.get("dates")).toBe("20260914T113000Z/20260914T121500Z")
  })

  it("carries the Hebrew title through encoding intact", () => {
    expect(new URL(url).searchParams.get("text")).toBe("שיחת אפיון · דנה")
  })

  // A zero or negative duration would produce an end before the start, which
  // Google silently drops.
  it("never produces an event that ends before it starts", () => {
    const dates = new URL(googleCalendarUrl({ title: "x", start: when, minutes: 0 })).searchParams.get("dates")!
    const [start, end] = dates.split("/")
    expect(end > start).toBe(true)
  })
})

describe("icsFile", () => {
  const ics = icsFile(scopingCallEvent("דנה כהן", "סטודיו דנה", when, 30, "054-000-0000"), "abc-123")

  it("is a complete single-event calendar", () => {
    expect(ics.startsWith("BEGIN:VCALENDAR")).toBe(true)
    expect(ics.trimEnd().endsWith("END:VCALENDAR")).toBe(true)
    expect(ics).toContain("DTSTART:20260914T113000Z")
    expect(ics).toContain("DTEND:20260914T120000Z")
    expect(ics).toContain("UID:abc-123")
  })

  it("uses CRLF, which is the one thing strict parsers reject a file over", () => {
    expect(ics.includes("\r\n")).toBe(true)
    expect(/[^\r]\n/.test(ics)).toBe(false)
  })

  // A comma inside a title would otherwise end the property value.
  it("escapes the characters that would break the file", () => {
    const escaped = icsFile({ title: "פגישה, עם; דנה", start: when, minutes: 30 }, "u")
    expect(escaped).toContain("SUMMARY:פגישה\\, עם\\; דנה")
  })

  it("folds lines longer than 75 characters", () => {
    const long = icsFile({ title: "א".repeat(200), start: when, minutes: 30 }, "u")
    for (const line of long.split("\r\n")) expect(line.length).toBeLessThanOrEqual(75)
  })

  it("carries a reminder", () => {
    expect(ics).toContain("TRIGGER:-PT30M")
  })
})

describe("scopingCallEvent", () => {
  it("names the person and the business", () => {
    expect(scopingCallEvent("דנה כהן", "סטודיו דנה", when, 30).title).toBe("שיחת אפיון · דנה כהן · סטודיו דנה")
  })

  it("copes with no business", () => {
    expect(scopingCallEvent("דנה כהן", null, when, 30).title).toBe("שיחת אפיון · דנה כהן")
  })
})
