import { Link, useParams } from "react-router-dom"
import { useProject, useProjects } from "@/hooks/useProjects"
import { useDocumentMeta } from "@/hooks/useDocumentMeta"
import { useHreflang } from "@/hooks/useHreflang"
import { useWhatsAppMessage } from "@/hooks/useWhatsAppMessage"
import { CaseStudyWebsite } from "@/pages/case-studies/CaseStudyWebsite"
import { CaseStudyAI } from "@/pages/case-studies/CaseStudyAI"
import { caseStudyJsonLd } from "@/lib/caseStudySchema"

export function CaseStudy() {
  const { slug } = useParams()
  const { project, loading } = useProject(slug)
  const { projects } = useProjects()

  useDocumentMeta(
    project ? `${project.title} · RAZ` : "RAZ",
    project?.overview ?? undefined
  )
  useWhatsAppMessage(project ? `היי, ראיתי את הפרויקט "${project.title}" ורציתי לשמוע פרטים על פרויקט דומה.` : undefined)
  useHreflang(`/work/${slug}`, `/en/work/${slug}`)

  if (loading) {
    return <div className="pt-40 pb-40 container font-mono text-xs text-dim uppercase">טוען…</div>
  }

  if (!project) {
    return (
      <div className="pt-40 pb-40 container">
        <p className="font-mono text-sm text-dim uppercase">הפרויקט לא נמצא.</p>
        <Link to="/work" className="inline-block mt-6 underline underline-offset-4 text-sm hover:text-[#D1FE17] transition-colors">
          → חזרה לעבודות
        </Link>
      </div>
    )
  }

  const currentIndex = projects.findIndex((p) => p.slug === project.slug)
  const next = projects.length > 1 ? projects[(currentIndex + 1) % projects.length] : null

  return (
    <>
      {/* The six project pages carried no structured data at all, while every
          other page type on the site does. */}
      <script type="application/ld+json">{JSON.stringify(caseStudyJsonLd(project, "he"))}</script>
      {project.project_type === "website" ? (
        <CaseStudyWebsite project={project} next={next} />
      ) : (
        <CaseStudyAI project={project} next={next} />
      )}
    </>
  )
}
