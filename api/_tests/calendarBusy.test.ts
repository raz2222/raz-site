import { describe, expect, it } from "vitest"
import { busyIntervals, calendarEmail, isGoogleIcsUrl } from "../_lib/calendar-busy.js"

const VTIMEZONE = [
  "BEGIN:VTIMEZONE",
  "TZID:Asia/Jerusalem",
  "BEGIN:DAYLIGHT",
  "TZOFFSETFROM:+0200",
  "TZOFFSETTO:+0300",
  "TZNAME:IDT",
  "DTSTART:19700327T020000",
  "RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1FR",
  "END:DAYLIGHT",
  "BEGIN:STANDARD",
  "TZOFFSETFROM:+0300",
  "TZOFFSETTO:+0200",
  "TZNAME:IST",
  "DTSTART:19701025T020000",
  "RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU",
  "END:STANDARD",
  "END:VTIMEZONE",
]

function calendar(...events: string[][]) {
  return ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//test//EN", ...VTIMEZONE, ...events.flat(), "END:VCALENDAR"].join("\r\n")
}

const from = new Date("2026-10-11T00:00:00Z")
const to = new Date("2026-10-25T00:00:00Z")
const iso = (xs: { start: Date; end: Date }[]) => xs.map((x) => [x.start.toISOString(), x.end.toISOString()]).sort()

describe("busyIntervals", () => {
  it("reads a one-off event in UTC", () => {
    const ics = calendar(["BEGIN:VEVENT", "UID:a", "DTSTART:20261012T090000Z", "DTEND:20261012T100000Z", "SUMMARY:Dentist", "END:VEVENT"])
    expect(iso(busyIntervals(ics, from, to))).toEqual([["2026-10-12T09:00:00.000Z", "2026-10-12T10:00:00.000Z"]])
  })

  it("reads a zoned time in Israel's offset", () => {
    const ics = calendar(["BEGIN:VEVENT", "UID:b", "DTSTART;TZID=Asia/Jerusalem:20261013T140000", "DTEND;TZID=Asia/Jerusalem:20261013T150000", "END:VEVENT"])
    expect(iso(busyIntervals(ics, from, to))).toEqual([["2026-10-13T11:00:00.000Z", "2026-10-13T12:00:00.000Z"]])
  })

  it("expands a weekly event, skipping an excluded date and following a moved one", () => {
    const ics = calendar(
      [
        "BEGIN:VEVENT",
        "UID:weekly",
        "DTSTART;TZID=Asia/Jerusalem:20260901T100000",
        "DTEND;TZID=Asia/Jerusalem:20260901T110000",
        "RRULE:FREQ=WEEKLY;BYDAY=TU",
        "EXDATE;TZID=Asia/Jerusalem:20261013T100000",
        "END:VEVENT",
      ],
      [
        "BEGIN:VEVENT",
        "UID:weekly",
        "RECURRENCE-ID;TZID=Asia/Jerusalem:20261020T100000",
        "DTSTART;TZID=Asia/Jerusalem:20261020T160000",
        "DTEND;TZID=Asia/Jerusalem:20261020T170000",
        "END:VEVENT",
      ]
    )
    // 13 Oct is excluded and 20 Oct moved to 16:00. Summer time ends on the
    // 25th, so both are still UTC+3.
    expect(iso(busyIntervals(ics, from, to))).toEqual([["2026-10-20T13:00:00.000Z", "2026-10-20T14:00:00.000Z"]])
  })

  it("ignores free, cancelled and default all-day events", () => {
    const ics = calendar(
      ["BEGIN:VEVENT", "UID:c", "DTSTART:20261014T090000Z", "DTEND:20261014T100000Z", "TRANSP:TRANSPARENT", "END:VEVENT"],
      ["BEGIN:VEVENT", "UID:d", "DTSTART:20261014T120000Z", "DTEND:20261014T130000Z", "STATUS:CANCELLED", "END:VEVENT"],
      ["BEGIN:VEVENT", "UID:e", "DTSTART;VALUE=DATE:20261015", "DTEND;VALUE=DATE:20261016", "TRANSP:TRANSPARENT", "END:VEVENT"]
    )
    expect(busyIntervals(ics, from, to)).toEqual([])
  })

  it("an all-day event marked busy covers the whole Israeli day", () => {
    const ics = calendar(["BEGIN:VEVENT", "UID:f", "DTSTART;VALUE=DATE:20261015", "DTEND;VALUE=DATE:20261016", "END:VEVENT"])
    expect(iso(busyIntervals(ics, from, to))).toEqual([["2026-10-14T21:00:00.000Z", "2026-10-15T21:00:00.000Z"]])
  })

  it("leaves out what falls outside the window", () => {
    const ics = calendar(["BEGIN:VEVENT", "UID:g", "DTSTART:20261201T090000Z", "DTEND:20261201T100000Z", "END:VEVENT"])
    expect(busyIntervals(ics, from, to)).toEqual([])
  })
})

describe("the secret address", () => {
  const url = "https://calendar.google.com/calendar/ical/hello%40madebyraz.co.il/private-0123abcd/basic.ics"

  it("accepts Google's secret iCal address", () => {
    expect(isGoogleIcsUrl(url)).toBe(true)
  })

  it("refuses the public address, another host, and plain http", () => {
    expect(isGoogleIcsUrl(url.replace("private-0123abcd", "public"))).toBe(false)
    expect(isGoogleIcsUrl(url.replace("calendar.google.com", "calendar.google.com.evil.example"))).toBe(false)
    expect(isGoogleIcsUrl(url.replace("https:", "http:"))).toBe(false)
    expect(isGoogleIcsUrl("not a url")).toBe(false)
  })

  it("names the calendar it belongs to", () => {
    expect(calendarEmail(url)).toBe("hello@madebyraz.co.il")
  })
})
