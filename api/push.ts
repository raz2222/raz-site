import type { VercelRequest, VercelResponse } from "@vercel/node"
import webpush from "web-push"
import { isQuietHours, readSecret, restFetch, serverConfig } from "./_lib/push-config.js"
import { verifyAdmin } from "./_lib/verify-admin.js"

/** Everything about push notifications, in one Serverless Function.
 *
 * Subscribing and sending were two files until Vercel refused the deployment:
 * the Hobby plan allows twelve Serverless Functions and this project had
 * thirteen. They belong together anyway · one subject, one file · and every
 * further endpoint from here has to earn its slot or share one of these.
 *
 * Three callers, told apart explicitly rather than by guessing from the body:
 *   GET                    · the browser asking for the public key
 *   POST ?action=send      · the admin_notifications trigger, with the secret
 *   POST / DELETE          · the browser saving or dropping a subscription
 *
 * Each is authenticated by the thing that suits it: the public key is public,
 * the trigger carries a shared secret, and saving a subscription is the owner.
 */

const OWNER_EMAIL = "mailto:hello@madebyraz.co.il"

type Subscription = { id: number; endpoint: string; p256dh: string; auth: string }
type NotificationBody = { id?: string; kind?: string; message?: string; quote_id?: string | null; lead_id?: string | null }

/** Where tapping the notification should land. A lead opens the people list, a
 * signed quote opens the quote · anything else opens the dashboard. */
export function targetFor(body: NotificationBody): string {
  if (body.lead_id) return "/admin/clients"
  if (body.quote_id) return `/admin/quotes/${body.quote_id}`
  // The social notifications carry neither id · they are about a post in a
  // group or a video on the account, not about a row in this CRM. Their kind
  // is the only thing that says where to go.
  if (body.kind?.startsWith("social_")) return "/admin/social"
  return "/admin"
}

export function titleFor(kind: string | undefined): string {
  // Where the lead came from is in the message · the site, or the cold-lead
  // GPT · so the title must not assert one of them.
  if (kind === "lead_new") return "ליד חדש"
  if (kind === "social_opportunity") return "הזדמנות בקבוצה"
  if (kind === "social_published") return "עלה לאינסטגרם"
  if (kind === "social_failed") return "פרסום לאינסטגרם נכשל"
  if (kind && kind.includes("sign")) return "מישהו חתם"
  return "RAZ"
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const config = serverConfig()
  if (!config) {
    res.status(503).json({ code: "not_configured" })
    return
  }

  if (req.method === "GET") {
    const publicKey = await readSecret(config, "vapid_public")
    if (!publicKey) {
      res.status(503).json({ code: "not_configured" })
      return
    }
    res.status(200).json({ publicKey })
    return
  }

  if (req.method === "POST" && req.query.action === "send") {
    await send(req, res, config)
    return
  }

  // Everything past here is a device asking to receive these notifications, and
  // what they carry is a client's name, a signature and an amount. Open, anyone
  // who found this endpoint could subscribe their own phone to Raz's CRM.
  if (!(await verifyAdmin(req.headers.authorization))) {
    res.status(401).json({ code: "unauthorized" })
    return
  }

  if (req.method === "POST") {
    const { subscription, userAgent } = (req.body ?? {}) as {
      subscription?: { endpoint?: string; keys?: { p256dh?: string; auth?: string } }
      userAgent?: string
    }
    const endpoint = subscription?.endpoint
    const p256dh = subscription?.keys?.p256dh
    const auth = subscription?.keys?.auth
    if (!endpoint || !p256dh || !auth) {
      res.status(400).json({ code: "invalid_subscription" })
      return
    }

    // Upsert on the endpoint: re-enabling on a phone that is already subscribed
    // must not leave two rows and send two notifications.
    const saved = await restFetch(config, "push_subscriptions?on_conflict=endpoint", {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify({
        endpoint,
        p256dh,
        auth,
        user_agent: typeof userAgent === "string" ? userAgent.slice(0, 300) : null,
      }),
    })
    if (!saved.ok) {
      res.status(502).json({ code: "not_saved", detail: await saved.text() })
      return
    }
    res.status(200).json({ ok: true })
    return
  }

  if (req.method === "DELETE") {
    const { endpoint } = (req.body ?? {}) as { endpoint?: string }
    if (!endpoint) {
      res.status(400).json({ code: "invalid_subscription" })
      return
    }
    await restFetch(config, `push_subscriptions?endpoint=eq.${encodeURIComponent(endpoint)}`, {
      method: "DELETE",
      headers: { Prefer: "return=minimal" },
    })
    res.status(200).json({ ok: true })
    return
  }

  res.status(405).json({ code: "method_not_allowed" })
}

/** How many notifications are waiting, for the badge on the app icon.
 *
 * Counted with the same filter the admin's own badge uses · `read = false` ·
 * so the number on the icon and the number in the nav can never disagree.
 * PostgREST returns it in content-range rather than the body, and a failure
 * here must not stop the notification: undefined simply leaves the icon alone.
 */
async function unreadCount(
  config: NonNullable<ReturnType<typeof serverConfig>>
): Promise<number | undefined> {
  try {
    const res = await restFetch(config, "admin_notifications?select=id&read=eq.false&limit=1", {
      headers: { Prefer: "count=exact", Range: "0-0" },
    })
    return parseCount(res.headers.get("content-range"))
  } catch {
    return undefined
  }
}

/** PostgREST answers "0-0/7", and "*\/0" when nothing matched at all. Anything
 * else · a missing header, a range with no total · means we do not know, and an
 * unknown count must leave the icon alone rather than clear it. */
export function parseCount(contentRange: string | null): number | undefined {
  const total = Number((contentRange ?? "").split("/")[1])
  return Number.isInteger(total) && total >= 0 ? total : undefined
}

/** Called by a Postgres trigger, not by a browser, so it is guarded by a shared
 * secret that also lives in the database. Without that check this would be a
 * way for anyone to make Raz's phone buzz. */
async function send(req: VercelRequest, res: VercelResponse, config: NonNullable<ReturnType<typeof serverConfig>>) {
  const expected = await readSecret(config, "push_hook_secret")
  if (!expected || req.headers["x-push-secret"] !== expected) {
    res.status(403).json({ code: "forbidden" })
    return
  }

  const body = (req.body ?? {}) as NotificationBody

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
    // The number for the app icon. The service worker has no database access,
    // so the count travels with the push.
    unread: await unreadCount(config),
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
