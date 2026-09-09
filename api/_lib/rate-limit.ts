/** A counter for the endpoints anyone on the internet can call.
 *
 * `api/send-login-code.ts` already had one of these, against its own
 * `login_code_requests` table, and the reasoning there holds for every public
 * endpoint: what stood between a public endpoint and an open mail relay was a
 * cap that belonged to someone else's service.
 *
 * This is the same idea with the endpoint named in the row rather than in the
 * table, so the next public endpoint needs no second table and no second copy
 * of this code. `bucket` is the endpoint, `key` is whatever identifies the
 * caller · an IP, an address · and the table has RLS on with no policies, so
 * only the service key can see it.
 *
 * Underscore-prefixed directory: Vercel would otherwise deploy this file as its
 * own Serverless Function, and the Hobby plan allows twelve.
 */

export type LimitConfig = { url: string; serviceKey: string }

export type LimitRule = {
  /** Which endpoint is counting. */
  bucket: string
  /** How many are allowed inside the window. */
  limit: number
  /** How long the window is. */
  windowMinutes: number
}

/** The decision, with no network in it, so the arithmetic can be tested.
 *
 * `>=` rather than `>` because the attempt being judged is counted before it
 * is served · a request that fails every time would otherwise never be
 * throttled at all, which is the mistake the login endpoint documents. */
export function isOverLimit(hits: number, rule: LimitRule): boolean {
  return hits >= rule.limit
}

function headers(config: LimitConfig) {
  return {
    apikey: config.serviceKey,
    Authorization: `Bearer ${config.serviceKey}`,
    "Content-Type": "application/json",
  }
}

async function countSince(config: LimitConfig, rule: LimitRule, key: string): Promise<number> {
  const since = new Date(Date.now() - rule.windowMinutes * 60_000).toISOString()
  const query =
    `rate_limit_hits?select=id` +
    `&bucket=eq.${encodeURIComponent(rule.bucket)}` +
    `&key=eq.${encodeURIComponent(key)}` +
    `&created_at=gte.${since}` +
    `&limit=${rule.limit + 1}`
  const res = await fetch(`${config.url}/rest/v1/${query}`, { headers: headers(config) })
  if (!res.ok) return 0
  const rows = (await res.json().catch(() => [])) as unknown[]
  return Array.isArray(rows) ? rows.length : 0
}

async function record(config: LimitConfig, rule: LimitRule, key: string): Promise<void> {
  await fetch(`${config.url}/rest/v1/rate_limit_hits`, {
    method: "POST",
    headers: { ...headers(config), Prefer: "return=minimal" },
    body: JSON.stringify({ bucket: rule.bucket, key }),
  }).catch(() => {})

  // Nothing here is worth keeping past the window it is counted in, and this is
  // the only code that runs against the table. Once in a while is often enough
  // to stop it growing and never adds latency to the other requests.
  if (Math.random() < 0.05) {
    const cutoff = new Date(Date.now() - 24 * 60 * 60_000).toISOString()
    await fetch(`${config.url}/rest/v1/rate_limit_hits?created_at=lt.${cutoff}`, {
      method: "DELETE",
      headers: { ...headers(config), Prefer: "return=minimal" },
    }).catch(() => {})
  }
}

/** Counts this attempt and says whether it is over the line.
 *
 * A caller with no key · no IP on the request · is let through rather than
 * counted under a shared blank key, which would throttle every such caller
 * together. Failing open is deliberate: a counter that is down must not take
 * the contact form down with it. */
export async function hitRateLimit(
  config: LimitConfig | null,
  rule: LimitRule,
  key: string | null
): Promise<boolean> {
  if (!config || !key) return false
  try {
    const hits = await countSince(config, rule, key)
    await record(config, rule, key)
    return isOverLimit(hits, rule)
  } catch {
    return false
  }
}

/** The caller's address, as Vercel passes it on. */
export function callerIp(forwarded: string | string[] | undefined): string | null {
  const value = Array.isArray(forwarded) ? forwarded[0] : forwarded
  return value?.split(",")[0]?.trim() || null
}

export function limitConfig(): LimitConfig | null {
  const url = process.env.VITE_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  return url && serviceKey ? { url, serviceKey } : null
}
