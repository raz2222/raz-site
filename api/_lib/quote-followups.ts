import type { PushConfig } from "./push-config.js"
import { restFetch } from "./push-config.js"
import { EMAIL_SIGNATURE_HTML, EMAIL_SIGNATURE_TEXT } from "./email-signature.js"

/** Chasing a quote nobody answered.
 *
 * Lifted out of its own cron function and into a library when the daily jobs
 * were merged into one · the Hobby plan deploys twelve functions, and two
 * daily sweeps were two of them. The logic is unchanged. */

const FROM_ADDRESS = "RAZ <hello@madebyraz.co.il>"
const MAX_REMINDERS = 2

type Quote = {
  id: string
  client_name: string
  client_email: string
  title: string
  currency: string
  final_total: number | null
  calculated_total: number
  total: number
  sent_at: string
  reminder_count: number
  last_reminded_at: string | null
}

type Settings = { reminder_interval_days: number }

function daysSince(iso: string) {
  return (Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24)
}


export async function quoteFollowUps(config: PushConfig) {
  const resendKey = process.env.RESEND_API_KEY
  const settingsRes = await restFetch(config, "quote_settings?select=reminder_interval_days&limit=1")
  const settingsRows = (await settingsRes.json()) as Settings[]
  const reminderIntervalDays = settingsRows[0]?.reminder_interval_days ?? 4

  // sent_at IS NOT NULL matters: a quote can have status='sent' with sent_at
  // still null from a manual status flip in the admin UI (not an actual send),
  // and it must not be swept into the follow-up cycle.
  const quotesRes = await restFetch(
    config,
    "quotes?select=id,client_name,client_email,title,currency,final_total,calculated_total,total,sent_at,reminder_count,last_reminded_at&status=eq.sent&sent_at=not.is.null"
  )
  const quotes = (await quotesRes.json()) as Quote[]

  let remindersSent = 0
  let expired = 0
  let skipped = 0

  for (const quote of quotes) {
    const referenceDate = quote.last_reminded_at ?? quote.sent_at
    const due = daysSince(referenceDate) >= reminderIntervalDays

    if (!due) {
      skipped++
      continue
    }

    if (quote.reminder_count >= MAX_REMINDERS) {
      await restFetch(config, `quotes?id=eq.${quote.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "expired" }),
      })
      expired++
      continue
    }

    if (resendKey) {
      const total = quote.final_total ?? quote.calculated_total ?? quote.total
      const symbol = quote.currency === "ILS" || !quote.currency ? "₪" : quote.currency
      const link = `https://madebyraz.co.il/portal/quote/${quote.id}`
      const html = `
        <div dir="rtl" style="font-family: sans-serif; font-size: 15px; color: #111; max-width: 480px; margin: 0 auto;">
          <p style="margin:0 0 16px;">היי${quote.client_name ? " " + quote.client_name : ""},</p>
          <p style="margin:0 0 16px;">רק תזכורת קטנה · עדיין מחכה לך הצעת מחיר פתוחה: <strong>${quote.title}</strong></p>
          <p style="margin:0 0 24px;">סה"כ: <strong>${symbol}${Math.round(total).toLocaleString("he-IL")}</strong></p>
          <p style="margin:0 0 24px;">
            <a href="${link}" style="display:inline-block;background:#D1FE17;color:#000;text-decoration:none;font-weight:700;padding:12px 24px;border-radius:8px;">לצפייה ואישור ההצעה ←</a>
          </p>
          <p style="margin:0;color:#666;font-size:13px;">אם יש שאלות, פשוט תשיבו למייל הזה.</p>
        </div>
        ${EMAIL_SIGNATURE_HTML}
      `
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: FROM_ADDRESS,
          to: [quote.client_email],
          reply_to: "hello@madebyraz.co.il",
          subject: `תזכורת: הצעת מחיר ${quote.title} · RAZ`,
          html,
          text: `היי${quote.client_name ? " " + quote.client_name : ""},\n\nתזכורת להצעת מחיר פתוחה: ${quote.title}\n\nלצפייה ואישור: ${link}\n\n${EMAIL_SIGNATURE_TEXT}`,
        }),
      })
    }

    await restFetch(config, `quotes?id=eq.${quote.id}`, {
      method: "PATCH",
      body: JSON.stringify({ reminder_count: quote.reminder_count + 1, last_reminded_at: new Date().toISOString() }),
    })

    await restFetch(config, "admin_notifications", {
      method: "POST",
      body: JSON.stringify({
        kind: "quote_followup_whatsapp",
        message: `שלחו תזכורת וואטסאפ ידנית ל${quote.client_name} על הצעת המחיר "${quote.title}" (תזכורת ${quote.reminder_count + 1}/${MAX_REMINDERS}).`,
        quote_id: quote.id,
      }),
    })

    remindersSent++
  }

  return { remindersSent, expired, skipped, checked: quotes.length }

}
