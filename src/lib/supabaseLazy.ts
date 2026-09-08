import type { SupabaseClient } from "@supabase/supabase-js"

/** The Supabase client, loaded on demand.
 *
 * supabase-js is 204KB · 53KB gzipped · and it was in the chunk every visitor
 * downloads and evaluates before the page could do anything, because the hooks
 * that read the site's own copy imported it at the top of the file. Nothing on
 * the public site needs it during the first paint: every page is prerendered to
 * static HTML, and each of these hooks starts from that content or from the SSR
 * payload. The client is only needed to refresh what is already on screen.
 *
 * So it is imported inside the effect instead, through here. The import is
 * cached by the module system, so the second caller pays nothing, and the admin
 * · which really does need auth, realtime and storage · loads it the same way
 * on its own routes.
 *
 * `import("@/lib/supabase")` directly would work just as well; this exists so
 * the reason is written once rather than in a comment above thirty effects. */
export async function getSupabase(): Promise<SupabaseClient> {
  const { supabase } = await import("@/lib/supabase")
  return supabase as unknown as SupabaseClient
}
