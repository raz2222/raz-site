import type { VercelRequest, VercelResponse } from "@vercel/node"
import { EMAIL_SIGNATURE_HTML, EMAIL_SIGNATURE_TEXT } from "./_lib/email-signature.js"
import { verifyAdmin } from "./_lib/verify-admin.js"

/** The letter that carries a quote or a contract to the client.
 *
 * Two endpoints wrote this, and the 109 lines were the same 109 lines twice ·
 * the same auth, the same escaping, the same Resend call, differing only in the
 * sentence in the middle. They share one slot now, which is what the twelve-
 * function ceiling in CLAUDE.md asks of anything new: earn a slot or share one.
 *
 * `kind` says which letter. `src/lib/sendDocument.ts` is the caller, and it
 * already treated sending a document as one idea. */

const FROM_ADDRESS = "RAZ <hello@madebyraz.co.il>"

type SendPayload = {
  kind?: "quote" | "contract"
  clientEmail?: string
  clientName?: string
  title?: string
  link?: string
  /** Quote only. */
  total?: number
  currency?: string
  /** Contract only. */
  contractNumber?: string | null
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

type Letter = { subject: string; html: string; text: string }

function quoteLetter(payload: SendPayload): Letter {
  const safeName = escapeHtml(payload.clientName || "")
  const title = payload.title || "הצעת מחיר"
  const safeTitle = escapeHtml(title)
  const symbol = payload.currency === "ILS" || !payload.currency ? "₪" : payload.currency
  const totalLine =
    typeof payload.total === "number"
      ? `<p style="margin:0 0 24px;font-size:15px;color:#111;">סה"כ: <strong>${symbol}${Math.round(payload.total).toLocaleString("he-IL")}</strong></p>`
      : ""

  return {
    subject: `הצעת מחיר: ${title} · RAZ`,
    html: `
    <div dir="rtl" style="font-family: sans-serif; font-size: 15px; color: #111; max-width: 480px; margin: 0 auto;">
      <p style="margin:0 0 16px;">היי${safeName ? " " + safeName : ""},</p>
      <p style="margin:0 0 16px;">הכנתי לך הצעת מחיר: <strong>${safeTitle}</strong></p>
      ${totalLine}
      <p style="margin:0 0 24px;">אפשר לצפות בהצעה המלאה, בפירוט ובתנאים, ולאשר אותה ישירות בלינק הבא:</p>
      <p style="margin:0 0 24px;">
        <a href="${payload.link}" style="display:inline-block;background:#D1FE17;color:#000;text-decoration:none;font-weight:700;padding:12px 24px;border-radius:8px;">לצפייה ואישור ההצעה ←</a>
      </p>
      <p style="margin:0;color:#666;font-size:13px;">אם יש שאלות, פשוט תשיבו למייל הזה.</p>
    </div>
    ${EMAIL_SIGNATURE_HTML}
  `,
    text: `היי${safeName ? " " + safeName : ""},\n\nהכנתי לך הצעת מחיר: ${title}\n\nלצפייה ואישור: ${payload.link}\n\n${EMAIL_SIGNATURE_TEXT}`,
  }
}

function contractLetter(payload: SendPayload): Letter {
  const safeName = escapeHtml(payload.clientName || "")
  const title = payload.title || "חוזה עבודה"
  const safeTitle = escapeHtml(title)
  const numberLine = payload.contractNumber
    ? `<p style="margin:0 0 16px;font-size:13px;color:#666;">מספר הסכם: ${escapeHtml(payload.contractNumber)}</p>`
    : ""

  return {
    subject: `חוזה עבודה לחתימה: ${title} · RAZ`,
    html: `
    <div dir="rtl" style="font-family: sans-serif; font-size: 15px; color: #111; max-width: 480px; margin: 0 auto;">
      <p style="margin:0 0 16px;">היי${safeName ? " " + safeName : ""},</p>
      <p style="margin:0 0 16px;">מצורף חוזה העבודה שלנו: <strong>${safeTitle}</strong></p>
      ${numberLine}
      <p style="margin:0 0 24px;">אפשר לקרוא אותו במלואו ולחתום עליו דיגיטלית בקישור הבא. הכניסה היא עם כתובת המייל הזו, בלי סיסמה.</p>
      <p style="margin:0 0 24px;">
        <a href="${payload.link}" style="display:inline-block;background:#D1FE17;color:#000;text-decoration:none;font-weight:700;padding:12px 24px;border-radius:8px;">לקריאה ולחתימה ←</a>
      </p>
      <p style="margin:0;color:#666;font-size:13px;">יש שאלה או סעיף שצריך לדבר עליו? פשוט תשיבו למייל הזה, לפני החתימה.</p>
    </div>
    ${EMAIL_SIGNATURE_HTML}
  `,
    text: `היי${safeName ? " " + safeName : ""},\n\nמצורף חוזה העבודה: ${title}${payload.contractNumber ? ` (${payload.contractNumber})` : ""}\n\nלקריאה ולחתימה: ${payload.link}\n\n${EMAIL_SIGNATURE_TEXT}`,
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" })
    return
  }

  if (!(await verifyAdmin(req.headers.authorization))) {
    res.status(401).json({ error: "Unauthorized" })
    return
  }

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    res.status(503).json({ error: "Email notifications are not configured on the server." })
    return
  }

  const payload = (req.body ?? {}) as SendPayload
  if (payload.kind !== "quote" && payload.kind !== "contract") {
    res.status(400).json({ error: "Missing 'kind': expected 'quote' or 'contract'." })
    return
  }
  if (!payload.clientEmail || typeof payload.clientEmail !== "string" || !payload.link || typeof payload.link !== "string") {
    res.status(400).json({ error: "Missing 'clientEmail' or 'link' in request body." })
    return
  }

  const letter = payload.kind === "quote" ? quoteLetter(payload) : contractLetter(payload)

  try {
    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: FROM_ADDRESS,
        to: [payload.clientEmail],
        reply_to: "hello@madebyraz.co.il",
        subject: letter.subject,
        html: letter.html,
        text: letter.text,
      }),
    })

    if (!resendRes.ok) {
      res.status(502).json({ error: "Failed to send the document email", detail: await resendRes.text() })
      return
    }

    res.status(200).json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: "Unexpected server error", detail: String(err) })
  }
}
