import { useState } from "react"
import { clientMeetingEvent, googleCalendarUrl, icsFile } from "@/lib/calendarEvent"
import { adminNotify } from "@/components/admin/AdminToaster"
import { authHeaders } from "@/lib/accessToken"

/** Agreeing a meeting, and telling the client about it in the same breath.
 *
 * Raz asked for this after a client asked for a meeting by email: pick the
 * moment once, and the client gets a real invitation while it goes into his own
 * calendar. Two separate things happen, and both are shown, because they fail
 * separately: the invitation is an email we send, and Raz's own copy is a link
 * he taps. Adding it to his calendar for him would mean an OAuth grant he has
 * to manage and renew, for one button. */
const ORGANIZER_NAME = "Raz Avramov"
const ORGANIZER_EMAIL = "hello@madebyraz.co.il"

export function MeetingBooking({
  contact,
  business,
  email,
  meetingAt,
  minutes,
  note,
  invitedAt,
  onChange,
}: {
  contact: string
  business?: string | null
  email?: string | null
  meetingAt: string | null
  minutes: number
  note: string | null
  invitedAt: string | null
  onChange: (patch: {
    meeting_at?: string | null
    meeting_minutes?: number
    meeting_note?: string | null
    meeting_invited_at?: string | null
  }) => Promise<void> | void
}) {
  const [sending, setSending] = useState(false)

  const when = meetingAt ? new Date(meetingAt) : null
  const event = when ? clientMeetingEvent(contact, business, when, minutes, note) : null

  async function sendInvite() {
    if (!event || !when || !email?.trim()) return
    setSending(true)
    try {
      const ics = icsFile(event, `${Date.now()}-${when.getTime()}@madebyraz.co.il`, {
        organizerName: ORGANIZER_NAME,
        organizerEmail: ORGANIZER_EMAIL,
        attendeeName: contact,
        attendeeEmail: email.trim(),
      })
      const res = await fetch("/api/send-meeting-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(await authHeaders()) },
        body: JSON.stringify({
          to: email.trim(),
          toName: contact,
          subject: `זימון לפגישה · ${when.toLocaleDateString("he-IL")} · RAZ`,
          intro: note?.trim() || "קבענו פגישה, ומצורף זימון ליומן.",
          when: when.toLocaleString("he-IL", { dateStyle: "full", timeStyle: "short" }),
          ics,
        }),
      })
      if (!res.ok) {
        adminNotify("הזימון לא נשלח. נסה שוב.", "error")
        return
      }
      await onChange({ meeting_invited_at: new Date().toISOString() })
      adminNotify(`הזימון נשלח ל-${email.trim()}`)
    } catch {
      adminNotify("הזימון לא נשלח. נסה שוב.", "error")
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="border border-white/10 rounded-lg p-5 grid gap-4">
      <div>
        <div className="font-mono text-[10px] uppercase tracking-wide text-dim">פגישה</div>
        <p className="text-dim text-xs mt-1">
          {invitedAt
            ? `הזימון נשלח ב-${new Date(invitedAt).toLocaleString("he-IL", { dateStyle: "short", timeStyle: "short" })}.`
            : "קובעים מועד, והלקוח מקבל זימון אמיתי ליומן."}
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <div>
          <label htmlFor="meeting-when" className="text-dim text-[10px] font-mono uppercase block mb-1">
            מתי
          </label>
          <input
            id="meeting-when"
            type="datetime-local"
            value={meetingAt ? toLocalInput(new Date(meetingAt)) : ""}
            onChange={(e) => onChange({ meeting_at: e.target.value ? new Date(e.target.value).toISOString() : null })}
            className="bg-transparent border border-white/30 rounded px-4 py-3 text-sm"
          />
        </div>
        <div>
          <label htmlFor="meeting-length" className="text-dim text-[10px] font-mono uppercase block mb-1">
            אורך
          </label>
          <select
            id="meeting-length"
            value={minutes}
            onChange={(e) => onChange({ meeting_minutes: Number(e.target.value) })}
            className="bg-background border border-white/30 rounded px-4 py-3 text-sm"
          >
            {[30, 45, 60, 90].map((m) => (
              <option key={m} value={m}>
                {m} דקות
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="meeting-note" className="text-dim text-[10px] font-mono uppercase block mb-1">
          מה לכתוב ללקוח
        </label>
        <input
          id="meeting-note"
          value={note ?? ""}
          onChange={(e) => onChange({ meeting_note: e.target.value })}
          placeholder="קבענו פגישה, ומצורף זימון ליומן."
          className="w-full bg-transparent border border-white/30 rounded px-4 py-3 text-sm"
        />
      </div>

      {event && (
        <div className="flex flex-wrap gap-2 items-center">
          <button
            onClick={sendInvite}
            disabled={sending || !email?.trim()}
            className="font-mono text-[10px] font-bold uppercase tracking-wide bg-lime text-black rounded-full px-5 min-h-[44px] inline-flex items-center hover:scale-105 transition-transform disabled:opacity-40 disabled:hover:scale-100"
          >
            {sending ? "שולח…" : invitedAt ? "שליחת זימון מעודכן" : "שליחת זימון ללקוח"}
          </button>
          <a
            href={googleCalendarUrl(event)}
            target="_blank"
            rel="noreferrer"
            className="font-mono text-[10px] uppercase tracking-wide border border-white/25 rounded-full px-5 min-h-[44px] inline-flex items-center hover:border-lime transition-colors"
          >
            ליומן שלי ←
          </a>
          {!email?.trim() && <span className="text-dim text-xs">אין כתובת מייל · אי אפשר לשלוח זימון.</span>}
        </div>
      )}
    </div>
  )
}

/** `2026-09-14T14:30` in the browser's own zone, which is what the input wants
 * and what Raz means when he says half past two. */
function toLocalInput(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}
