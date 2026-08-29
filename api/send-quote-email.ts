import type { VercelRequest, VercelResponse } from "@vercel/node"
import { EMAIL_SIGNATURE_HTML, EMAIL_SIGNATURE_TEXT } from "./_lib/email-signature"

const OWNER_EMAIL = "razavramov2@gmail.com"
const FROM_ADDRESS = "RAZ <hello@madebyraz.co.il>"

type SendQuotePayload = {
  clientEmail?: string
  clientName?: string
  title?: string
  link?: string
  total?: number
  currency?: string
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

async function verifyAdmin(authHeader: string | undefined) {
  if (!authHeader?.startsWith("Bearer ")) return false
  const token = authHeader.slice(7)
  const url = process.env.VITE_SUPABASE_URL
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY
  if (!url || !anonKey) return false
  const res = await fetch(`${url}/auth/v1/user`, {
    headers: { Authorization: `Bearer ${token}`, apikey: anonKey },
  })
  if (!res.ok) return false
  const user = await res.json()
  return user?.email === OWNER_EMAIL
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" })
    return
  }

  const isAdmin = await verifyAdmin(req.headers.authorization)
  if (!isAdmin) {
    res.status(401).json({ error: "Unauthorized" })
    return
  }

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    res.status(503).json({ error: "Email notifications are not configured on the server." })
    return
  }

  const { clientEmail, clientName, title, link, total, currency } = (req.body ?? {}) as SendQuotePayload
  if (!clientEmail || typeof clientEmail !== "string" || !link || typeof link !== "string") {
    res.status(400).json({ error: "Missing 'clientEmail' or 'link' in request body." })
    return
  }

  const safeName = escapeHtml(clientName || "")
  const safeTitle = escapeHtml(title || "הצעת מחיר")
  const symbol = currency === "ILS" || !currency ? "₪" : currency
  const totalLine = typeof total === "number" ? `<p style="margin:0 0 24px;font-size:15px;color:#111;">סה"כ: <strong>${symbol}${Math.round(total).toLocaleString("he-IL")}</strong></p>` : ""

  const html = `
    <div dir="rtl" style="font-family: sans-serif; font-size: 15px; color: #111; max-width: 480px; margin: 0 auto;">
      <p style="margin:0 0 16px;">היי${safeName ? " " + safeName : ""},</p>
      <p style="margin:0 0 16px;">הכנתי לך הצעת מחיר: <strong>${safeTitle}</strong></p>
      ${totalLine}
      <p style="margin:0 0 24px;">אפשר לצפות בהצעה המלאה, בפירוט ובתנאים, ולאשר אותה ישירות בלינק הבא:</p>
      <p style="margin:0 0 24px;">
        <a href="${link}" style="display:inline-block;background:#D1FE17;color:#000;text-decoration:none;font-weight:700;padding:12px 24px;border-radius:8px;">לצפייה ואישור ההצעה ←</a>
      </p>
      <p style="margin:0;color:#666;font-size:13px;">אם יש שאלות, פשוט תשיבו למייל הזה.</p>
    </div>
    ${EMAIL_SIGNATURE_HTML}
  `
  const text = `היי${safeName ? " " + safeName : ""},\n\nהכנתי לך הצעת מחיר: ${title || "הצעת מחיר"}\n\nלצפייה ואישור: ${link}\n\n${EMAIL_SIGNATURE_TEXT}`

  try {
    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_ADDRESS,
        to: [clientEmail],
        reply_to: "hello@madebyraz.co.il",
        subject: `הצעת מחיר: ${title || "הצעת מחיר"} — RAZ`,
        html,
        text,
      }),
    })

    if (!resendRes.ok) {
      res.status(502).json({ error: "Failed to send quote email", detail: await resendRes.text() })
      return
    }

    res.status(200).json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: "Unexpected server error", detail: String(err) })
  }
}
