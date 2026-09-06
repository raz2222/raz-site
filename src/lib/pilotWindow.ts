import { CALL_PACKAGES } from "@/lib/callScript"
import type { ContractRow } from "@/lib/supabase"

/** The pilot is sold on one promise: pay 1,800 for a single video, and if you
 * decide within seven days to go monthly, the whole amount comes off the price.
 * The promise was written into the script and into the contract clause, and
 * nothing counted the days, so it relied on Raz remembering. This counts them.
 *
 * The clock starts at delivery, not at signing. The client signs before the
 * video exists, so a window measured from the signature could expire before
 * they had anything to decide about. */
export const PILOT_WINDOW_DAYS = 7

/** What is left to pay to convert. Derived rather than written down again: the
 * 4,200 said on the phone, printed in the offer card and charged on the
 * follow-up contract is this subtraction, and it cannot drift from it. */
export const PILOT_TOPUP = CALL_PACKAGES.monthly.price - CALL_PACKAGES.pilot.price

export type PilotWindow =
  /** Not a pilot contract, or not signed yet: nothing to count. */
  | { state: "none" }
  /** Signed, but the video has not been handed over, so the clock has not started. */
  | { state: "awaiting_delivery" }
  /** Running. `daysLeft` is 0 on the final day. */
  | { state: "open"; daysLeft: number; deadline: string }
  /** The seven days are gone. The offset is off the table. */
  | { state: "expired"; deadline: string }

/** Calendar days since the epoch, from a `YYYY-MM-DD` date. Deliberately not
 * Date arithmetic on timestamps: the difference between two local midnights is
 * not always 24 hours, and a DST boundary would quietly shorten someone's
 * window by a day. */
function dayNumber(isoDate: string): number | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(isoDate)
  if (!match) return null
  const [, y, m, d] = match
  return Math.floor(Date.UTC(Number(y), Number(m) - 1, Number(d)) / 86_400_000)
}

function toIsoDate(dayNum: number): string {
  return new Date(dayNum * 86_400_000).toISOString().slice(0, 10)
}

/** Today as a `YYYY-MM-DD` in the viewer's own calendar, which is the calendar
 * they count days in. */
export function todayIso(now: Date = new Date()): string {
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60_000)
  return local.toISOString().slice(0, 10)
}

type PilotContract = Pick<ContractRow, "package_key" | "status" | "pilot_delivered_at">

export function pilotWindow(contract: PilotContract, today: string = todayIso()): PilotWindow {
  if (contract.package_key !== "pilot" || contract.status !== "signed") return { state: "none" }
  if (!contract.pilot_delivered_at) return { state: "awaiting_delivery" }

  const delivered = dayNumber(contract.pilot_delivered_at)
  const now = dayNumber(today)
  if (delivered === null || now === null) return { state: "awaiting_delivery" }

  const deadlineDay = delivered + PILOT_WINDOW_DAYS
  const daysLeft = deadlineDay - now
  const deadline = toIsoDate(deadlineDay)
  return daysLeft >= 0 ? { state: "open", daysLeft, deadline } : { state: "expired", deadline }
}

/** One line for the client and for the dashboard, in the same words in both
 * places so the thing Raz is chasing and the thing the client is reading are
 * recognisably the same offer. */
export function pilotWindowLabel(window: PilotWindow): string | null {
  switch (window.state) {
    case "awaiting_delivery":
      return "פיילוט חתום · הספירה מתחילה במסירה"
    case "open":
      if (window.daysLeft === 0) return "היום האחרון לקיזוז הפיילוט"
      if (window.daysLeft === 1) return "נשאר יום אחד לקיזוז הפיילוט"
      return `נשארו ${window.daysLeft} ימים לקיזוז הפיילוט`
    case "expired":
      return "חלון הקיזוז נסגר"
    default:
      return null
  }
}

/** Sorts the dashboard: what is about to run out comes first, and a pilot that
 * has not been delivered yet sits behind the live windows rather than at the
 * top, because it is not losing time. */
export function pilotUrgency(window: PilotWindow): number {
  switch (window.state) {
    case "open": return window.daysLeft
    case "awaiting_delivery": return PILOT_WINDOW_DAYS + 1
    default: return Number.MAX_SAFE_INTEGER
  }
}
