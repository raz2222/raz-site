/** Is this reply work, or is it applause?
 *
 * Most of what lands under a good video is "נראה מדהים" · warm, worth nothing
 * to the calendar, and there is a lot of it. If every one of those reached
 * Raz's phone he would stop looking at the phone, and the one message that was
 * actually a customer would arrive in the same grey list as forty hearts.
 *
 * So every reply is scored, and only what reads like someone wanting the thing
 * is allowed to interrupt. The rest is still stored · it is what the scoring
 * gets measured against, and it is also how a post's reach gets counted. */

export type EngagementKind = "comment" | "dm" | "mention"
export type EngagementIntent = "wants_one" | "pricing" | "how" | "collab" | "praise" | "other"

/** Someone asking for the thing, or for what it costs. */
const WANTS = [
  "רוצה כזה", "רוצה אחד כזה", "אני רוצה", "אפשר גם לי", "גם לי", "מעוניין", "מעוניינת",
  "אפשר לעשות", "תוכל לעשות", "תוכלי לעשות", "צריך כזה", "צריכה כזה", "לעסק שלי",
  "אפשר לדבר", "בפרטי", "שלח פרטים", "תפרטים", "פנה אליי", "צור קשר",
  "want one", "i want", "can you make", "can you do", "need this", "for my business", "dm me", "interested",
]

const PRICING = ["כמה עולה", "כמה זה", "מחיר", "מחירון", "עלות", "תקציב", "how much", "price", "cost", "quote"]

const HOW = [
  "איך עשית", "איך עושים", "באיזה כלי", "עם מה עשית", "איזו תוכנה", "מה השתמשת",
  "how did you", "what tool", "which software", "what did you use",
]

const COLLAB = ["שיתוף פעולה", "קולאב", "לעבוד יחד", "collab", "collaboration", "work together"]

/** Warm, and not a lead. Listed so it can be scored to zero on purpose rather
 * than by failing to match anything. */
const PRAISE = [
  "מדהים", "מהמם", "וואו", "יפה", "אש", "כל הכבוד", "חזק", "מטורף", "פצצה", "תותח", "נהדר", "מגניב",
  "amazing", "awesome", "wow", "beautiful", "love it", "insane", "fire", "sick", "nice", "great", "cool",
]

export type EngagementSignal = { score: number; intent: EngagementIntent }

/** Strip emoji and punctuation · a comment that is only 🔥🔥🔥 has no words at
 * all, and should not score for accidentally containing a letter. */
function words(text: string): string {
  return text
    .toLowerCase()
    .replace(/[֑-ׇ]/g, "")
    .replace(/[^\p{Letter}\p{Number}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
}

export function scoreEngagement(text: string, kind: EngagementKind = "comment"): EngagementSignal {
  const haystack = words(text)
  if (!haystack) return { score: 0, intent: "praise" }

  const has = (phrase: string) => haystack.includes(words(phrase))

  const wants = WANTS.filter(has).length
  const pricing = PRICING.filter(has).length
  const how = HOW.filter(has).length
  const collab = COLLAB.filter(has).length
  const praise = PRAISE.filter(has).length

  let intent: EngagementIntent = "other"
  if (pricing) intent = "pricing"
  else if (wants) intent = "wants_one"
  else if (collab) intent = "collab"
  else if (how) intent = "how"
  else if (praise) intent = "praise"

  // Asking the price is the strongest thing a stranger can say. Wanting one is
  // next. Asking how it was made is a peer, not a buyer · it scores, but not
  // enough to ring.
  let score = 0
  if (pricing) score = 85
  else if (wants) score = 75
  else if (collab) score = 45
  else if (how) score = 30

  // Someone who opened a private message meant it more than someone who typed
  // under a video everybody can see.
  if (kind === "dm" && score > 0) score += 10

  // Praise alongside a real question is normal · praise alone is the whole
  // message, and that is not a lead.
  if (score === 0 && praise) return { score: 0, intent: "praise" }

  // A handful of words carrying no signal is not worth a notification either.
  if (score === 0 && haystack.split(" ").length <= 3) return { score: 0, intent: "other" }

  return { score: Math.min(100, score), intent }
}

/** Above this a reply is a lead and reaches the phone. It matches the trigger
 * on `social_engagements`, which is what actually writes the notification.
 *
 * Scoring lives on the server rather than in the browser because the score is
 * stored on the row · the screen reads it, it never recomputes it, so the two
 * cannot disagree about which reply was worth interrupting him for. */
export const LEAD_THRESHOLD = 60

export function isLead(signal: EngagementSignal): boolean {
  return signal.score >= LEAD_THRESHOLD
}
