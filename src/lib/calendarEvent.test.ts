import { describe, expect, it } from "vitest"
import { clientMeetingEvent, googleCalendarUrl, icsFile, scopingCallEvent, toCalendarStamp } from "./calendarEvent"

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

/** An invitation is not a file with an event in it. A mail client shows accept
 * and decline only for METHOD:REQUEST with an organizer and an attendee, and
 * without those the client gets something they have to add by hand · which is
 * the thing Raz asked not to have to ask them to do. */
describe("icsFile as an invitation", () => {
  const when = new Date("2026-09-14T11:30:00Z")
  const event = clientMeetingEvent("דנה כהן", "סטודיו דנה", when, 45)
  const invite = icsFile(event, "uid-1@madebyraz.co.il", {
    organizerName: "Raz Avramov",
    organizerEmail: "hello@madebyraz.co.il",
    attendeeName: "דנה כהן",
    attendeeEmail: "dana@example.com",
  })

  it("asks rather than announces", () => {
    expect(invite).toContain("METHOD:REQUEST")
    expect(invite).not.toContain("METHOD:PUBLISH")
  })

  // Long lines are folded, so assert on what a calendar reads rather than on
  // the raw text: a continuation line begins with one space that is dropped.
  const unfolded = invite.replace(/\r\n /g, "")

  it("names both sides, which is what makes it answerable", () => {
    expect(unfolded).toContain("ORGANIZER;CN=Raz Avramov:mailto:hello@madebyraz.co.il")
    expect(unfolded).toContain("RSVP=TRUE:mailto:dana@example.com")
    expect(unfolded).toContain("PARTSTAT=NEEDS-ACTION")
  })

  it("still publishes when nobody is being invited", () => {
    const plain = icsFile(event, "uid-2@madebyraz.co.il")
    expect(plain).toContain("METHOD:PUBLISH")
    expect(plain).not.toContain("ATTENDEE")
  })

  it("carries the agreed moment and length", () => {
    expect(invite).toContain("DTSTART:20260914T113000Z")
    expect(invite).toContain("DTEND:20260914T121500Z")
  })

  it("keeps every line inside the 75 octets a calendar will accept", () => {
    for (const line of invite.split("\r\n")) {
      expect(new TextEncoder().encode(line).length).toBeLessThanOrEqual(75)
    }
  })
})
