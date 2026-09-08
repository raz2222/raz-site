import type { PushConfig } from "./push-config.js"
import { restFetch } from "./push-config.js"
import { isLead, scoreEngagement, type EngagementIntent } from "./engagement-signal.js"
import type { ParsedEngagement } from "./meta-webhook.js"

/** Turning a reply into a row, and sometimes into a lead.
 *
 * The attribution is the point. A comment is stored with the post it answered
 * and the project whose film was on screen, so afterwards there is an answer to
 * a question view counts never answer: which video actually made someone write.
 *
 * Everything here treats the reply as data. It was written by a stranger. */

const PROJECT_TYPE: Record<EngagementIntent, string> = {
  pricing: "סרטון AI",
  wants_one: "סרטון AI",
  collab: "שיתוף פעולה",
  how: "שאלה מקצועית",
  praise: "מחמאה",
  other: "פנייה מסושיאל",
}

type QueuedPost = { id: string; project_id: string | null }

/** Which of our posts was this, and which project was in it. */
async function postForMedia(config: PushConfig, mediaId: string | null): Promise<QueuedPost | null> {
  if (!mediaId) return null
  const res = await restFetch(
    config,
    `social_posts?select=id,project_id&ig_media_id=eq.${encodeURIComponent(mediaId)}&limit=1`
  )
  const rows = (await res.json().catch(() => [])) as QueuedPost[]
  return rows[0] ?? null
}

async function createLead(config: PushConfig, engagement: ParsedEngagement, intent: EngagementIntent, extra: Record<string, unknown>) {
  const res = await restFetch(config, "leads", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({
      name: engagement.authorName ?? engagement.authorHandle ?? "פנייה מסושיאל",
      // Null on purpose · a commenter has a handle, and inventing an address
      // would start merging strangers into each other on the next import.
      email: null,
      handle: engagement.authorHandle ? `@${engagement.authorHandle}` : null,
      project_type: PROJECT_TYPE[intent],
      message: engagement.text,
      source: engagement.platform,
      metadata: extra,
    }),
  })
  if (!res.ok) return null
  const rows = (await res.json().catch(() => [])) as { id: string }[]
  return rows[0]?.id ?? null
}

/** Store what came in, and promote what reads like work.
 *
 * Deduplicated on Meta's own id: webhooks are redelivered, and three
 * notifications about one person is worse than none. */
export async function ingestEngagements(config: PushConfig, parsed: ParsedEngagement[]): Promise<{ stored: number; leads: number }> {
  let stored = 0
  let leads = 0

  for (const engagement of parsed) {
    const signal = scoreEngagement(engagement.text, engagement.kind)
    const post = await postForMedia(config, engagement.mediaId)

    let leadId: string | null = null
    if (isLead(signal)) {
      leadId = await createLead(config, engagement, signal.intent, {
        kind: engagement.kind,
        platform: engagement.platform,
        permalink: engagement.permalink,
        media_id: engagement.mediaId,
        post_id: post?.id ?? null,
        project_id: post?.project_id ?? null,
        score: signal.score,
        intent: signal.intent,
      })
      if (leadId) leads++
    }

    const inserted = await restFetch(config, "social_engagements?on_conflict=external_id", {
      method: "POST",
      headers: { Prefer: "resolution=ignore-duplicates,return=minimal" },
      body: JSON.stringify({
        platform: engagement.platform,
        kind: engagement.kind,
        external_id: engagement.externalId,
        author_name: engagement.authorName,
        author_handle: engagement.authorHandle,
        author_id: engagement.authorId,
        text: engagement.text,
        permalink: engagement.permalink,
        media_id: engagement.mediaId,
        post_id: post?.id ?? null,
        project_id: post?.project_id ?? null,
        intent: signal.intent,
        score: signal.score,
        lead_id: leadId,
        status: isLead(signal) ? "lead" : signal.score > 0 ? "new" : "noise",
        occurred_at: engagement.occurredAt,
      }),
    })
    if (inserted.ok) stored++
  }

  return { stored, leads }
}
