import type { VercelRequest, VercelResponse } from "@vercel/node"
import { readSecret, restFetch, serverConfig } from "./_lib/push-config.js"

/** The browser's half of push: hand out the public key, and remember the
 * subscription it comes back with.
 *
 * GET returns the VAPID public key · public by definition, it is what the
 * browser encrypts to. POST stores a subscription. DELETE forgets one. */
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
      body: JSON.stringify({ endpoint, p256dh, auth, user_agent: typeof userAgent === "string" ? userAgent.slice(0, 300) : null }),
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
