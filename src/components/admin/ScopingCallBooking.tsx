import { googleCalendarUrl, icsFile, scopingCallEvent } from "@/lib/calendarEvent"

/** A scoping call agreed on the phone, put in the calendar before hanging up.
 *
 * A follow-up date on its own is a note to self. Raz asked for the meeting to
 * actually exist, so this takes a date and a time and hands back the two ways
 * to create it: Google Calendar, which opens prefilled, and an .ics for Apple
 * Calendar and Outlook. Neither needs an account connected to anything.
 *
 * The time is stored either way, so the call record says when the meeting is
 * even if he books it from his phone later. */
export function ScopingCallBooking({
  contact,
  business,
  phone,
  meetingAt,
  minutes,
  onChange,
}: {
  contact: string
  business?: string | null
  phone?: string | null
  meetingAt: string | null
  minutes: number
  onChange: (patch: { meeting_at?: string | null; meeting_minutes?: number }) => void
}) {
  // <input type="datetime-local"> speaks local wall-clock time with no zone;
  // the column is a timestamptz. Convert on the way in and out rather than
  // slicing the ISO string, which would silently shift the meeting by the
  // offset · three hours, in Israel, in summer.
  const localValue = meetingAt ? toLocalInput(new Date(meetingAt)) : ""
  const when = meetingAt ? new Date(meetingAt) : null
  const event = when ? scopingCallEvent(contact, business, when, minutes, phone) : null

  function downloadIcs() {
    if (!event) return
    const blob = new Blob([icsFile(event, `${Date.now()}@madebyraz.co.il`)], {
      type: "text/calendar;charset=utf-8",
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "scoping-call.ics"
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="border border-white/10 rounded-lg p-4 grid gap-3">
      <div>
        <div className="font-mono text-[10px] uppercase tracking-wide text-dim">שיחת אפיון</div>
        <p className="text-dim text-xs mt-1">קובעים תאריך ושעה עכשיו, ומכניסים ליומן לפני שמנתקים.</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <div>
          <label htmlFor="meeting-at" className="text-dim text-[10px] font-mono uppercase block mb-1">
            מתי
          </label>
          <input
            id="meeting-at"
            type="datetime-local"
            value={localValue}
            onChange={(e) =>
              onChange({ meeting_at: e.target.value ? new Date(e.target.value).toISOString() : null })
            }
            className="bg-transparent border border-white/30 rounded px-4 py-3 text-sm"
          />
        </div>
        <div>
          <label htmlFor="meeting-minutes" className="text-dim text-[10px] font-mono uppercase block mb-1">
            אורך
          </label>
          <select
            id="meeting-minutes"
            value={minutes}
            onChange={(e) => onChange({ meeting_minutes: Number(e.target.value) })}
            className="bg-background border border-white/30 rounded px-4 py-3 text-sm"
          >
            {[15, 30, 45, 60].map((m) => (
              <option key={m} value={m}>
                {m} דקות
              </option>
            ))}
          </select>
        </div>
      </div>

      {event && (
        <div className="flex flex-wrap gap-2 items-center">
          <a
            href={googleCalendarUrl(event)}
            target="_blank"
            rel="noreferrer"
            className="font-mono text-[10px] font-bold uppercase tracking-wide bg-lime text-black rounded-full px-5 min-h-[44px] inline-flex items-center hover:scale-105 transition-transform"
          >
            הוספה ליומן גוגל ←
          </a>
          <button
            onClick={downloadIcs}
            className="font-mono text-[10px] uppercase tracking-wide border border-white/25 rounded-full px-5 min-h-[44px] inline-flex items-center hover:border-lime transition-colors"
          >
            קובץ ליומן אחר (ics)
          </button>
        </div>
      )}
    </div>
  )
}

/** `2026-09-14T14:30`, in the browser's own timezone, which is what the input
 * expects and what Raz means when he says two thirty. */
function toLocalInput(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}
