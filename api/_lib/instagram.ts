import type { PushConfig } from "./push-config.js"
import { readSecret } from "./push-config.js"

/** Publishing to Instagram, which · unlike Facebook groups · really is an API.
 *
 * The Content Publishing API takes two steps: a container that points at a
 * publicly reachable media URL, then a publish call on that container. Video is
 * transcoded in between, which takes anywhere from seconds to minutes, so this
 * is written to be resumable: a run that ends before the container is ready
 * stores the container id and the next run picks it up rather than uploading
 * the film a second time.
 *
 * Two credentials are needed and both live in `app_secrets` rather than in
 * Vercel's environment · the functions already hold the service-role key, and a
 * dashboard visit is a step Raz would have to take. */

const GRAPH = "https://graph.facebook.com/v21.0"

export type InstagramCredentials = { userId: string; accessToken: string }

export async function instagramCredentials(config: PushConfig): Promise<InstagramCredentials | null> {
  const [userId, accessToken] = await Promise.all([
    readSecret(config, "ig_user_id"),
    readSecret(config, "ig_access_token"),
  ])
  return userId && accessToken ? { userId, accessToken } : null
}

export type ContainerInput = {
  mediaUrl: string
  mediaType: "image" | "video"
  caption: string
}

/** A video posted to a business account goes up as a reel · Instagram removed
 * the plain feed-video container, and `media_type: VIDEO` is rejected. */
export function containerParams(input: ContainerInput): Record<string, string> {
  const params: Record<string, string> = { caption: input.caption }
  if (input.mediaType === "video") {
    params.media_type = "REELS"
    params.video_url = input.mediaUrl
  } else {
    params.image_url = input.mediaUrl
  }
  return params
}

/** Graph answers a failure with 200-shaped JSON often enough that reading the
 * body is the only reliable check. */
export function graphErrorMessage(body: unknown): string | null {
  const error = (body as { error?: { message?: string; error_user_msg?: string } } | null)?.error
  if (!error) return null
  return error.error_user_msg || error.message || "Instagram rejected the request"
}

async function graphPost(path: string, params: Record<string, string>, accessToken: string) {
  const body = new URLSearchParams({ ...params, access_token: accessToken })
  const res = await fetch(`${GRAPH}/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  })
  return (await res.json().catch(() => null)) as unknown
}

async function graphGet(path: string, fields: string, accessToken: string) {
  const res = await fetch(`${GRAPH}/${path}?fields=${fields}&access_token=${encodeURIComponent(accessToken)}`)
  return (await res.json().catch(() => null)) as unknown
}

export type PostToPublish = {
  id: string
  media_url: string | null
  media_type: "image" | "video"
  caption: string | null
  /** A container id from an earlier run that ran out of time. */
  ig_media_id: string | null
  status: string
}

export type PublishOutcome =
  | { state: "published"; mediaId: string; permalink: string | null }
  | { state: "processing"; containerId: string }
  | { state: "failed"; error: string }

/** Move one post as far towards published as this invocation can.
 *
 * `waitMs` is the budget for waiting on transcoding · a serverless function
 * that overruns is killed mid-flight, and the whole point of returning
 * `processing` is that the next run finishes the job for free. */
export async function advancePost(
  credentials: InstagramCredentials,
  post: PostToPublish,
  waitMs = 40_000,
  sleep: (ms: number) => Promise<void> = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
): Promise<PublishOutcome> {
  const { userId, accessToken } = credentials

  let containerId = post.status === "publishing" ? post.ig_media_id : null

  if (!containerId) {
    if (!post.media_url) return { state: "failed", error: "אין מדיה לפרסום" }
    const created = await graphPost(
      `${userId}/media`,
      containerParams({ mediaUrl: post.media_url, mediaType: post.media_type, caption: post.caption ?? "" }),
      accessToken
    )
    const error = graphErrorMessage(created)
    if (error) return { state: "failed", error }
    containerId = (created as { id?: string } | null)?.id ?? null
    if (!containerId) return { state: "failed", error: "אינסטגרם לא החזירה מזהה מדיה" }
  }

  const deadline = Date.now() + waitMs
  for (;;) {
    const status = await graphGet(containerId, "status_code,status", accessToken)
    const statusError = graphErrorMessage(status)
    if (statusError) return { state: "failed", error: statusError }

    const code = (status as { status_code?: string } | null)?.status_code
    if (code === "FINISHED") break
    if (code === "ERROR" || code === "EXPIRED") {
      const detail = (status as { status?: string } | null)?.status
      return { state: "failed", error: detail || `העלאה נכשלה (${code})` }
    }
    if (Date.now() >= deadline) return { state: "processing", containerId }
    await sleep(3000)
  }

  const published = await graphPost(`${userId}/media_publish`, { creation_id: containerId }, accessToken)
  const publishError = graphErrorMessage(published)
  if (publishError) return { state: "failed", error: publishError }

  const mediaId = (published as { id?: string } | null)?.id
  if (!mediaId) return { state: "failed", error: "אינסטגרם לא אישרה את הפרסום" }

  const details = await graphGet(mediaId, "permalink", accessToken)
  const permalink = (details as { permalink?: string } | null)?.permalink ?? null

  return { state: "published", mediaId, permalink }
}
