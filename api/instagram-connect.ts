import type { VercelRequest, VercelResponse } from "@vercel/node"
import { restFetch, serverConfig } from "./_lib/push-config.js"
import { instagramCredentials } from "./_lib/instagram.js"
import { verifyAdmin } from "./_lib/verify-admin.js"

/** Connecting the Instagram account, from the admin rather than from a
 * dashboard.
 *
 * The token and the account id are the one thing here that genuinely cannot be
 * derived · they come from Meta, and only Raz can issue them. What this removes
 * is everything after that: he pastes them into `/admin/social` and the token
 * is verified and stored server-side, instead of being typed into Supabase's
 * table editor. `app_secrets` has RLS on with no policies, so the browser can
 * never read back what it wrote · which is the point of storing it there. */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!(await verifyAdmin(req.headers.authorization))) {
    res.status(401).json({ error: "Unauthorized" })
    return
  }

  const config = serverConfig()
  if (!config) {
    res.status(503).json({ error: "השרת לא מוגדר מול Supabase." })
    return
  }

  if (req.method === "GET") {
    const credentials = await instagramCredentials(config)
    if (!credentials) {
      res.status(200).json({ connected: false })
      return
    }
    const check = await fetch(
      `https://graph.facebook.com/v21.0/${credentials.userId}?fields=username,followers_count&access_token=${encodeURIComponent(credentials.accessToken)}`
    )
    const body = (await check.json().catch(() => null)) as
      | { username?: string; followers_count?: number; error?: { message?: string } }
      | null
    if (!body || body.error) {
      // A token that has expired is worse than no token: the queue looks
      // healthy and every publish fails. Say so on the screen that can fix it.
      res.status(200).json({ connected: false, expired: true, error: body?.error?.message ?? "הטוקן אינו תקף" })
      return
    }
    res.status(200).json({ connected: true, username: body.username, followers: body.followers_count })
    return
  }

  if (req.method === "POST") {
    const { userId, accessToken } = (req.body ?? {}) as { userId?: string; accessToken?: string }
    if (!userId?.trim() || !accessToken?.trim()) {
      res.status(400).json({ error: "צריך מזהה חשבון וטוקן." })
      return
    }

    // Verified before it is stored · a typo saved silently would only surface
    // the next time something failed to publish.
    const check = await fetch(
      `https://graph.facebook.com/v21.0/${userId.trim()}?fields=username&access_token=${encodeURIComponent(accessToken.trim())}`
    )
    const body = (await check.json().catch(() => null)) as { username?: string; error?: { message?: string } } | null
    if (!body?.username) {
      res.status(400).json({ error: body?.error?.message ?? "מטא לא זיהתה את החשבון עם הטוקן הזה." })
      return
    }

    const saved = await restFetch(config, "app_secrets?on_conflict=key", {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify([
        { key: "ig_user_id", value: userId.trim() },
        { key: "ig_access_token", value: accessToken.trim() },
      ]),
    })
    if (!saved.ok) {
      res.status(502).json({ error: "השמירה נכשלה", detail: await saved.text() })
      return
    }

    res.status(200).json({ connected: true, username: body.username })
    return
  }

  if (req.method === "DELETE") {
    await restFetch(config, "app_secrets?key=in.(ig_user_id,ig_access_token)", { method: "DELETE" })
    res.status(200).json({ connected: false })
    return
  }

  res.status(405).json({ error: "Method not allowed" })
}
