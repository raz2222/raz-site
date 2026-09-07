import type { PushConfig } from "./push-config.js"
import { restFetch } from "./push-config.js"
import { advancePost, type InstagramCredentials, type PostToPublish } from "./instagram.js"
import { draftCaption } from "./social-agent.js"

/** The parts of publishing that both the "publish now" button and the daily
 * sweep need, so the two cannot drift into publishing differently. */

const SITE_URL = "https://madebyraz.co.il"
const DAY_MS = 24 * 60 * 60 * 1000

export type SocialSettings = {
  ig_daily_cap: number
  ig_auto_publish: boolean
  ig_auto_queue_projects: boolean
}

/** Instagram fetches the media itself, so a site-relative path publishes
 * nothing. The browser's copy of this is `absoluteMediaUrl` in
 * `src/lib/socialCopy.ts`; they answer the same question on two sides of a
 * boundary neither build crosses. */
function absolute(value: string | null | undefined): string | null {
  const trimmed = value?.trim()
  if (!trimmed) return null
  return /^https?:\/\//.test(trimmed) ? trimmed : `${SITE_URL}/${trimmed.replace(/^\//, "")}`
}

export async function readSettings(config: PushConfig): Promise<SocialSettings> {
  const res = await restFetch(config, "social_settings?select=ig_daily_cap,ig_auto_publish,ig_auto_queue_projects&limit=1")
  const rows = (await res.json().catch(() => [])) as SocialSettings[]
  return rows[0] ?? { ig_daily_cap: 2, ig_auto_publish: false, ig_auto_queue_projects: true }
}

/** How many publishes are left in the rolling day. Counted from the ledger of
 * what actually went out, so a re-run cannot spend the budget twice. */
export async function instagramRemainingToday(config: PushConfig, cap: number): Promise<number> {
  const since = new Date(Date.now() - DAY_MS).toISOString()
  const res = await restFetch(
    config,
    `social_actions?select=id&action=eq.ig_publish&created_at=gte.${since}`
  )
  const rows = (await res.json().catch(() => [])) as unknown[]
  return Math.max(0, cap - rows.length)
}

async function patchPost(config: PushConfig, id: string, body: Record<string, unknown>) {
  await restFetch(config, `social_posts?id=eq.${id}`, {
    method: "PATCH",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify(body),
  })
}

export type PublishResult = { state: "published" | "processing" | "failed"; detail?: string }

/** Take one queued post as far as it goes, and leave the row telling the truth
 * about where it stopped. */
export async function publishPost(
  config: PushConfig,
  credentials: InstagramCredentials,
  post: PostToPublish,
  waitMs = 40_000
): Promise<PublishResult> {
  const outcome = await advancePost(credentials, post, waitMs)

  if (outcome.state === "processing") {
    await patchPost(config, post.id, { status: "publishing", ig_media_id: outcome.containerId, error: null })
    return { state: "processing", detail: outcome.containerId }
  }

  if (outcome.state === "failed") {
    await patchPost(config, post.id, { status: "failed", error: outcome.error })
    return { state: "failed", detail: outcome.error }
  }

  await patchPost(config, post.id, {
    status: "published",
    ig_media_id: outcome.mediaId,
    permalink: outcome.permalink,
    published_at: new Date().toISOString(),
    error: null,
  })

  // The ledger, not the queue, is what every pacing rule counts.
  await restFetch(config, "social_actions", {
    method: "POST",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({ platform: "instagram", action: "ig_publish", post_id: post.id, promotional: true }),
  })

  return { state: "published", detail: outcome.permalink ?? undefined }
}

type ProjectRow = {
  id: string
  title: string
  overview: string | null
  ai_tools: string[] | null
  categories: string[] | null
  client_name: string | null
  video: string | null
  gallery: { type?: string; url?: string }[] | null
  created_at: string
}

/** Put every finished project that has never been posted into the queue, one a
 * day, in the order they were made.
 *
 * This is the same shape as the guides queue and for the same reason: dated
 * rows release themselves, so nothing has to run on time. A project with
 * neither a film nor a still is skipped rather than queued empty · there would
 * be nothing to publish. */
export async function queueNewProjects(config: PushConfig, settings: SocialSettings): Promise<number> {
  const projectsRes = await restFetch(
    config,
    "projects?select=id,title,overview,ai_tools,categories,client_name,video,gallery,created_at&draft=not.is.true&order=created_at.asc"
  )
  const projects = (await projectsRes.json().catch(() => [])) as ProjectRow[]

  const queuedRes = await restFetch(config, "social_posts?select=project_id,scheduled_for&project_id=not.is.null")
  const queued = (await queuedRes.json().catch(() => [])) as { project_id: string; scheduled_for: string | null }[]
  const already = new Set(queued.map((row) => row.project_id))

  const lastScheduled = queued
    .map((row) => (row.scheduled_for ? Date.parse(row.scheduled_for) : 0))
    .reduce((max, value) => Math.max(max, value), 0)

  // Each new post lands a day after the last one already queued, so a batch
  // discovered at once releases itself one a day instead of all at once.
  let cursor = Math.max(Date.now() - DAY_MS, lastScheduled)
  let added = 0

  for (const project of projects) {
    if (already.has(project.id)) continue
    const film = absolute(project.video)
    const first = project.gallery?.[0]
    const media = film ?? absolute(first?.url)
    if (!media) continue

    const mediaType = film || first?.type === "video" ? "video" : "image"
    const draft = await draftCaption({
      title: project.title,
      overview: project.overview,
      tools: project.ai_tools,
      categories: project.categories,
      clientName: project.client_name,
      mediaType,
    }).catch(() => null)

    // Nothing goes out on its own without a caption someone wrote · an empty
    // one under a client's film is worse than a day's delay.
    const status = draft && settings.ig_auto_publish ? "ready" : "draft"
    cursor += DAY_MS

    const inserted = await restFetch(config, "social_posts", {
      method: "POST",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({
        platform: "instagram",
        project_id: project.id,
        media_url: media,
        media_type: mediaType,
        caption: draft?.caption ?? null,
        hashtags: draft?.hashtags ?? [],
        scheduled_for: new Date(cursor).toISOString(),
        status,
        source: "project",
      }),
    })
    if (inserted.ok) added++
  }

  return added
}
