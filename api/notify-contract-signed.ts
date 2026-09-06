import type { VercelRequest, VercelResponse } from "@vercel/node"
import { EMAIL_SIGNATURE_HTML, EMAIL_SIGNATURE_TEXT } from "./_lib/email-signature"

const OWNER_EMAIL = "hello@madebyraz.co.il"
const FROM_ADDRESS = "RAZ <hello@madebyraz.co.il>"
const SITE_ORIGIN = "https://madebyraz.co.il"

// A signature that just happened is worth an email. One from last month is a
// replayed request, so the window is what keeps this endpoint from being usable
// as a way to mail a stranger's client over and over.
const FRESH_SIGNATURE_MINUTES = 10

type Contract = {
  id: string
  contract_number: string | null
  title: string
  client_name: string
  client_email: string
  total: number
  currency: string
  status: string
}

type Signature = {
  full_name: string
  id_number: string | null
  signed_at: string
  ip_address: string | null
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

async function restGet<T>(url: string, serviceKey: string, path: string): Promise<T[]> {
  const res = await fetch(`${url}/rest/v1/${path}`, {
    headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
  })
  if (!res.ok) return []
  return (await res.json()) as T[]
}

async function sendEmail(apiKey: string, to: string, subject: string, html: string, text: string, replyTo: string) {
  return fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: FROM_ADDRESS, to: [to], reply_to: replyTo, subject, html, text }),
  })
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" })
    return
  }

  const { contractId } = (req.body ?? {}) as { contractId?: string }
  if (!contractId || typeof contractId !== "string") {
    res.status(400).json({ error: "Missing 'contractId' in request body." })
    return
  }

  const url = process.env.VITE_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const apiKey = process.env.RESEND_API_KEY
  if (!url || !serviceKey || !apiKey) {
    res.status(503).json({ error: "Server is missing Supabase or Resend configuration." })
    return
  }

  const [contract] = await restGet<Contract>(
    url,
    serviceKey,
    `contracts?id=eq.${encodeURIComponent(contractId)}&select=id,contract_number,title,client_name,client_email,total,currency,status&limit=1`
  )
  const [signature] = await restGet<Signature>(
    url,
    serviceKey,
    `contract_signatures?contract_id=eq.${encodeURIComponent(contractId)}&select=full_name,id_number,signed_at,ip_address&limit=1`
  )

  if (!contract || !signature || contract.status !== "signed") {
    res.status(404).json({ error: "No signed contract with that id." })
    return
  }

  const ageMinutes = (Date.now() - new Date(signature.signed_at).getTime()) / 60000
  if (ageMinutes > FRESH_SIGNATURE_MINUTES) {
    res.status(409).json({ error: "This signature was already notified." })
    return
  }

  const link = `${SITE_ORIGIN}/portal/contract/${contract.id}`
  const numberSuffix = contract.contract_number ? ` (${contract.contract_number})` : ""
  const signedAtText = new Date(signature.signed_at).toLocaleString("he-IL", { timeZone: "Asia/Jerusalem" })

  const ownerRows = [
    ["חוזה", `${contract.title}${numberSuffix}`],
    ["לקוח", contract.client_name],
    ["נחתם על ידי", signature.full_name],
    ["ת.ז / ח.פ", signature.id_number || "—"],
    ["מועד", signedAtText],
    ["IP", signature.ip_address || "—"],
  ]
  const ownerHtml = `
    <div dir="rtl" style="font-family: sans-serif; font-size: 14px; color: #111;">
      <h2>חוזה נחתם</h2>
      <table cellpadding="6" style="border-collapse: collapse;">
        ${ownerRows
          .map(([label, value]) => `<tr><td style="font-weight:600;vertical-align:top;">${escapeHtml(label)}</td><td>${escapeHtml(value)}</td></tr>`)
          .join("")}
      </table>
      <p style="margin:20px 0 0;"><a href="${SITE_ORIGIN}/admin/contracts/${contract.id}">פתיחת החוזה בממשק ←</a></p>
    </div>
    ${EMAIL_SIGNATURE_HTML}
  `
  const ownerText = ownerRows.map(([l, v]) => `${l}: ${v}`).join("\n") + `\n\n${SITE_ORIGIN}/admin/contracts/${contract.id}\n\n${EMAIL_SIGNATURE_TEXT}`

  const clientHtml = `
    <div dir="rtl" style="font-family: sans-serif; font-size: 15px; color: #111; max-width: 480px; margin: 0 auto;">
      <p style="margin:0 0 16px;">היי ${escapeHtml(contract.client_name)},</p>
      <p style="margin:0 0 16px;">החוזה <strong>${escapeHtml(contract.title)}</strong>${escapeHtml(numberSuffix)} נחתם בהצלחה ב-${escapeHtml(signedAtText)}.</p>
      <p style="margin:0 0 24px;">העותק החתום שמור בפורטל שלכם, ואפשר לפתוח אותו ולשמור כ-PDF בכל רגע:</p>
      <p style="margin:0 0 24px;">
        <a href="${link}" style="display:inline-block;background:#D1FE17;color:#000;text-decoration:none;font-weight:700;padding:12px 24px;border-radius:8px;">לצפייה בחוזה החתום ←</a>
      </p>
      <p style="margin:0;color:#666;font-size:13px;">מכאן מתחילים. אדבר איתכם על הצעד הראשון.</p>
    </div>
    ${EMAIL_SIGNATURE_HTML}
  `
  const clientText = `היי ${contract.client_name},\n\nהחוזה ${contract.title}${numberSuffix} נחתם בהצלחה ב-${signedAtText}.\n\nלצפייה בעותק החתום: ${link}\n\n${EMAIL_SIGNATURE_TEXT}`

  try {
    const [ownerRes, clientRes] = await Promise.all([
      sendEmail(apiKey, OWNER_EMAIL, `חוזה נחתם: ${contract.title}${numberSuffix}`, ownerHtml, ownerText, contract.client_email),
      sendEmail(apiKey, contract.client_email, `החוזה נחתם: ${contract.title}${numberSuffix} — RAZ`, clientHtml, clientText, OWNER_EMAIL),
    ])

    // Also lands in the admin's own notification list, so a signature is never
    // discoverable only through an inbox.
    await fetch(`${url}/rest/v1/admin_notifications`, {
      method: "POST",
      headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        kind: "contract_signed",
        message: `${signature.full_name} חתם/ה על החוזה "${contract.title}"${numberSuffix}.`,
        read: false,
      }),
    })

    if (!ownerRes.ok || !clientRes.ok) {
      res.status(502).json({ error: "Failed to send one of the notification emails." })
      return
    }
    res.status(200).json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: "Unexpected server error", detail: String(err) })
  }
}
