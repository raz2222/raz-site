import type { VercelRequest, VercelResponse } from "@vercel/node"
import { restFetch, serverConfig } from "../_lib/push-config.js"
import { instagramCredentials, type PostToPublish } from "../_lib/instagram.js"
import { instagramRemainingToday, publishPost, queueNewProjects, readSettings } from "../_lib/social-publish.js"

/** Once a day: queue the projects that have never been posted, and publish
 * whatever the queue says is due.
 *
 * Daily rather than hourly on purpose. A queue of dated rows releases itself
 * one a day with nothing running on time · the same arrangement the guides use,
 * and the reason that one has never needed a robot. It also keeps the site
 * inside the cron allowance rather than spending it on a sweep that finds
 * nothing 23 times out of 24. */
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

  const settings = await readSettings(config)
  const queued = settings.ig_auto_queue_projects ? await queueNewProjects(config, settings) : 0

  const credentials = await instagramCredentials(config)
  if (!credentials) {
    res.status(200).json({ ok: true, queued, published: 0, note: "instagram_not_connected" })
    return
  }

  let remaining = await instagramRemainingToday(config, settings.ig_daily_cap)

  // A post left mid-transcode by an earlier run goes first: its container is
  // already uploaded and expires, so finishing it is both cheaper and urgent.
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

  res.status(200).json({ ok: true, queued, published, processing, failed, checked: due.length })
}
