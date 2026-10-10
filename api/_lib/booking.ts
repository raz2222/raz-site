import type { VercelRequest, VercelResponse } from "@vercel/node"
import { callerIp, hitRateLimit, limitConfig, type LimitConfig, type LimitRule } from "./rate-limit.js"
import { CALL_MINUTES, DAYS_AHEAD, freeSlots, hebrewSlotLabel, type Interval } from "./booking-slots.js"
import { busyIntervals, calendarEmail, isGoogleIcsUrl } from "./calendar-busy.js"
import { icsFile } from "./calendar-event.js"
import { verifyAdmin } from "./verify-admin.js"
import { EMAIL_SIGNATURE_HTML, EMAIL_SIGNATURE_TEXT } from "./email-signature.js"

/** The thank-you page's time picker, and the calendar it reads.
 *
 * `?action=slots`  public · the free slots for the next working days
 * `?action=book`   public · one booking per lead, by the lead's own id
 * `?action=calendar` owner only · connect, check or forget Google Calendar
 *
 * Underscore-prefixed directory so Vercel does not deploy it as a function of
 * its own; `api/notify-lead.ts` routes to it. */

export const BOOKING_ACTIONS = ["slots", "book", "calendar"]

/** Booking is per lead and once, so a person needs a handful at most. */
const BOOK_RULE: LimitRule = { bucket: "book_call", limit: 10, windowMinutes: 60 }
/** The thank-you page is where a lead books. Two days later it is a
 * conversation, not a form, and an id in an old tab should not still be a key. */
const BOOKING_WINDOW_HOURS = 48
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const ICS_KEY = "calendar_ics_url"
const OWNER_EMAIL = "hello@madebyraz.co.il"
const FROM_ADDRESS = "RAZ Website <hello@madebyraz.co.il>"
/** Not Raz's own address: Google does not add an invitation to the calendar of
 * the person it says organised it. Same domain, so it counts as a known sender. */
const ORGANIZER = { name: "Made by RAZ", email: "bookings@madebyraz.co.il" }

function rest(config: LimitConfig, path: string, init?: RequestInit) {
  return fetch(`${config.url}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: config.serviceKey,
      Authorization: `Bearer ${config.serviceKey}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  })
}

async function readIcsUrl(config: LimitConfig): Promise<string | null> {
  const res = await rest(config, `app_secrets?select=value&key=eq.${ICS_KEY}&limit=1`)
  if (!res.ok) return null
  const rows = (await res.json().catch(() => [])) as { value?: string }[]
  return rows[0]?.value ?? null
}

async function fetchCalendar(url: string, now: Date): Promise<Interval[]> {
  const res = await fetch(url, { signal: AbortSignal.timeout(6000) })
  if (!res.ok) throw new Error(`calendar answered ${res.status}`)
  const text = await res.text()
  if (!text.includes("BEGIN:VCALENDAR")) throw new Error("not a calendar")
  return busyIntervals(text, now, new Date(now.getTime() + (DAYS_AHEAD + 9) * 86_400_000))
}

/** Everything that makes a slot unavailable: meetings in the admin, and every
 * busy stretch in Raz's own calendar. A calendar that cannot be read is left
 * out rather than taking the picker down: the admin's own meetings still
 * count, and a booking that clashes is one he moves. */
async function busy(config: LimitConfig, now: Date): Promise<Interval[]> {
  const since = encodeURIComponent(now.toISOString())
  const [leads, calls, icsUrl] = await Promise.all([
    rest(config, `leads?select=meeting_at,meeting_minutes&meeting_at=gte.${since}&deleted_at=is.null`),
    rest(config, `call_sessions?select=meeting_at&meeting_at=gte.${since}&deleted_at=is.null`),
    readIcsUrl(config),
  ])
  if (!leads.ok || !calls.ok) throw new Error("could not read the meetings")
  const rows = [
    ...((await leads.json()) as { meeting_at: string; meeting_minutes: number | null }[]),
    ...((await calls.json()) as { meeting_at: string }[]).map((r) => ({ ...r, meeting_minutes: null })),
  ]
  const meetings = rows.map((r) => {
    const start = new Date(r.meeting_at)
    return { start, end: new Date(start.getTime() + (r.meeting_minutes ?? 45) * 60_000) }
  })
  let calendar: Interval[] = []
  if (icsUrl) {
    try {
      calendar = await fetchCalendar(icsUrl, now)
    } catch (err) {
      console.error("calendar unavailable", String(err))
    }
  }
  return [...meetings, ...calendar]
}

type Lead = {
  id: string
  name: string
  email: string | null
  phone: string | null
  project_type: string | null
  created_at: string
  meeting_at: string | null
  deleted_at: string | null
}

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;")
}

/** Puts the booked call in Raz's calendar: an invitation to the calendar's own
 * address, which Google adds by itself. Sent only to him, with nothing the
 * visitor typed except their own details, so the public endpoint is no relay. */
async function inviteOwner(config: LimitConfig, lead: Lead, slot: Date) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return
  const icsUrl = await readIcsUrl(config)
  const to = (icsUrl && calendarEmail(icsUrl)) || OWNER_EMAIL
  const details = [
    `${lead.name} קבע/ה שיחה מדף התודה באתר.`,
    lead.phone ? `טלפון: ${lead.phone}` : null,
    lead.email ? `אימייל: ${lead.email}` : null,
    lead.project_type ? `מה מעניין: ${lead.project_type}` : null,
    "https://madebyraz.co.il/admin/clients",
  ].filter(Boolean) as string[]
  const ics = icsFile(
    { title: `שיחה עם ${lead.name} · מהאתר`, start: slot, minutes: CALL_MINUTES, description: details.join("\n") },
    `${lead.id}@madebyraz.co.il`,
    { organizerName: ORGANIZER.name, organizerEmail: ORGANIZER.email, attendeeName: "Raz", attendeeEmail: to }
  )
  const when = hebrewSlotLabel(slot)
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: FROM_ADDRESS,
      to: [to],
      subject: `נקבעה שיחה: ${lead.name} · ${when}`,
      html: `<div dir="rtl" style="font-family: sans-serif; font-size: 15px; color: #111; line-height: 1.7;">${details
        .map((d) => `<p style="margin: 0 0 8px;">${escapeHtml(d)}</p>`)
        .join("")}<p style="margin: 16px 0 0; font-weight: 600;">${escapeHtml(when)}</p></div>${EMAIL_SIGNATURE_HTML}`,
      text: [...details, "", when, "", EMAIL_SIGNATURE_TEXT].join("\n"),
      attachments: [
        { filename: "call.ics", content: Buffer.from(ics, "utf8").toString("base64"), contentType: "text/calendar; charset=utf-8; method=REQUEST" },
      ],
    }),
  }).catch((err) => console.error("invite failed", String(err)))
}

export async function booking(req: VercelRequest, res: VercelResponse, action: string) {
  const config = limitConfig()
  if (!config) {
    res.status(503).json({ code: "not_configured" })
    return
  }
  const now = new Date()

  if (action === "calendar") {
    await calendarSetting(req, res, config, now)
    return
  }

  if (action === "slots") {
    if (req.method !== "GET") {
      res.status(405).json({ code: "method_not_allowed" })
      return
    }
    try {
      const slots = freeSlots(now, await busy(config, now))
      res.setHeader("Cache-Control", "no-store")
      res.status(200).json({ slots: slots.map((s) => s.toISOString()), minutes: CALL_MINUTES })
    } catch {
      res.status(502).json({ code: "unavailable" })
    }
    return
  }

  if (req.method !== "POST") {
    res.status(405).json({ code: "method_not_allowed" })
    return
  }
  const { leadId, slot } = (req.body ?? {}) as { leadId?: unknown; slot?: unknown }
  if (typeof leadId !== "string" || !UUID.test(leadId) || typeof slot !== "string" || Number.isNaN(Date.parse(slot))) {
    res.status(400).json({ code: "invalid_request" })
    return
  }
  if (await hitRateLimit(config, BOOK_RULE, callerIp(req.headers["x-forwarded-for"]))) {
    res.status(429).json({ code: "rate_limited" })
    return
  }

  // The id is the key: generated in the visitor's browser, sent once with
  // their own form, and shown nowhere else.
  const leadRes = await rest(config, `leads?id=eq.${leadId}&select=id,name,email,phone,project_type,created_at,meeting_at,deleted_at`)
  const lead = leadRes.ok ? ((await leadRes.json()) as Lead[])[0] : undefined
  const fresh = lead && now.getTime() - Date.parse(lead.created_at) < BOOKING_WINDOW_HOURS * 3_600_000
  if (!lead || !fresh || lead.deleted_at) {
    res.status(404).json({ code: "not_found" })
    return
  }
  if (lead.meeting_at) {
    res.status(409).json({ code: "already_booked", slot: lead.meeting_at })
    return
  }

  const wanted = new Date(slot)
  let free: Date[]
  try {
    free = freeSlots(now, await busy(config, now))
  } catch {
    res.status(502).json({ code: "unavailable" })
    return
  }
  if (!free.some((s) => s.getTime() === wanted.getTime())) {
    res.status(409).json({ code: "slot_taken" })
    return
  }

  // `meeting_at=is.null` in the filter makes a double tap, or two tabs, one booking.
  const update = await rest(config, `leads?id=eq.${leadId}&meeting_at=is.null`, {
    method: "PATCH",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({
      meeting_at: wanted.toISOString(),
      meeting_minutes: CALL_MINUTES,
      meeting_note: "נקבעה על ידי הלקוח בדף התודה",
    }),
  })
  const updated = update.ok ? ((await update.json()) as unknown[]) : []
  if (updated.length === 0) {
    res.status(409).json({ code: "already_booked" })
    return
  }

  // The row is what Raz sees, and the trigger on this table pushes it to his
  // phone, quiet hours included, like every other notification.
  await Promise.all([
    rest(config, "admin_notifications", {
      method: "POST",
      body: JSON.stringify({ kind: "meeting_booked", message: `שיחה נקבעה: ${lead.name} · ${hebrewSlotLabel(wanted)}`, lead_id: lead.id }),
    }).catch(() => {}),
    inviteOwner(config, lead, wanted),
  ])

  res.status(200).json({ ok: true, slot: wanted.toISOString(), minutes: CALL_MINUTES })
}

/** Connecting Google Calendar from /admin/business. The address is checked by
 * actually reading it before it is stored, so a wrong paste shows now rather
 * than as a picker that quietly ignores his diary. */
async function calendarSetting(req: VercelRequest, res: VercelResponse, config: LimitConfig, now: Date) {
  if (!(await verifyAdmin(req.headers.authorization))) {
    res.status(401).json({ code: "unauthorized" })
    return
  }

  if (req.method === "GET") {
    const url = await readIcsUrl(config)
    if (!url) {
      res.status(200).json({ connected: false })
      return
    }
    try {
      const intervals = await fetchCalendar(url, now)
      res.status(200).json({ connected: true, email: calendarEmail(url), busyCount: intervals.length })
    } catch (err) {
      res.status(200).json({ connected: true, email: calendarEmail(url), error: String(err) })
    }
    return
  }

  if (req.method === "DELETE") {
    await rest(config, `app_secrets?key=eq.${ICS_KEY}`, { method: "DELETE" })
    res.status(200).json({ connected: false })
    return
  }

  if (req.method !== "POST") {
    res.status(405).json({ code: "method_not_allowed" })
    return
  }
  const { url } = (req.body ?? {}) as { url?: unknown }
  if (typeof url !== "string" || !isGoogleIcsUrl(url)) {
    res.status(400).json({ code: "invalid_url" })
    return
  }
  let intervals: Interval[]
  try {
    intervals = await fetchCalendar(url.trim(), now)
  } catch {
    res.status(400).json({ code: "unreadable" })
    return
  }
  const saved = await rest(config, "app_secrets?on_conflict=key", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify([{ key: ICS_KEY, value: url.trim() }]),
  })
  if (!saved.ok) {
    res.status(502).json({ code: "save_failed" })
    return
  }
  res.status(200).json({ connected: true, email: calendarEmail(url), busyCount: intervals.length })
}
