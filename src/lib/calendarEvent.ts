/** Turning a booked call into an actual calendar entry.
 *
 * There is no connection to Raz's Google account and there is not going to be
 * one for a single button: an OAuth grant is a credential he would have to
 * manage, renew and re-grant. A prefilled link needs nothing, works on the
 * phone he runs calls from, and is one tap.
 *
 * Two of them, because a link is Google-only: the Google Calendar template URL,
 * and an .ics file for anything else (Apple Calendar, Outlook). Same event. */

export type CalendarEvent = {
  title: string
  start: Date
  minutes: number
  description?: string
  location?: string
}

/** `20260907T143000Z`. Google's template URL and .ics both want UTC basic
 * format, which sidesteps the timezone field entirely. */
export function toCalendarStamp(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "")
}

function endOf(event: CalendarEvent): Date {
  return new Date(event.start.getTime() + Math.max(1, event.minutes) * 60_000)
}

export function googleCalendarUrl(event: CalendarEvent): string {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${toCalendarStamp(event.start)}/${toCalendarStamp(endOf(event))}`,
  })
  if (event.description) params.set("details", event.description)
  if (event.location) params.set("location", event.location)
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

/** A line in an .ics file may not exceed 75 octets, and the escape rules are
 * not the same as anywhere else: commas, semicolons and newlines all matter. */
function icsEscape(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n")
}

function fold(line: string): string {
  if (line.length <= 75) return line
  const parts: string[] = []
  let rest = line
  parts.push(rest.slice(0, 75))
  rest = rest.slice(75)
  while (rest.length > 74) {
    parts.push(" " + rest.slice(0, 74))
    rest = rest.slice(74)
  }
  if (rest.length) parts.push(" " + rest)
  return parts.join("\r\n")
}

export function icsFile(event: CalendarEvent, uid: string): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Made by RAZ//Admin//HE",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${toCalendarStamp(new Date())}`,
    `DTSTART:${toCalendarStamp(event.start)}`,
    `DTEND:${toCalendarStamp(endOf(event))}`,
    `SUMMARY:${icsEscape(event.title)}`,
    event.description ? `DESCRIPTION:${icsEscape(event.description)}` : null,
    event.location ? `LOCATION:${icsEscape(event.location)}` : null,
    // Half an hour is enough warning to get somewhere quiet and open the notes.
    "BEGIN:VALARM",
    "TRIGGER:-PT30M",
    "ACTION:DISPLAY",
    "DESCRIPTION:תזכורת",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean) as string[]
  return lines.map(fold).join("\r\n")
}

/** The event a scoping call becomes. Keeps the wording in one place so the
 * Google link and the .ics cannot describe the same meeting differently. */
export function scopingCallEvent(
  contact: string,
  business: string | null | undefined,
  when: Date,
  minutes: number,
  phone?: string | null
): CalendarEvent {
  const who = [contact, business?.trim()].filter(Boolean).join(" · ")
  return {
    title: `שיחת אפיון · ${who}`,
    start: when,
    minutes,
    description: [`שיחת אפיון עם ${who}.`, phone?.trim() ? `טלפון: ${phone.trim()}` : null]
      .filter(Boolean)
      .join("\n"),
    location: phone?.trim() || undefined,
  }
}
