/** Which call slots a lead can pick on the thank-you page.
 *
 * The reel this came from puts a time picker straight after the form: the
 * lead's attention is still on the problem, and "pick a time" is a smaller
 * step than waiting to be called. There is no connection to Raz's calendar
 * (see `src/lib/calendarEvent.ts` for why), so the slots are a fixed grid of
 * his working hours, minus every meeting already booked in the admin.
 *
 * Pure, with `now` passed in, so the arithmetic is tested rather than trusted.
 * Underscore-prefixed directory: Vercel would otherwise deploy it as a
 * function, and the plan allows twelve. */

export const TIME_ZONE = "Asia/Jerusalem"
/** Sunday to Thursday, the Israeli working week (0 is Sunday). */
export const WORK_DAYS = [0, 1, 2, 3, 4]
/** Local start times, as [hour, minute]. */
export const SLOT_TIMES: [number, number][] = [
  [10, 0],
  [12, 0],
  [14, 0],
  [16, 0],
]
export const CALL_MINUTES = 20
/** How many working days ahead the picker offers. */
export const DAYS_AHEAD = 5
/** Nothing sooner than this, so a slot is never booked for twenty minutes from now. */
export const MIN_NOTICE_HOURS = 12
/** A slot is taken when another meeting starts within this many minutes of it. */
export const BUFFER_MINUTES = 45

type LocalParts = { year: number; month: number; day: number; weekday: number; hour: number; minute: number }

const WEEKDAYS: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }

/** A moment, read as a wall clock in Israel. */
export function localParts(date: Date): LocalParts {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    weekday: "short",
    hour: "numeric",
    minute: "numeric",
    hourCycle: "h23",
  }).formatToParts(date)
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? ""
  return {
    year: Number(get("year")),
    month: Number(get("month")),
    day: Number(get("day")),
    weekday: WEEKDAYS[get("weekday")] ?? 0,
    hour: Number(get("hour")),
    minute: Number(get("minute")),
  }
}

/** The moment an Israeli wall clock shows a given time. Not "UTC minus two":
 * the offset is three for half the year, so it is read off the zone for that
 * very date, and checked once more in case the guess crossed a changeover. */
export function jerusalemTime(year: number, month: number, day: number, hour: number, minute: number): Date {
  const wanted = Date.UTC(year, month - 1, day, hour, minute)
  let guess = wanted
  for (let i = 0; i < 2; i++) {
    const p = localParts(new Date(guess))
    const shown = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute)
    guess += wanted - shown
  }
  return new Date(guess)
}

/** Every slot on the grid for the next working days, before anything is taken. */
export function candidateSlots(now: Date): Date[] {
  const earliest = now.getTime() + MIN_NOTICE_HOURS * 3_600_000
  const today = localParts(now)
  const slots: Date[] = []
  let days = 0
  // Walk calendar days from tomorrow; two weeks is far more than five working days.
  for (let offset = 1; offset <= 14 && days < DAYS_AHEAD; offset++) {
    const noon = jerusalemTime(today.year, today.month, today.day + offset, 12, 0)
    const d = localParts(noon)
    if (!WORK_DAYS.includes(d.weekday)) continue
    days++
    for (const [h, m] of SLOT_TIMES) {
      const slot = jerusalemTime(d.year, d.month, d.day, h, m)
      if (slot.getTime() >= earliest) slots.push(slot)
    }
  }
  return slots
}

/** The grid minus anything within the buffer of a meeting already booked. */
export function freeSlots(now: Date, taken: Date[]): Date[] {
  const buffer = BUFFER_MINUTES * 60_000
  return candidateSlots(now).filter((slot) => taken.every((t) => Math.abs(t.getTime() - slot.getTime()) >= buffer))
}

/** "יום שלישי 14.10 · 12:00", the way the notification on Raz's phone reads it. */
export function hebrewSlotLabel(slot: Date): string {
  const p = localParts(slot)
  const day = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"][p.weekday]
  return `יום ${day} ${p.day}.${p.month} · ${String(p.hour).padStart(2, "0")}:${String(p.minute).padStart(2, "0")}`
}
