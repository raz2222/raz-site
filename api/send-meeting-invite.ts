import type { VercelRequest, VercelResponse } from "@vercel/node"
import { EMAIL_SIGNATURE_HTML, EMAIL_SIGNATURE_TEXT } from "./_lib/email-signature.js"

/** Emails the client a real calendar invitation.
 *
 * Not a link and not "here is the date, please add it": a `text/calendar` part
 * with METHOD:REQUEST is what makes Gmail and Apple Mail show accept and
 * decline, and what puts the meeting in their calendar when they accept. The
 * .ics is built in the browser from `src/lib/calendarEvent.ts`, which is the
 * same builder the admin's own Google link and download use · one description
 * of the meeting, not three.
 *
 * Raz's own copy is the Google Calendar link on the screen. Adding it for him
 * would need an OAuth grant he would have to manage and renew, for one button.
 */

const FROM_ADDRESS = "RAZ <hello@madebyraz.co.il>"

type Body = { to?: unknown; toName?: unknown; subject?: unknown; intro?: unknown; ics?: unknown; when?: unknown }

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ code: "method_not_allowed" })
    return
  }

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    res.status(503).json({ code: "not_configured" })
    return
  }

  const { to, toName, subject, intro, ics, when } = (req.body ?? {}) as Body
  if (typeof to !== "string" || !to.includes("@") || typeof ics !== "string" || !ics.includes("BEGIN:VCALENDAR")) {
    res.status(400).json({ code: "invalid_request" })
    return
  }

  const greeting = typeof toName === "string" && toName.trim() ? `היי ${toName.trim()},` : "היי,"
  const line = typeof intro === "string" && intro.trim() ? intro.trim() : "קבענו פגישה."
  const whenText = typeof when === "string" ? when : ""

  const html = `
    <div dir="rtl" style="font-family: sans-serif; font-size: 15px; color: #111; line-height: 1.7;">
      <p style="margin: 0 0 16px;">${escapeHtml(greeting)}</p>
      <p style="margin: 0 0 16px;">${escapeHtml(line)}</p>
      ${whenText ? `<p style="margin: 0 0 16px; font-weight: 600;">${escapeHtml(whenText)}</p>` : ""}
      <p style="margin: 0; color: #555;">מצורף זימון · אישור שלו יוסיף את הפגישה ליומן שלך.</p>
    </div>
    ${EMAIL_SIGNATURE_HTML}
  `
  const text = [greeting, "", line, whenText, "", "מצורף זימון ליומן.", "", EMAIL_SIGNATURE_TEXT].join("\n")

  try {
    const sent = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: FROM_ADDRESS,
        to: [to],
        subject: typeof subject === "string" && subject.trim() ? subject.trim() : "זימון לפגישה · RAZ",
        html,
        text,
        attachments: [
          {
            filename: "meeting.ics",
            // Resend takes attachment content as base64.
            content: Buffer.from(ics, "utf8").toString("base64"),
            contentType: "text/calendar; charset=utf-8; method=REQUEST",
          },
        ],
      }),
    })

    if (!sent.ok) {
      res.status(502).json({ code: "send_failed", detail: await sent.text() })
      return
    }
    res.status(200).json({ ok: true })
  } catch (err) {
    res.status(500).json({ code: "unexpected", detail: String(err) })
  }
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}
