import type { VercelRequest, VercelResponse } from "@vercel/node"

const OWNER_EMAIL = "hello@madebyraz.co.il"
const FROM_ADDRESS = "RAZ Website <hello@madebyraz.co.il>"

// Fixed brand signature appended to every outgoing lead-notification email: Raz's actual
// business-card graphic, hosted from the site itself so it renders reliably across email
// clients (unlike a data: URI, which some clients strip).
const SIGNATURE_IMAGE_URL = "https://madebyraz.co.il/images/email-signature.png"
const EMAIL_SIGNATURE_HTML = `
  <table cellpadding="0" cellspacing="0" style="margin-top: 28px; border-collapse: collapse;">
    <tr>
      <td>
        <a href="https://madebyraz.co.il" style="display: block;">
          <img src="${SIGNATURE_IMAGE_URL}" width="500" height="250" alt="Made by RAZ — Raz Avramov, AI Creative Developer" style="display: block; width: 500px; height: 250px; max-width: 100%; border: 0;" />
        </a>
      </td>
    </tr>
  </table>
`

const EMAIL_SIGNATURE_TEXT = [
  "MADE BY RAZ",
  "Raz Avramov — AI Creative Developer",
  "hello@madebyraz.co.il | madebyraz.co.il | 054-812-0747",
  "Instagram: instagram.com/made.by.raz | LinkedIn: linkedin.com/in/raz-avramov-783370199 | WhatsApp: wa.me/972506944443",
].join("\n")

type LeadPayload = {
  name?: string
  email?: string
  phone?: string | null
  company?: string | null
  projectType?: string | null
  budget?: string | null
  message?: string | null
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" })
    return
  }

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    res.status(503).json({ error: "Email notifications are not configured on the server." })
    return
  }

  const { name, email, phone, company, projectType, budget, message } = (req.body ?? {}) as LeadPayload
  if (!name || typeof name !== "string" || !email || typeof email !== "string") {
    res.status(400).json({ error: "Missing 'name' or 'email' in request body." })
    return
  }

  const rows = [
    ["שם", name],
    ["אימייל", email],
    ["טלפון", phone || "—"],
    ["חברה / עסק", company || "—"],
    ["סוג פרויקט", projectType || "—"],
    ["תקציב", budget || "—"],
    ["הודעה", message || "—"],
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
