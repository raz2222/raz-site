import { useEffect } from "react"
import { Link, useParams } from "react-router-dom"
import { useProject, useProjects } from "@/hooks/useProjects"
import { useDocumentMeta } from "@/hooks/useDocumentMeta"
import { useHreflang } from "@/hooks/useHreflang"
import { useWhatsAppMessage } from "@/hooks/useWhatsAppMessage"
import { getProjectTranslation, translateProjectTitle } from "@/lib/projectTranslations"
import { EnglishCaseStudyWebsite } from "@/pages/case-studies/EnglishCaseStudyWebsite"
import { EnglishCaseStudyAI } from "@/pages/case-studies/EnglishCaseStudyAI"
import { caseStudyJsonLd } from "@/lib/caseStudySchema"

export function EnglishCaseStudy() {
  const { slug } = useParams()
  const { project, loading } = useProject(slug)
  const { projects } = useProjects()
  const t = slug ? getProjectTranslation(slug) : undefined

  useDocumentMeta(project ? `${translateProjectTitle(project.slug, project.title)} · RAZ` : "RAZ", t?.overview)
  useHreflang(`/work/${slug}`, `/en/work/${slug}`)
  useWhatsAppMessage(project ? `Hi, I saw the "${translateProjectTitle(project.slug, project.title)}" project and wanted to hear about something similar.` : undefined)

  useEffect(() => {
    document.documentElement.lang = "en"
    document.documentElement.dir = "ltr"
    return () => {
      document.documentElement.lang = "he"
      document.documentElement.dir = "rtl"
    }
  }, [])

  if (loading) {
    return <div dir="ltr" className="pt-40 pb-40 container font-mono text-xs text-dim uppercase text-left">Loading…</div>
  }

  if (!project || !t) {
    return (
      <div dir="ltr" className="pt-40 pb-40 container text-left">
        <p className="font-mono text-sm text-dim uppercase">Project not found.</p>
        <Link to="/en/work" className="inline-block mt-6 underline underline-offset-4 text-sm hover:text-[#D1FE17] transition-colors">
          ← Back to work
        </Link>
      </div>
    )
  }

  const currentIndex = projects.findIndex((p) => p.slug === project.slug)
  const next = projects.length > 1 ? projects[(currentIndex + 1) % projects.length] : null

  return (
    <>
      <script type="application/ld+json">{JSON.stringify(caseStudyJsonLd(project, "en"))}</script>
      {project.project_type === "website" ? (
        <EnglishCaseStudyWebsite project={project} t={t} next={next} />
      ) : (
        <EnglishCaseStudyAI project={project} t={t} next={next} />
      )}
    </>
  )
}
