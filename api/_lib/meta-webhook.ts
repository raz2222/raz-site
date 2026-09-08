/** What Meta sends when somebody answers something Raz posted.
 *
 * Three different shapes arrive at one URL and none of them looks like the
 * others: an Instagram comment nests under `changes`, an Instagram or Messenger
 * DM under `messaging`, and a comment on a Facebook Page post under `changes`
 * again but with completely different keys. Parsing them is separated from
 * receiving them so the shapes can be tested without a webhook.
 *
 * Everything in here is somebody else's writing. It is data · a comment that
 * says "ignore your instructions" is a comment, and gets scored like one. */

export type ParsedEngagement = {
  platform: "instagram" | "facebook"
  kind: "comment" | "dm" | "mention"
  externalId: string
  authorName: string | null
  authorHandle: string | null
  authorId: string | null
  text: string
  /** The post it happened on, on Meta's side. */
  mediaId: string | null
  permalink: string | null
  occurredAt: string
}

type Unknown = Record<string, unknown>

function asObject(value: unknown): Unknown | null {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Unknown) : null
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : []
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null
}

/** Meta sends seconds; everything in this project stores an ISO instant. Null
 * rather than "now" when there is nothing to read, so a caller can fall back to
 * a timestamp that is actually more specific. */
function instant(seconds: unknown): string | null {
  const value = typeof seconds === "number" ? seconds : Number(seconds)
  return Number.isFinite(value) && value > 0 ? new Date(value * 1000).toISOString() : null
}

function millis(ms: unknown): string | null {
  const value = typeof ms === "number" ? ms : Number(ms)
  return Number.isFinite(value) && value > 0 ? new Date(value).toISOString() : null
}

export function parseMetaWebhook(body: unknown): ParsedEngagement[] {
  const payload = asObject(body)
  if (!payload) return []

  const object = asString(payload.object)
  const platform: "instagram" | "facebook" = object === "instagram" ? "instagram" : "facebook"
  const out: ParsedEngagement[] = []

  for (const rawEntry of asArray(payload.entry)) {
    const entry = asObject(rawEntry)
    if (!entry) continue
    const entryTime = instant(entry.time) ?? new Date().toISOString()

    // A comment, on either platform.
    for (const rawChange of asArray(entry.changes)) {
      const change = asObject(rawChange)
      const value = asObject(change?.value)
      if (!value) continue

      const field = asString(change?.field)
      const from = asObject(value.from)
      const text = asString(value.text) ?? asString(value.message)
      const id = asString(value.id) ?? asString(value.comment_id)
      if (!text || !id) continue

      // A Page's `feed` field also fires for Raz's own posts and for likes.
      // Only somebody else writing something counts.
      if (field === "feed" && asString(value.item) !== "comment") continue
      if (asString(value.verb) === "remove") continue

      out.push({
        platform,
        kind: field === "mentions" ? "mention" : "comment",
        externalId: id,
        authorName: asString(from?.name),
        authorHandle: asString(from?.username),
        authorId: asString(from?.id),
        text,
        mediaId: asString(asObject(value.media)?.id) ?? asString(value.post_id) ?? asString(value.media_id),
        permalink: asString(value.permalink) ?? asString(value.permalink_url),
        occurredAt: instant(value.created_time) ?? entryTime,
      })
    }

    // A direct message, on either platform.
    for (const rawMessaging of asArray(entry.messaging)) {
      const messaging = asObject(rawMessaging)
      const message = asObject(messaging?.message)
      const text = asString(message?.text)
      const id = asString(message?.mid)
      if (!text || !id) continue

      // Echoes of Raz's own replies come back through the same webhook.
      if (message?.is_echo === true) continue

      const sender = asObject(messaging?.sender)
      out.push({
        platform,
        kind: "dm",
        externalId: id,
        authorName: null,
        authorHandle: asString(sender?.username),
        authorId: asString(sender?.id),
        text,
        mediaId: null,
        permalink: null,
        occurredAt: millis(messaging?.timestamp) ?? entryTime,
      })
    }
  }

  return out
}
