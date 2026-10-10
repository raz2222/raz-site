import type { VercelRequest, VercelResponse } from "@vercel/node"
import { EMAIL_SIGNATURE_HTML, EMAIL_SIGNATURE_TEXT } from "./_lib/email-signature.js"
import { callerIp, hitRateLimit, limitConfig, type LimitConfig, type LimitRule } from "./_lib/rate-limit.js"
import { CALL_MINUTES, freeSlots, hebrewSlotLabel } from "./_lib/booking-slots.js"

const OWNER_EMAIL = "hello@madebyraz.co.il"
const FROM_ADDRESS = "RAZ Website <hello@madebyraz.co.il>"

/** Five an hour from one address. A real enquiry is one, a person who sends it
 * twice is two, and everything past that is a script filling Raz's inbox. The
 * lead itself is throttled separately, by a trigger on the table, because the
 * form writes there with the anon key and never passes through here. */
const RULE: LimitRule = { bucket: "notify_lead", limit: 5, windowMinutes: 60 }

type LeadPayload = {
  name?: string
  email?: string
  phone?: string | null
  company?: string | null
  projectType?: string | null
  budget?: string | null
  message?: string | null
  /** The honeypot, never filled by a person. */
  website?: string | null
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

/** Booking is per lead and once, so a person needs a handful at most. */
const BOOK_RULE: LimitRule = { bucket: "book_call", limit: 10, windowMinutes: 60 }
/** The thank-you page is where a lead books. A day later it is a conversation,
 * not a form, and the id in an old tab should not still be a key. */
const BOOKING_WINDOW_HOURS = 48
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

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

/** Every meeting already in the admin, from a lead or from a sales call. */
async function takenSlots(config: LimitConfig, now: Date): Promise<Date[]> {
  const since = encodeURIComponent(now.toISOString())
  const [leads, calls] = await Promise.all([
    rest(config, `leads?select=meeting_at&meeting_at=gte.${since}&deleted_at=is.null`),
    rest(config, `call_sessions?select=meeting_at&meeting_at=gte.${since}&deleted_at=is.null`),
  ])
  if (!leads.ok || !calls.ok) throw new Error("could not read the calendar")
  const rows = [...((await leads.json()) as { meeting_at: string }[]), ...((await calls.json()) as { meeting_at: string }[])]
  return rows.map((r) => new Date(r.meeting_at))
}

/** `?action=slots` and `?action=book`: the time picker on the thank-you page.
 * It lives in this file because it is the second half of the same moment, and
 * because Vercel's Hobby plan allows twelve functions. */
async function booking(req: VercelRequest, res: VercelResponse, action: string) {
  const config = limitConfig()
  if (!config) {
    res.status(503).json({ code: "not_configured" })
    return
  }
  const now = new Date()

  if (action === "slots") {
    if (req.method !== "GET") {
      res.status(405).json({ code: "method_not_allowed" })
      return
    }
    try {
      const slots = freeSlots(now, await takenSlots(config, now))
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

  // The id is the key: it is generated in the visitor's browser, sent once with
  // their own form, and never shown anywhere else.
  const leadRes = await rest(config, `leads?id=eq.${leadId}&select=id,name,created_at,meeting_at,deleted_at`)
  const lead = leadRes.ok ? ((await leadRes.json()) as { id: string; name: string; created_at: string; meeting_at: string | null; deleted_at: string | null }[])[0] : undefined
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
    free = freeSlots(now, await takenSlots(config, now))
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
  await rest(config, "admin_notifications", {
    method: "POST",
    body: JSON.stringify({
      kind: "meeting_booked",
      message: `שיחה נקבעה: ${lead.name} · ${hebrewSlotLabel(wanted)}`,
      lead_id: lead.id,
    }),
  }).catch(() => {})

  res.status(200).json({ ok: true, slot: wanted.toISOString(), minutes: CALL_MINUTES })
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const action = typeof req.query?.action === "string" ? req.query.action : ""
  if (action === "slots" || action === "book") {
    await booking(req, res, action)
    return
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" })
    return
  }

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    res.status(503).json({ error: "Email notifications are not configured on the server." })
    return
  }

  const { name, email, phone, company, projectType, budget, message, website } = (req.body ?? {}) as LeadPayload
  if (!name || typeof name !== "string" || !email || typeof email !== "string") {
    res.status(400).json({ error: "Missing 'name' or 'email' in request body." })
    return
  }

  // The honeypot. The field is in the form, hidden from anyone reading the page
  // and invisible to a screen reader, so only something filling every input it
  // finds writes into it. Answering 200 rather than an error is the point: a
  // bot that is told it failed tries again differently.
  if (typeof website === "string" && website.trim() !== "") {
    res.status(200).json({ ok: true })
    return
  }

  if (await hitRateLimit(limitConfig(), RULE, callerIp(req.headers["x-forwarded-for"]))) {
    res.status(429).json({ error: "Too many requests." })
    return
  }

  const rows = [
    ["שם", name],
    ["אימייל", email],
    ["טלפון", phone || "·"],
    ["חברה / עסק", company || "·"],
    ["סוג פרויקט", projectType || "·"],
    ["תקציב", budget || "·"],
    ["הודעה", message || "·"],
  ]

  const html = `
    <div dir="rtl" style="font-family: sans-serif; font-size: 14px; color: #111;">
      <h2>פנייה חדשה מהאתר</h2>
      <table cellpadding="6" style="border-collapse: collapse;">
        ${rows
          .map(
            ([label, value]) =>
              `<tr><td style="font-weight: 600; vertical-align: top;">${escapeHtml(label)}</td><td>${escapeHtml(value).replace(/\n/g, "<br/>")}</td></tr>`
          )
          .join("")}
      </table>
    </div>
    ${EMAIL_SIGNATURE_HTML}
  `
  const text = rows.map(([label, value]) => `${label}: ${value}`).join("\n") + "\n\n" + EMAIL_SIGNATURE_TEXT

  try {
    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_ADDRESS,
        to: [OWNER_EMAIL],
        reply_to: email,
        subject: `פנייה חדשה מהאתר: ${name}`,
        html,
        text,
      }),
    })

    if (!resendRes.ok) {
      res.status(502).json({ error: "Failed to send notification email", detail: await resendRes.text() })
      return
    }

    res.status(200).json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: "Unexpected server error", detail: String(err) })
  }
}
