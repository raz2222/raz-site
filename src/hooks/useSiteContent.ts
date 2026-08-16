import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export function useSiteContent<T>(key: string, fallback: T): { content: T; loading: boolean } {
  const [content, setContent] = useState<T>(fallback)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    supabase
      .from("site_content")
      .select("value")
      .eq("key", key)
      .maybeSingle()
      .then(({ data }) => {
        if (!alive) return
        if (data?.value) setContent(data.value as T)
        setLoading(false)
      })
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  return { content, loading }
}
