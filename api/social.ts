import type { VercelRequest, VercelResponse } from "@vercel/node"
import { restFetch, serverConfig } from "./_lib/push-config.js"
import { instagramCredentials, type PostToPublish } from "./_lib/instagram.js"
import { instagramRemainingToday, publishPost, readSettings } from "./_lib/social-publish.js"
import { agentConfigured, draftCaption, draftOpportunity } from "./_lib/social-agent.js"
import { readSecret } from "./_lib/push-config.js"
import { parseMetaWebhook } from "./_lib/meta-webhook.js"
import { ingestEngagements } from "./_lib/social-engagements.js"
import { verifyAdmin } from "./_lib/verify-admin.js"

/** Everything `/admin/social` asks the server for, behind one function.
 *
 * Three endpoints would have been clearer to read and this project cannot
 * afford them: Vercel's Hobby plan deploys twelve Serverless Functions and
 * refuses the thirteenth *after* the build reports success. `api/push.ts`
 * already answers three callers this way, so this follows it rather than
 * inventing a second shape · `?action=` says which job, and the three do not
 * share a line of logic beyond the admin check.
 *
 * None of them sends anything to Facebook. There is no API that could. */

/** The agent's read of a group post, or a caption for a project. */
async function draft(req: VercelRequest, res: VercelResponse) {
  // Not an error: the screen has a written fallback for both drafts, and
  // saying so lets it use that instead of showing a failure.
  if (!agentConfigured()) {
    res.status(200).json({ configured: false })
    return
  }

  const body = (req.body ?? {}) as Record<string, unknown>

  try {
    if (body.kind === "opportunity") {
      const postText = typeof body.postText === "string" ? body.postText.trim() : ""
      if (!postText) {
        res.status(400).json({ error: "Missing 'postText'." })
        return
      }
      res.status(200).json({
        configured: true,
        draft: await draftOpportunity({
          postText,
          groupName: typeof body.groupName === "string" ? body.groupName : null,
          groupRules: typeof body.groupRules === "string" ? body.groupRules : null,
          linksAllowed: body.linksAllowed === true,
        }),
      })
      return
    }

    if (body.kind === "caption") {
      const title = typeof body.title === "string" ? body.title.trim() : ""
      if (!title) {
        res.status(400).json({ error: "Missing 'title'." })
        return
      }
      res.status(200).json({
        configured: true,
        draft: await draftCaption({
          title,
          overview: typeof body.overview === "string" ? body.overview : null,
          tools: Array.isArray(body.tools) ? body.tools.map(String) : null,
          categories: Array.isArray(body.categories) ? body.categories.map(String) : null,
          clientName: typeof body.clientName === "string" ? body.clientName : null,
          mediaType: body.mediaType === "video" ? "video" : "image",
        }),
      })
      return
    }

    res.status(400).json({ error: "Unknown 'kind'." })
  } catch (err) {
    res.status(502).json({ error: "הסוכן לא הצליח לנסח טיוטה", detail: String(err) })
  }
}

/** Reading, storing and forgetting the Instagram credentials.
 *
 * They are the one thing here that cannot be derived · Meta issues them
 * against Raz's own account. Verified against Graph before they are stored, so
 * a typo surfaces now rather than the next time a publish fails, and kept in
 * `app_secrets`, whose RLS has no policies · the browser can never read back
 * what it wrote. */
async function connection(req: VercelRequest, res: VercelResponse) {
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

  if (req.method === "DELETE") {
    await restFetch(config, "app_secrets?key=in.(ig_user_id,ig_access_token)", { method: "DELETE" })
    res.status(200).json({ connected: false })
    return
  }

  const { userId, accessToken } = (req.body ?? {}) as { userId?: string; accessToken?: string }
  if (!userId?.trim() || !accessToken?.trim()) {
    res.status(400).json({ error: "צריך מזהה חשבון וטוקן." })
    return
  }

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
}

/** Publish one queued post now.
 *
 * The daily sweep publishes what is due on its own; this exists because a
 * project finished at noon should not have to wait for tomorrow morning. */
async function publish(req: VercelRequest, res: VercelResponse) {
  const config = serverConfig()
  if (!config) {
    res.status(503).json({ error: "השרת לא מוגדר מול Supabase." })
    return
  }

  const credentials = await instagramCredentials(config)
  if (!credentials) {
    res.status(503).json({ code: "not_connected", error: "אינסטגרם לא מחוברת." })
    return
  }

  const postId = (req.body ?? {}).postId
  if (typeof postId !== "string" || !postId) {
    res.status(400).json({ error: "Missing 'postId'." })
    return
  }

  const settings = await readSettings(config)
  if ((await instagramRemainingToday(config, settings.ig_daily_cap)) <= 0) {
    res.status(429).json({ code: "daily_cap", error: `נגמרה המכסה היומית לאינסטגרם (${settings.ig_daily_cap}).` })
    return
  }

  const postRes = await restFetch(
    config,
    `social_posts?select=id,media_url,media_type,caption,hashtags,ig_media_id,status&id=eq.${postId}&limit=1`
  )
  const rows = (await postRes.json().catch(() => [])) as (PostToPublish & { hashtags: string[] })[]
  const post = rows[0]
  if (!post) {
    res.status(404).json({ error: "הפוסט לא נמצא." })
    return
  }
  if (post.status === "published") {
    res.status(409).json({ error: "הפוסט כבר פורסם." })
    return
  }

  // Hashtags are stored apart so they can be edited as a list, and joined onto
  // the caption only here · Instagram has one text field.
  const caption = [post.caption?.trim(), post.hashtags?.join(" ")].filter(Boolean).join("\n\n")

  const result = await publishPost(config, credentials, { ...post, caption }, 40_000)
  res.status(result.state === "failed" ? 502 : 200).json(result)
}

/** Meta calling to say somebody answered something.
 *
 * The only caller here that is not Raz, so it authenticates differently: a
 * secret in the URL that only Meta was ever given, the same shape
 * `/api/inbound-lead` uses for the cold-lead GPT. The handshake Meta performs
 * before it will deliver anything answers with the challenge it sent.
 *
 * It sits inside this function rather than beside it because the Hobby plan
 * deploys twelve, and this screen already had one. */
async function webhook(req: VercelRequest, res: VercelResponse) {
  const config = serverConfig()
  if (!config) {
    res.status(503).json({ error: "not configured" })
    return
  }

  const expected = await readSecret(config, "meta_webhook_key")
  if (!expected || req.query.key !== expected) {
    res.status(401).json({ error: "Unauthorized" })
    return
  }

  // Meta's subscription handshake.
  if (req.method === "GET") {
    if (req.query["hub.mode"] === "subscribe") {
      res.status(200).send(String(req.query["hub.challenge"] ?? ""))
      return
    }
    res.status(200).json({ ok: true })
    return
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" })
    return
  }

  // Answer first, work after: Meta retries anything it does not hear back
  // about within seconds, and a retry would double every notification.
  const parsed = parseMetaWebhook(req.body)
  res.status(200).json({ ok: true, received: parsed.length })
  if (parsed.length) await ingestEngagements(config, parsed).catch(() => undefined)
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.query.action === "webhook") {
    await webhook(req, res)
    return
  }

  if (!(await verifyAdmin(req.headers.authorization))) {
    res.status(401).json({ error: "Unauthorized" })
    return
  }

  const action = req.query.action
  if (action === "connection") {
    await connection(req, res)
    return
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" })
    return
  }
  if (action === "draft") {
    await draft(req, res)
    return
  }
  if (action === "publish") {
    await publish(req, res)
    return
  }

  res.status(400).json({ error: "Unknown 'action'." })
}
