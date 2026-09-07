// The sign-in email, written here rather than in Supabase's template editor.
//
// Supabase will only send a code if the Magic Link template prints `{{ .Token }}`,
// and it will only let that template be edited once a custom SMTP server is
// configured · two dashboard screens, on a project whose email already goes out
// through Resend from hello@madebyraz.co.il. So the code is generated with the
// admin API instead (which sends nothing) and the email is sent from here, in
// Hebrew, from the same address as every other mail the site sends.
//
// Underscore-prefixed directory so Vercel doesn't treat this as its own
// Serverless Function.
import { EMAIL_SIGNATURE_HTML, EMAIL_SIGNATURE_TEXT } from "./email-signature.js"

export type LoginCodeAudience = "admin" | "portal"

export function loginCodeSubject(code: string): string {
  // The code leads, because a phone shows the subject line before the body and
  // iOS offers a code it can see there straight from the notification.
  return `${code} · קוד הכניסה שלך`
}

export function loginCodeEmail(
  code: string,
  link: string,
  audience: LoginCodeAudience
): { subject: string; html: string; text: string } {
  const where = audience === "admin" ? "לניהול האתר" : "לפורטל הלקוחות"
  const safeLink = escapeHtml(link)

  const html = `
    <div dir="rtl" style="font-family: sans-serif; font-size: 15px; color: #111; line-height: 1.7;">
      <p style="margin: 0 0 18px;">קוד הכניסה ${escapeHtml(where)}:</p>
      <p style="margin: 0 0 18px; font-family: monospace; font-size: 34px; font-weight: 700; letter-spacing: 8px; direction: ltr; text-align: right;">${escapeHtml(code)}</p>
      <p style="margin: 0 0 18px;">הקוד תקף לשעה אחת, ולשימוש אחד בלבד.</p>
      <p style="margin: 0 0 18px; color: #555;">אם פתחת את המסך בטלפון, הקלד את הקוד שם · זה מה שישאיר אותך מחובר.</p>
      <p style="margin: 0 0 18px;">
        במחשב אפשר פשוט <a href="${safeLink}" style="color: #111;">ללחוץ כאן להתחברות</a>.
      </p>
      <p style="margin: 0; color: #777; font-size: 13px;">לא ביקשת קוד? אפשר להתעלם מהמייל הזה · בלי הקוד אף אחד לא נכנס.</p>
    </div>
    ${EMAIL_SIGNATURE_HTML}
  `

  const text = [
    `קוד הכניסה ${where}: ${code}`,
    "הקוד תקף לשעה אחת, ולשימוש אחד בלבד.",
    "",
    `להתחברות במחשב: ${link}`,
    "",
    "לא ביקשת קוד? אפשר להתעלם מהמייל הזה.",
    "",
    EMAIL_SIGNATURE_TEXT,
  ].join("\n")

  return { subject: loginCodeSubject(code), html, text }
}

/** Deliberately narrow. Anything this rejects would have failed at Supabase a
 * moment later anyway, and rejecting it here costs no email and no round trip. */
export function normalizeEmail(value: unknown): string | null {
  if (typeof value !== "string") return null
  const email = value.trim().toLowerCase()
  if (email.length < 6 || email.length > 254) return null
  if (!/^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/.test(email)) return null
  return email
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}
