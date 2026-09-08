import { useEffect, useState } from "react"
import { getSupabase } from "@/lib/supabaseLazy"

/** The Supabase client is imported inside the effect rather than at the top of
 * the file, and that one line is why the public site no longer ships it.
 *
 * Nearly every component on the homepage reads its copy through this hook, so
 * a static import here put supabase-js · 204KB, 53KB gzipped · into the chunk
 * that every visitor downloads and evaluates before anything else can run.
 *
 * Nothing is lost by deferring it. The page is prerendered, so the copy is
 * already on screen from static HTML; this hook refreshes it against the
 * database, and starting that refresh a beat later is invisible. The fallback
 * renders until it answers, exactly as before. */
export function useSiteContent<T>(key: string, fallback: T): { content: T; loading: boolean } {
  const [content, setContent] = useState<T>(fallback)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    getSupabase()
      .then((sb) => sb.from("site_content").select("value").eq("key", key).maybeSingle())
      .then(({ data }) => {
        if (!alive) return
        if (data?.value) setContent(data.value as T)
        setLoading(false)
      })
      .catch(() => {
        // The prerendered copy stays on screen. A refresh that never arrives is
        // not worth an error boundary.
        if (alive) setLoading(false)
      })
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  return { content, loading }
}
