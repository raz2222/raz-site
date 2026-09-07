import type { VercelRequest, VercelResponse } from "@vercel/node"
import { restFetch, serverConfig } from "./_lib/push-config.js"
import { instagramCredentials, type PostToPublish } from "./_lib/instagram.js"
import { instagramRemainingToday, publishPost, readSettings } from "./_lib/social-publish.js"
import { verifyAdmin } from "./_lib/verify-admin.js"

/** Publish one queued post now, from the button in the admin.
 *
 * The daily sweep publishes what is due on its own; this exists because a
 * project finished at noon should not have to wait for tomorrow morning. */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" })
    return
  }

  if (!(await verifyAdmin(req.headers.authorization))) {
    res.status(401).json({ error: "Unauthorized" })
    return
  }

  const config = serverConfig()
  if (!config) {
    res.status(503).json({ error: "השרת לא מוגדר מול Supabase." })
    return
  }

  const credentials = await instagramCredentials(config)
  if (!credentials) {
    res.status(503).json({ code: "not_connected", error: "אינסטגרם לא מחוברת · חסרים ig_user_id ו-ig_access_token." })
    return
  }

  const postId = (req.body ?? {}).postId
  if (typeof postId !== "string" || !postId) {
    res.status(400).json({ error: "Missing 'postId'." })
    return
  }

  const settings = await readSettings(config)
  const remaining = await instagramRemainingToday(config, settings.ig_daily_cap)
  if (remaining <= 0) {
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
