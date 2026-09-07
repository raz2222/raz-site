import type { VercelRequest, VercelResponse } from "@vercel/node"
import webpush from "web-push"
import { isQuietHours, readSecret, restFetch, serverConfig } from "./_lib/push-config.js"

/** Sends one notification to every phone that asked for them.
 *
 * Called by a Postgres trigger on admin_notifications, not by a browser, so it
 * is guarded by a shared secret that also lives in the database. Without that
 * check this would be a way for anyone to make Raz's phone buzz. */

const OWNER_EMAIL = "mailto:hello@madebyraz.co.il"

type Body = { id?: string; kind?: string; message?: string; quote_id?: string | null; lead_id?: string | null }

type Subscription = { id: number; endpoint: string; p256dh: string; auth: string }

/** Where tapping the notification should land. A lead opens the person, a
 * signed quote opens the quote, anything social opens the social screen ·
 * anything else opens the dashboard.
 *
 * The social notifications carry neither id, because they are about a post in a
 * group or a video on Instagram rather than about a row in this CRM. Their kind
 * is the only thing that says where to go. */
export function targetFor(body: Body): string {
  if (body.lead_id) return "/admin/clients"
  if (body.quote_id) return `/admin/quotes/${body.quote_id}`
  if (body.kind?.startsWith("social_")) return "/admin/social"
  return "/admin"
}

export function titleFor(kind: string | undefined): string {
  if (kind === "lead_new") return "פנייה חדשה מהאתר"
  if (kind === "social_opportunity") return "הזדמנות בקבוצה"
  if (kind === "social_published") return "עלה לאינסטגרם"
  if (kind === "social_failed") return "פרסום לאינסטגרם נכשל"
  if (kind && kind.includes("sign")) return "מישהו חתם"
  return "RAZ"
}

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

  const expected = await readSecret(config, "push_hook_secret")
  const provided = req.headers["x-push-secret"]
  if (!expected || provided !== expected) {
    res.status(403).json({ code: "forbidden" })
    return
  }

  const body = (req.body ?? {}) as Body

  if (isQuietHours()) {
    // Written, counted, badged · just not buzzed. He asked for that explicitly.
    res.status(200).json({ ok: true, skipped: "quiet_hours" })
    return
  }

  const [publicKey, privateKey] = await Promise.all([
    readSecret(config, "vapid_public"),
    readSecret(config, "vapid_private"),
  ])
  if (!publicKey || !privateKey) {
    res.status(503).json({ code: "not_configured" })
    return
  }
  webpush.setVapidDetails(OWNER_EMAIL, publicKey, privateKey)

  const subsRes = await restFetch(config, "push_subscriptions?select=id,endpoint,p256dh,auth")
  const subscriptions = (await subsRes.json().catch(() => [])) as Subscription[]
  if (!Array.isArray(subscriptions) || subscriptions.length === 0) {
    res.status(200).json({ ok: true, sent: 0 })
    return
  }

  const payload = JSON.stringify({
    title: titleFor(body.kind),
    body: body.message ?? "",
    url: targetFor(body),
    tag: body.id ?? "raz-admin",
  })

  let sent = 0
  const gone: number[] = []

  await Promise.all(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload
        )
        sent += 1
      } catch (err) {
        // 404 and 410 mean the browser threw the subscription away · an app
        // deleted, notifications turned off in iOS settings. Keeping a dead
        // endpoint means retrying it forever, so forget it.
        const status = (err as { statusCode?: number }).statusCode
        if (status === 404 || status === 410) gone.push(sub.id)
      }
    })
  )

  if (gone.length > 0) {
    await restFetch(config, `push_subscriptions?id=in.(${gone.join(",")})`, {
      method: "DELETE",
      headers: { Prefer: "return=minimal" },
    })
  }

  res.status(200).json({ ok: true, sent, removed: gone.length })
}
