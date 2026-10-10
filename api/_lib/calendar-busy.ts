import ICAL from "ical.js"
import { jerusalemTime, type Interval } from "./booking-slots.js"

/** When Raz is actually busy, read from his own Google Calendar.
 *
 * Through the calendar's secret iCal address rather than an OAuth grant: the
 * address is one string he copies once, it does not expire, and it needs no
 * Google Cloud project, consent screen or refresh token to look after. It is
 * kept in `app_secrets` (RLS on, no policies), because whoever holds it can read
 * his whole calendar.
 *
 * Only the intervals leave this file, never a title. Recurring events are
 * expanded with their moved and cancelled occurrences, because a weekly
 * meeting is exactly what a fixed grid would otherwise book over. */

/** A time with no zone, and an all-day date, are both Israel's wall clock. */
function toDate(time: ICAL.Time): Date {
  if (time.isDate || time.zone === ICAL.Timezone.localTimezone) {
    return jerusalemTime(time.year, time.month, time.day, time.isDate ? 0 : time.hour, time.isDate ? 0 : time.minute)
  }
  return time.toJSDate()
}

function blocks(component: ICAL.Component): boolean {
  if (String(component.getFirstPropertyValue("status") ?? "").toUpperCase() === "CANCELLED") return false
  // "Free" in Google Calendar, which is also the default for an all-day event:
  // a birthday or a reminder does not make him unavailable.
  return String(component.getFirstPropertyValue("transp") ?? "OPAQUE").toUpperCase() !== "TRANSPARENT"
}

/** Every busy stretch that touches [from, to). */
export function busyIntervals(ics: string, from: Date, to: Date): Interval[] {
  const root = new ICAL.Component(ICAL.parse(ics))
  for (const tz of root.getAllSubcomponents("vtimezone")) ICAL.TimezoneService.register(tz)

  const masters = new Map<string, ICAL.Event[]>()
  const exceptions: ICAL.Event[] = []
  for (const component of root.getAllSubcomponents("vevent")) {
    const event = new ICAL.Event(component)
    if (event.isRecurrenceException()) exceptions.push(event)
    else masters.set(event.uid, [...(masters.get(event.uid) ?? []), event])
  }
  for (const exception of exceptions) {
    const master = masters.get(exception.uid)?.find((e) => e.isRecurring())
    master?.relateException(exception)
  }

  const out: Interval[] = []
  const push = (start: Date, end: Date) => {
    if (end > from && start < to) out.push({ start, end })
  }

  for (const event of [...masters.values()].flat()) {
    if (!event.isRecurring()) {
      if (blocks(event.component)) push(toDate(event.startDate), toDate(event.endDate))
      continue
    }
    const iterator = event.iterator()
    // A daily event over two weeks is fourteen; the cap is only against a
    // malformed rule looping for the whole function lifetime.
    for (let i = 0; i < 5000; i++) {
      const next = iterator.next()
      if (!next) break
      const details = event.getOccurrenceDetails(next)
      const start = toDate(details.startDate)
      if (start >= to) break
      if (blocks(details.item.component)) push(start, toDate(details.endDate))
    }
  }
  return out
}

/** The address Google gives under "Secret address in iCal format". Anything
 * else is refused before it is stored or fetched. */
export function isGoogleIcsUrl(value: string): boolean {
  try {
    const url = new URL(value.trim())
    return url.protocol === "https:" && url.hostname === "calendar.google.com" && /^\/calendar\/ical\/[^/]+\/private-[^/]+\/basic\.ics$/.test(url.pathname)
  } catch {
    return false
  }
}

/** The calendar's own address is inside the URL: where an invitation must go
 * to land in this calendar. */
export function calendarEmail(value: string): string | null {
  const match = /^\/calendar\/ical\/([^/]+)\//.exec(new URL(value.trim()).pathname)
  const email = match ? decodeURIComponent(match[1]) : ""
  return email.includes("@") ? email : null
}
