import type { VercelRequest, VercelResponse } from "@vercel/node"
import { readSecret, restFetch, serverConfig } from "./_lib/push-config.js"

/** A lead from outside the site.
 *
 * Raz works cold leads in a system he built inside ChatGPT. A conversation has
 * no API to connect to, but a custom GPT has Actions · it can call an HTTP
 * endpoint · so this is that endpoint. He tells the GPT "add this lead" or "we
 * booked a meeting", and the row lands in the same `leads` table the contact
 * form writes to, which means the same list, the same badge, the same push.
 *
 * One key, in `app_secrets` rather than a Vercel environment variable, for the
 * same reason as the push keys: it needed nothing from him to set up.
 *
 * Matching is by email, and an existing lead is updated rather than duplicated:
 * a GPT told the same thing twice, or told about someone the site already knows,
 * must not produce two of the same person.
 */

type Body = {
  name?: unknown
  email?: unknown
  phone?: unknown
  company?: unknown
  note?: unknown
  /** ISO 8601. Set when the GPT is reporting a booked meeting. */
  meeting_at?: unknown
  /** "won" when a deal closed there, otherwise left alone. */
  status?: unknown
}

const ALLOWED_STATUS = new Set(["new", "contacted", "won", "lost"])

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ code: "method_not_allowed" })
    return
  }

  const config = serverConfig()
  if (!config) {
    res.status(503).json({ code: "not_configured" })
    return
  }

  const expected = await readSecret(config, "gpt_action_key")
  const provided = String(req.headers.authorization ?? "").replace(/^Bearer\s+/i, "")
  if (!expected || provided !== expected) {
    res.status(401).json({ code: "unauthorized" })
    return
  }

  const body = (req.body ?? {}) as Body
  const name = text(body.name)
  const email = text(body.email)?.toLowerCase()
  if (!name || !email || !email.includes("@")) {
    res.status(400).json({ code: "name_and_email_required" })
    return
  }

  const patch: Record<string, unknown> = {
    name,
    email,
    phone: text(body.phone),
    company: text(body.company),
    message: text(body.note),
    meeting_at: isoOrNull(body.meeting_at),
  }
  const status = text(body.status)
  if (status && ALLOWED_STATUS.has(status)) patch.status = status

  // Drop the keys that were not supplied, so a GPT reporting only a meeting
  // does not blank out the phone number the site already had.
  for (const key of Object.keys(patch)) {
    if (patch[key] === null || patch[key] === undefined) delete patch[key]
  }

  const existingRes = await restFetch(
    config,
    `leads?select=id&email=eq.${encodeURIComponent(email)}&deleted_at=is.null&limit=1`
  )
  const existing = (await existingRes.json().catch(() => [])) as { id?: string }[]

  if (existing[0]?.id) {
    const updated = await restFetch(config, `leads?id=eq.${existing[0].id}`, {
      method: "PATCH",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify(patch),
    })
    if (!updated.ok) {
      res.status(502).json({ code: "not_saved", detail: await updated.text() })
      return
    }
    res.status(200).json({ ok: true, id: existing[0].id, created: false })
    return
  }

  const created = await restFetch(config, "leads", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    // `source` is how the admin tells where someone came from, and this is the
    // whole point of the endpoint: these are not site enquiries.
    body: JSON.stringify({ status: "new", project_type: "cold", ...patch, source: "gpt" }),
  })
  if (!created.ok) {
    res.status(502).json({ code: "not_saved", detail: await created.text() })
    return
  }
  const rows = (await created.json().catch(() => [])) as { id?: string }[]
  res.status(200).json({ ok: true, id: rows[0]?.id ?? null, created: true })
}

function text(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim().slice(0, 500) : null
}

function isoOrNull(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date.toISOString()
}
