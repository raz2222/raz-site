import type { VercelRequest, VercelResponse } from "@vercel/node"
import { serverConfig } from "../_lib/push-config.js"
import { instagramCredentials, type PostToPublish } from "../_lib/instagram.js"
import { restFetch } from "../_lib/push-config.js"
import { instagramRemainingToday, publishPost, queueNewProjects, readSettings } from "../_lib/social-publish.js"
import { quoteFollowUps } from "../_lib/quote-followups.js"

/** What the studio does every morning without being asked.
 *
 * Two jobs, one function, because Vercel's Hobby plan deploys twelve of them
 * and refuses the thirteenth after the build has already reported success.
 * They are unrelated, so each is wrapped: a Resend outage must not stop
 * Instagram from publishing, and an expired Meta token must not stop a client
 * being reminded about a quote. The response says what each one did. */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret || req.headers.authorization !== `Bearer ${cronSecret}`) {
    res.status(401).json({ error: "Unauthorized" })
    return
  }

  const config = serverConfig()
  if (!config) {
    res.status(503).json({ error: "Server is missing SUPABASE_SERVICE_ROLE_KEY / VITE_SUPABASE_URL." })
    return
  }

  const quotes = await quoteFollowUps(config).catch((err) => ({ error: String(err) }))
  const social = await socialSweep(config).catch((err) => ({ error: String(err) }))

  res.status(200).json({ ok: true, quotes, social })
}

/** Queue the projects that have never been posted, then publish what is due.
 *
 * A post left mid-transcode by an earlier run goes first: its container is
 * already uploaded and expires, so finishing it is both cheaper and urgent. */
async function socialSweep(config: NonNullable<ReturnType<typeof serverConfig>>) {
  const settings = await readSettings(config)
  const queued = settings.ig_auto_queue_projects ? await queueNewProjects(config, settings) : 0

  const credentials = await instagramCredentials(config)
  if (!credentials) return { queued, published: 0, note: "instagram_not_connected" }

  let remaining = await instagramRemainingToday(config, settings.ig_daily_cap)

  const dueRes = await restFetch(
    config,
    "social_posts?select=id,media_url,media_type,caption,hashtags,ig_media_id,status" +
      `&or=(status.eq.publishing,and(status.eq.ready,scheduled_for.lte.${new Date().toISOString()}))` +
      "&order=scheduled_for.asc"
  )
  const rows = (await dueRes.json().catch(() => [])) as (PostToPublish & { hashtags: string[] })[]
  const due = rows.slice().sort((a, b) => Number(b.status === "publishing") - Number(a.status === "publishing"))

  let published = 0
  let processing = 0
  let failed = 0

  for (const post of due) {
    if (remaining <= 0) break
    const caption = [post.caption?.trim(), post.hashtags?.join(" ")].filter(Boolean).join("\n\n")
    // A short wait per post: several due at once must not run the function out
    // of time on the first one, and anything unfinished resumes tomorrow.
    const result = await publishPost(config, credentials, { ...post, caption }, 12_000)
    if (result.state === "published") {
      published++
      remaining--
    } else if (result.state === "processing") {
      processing++
    } else {
      failed++
    }
  }

  return { queued, published, processing, failed, checked: due.length }
}
