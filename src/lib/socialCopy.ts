/** Reading a group post, and writing a caption, without an API key.
 *
 * The agent behind this screen writes better copy than anything here does, but
 * it needs a key and it can be down, and a screen whose whole content is "the
 * model did not answer" is worse than a plain draft. So every deterministic
 * fallback lives here, tested, and the agent's answer replaces it when there is
 * one. The scoring is not a fallback at all · it runs on every opportunity, so
 * the list is ordered even before anything is drafted. */

import type { ProjectRow } from "@/lib/supabase"

export const SITE_URL = "https://madebyraz.co.il"

/** No em dashes anywhere in Raz's copy, and the model has to be held to it too
 * · it writes them by habit in both languages. */
export function stripEmDashes(text: string): string {
  return text.replace(/\s*[—–]\s*/g, " · ")
}

export type OpportunityIntent = "video" | "ads" | "website" | "other"

const INTENT_WORDS: Record<Exclude<OpportunityIntent, "other">, string[]> = {
  video: ["סרטון", "סרטונים", "וידאו", "עריכת וידאו", "עורך וידאו", "ריל", "רילס", "רילז", "reels", "video", "צילום מוצר", "תוכן ויזואלי"],
  ads: ["פרסומת", "פרסומות", "קמפיין", "מודעה", "מודעות", "ads", "ממומן", "קריאייטיב", "ugc"],
  website: ["אתר", "אתרים", "לנדינג", "דף נחיתה", "חנות אונליין", "website", "landing"],
}

/** Someone asking, rather than someone selling. */
const BUYING_SIGNALS = [
  "מחפש", "מחפשת", "מחפשים", "מישהו מכיר", "מישהי מכירה", "ממליצים", "המלצה על",
  "צריך", "צריכה", "מתלבט", "בתשלום", "תקציב", "כמה עולה", "מחיר", "הצעת מחיר",
  "לעסק שלי", "לעסק שלנו", "לחברה שלנו", "דחוף", "לפרויקט",
]

/** Someone advertising themselves is not a lead, and left unweighted it scores
 * exactly like one · both posts are full of the same nouns. */
const SELLING_SIGNALS = [
  "מציע שירותי", "מציעה שירותי", "אני עורך", "אני עורכת", "אני מפתח", "אני מעצב",
  "מחפש עבודה", "מחפשת עבודה", "פנוי לפרויקטים", "פנויה לפרויקטים", "לקוחות חדשים",
  "השירותים שלי", "צרו קשר לפרטים", "בואו נדבר בפרטי",
]

export type OpportunityScore = { score: number; intent: OpportunityIntent }

/** How much a group post looks like paid work Raz can do, 0 to 100.
 *
 * Deliberately blunt: it orders a list and decides what is worth pushing to his
 * phone. The judgement of whether to answer stays his, and the agent's summary
 * is what he actually reads. */
export function scoreOpportunity(text: string): OpportunityScore {
  const haystack = text.toLowerCase()
  const has = (word: string) => haystack.includes(word.toLowerCase())

  let intent: OpportunityIntent = "other"
  let topicHits = 0
  for (const [key, words] of Object.entries(INTENT_WORDS) as [Exclude<OpportunityIntent, "other">, string[]][]) {
    const hits = words.filter(has).length
    if (hits > topicHits) {
      topicHits = hits
      intent = key
    }
  }

  if (topicHits === 0) return { score: 0, intent: "other" }

  const buying = BUYING_SIGNALS.filter(has).length
  const selling = SELLING_SIGNALS.filter(has).length

  let score = 25 + Math.min(topicHits, 3) * 10 + Math.min(buying, 3) * 15
  if (selling > 0) score -= 40 + selling * 10
  // A one-line post rarely carries a brief worth answering.
  if (text.trim().length < 40) score -= 15

  return { score: Math.max(0, Math.min(100, score)), intent }
}

/** A reply that carries a link, a price or the studio's name spends the value
 * budget; a genuinely helpful answer does not. */
export function looksPromotional(text: string): boolean {
  const haystack = text.toLowerCase()
  return (
    /https?:\/\//.test(haystack) ||
    haystack.includes("madebyraz") ||
    haystack.includes("wa.me") ||
    /\b0\d{1,2}-?\d{7}\b/.test(haystack) ||
    /\d{3,5}\s*(₪|שח|ש"ח)/.test(haystack)
  )
}

const HASHTAG_BASE = ["#סרטוני_AI", "#AI", "#תוכן_לעסקים", "#madebyraz"]

const HASHTAG_FOR_TOOL: Record<string, string> = {
  higgsfield: "#higgsfield",
  seedance: "#seedance",
  kling: "#kling",
  veo: "#veo",
  runway: "#runway",
  midjourney: "#midjourney",
  "nano banana": "#nanobanana",
}

export function projectHashtags(project: Pick<ProjectRow, "ai_tools" | "categories">): string[] {
  const tags = new Set(HASHTAG_BASE)
  for (const tool of project.ai_tools ?? []) {
    const key = Object.keys(HASHTAG_FOR_TOOL).find((k) => tool.toLowerCase().includes(k))
    if (key) tags.add(HASHTAG_FOR_TOOL[key])
  }
  for (const category of project.categories ?? []) {
    const slug = category.trim().replace(/\s+/g, "_")
    if (slug) tags.add(`#${slug}`)
  }
  return [...tags].slice(0, 10)
}

/** The first sentence of the overview, which is the part written to be read
 * first · the rest is case-study detail that reads as filler under a video.
 *
 * The floor stops a decimal or an abbreviation's full stop from cutting the
 * line after three words; below it, the first line is the better guess. */
function firstSentence(text: string): string {
  const trimmed = text.trim()
  const end = trimmed.search(/[.!?\n]/)
  return end >= 12 ? trimmed.slice(0, end).trim() : trimmed.split("\n")[0].trim()
}

/** The caption a project gets when nothing has drafted a better one. */
export function projectCaption(project: Pick<ProjectRow, "title" | "overview" | "ai_tools" | "client_name">): string {
  const lines = [project.title.trim()]
  if (project.overview) lines.push(firstSentence(project.overview))
  const tools = (project.ai_tools ?? []).slice(0, 4)
  if (tools.length) lines.push(`נעשה עם ${tools.join(" · ")}`)
  lines.push("רוצה משהו כזה לעסק? הקישור בביו.")
  return stripEmDashes(lines.filter(Boolean).join("\n\n"))
}

/** Instagram fetches the media itself, so a site-relative path publishes
 * nothing · it has to be an absolute, publicly reachable URL. */
export function absoluteMediaUrl(value: string | null | undefined, origin: string = SITE_URL): string | null {
  if (!value) return null
  const trimmed = value.trim()
  if (!trimmed) return null
  if (/^https?:\/\//.test(trimmed)) return trimmed
  return `${origin.replace(/\/$/, "")}/${trimmed.replace(/^\//, "")}`
}

/** What Instagram would publish for this project, and as what.
 *
 * The film first, because that is what the work is; the first gallery item
 * otherwise. A project with neither has nothing to post and says so by
 * returning null · queueing it would only produce a post that fails later. */
export function projectMedia(
  project: Pick<ProjectRow, "video" | "gallery">,
  origin: string = SITE_URL
): { url: string; type: "video" | "image" } | null {
  const video = absoluteMediaUrl(project.video, origin)
  if (video) return { url: video, type: "video" }

  const first = (project.gallery ?? [])[0]
  const gallery = absoluteMediaUrl(first?.url, origin)
  if (gallery) return { url: gallery, type: first.type === "video" ? "video" : "image" }

  return null
}

export function captionWithHashtags(caption: string, hashtags: string[]): string {
  const tags = hashtags.filter(Boolean).join(" ")
  return tags ? `${caption.trim()}\n\n${tags}` : caption.trim()
}
