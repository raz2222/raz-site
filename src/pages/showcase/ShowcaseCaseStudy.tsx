import { Link, useParams } from "react-router-dom"
import { useProject, useProjects } from "@/hooks/useProjects"
import { useDocumentMeta } from "@/hooks/useDocumentMeta"
import { getProjectTranslation } from "@/lib/projectTranslations"
import { EnglishCaseStudyWebsite } from "@/pages/case-studies/EnglishCaseStudyWebsite"
import { EnglishCaseStudyAI } from "@/pages/case-studies/EnglishCaseStudyAI"

// Thin wrapper around the same case-study body components the main site's
// English /en/work/:slug route uses, reusing all the real project content —
// with basePath pointed at this subdomain's root routes and the "want a
// similar site?" sales CTA hidden.
export function ShowcaseCaseStudy() {
  const { slug } = useParams()
  const { project, loading } = useProject(slug)
  const { projects } = useProjects()
  const t = slug ? getProjectTranslation(slug) : undefined

  useDocumentMeta(project ? `${project.title} · RAZ` : "RAZ", t?.overview, "/images/og-image.png")

  if (loading) {
    return <div className="pt-40 pb-40 container font-mono text-xs text-dim uppercase text-left">Loading…</div>
  }

  if (!project || !t) {
    return (
      <div className="pt-40 pb-40 container text-left">
        <p className="font-mono text-sm text-dim uppercase">Project not found.</p>
        <Link to="/work" className="inline-block mt-6 underline underline-offset-4 text-sm hover:text-[#D1FE17] transition-colors">
          ← Back to work
        </Link>
      </div>
    )
  }

  const currentIndex = projects.findIndex((p) => p.slug === project.slug)
  const next = projects.length > 1 ? projects[(currentIndex + 1) % projects.length] : null

  return project.project_type === "website" ? (
    <EnglishCaseStudyWebsite project={project} t={t} next={next} basePath="" hideSalesCTA />
  ) : (
    <EnglishCaseStudyAI project={project} t={t} next={next} basePath="" hideSalesCTA />
  )
}
