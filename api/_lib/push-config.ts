// Shared plumbing for the two push endpoints.
//
// The VAPID keypair lives in the database rather than in a Vercel environment
// variable, so setting this up needed nothing from Raz · the serverless
// functions already hold the service-role key. Underscore-prefixed directory so
// Vercel does not treat this as its own Serverless Function.

export type PushConfig = { url: string; serviceKey: string }

export function serverConfig(): PushConfig | null {
  const url = process.env.VITE_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  return url && serviceKey ? { url, serviceKey } : null
}

export function restFetch(config: PushConfig, path: string, init?: RequestInit) {
  return fetch(`${config.url}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: config.serviceKey,
      Authorization: `Bearer ${config.serviceKey}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
  })
}

export async function readSecret(config: PushConfig, key: string): Promise<string | null> {
  const res = await restFetch(config, `app_secrets?select=value&key=eq.${encodeURIComponent(key)}&limit=1`)
  if (!res.ok) return null
  const rows = (await res.json().catch(() => [])) as { value?: string }[]
  return rows[0]?.value ?? null
}

/** Raz asked for nothing that wakes him: no push between roughly 22:00 and
 * 08:00 Israel time. The row is still written and the badge still counts it ·
 * this silences the phone, it does not drop the lead.
 *
 * Asia/Jerusalem rather than a fixed offset, because Israel keeps DST and a
 * hardcoded +3 would be an hour wrong for half the year. */
export function isQuietHours(now: Date = new Date()): boolean {
  const hour = Number(
    new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Jerusalem", hour: "2-digit", hour12: false }).format(now)
  )
  return hour >= 22 || hour < 8
}
