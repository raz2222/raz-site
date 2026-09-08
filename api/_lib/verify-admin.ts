/** Is the caller Raz?
 *
 * The same four lines were already copied into three endpoints; anything new
 * imports them from here. The check is on the email rather than a role because
 * that is what every RLS policy in this project gates on, and two different
 * answers to "is this the owner" is one answer too many. */
const OWNER_EMAIL = "razavramov2@gmail.com"

export async function verifyAdmin(authHeader: string | undefined): Promise<boolean> {
  if (!authHeader?.startsWith("Bearer ")) return false
  const token = authHeader.slice(7)
  const url = process.env.VITE_SUPABASE_URL
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY
  if (!url || !anonKey) return false

  const res = await fetch(`${url}/auth/v1/user`, {
    headers: { Authorization: `Bearer ${token}`, apikey: anonKey },
  })
  if (!res.ok) return false
  const user = (await res.json().catch(() => null)) as { email?: string } | null
  return user?.email === OWNER_EMAIL
}
