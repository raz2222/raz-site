import { getSupabase } from "@/lib/supabaseLazy"

/** The signed-in owner's token, for the endpoints that check who is calling.
 *
 * Every endpoint under `api/` that spends money or reads the CRM verifies this
 * against Supabase with `verifyAdmin`, so the same four lines were being copied
 * into each screen that calls one. They live here instead · one answer to "who
 * is asking", the way `verify-admin.ts` is one answer on the other side.
 *
 * Through the lazy client, because a static import of supabase-js from a file
 * this small is exactly how 204KB found its way back onto the first paint. */
export async function accessToken(): Promise<string | null> {
  const supabase = await getSupabase()
  const { data } = await supabase.auth.getSession()
  return data.session?.access_token ?? null
}

/** The same token as a header, for the common case.
 *
 * An empty object when there is no session: the request then fails the check on
 * the server, which is the correct outcome and one place to reason about. */
export async function authHeaders(): Promise<Record<string, string>> {
  const token = await accessToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}
