import { useEffect, useState } from "react"
import { supabase, type ProjectRow } from "@/lib/supabase"

export function useProjects() {
  const [projects, setProjects] = useState<ProjectRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from("projects")
      .select("*")
      .order("sort_order", { ascending: true })
      .then(({ data }) => {
        setProjects(data ?? [])
        setLoading(false)
      })
  }, [])

  return { projects, loading }
}

export function useProject(slug: string | undefined) {
  const [project, setProject] = useState<ProjectRow | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    supabase
      .from("projects")
      .select("*")
      .eq("slug", slug)
      .single()
      .then(({ data }) => {
        setProject(data ?? null)
        setLoading(false)
      })
  }, [slug])

  return { project, loading }
}
