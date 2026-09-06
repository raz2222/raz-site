/** How far back a browser that has never celebrated anything is willing to look.
 * Without it, signing in from a new phone would throw confetti for a contract
 * signed last year. */
export const MAX_CELEBRATION_AGE_DAYS = 30

/** The earliest signature worth celebrating on this device, as an ISO string.
 *
 * A device that watched a signature go by remembers it and only celebrates what
 * came after. A device that has never seen one, or that remembers something
 * older than the window, starts from the window instead. */
export function celebrationFloor(lastSeen: string | null, now: Date = new Date()): string {
  const windowStart = new Date(now.getTime() - MAX_CELEBRATION_AGE_DAYS * 86_400_000).toISOString()
  if (!lastSeen) return windowStart
  return lastSeen > windowStart ? lastSeen : windowStart
}

/** Whether a signature is news on this device. */
export function shouldCelebrate(
  signedAt: string | null | undefined,
  lastSeen: string | null,
  now: Date = new Date()
): boolean {
  if (!signedAt) return false
  if (signedAt > now.toISOString()) return false
  return signedAt > celebrationFloor(lastSeen, now)
}
