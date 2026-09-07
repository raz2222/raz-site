/** What may be sent to Facebook right now, and what has to wait.
 *
 * There is no API for posting or commenting in groups Raz does not own ·
 * `publish_to_groups` was withdrawn · so anything that "automates" a group is a
 * script driving his own logged-in browser, which is the thing Meta suspends
 * accounts for. The interface therefore drafts and paces; a person sends. What
 * is left to get wrong is the pacing, and that is what this file owns.
 *
 * Every rule here answers a specific way accounts get flagged: too many actions
 * in a day, several in the same minute, the same group over and over, the same
 * paragraph pasted into eight groups, and a feed of nothing but self-promotion.
 * They read the ledger of what was actually sent · `social_actions` · rather
 * than the queue, so re-opening the screen cannot spend a budget twice. */

export type SocialLimits = {
  fb_daily_cap: number
  fb_group_cooldown_days: number
  fb_min_gap_minutes: number
  fb_value_ratio: number
  warmup_started_on: string | null
}

export type ActionRecord = {
  action: string
  group_id: string | null
  text_fingerprint: string | null
  promotional: boolean
  created_at: string
}

export type SafetyVerdict = {
  allowed: boolean
  /** Hebrew, and specific: a blocked action says what to do instead. */
  reason?: string
  /** When the block lifts, where that is knowable. */
  waitUntil?: Date
  usedToday: number
  capToday: number
}

const DAY_MS = 24 * 60 * 60 * 1000
const QUIET_FROM = 22
const QUIET_UNTIL = 8

/** Asia/Jerusalem rather than a fixed +3: Israel keeps DST, so a hardcoded
 * offset is an hour wrong for half the year. */
export function israelHour(now: Date): number {
  return Number(
    new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Jerusalem", hour: "2-digit", hour12: false }).format(now)
  )
}

export function israelDateKey(now: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jerusalem",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now)
}

/** Commenting in a group at 03:00 is a bot tell before it is anything else, and
 * a business asking about video at that hour reads badly to the person too. */
export function isQuietHours(now: Date): boolean {
  const hour = israelHour(now)
  return hour >= QUIET_FROM || hour < QUIET_UNTIL
}

/** The next 08:00 Israel time, as an instant.
 *
 * Derived by stepping forward an hour at a time rather than by arithmetic on a
 * local midnight: two Israeli midnights are not always 24 hours apart, and the
 * DST boundary is exactly when a "+10 hours" would land in the wrong hour. */
export function quietHoursEnd(now: Date): Date {
  const candidate = new Date(now.getTime())
  for (let i = 0; i < 26; i++) {
    candidate.setTime(candidate.getTime() + 60 * 60 * 1000)
    candidate.setUTCMinutes(0, 0, 0)
    if (israelHour(candidate) === QUIET_UNTIL) return candidate
  }
  return candidate
}

/** A cold account that starts commenting five times a day is a new spammer.
 * The ramp adds one action every three days until it reaches the real cap. */
export function warmupCap(limits: SocialLimits, now: Date): number {
  if (!limits.warmup_started_on) return limits.fb_daily_cap
  const started = Date.parse(`${limits.warmup_started_on}T00:00:00Z`)
  if (Number.isNaN(started)) return limits.fb_daily_cap
  const days = Math.max(0, Math.floor((now.getTime() - started) / DAY_MS))
  return Math.max(1, Math.min(limits.fb_daily_cap, 1 + Math.floor(days / 3)))
}

/** What two pieces of text have in common once wording stops mattering.
 *
 * Punctuation, emoji, Hebrew niqqud and the vowel-less prefixes people vary
 * between copies all fall out, so "מוזמנים לפנות!" and "מוזמנים לפנות :)" are
 * the same paragraph · which is how Meta reads them too. */
export function textFingerprint(text: string): string {
  return text
    .toLowerCase()
    .replace(/[֑-ׇ]/g, "")
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/[^\p{Letter}\p{Number}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function tokens(fingerprint: string): Set<string> {
  return new Set(fingerprint.split(" ").filter((word) => word.length > 1))
}

/** Jaccard overlap of the two word sets · 1 is the same text, 0 shares nothing. */
export function textSimilarity(a: string, b: string): number {
  const left = tokens(a)
  const right = tokens(b)
  if (left.size === 0 || right.size === 0) return left.size === right.size ? 1 : 0
  let shared = 0
  for (const word of left) if (right.has(word)) shared++
  return shared / (left.size + right.size - shared)
}

const NEAR_DUPLICATE = 0.75
const DUPLICATE_WINDOW_DAYS = 30

export type FacebookActionRequest = {
  groupId: string | null
  /** The exact text about to be posted. */
  text: string
  /** Carries a link, a price or the studio's name · the kind of reply a group
   * tolerates rarely and a feed of which reads as advertising. */
  promotional: boolean
  /** This group's own cooldown, where it differs from the default. */
  groupCooldownDays?: number | null
}

/** May this comment go out now?
 *
 * Rules run cheapest-and-most-absolute first, and the first block wins · a
 * screen that listed five reasons at once would be answering a question nobody
 * asked. */
export function evaluateFacebookAction(
  request: FacebookActionRequest,
  recent: ActionRecord[],
  limits: SocialLimits,
  now: Date = new Date()
): SafetyVerdict {
  const capToday = warmupCap(limits, now)
  const today = israelDateKey(now)
  const facebook = recent
    .filter((a) => a.action.startsWith("fb_"))
    .slice()
    .sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at))

  const usedToday = facebook.filter((a) => israelDateKey(new Date(a.created_at)) === today).length
  const base = { usedToday, capToday }

  if (isQuietHours(now)) {
    return { ...base, allowed: false, reason: "שעות שקט · לא מגיבים בין 22:00 ל-08:00", waitUntil: quietHoursEnd(now) }
  }

  if (usedToday >= capToday) {
    const ramping = limits.warmup_started_on && capToday < limits.fb_daily_cap
    return {
      ...base,
      allowed: false,
      reason: ramping
        ? `נגמרה המכסה להיום (${capToday}) · החשבון עדיין בחימום, המכסה עולה בהדרגה`
        : `נגמרה המכסה להיום (${capToday} תגובות)`,
    }
  }

  const last = facebook[0]
  if (last) {
    const gapMs = limits.fb_min_gap_minutes * 60 * 1000
    const since = now.getTime() - Date.parse(last.created_at)
    if (since < gapMs) {
      const minutes = Math.ceil((gapMs - since) / 60000)
      return {
        ...base,
        allowed: false,
        reason: `עברו פחות מ-${limits.fb_min_gap_minutes} דקות מהתגובה הקודמת · עוד ${minutes} דקות`,
        waitUntil: new Date(Date.parse(last.created_at) + gapMs),
      }
    }
  }

  if (request.groupId) {
    const cooldownDays = request.groupCooldownDays ?? limits.fb_group_cooldown_days
    const lastInGroup = facebook.find((a) => a.group_id === request.groupId)
    if (lastInGroup) {
      const readyAt = Date.parse(lastInGroup.created_at) + cooldownDays * DAY_MS
      if (now.getTime() < readyAt) {
        const days = Math.ceil((readyAt - now.getTime()) / DAY_MS)
        return {
          ...base,
          allowed: false,
          reason: `כבר הגבת בקבוצה הזאת לאחרונה · אפשר שוב בעוד ${days} ימים`,
          waitUntil: new Date(readyAt),
        }
      }
    }
  }

  const fingerprint = textFingerprint(request.text)
  const duplicateSince = now.getTime() - DUPLICATE_WINDOW_DAYS * DAY_MS
  const duplicate = facebook.find(
    (a) =>
      a.text_fingerprint &&
      Date.parse(a.created_at) >= duplicateSince &&
      textSimilarity(a.text_fingerprint, fingerprint) >= NEAR_DUPLICATE
  )
  if (duplicate) {
    return { ...base, allowed: false, reason: "הטקסט כמעט זהה לתגובה קודמת · כתוב אותו מחדש לפוסט הזה" }
  }

  if (request.promotional && limits.fb_value_ratio > 0) {
    const window = facebook.slice(0, limits.fb_value_ratio)
    const promotional = window.filter((a) => a.promotional).length
    if (promotional > 0) {
      const owed = limits.fb_value_ratio - (window.length - promotional)
      return {
        ...base,
        allowed: false,
        reason: `יחס ערך · צריך עוד ${Math.max(1, owed)} תשובות מועילות בלי קישור לפני עוד תגובה שיווקית`,
      }
    }
  }

  return { ...base, allowed: true }
}

/** How many Instagram posts are left today. Instagram's own ceiling is 50 in
 * 24 hours; the cap here is a taste decision long before it is a limit. */
export function instagramRemaining(recent: ActionRecord[], dailyCap: number, now: Date = new Date()): number {
  const since = now.getTime() - DAY_MS
  const used = recent.filter((a) => a.action === "ig_publish" && Date.parse(a.created_at) >= since).length
  return Math.max(0, dailyCap - used)
}
