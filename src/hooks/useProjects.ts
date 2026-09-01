import { useEffect, useState } from "react"
import { supabase, type ProjectRow } from "@/lib/supabase"
import { useSsrData } from "@/lib/ssrData"

export function useProjects() {
  const preloaded = useSsrData()?.projects
  const [projects, setProjects] = useState<ProjectRow[]>(preloaded ?? [])
  const [loading, setLoading] = useState(!preloaded)

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
  const preloaded = useSsrData()?.projects?.find((p) => p.slug === slug)
  const [project, setProject] = useState<ProjectRow | null>(preloaded ?? null)
  const [loading, setLoading] = useState(!preloaded)

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
