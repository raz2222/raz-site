import { useCallback, useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/hooks/useAuth"
import type { CourseConfig, LessonFull, LessonMeta } from "../lib/types"
import { COURSE_CONFIG_KEY, DEFAULT_COURSE_CONFIG } from "../lib/config"

// Explicit column list — never `select *` on course_lessons so the gated
// content table stays the only path to body_he / video_url.
const LESSON_COLS =
  "slug,module_no,lesson_no,order_index,title_he,summary_he,duration_min,is_free,published,resources"

export function useLessons() {
  const [lessons, setLessons] = useState<LessonMeta[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from("course_lessons")
      .select(LESSON_COLS)
      .eq("published", true)
      .order("order_index", { ascending: true })
      .then(({ data }) => {
        setLessons((data as LessonMeta[] | null) ?? [])
        setLoading(false)
      })
  }, [])

  return { lessons, loading }
}

export function useLesson(slug: string | undefined) {
  const { session, loading: authLoading } = useAuth()
  const [lesson, setLesson] = useState<LessonFull | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!slug || authLoading) return
    setLoading(true)
    setNotFound(false)
    supabase.rpc("get_lesson", { p_slug: slug }).then(({ data, error }) => {
      const row = Array.isArray(data) ? data[0] : data
      if (error || !row) {
        setLesson(null)
        setNotFound(true)
      } else {
        setLesson(row as LessonFull)
      }
      setLoading(false)
    })
  }, [slug, session?.user?.id, authLoading])

  return { lesson, loading, notFound }
}

export function useCourseAccess() {
  const { user, loading: authLoading } = useAuth()
  const [hasAccess, setHasAccess] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      setHasAccess(false)
      setLoading(false)
      return
    }
    setLoading(true)
    supabase
      .from("course_access")
      .select("status,expires_at")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        const ok =
          !!data &&
          data.status === "active" &&
          (!data.expires_at || new Date(data.expires_at as string) > new Date())
        setHasAccess(ok)
        setLoading(false)
      })
  }, [user?.id, authLoading])

  return { hasAccess, loading: loading || authLoading, user }
}

export function useCourseConfig() {
  const [config, setConfig] = useState<CourseConfig>(DEFAULT_COURSE_CONFIG)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from("site_content")
      .select("value")
      .eq("key", COURSE_CONFIG_KEY)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.value && typeof data.value === "object") {
          setConfig({ ...DEFAULT_COURSE_CONFIG, ...(data.value as Partial<CourseConfig>) })
        }
        setLoading(false)
      })
  }, [])

  return { config, loading }
}

export function useProgress() {
  const { user } = useAuth()
  const [done, setDone] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!user) {
      setDone(new Set())
      return
    }
    supabase
      .from("course_progress")
      .select("lesson_slug")
      .eq("user_id", user.id)
      .then(({ data }) => {
        setDone(new Set((data ?? []).map((r: { lesson_slug: string }) => r.lesson_slug)))
      })
  }, [user?.id])

  const toggle = useCallback(
    async (slug: string) => {
      if (!user) return
      if (done.has(slug)) {
        await supabase.from("course_progress").delete().eq("user_id", user.id).eq("lesson_slug", slug)
        setDone((s) => {
          const n = new Set(s)
          n.delete(slug)
          return n
        })
      } else {
        await supabase.from("course_progress").insert({ user_id: user.id, lesson_slug: slug })
        setDone((s) => new Set(s).add(slug))
      }
    },
    [user, done]
  )

  return { done, toggle }
}
