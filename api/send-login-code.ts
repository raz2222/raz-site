import type { VercelRequest, VercelResponse } from "@vercel/node"
import { loginCodeEmail, normalizeEmail, type LoginCodeAudience } from "./_lib/login-code-email.js"

/** The six-digit sign-in code, generated here and sent through Resend.
 *
 * The obvious way to do this is `supabase.auth.signInWithOtp` from the browser,
 * and that is what shipped first. It only ever sends a link, because Supabase
 * prints the code solely when the Magic Link template contains `{{ .Token }}` ·
 * and it refuses to let that template be edited at all until a custom SMTP
 * server is configured. Two dashboard screens, on a project that already sends
 * every other email through Resend from hello@madebyraz.co.il.
 *
 * So the code is generated instead with the admin `generate_link` endpoint,
 * which returns the OTP and sends nothing, and the email is written and sent
 * from here. Three things fall out of that, all of them improvements: the mail
 * is in Hebrew and looks like the rest of the site's mail, it comes from Raz's
 * own verified domain rather than Supabase's shared sender, and it is not
 * subject to the built-in SMTP's cap of a couple of emails an hour · which is
 * what "יותר מדי בקשות" on the login screen actually was.
 *
 * What that cap was also doing, though, was standing between a public endpoint
 * and an open mail relay. `login_code_requests` is that counter now.
 */

const FROM_ADDRESS = "RAZ <hello@madebyraz.co.il>"
const CANONICAL_ORIGIN = "https://madebyraz.co.il"

/** Per address, per quarter hour. Generous enough that nobody typing their own
 * email badly gets locked out, tight enough that nobody gets mailbombed. */
const PER_EMAIL_LIMIT = 5
const PER_EMAIL_WINDOW_MINUTES = 15
/** Per source address, per hour. An office behind one NAT is still fine. */
const PER_IP_LIMIT = 20
const PER_IP_WINDOW_MINUTES = 60

type Body = { email?: unknown; audience?: unknown }

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ code: "method_not_allowed" })
    return
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const resendKey = process.env.RESEND_API_KEY
  if (!supabaseUrl || !serviceKey || !resendKey) {
    res.status(503).json({ code: "not_configured" })
    return
  }

  const { email: rawEmail, audience: rawAudience } = (req.body ?? {}) as Body
  const email = normalizeEmail(rawEmail)
  const audience: LoginCodeAudience = rawAudience === "admin" ? "admin" : "portal"
  if (!email) {
    res.status(400).json({ code: "invalid_email" })
    return
  }

  const ip = clientIp(req)

  try {
    if (await isRateLimited(supabaseUrl, serviceKey, email, ip)) {
      res.status(429).json({ code: "rate_limited" })
      return
    }
    // Counted before the work, not after it: an attempt that fails on the way
    // out is still an attempt, and counting only successes would leave a loop
    // that errors every time completely unthrottled.
    await recordRequest(supabaseUrl, serviceKey, email, ip)

    const redirectTo = `${originFor(req)}/${audience}`

    let link = await generateLink(supabaseUrl, serviceKey, email, redirectTo)

    if (link === "no_such_user") {
      // The portal is open to any address · a client signs in with whatever
      // email their contract was written to, and the account is created on
      // first use. The admin is not: an unknown address there is simply not
      // authorized, and creating one would hand out the keys.
      if (audience === "admin") {
        res.status(403).json({ code: "not_authorized" })
        return
      }
      await createUser(supabaseUrl, serviceKey, email)
      link = await generateLink(supabaseUrl, serviceKey, email, redirectTo)
    }

    if (link === "throttled") {
      res.status(429).json({ code: "rate_limited" })
      return
    }
    if (link === "no_such_user" || link === null) {
      res.status(502).json({ code: "send_failed" })
      return
    }

    const { subject, html, text } = loginCodeEmail(link.code, link.url, audience)
    const sent = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: FROM_ADDRESS, to: [email], subject, html, text }),
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

/** `null` means the call failed for a reason that is not worth telling the
 * browser apart; `"no_such_user"` is the one the caller has to branch on. */
async function generateLink(
  url: string,
  serviceKey: string,
  email: string,
  redirectTo: string
): Promise<{ code: string; url: string } | "no_such_user" | "throttled" | null> {
  const res = await fetch(`${url}/auth/v1/admin/generate_link`, {
    method: "POST",
    headers: authHeaders(serviceKey),
    body: JSON.stringify({ type: "magiclink", email, redirect_to: redirectTo }),
  })

  const body = (await res.json().catch(() => null)) as Record<string, unknown> | null

  if (!res.ok) {
    const message = JSON.stringify(body ?? "").toLowerCase()
    if (message.includes("user_not_found") || message.includes("user not found")) return "no_such_user"
    // Supabase keeps its own minimum interval between generated links. Two
    // taps in quick succession land here, and the code from the first one is
    // still good · which is what the screen tells them.
    if (res.status === 429 || message.includes("only request this after")) return "throttled"
    return null
  }

  // GoTrue returns the OTP alongside the user; supabase-js splits the same
  // response into `properties`. Read either shape rather than depending on
  // which one this project's API version hands back.
  const properties = (body?.properties as Record<string, unknown> | undefined) ?? body ?? {}
  const code = properties.email_otp
  const actionLink = properties.action_link
  if (typeof code !== "string" || typeof actionLink !== "string") return null
  return { code, url: actionLink }
}

async function createUser(url: string, serviceKey: string, email: string) {
  await fetch(`${url}/auth/v1/admin/users`, {
    method: "POST",
    headers: authHeaders(serviceKey),
    // Confirmed on creation: the code they are about to type is the proof that
    // the address is theirs, and an unconfirmed user cannot be sent a magiclink.
    body: JSON.stringify({ email, email_confirm: true }),
  })
}

async function isRateLimited(url: string, serviceKey: string, email: string, ip: string | null) {
  const [byEmail, byIp] = await Promise.all([
    countSince(url, serviceKey, `email=eq.${encodeURIComponent(email)}`, PER_EMAIL_WINDOW_MINUTES),
    ip ? countSince(url, serviceKey, `ip=eq.${encodeURIComponent(ip)}`, PER_IP_WINDOW_MINUTES) : Promise.resolve(0),
  ])
  return byEmail >= PER_EMAIL_LIMIT || byIp >= PER_IP_LIMIT
}

async function countSince(url: string, serviceKey: string, filter: string, minutes: number) {
  const since = new Date(Date.now() - minutes * 60_000).toISOString()
  const res = await fetch(
    `${url}/rest/v1/login_code_requests?select=id&${filter}&created_at=gte.${since}&limit=${PER_IP_LIMIT + 1}`,
    { headers: authHeaders(serviceKey) }
  )
  if (!res.ok) return 0
  const rows = (await res.json().catch(() => [])) as unknown[]
  return Array.isArray(rows) ? rows.length : 0
}

async function recordRequest(url: string, serviceKey: string, email: string, ip: string | null) {
  await fetch(`${url}/rest/v1/login_code_requests`, {
    method: "POST",
    headers: { ...authHeaders(serviceKey), Prefer: "return=minimal" },
    body: JSON.stringify({ email, ip }),
  })

  // Nothing here is worth keeping past the window it is counted in, and this is
  // the only code that ever runs against the table. Once in a while is often
  // enough to stop it growing, and never adds latency to the other requests.
  if (Math.random() < 0.05) {
    const cutoff = new Date(Date.now() - 24 * 60 * 60_000).toISOString()
    await fetch(`${url}/rest/v1/login_code_requests?created_at=lt.${cutoff}`, {
      method: "DELETE",
      headers: { ...authHeaders(serviceKey), Prefer: "return=minimal" },
    })
  }
}

function authHeaders(serviceKey: string) {
  return {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
    "Content-Type": "application/json",
  }
}

function clientIp(req: VercelRequest): string | null {
  const forwarded = req.headers["x-forwarded-for"]
  const first = Array.isArray(forwarded) ? forwarded[0] : forwarded?.split(",")[0]
  return first?.trim() || req.socket?.remoteAddress || null
}

/** The link has to come back to the deployment the request came from, so a
 * preview build signs in against itself. Built from the request's own host
 * rather than anything the caller can set · and Supabase's redirect allowlist
 * has the final say either way. */
function originFor(req: VercelRequest): string {
  const host = req.headers.host
  if (!host) return CANONICAL_ORIGIN
  return `${host.startsWith("localhost") || host.startsWith("127.0.0.1") ? "http" : "https"}://${host}`
}
