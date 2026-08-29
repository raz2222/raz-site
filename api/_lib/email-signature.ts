// Shared brand signature appended to every outgoing email (lead notifications, quotes,
// quote follow-ups): Raz's business-card graphic, hosted from the site itself so it
// renders reliably across email clients (unlike a data: URI, which some clients strip).
// Underscore-prefixed directory so Vercel doesn't treat this as its own Serverless Function.
const SIGNATURE_IMAGE_URL = "https://madebyraz.co.il/images/email-signature.png"

export const EMAIL_SIGNATURE_HTML = `
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

export const EMAIL_SIGNATURE_TEXT = [
  "MADE BY RAZ",
  "Raz Avramov — AI Creative Developer",
  "hello@madebyraz.co.il | madebyraz.co.il | 054-812-0747",
  "Instagram: instagram.com/made.by.raz | LinkedIn: linkedin.com/in/raz-avramov-783370199 | WhatsApp: wa.me/972506944443",
].join("\n")
