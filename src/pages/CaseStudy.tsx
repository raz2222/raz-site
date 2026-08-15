import { Link, useParams } from "react-router-dom"
import { useProject, useProjects } from "@/hooks/useProjects"
import { useDocumentMeta } from "@/hooks/useDocumentMeta"
import { Reveal } from "@/components/Reveal"

function Block({ n, label, text }: { n: string; label: string; text: string }) {
  return (
    <Reveal className="grid md:grid-cols-[100px_1fr] gap-4 md:gap-10 border-t border-white/10 pt-8">
      <div className="flex md:flex-col items-baseline md:items-start gap-3 md:gap-1">
        <span className="font-mono text-xs text-dim">{n}</span>
        <span className="font-mono text-xs uppercase tracking-wide text-dim">{label}</span>
      </div>
      <p className="text-xl md:text-2xl leading-relaxed max-w-2xl font-display font-light">{text}</p>
    </Reveal>
  )
}

export function CaseStudy() {
  const { slug } = useParams()
  const { project, loading } = useProject(slug)
  const { projects } = useProjects()

  useDocumentMeta(
    project ? `${project.title} — RAZ` : "RAZ",
    project?.overview ?? undefined
  )

  if (loading) {
    return <div className="pt-40 pb-40 container font-mono text-xs text-dim uppercase">טוען…</div>
  }

  if (!project) {
    return (
      <div className="pt-40 pb-40 container">
        <p className="font-mono text-sm text-dim uppercase">הפרויקט לא נמצא.</p>
        <Link to="/work" className="inline-block mt-6 underline underline-offset-4 text-sm">
          → חזרה לעבודות
        </Link>
      </div>
    )
  }

  const currentIndex = projects.findIndex((p) => p.slug === project.slug)
  const next = projects[(currentIndex + 1) % Math.max(projects.length, 1)]

  const blocks = [
    { label: "האתגר", text: project.challenge },
    { label: "כיוון", text: project.direction },
    { label: "חוויה דיגיטלית", text: project.digital_experience },
    { label: "מאחורי הקלעים", text: project.behind_the_scenes },
    { label: "התוצאה", text: project.result },
  ].filter((b): b is { label: string; text: string } => !!b.text)

  return (
    <>
      <section className="pt-32 pb-10 md:pt-40">
        <div className="container">
          <Reveal className="font-mono text-xs uppercase tracking-wide text-dim mb-4">
            {project.number} {project.concept && "· פרויקט קונספט עצמאי"}
          </Reveal>
          <Reveal>
            <h1 className="font-display font-bold text-[clamp(34px,7vw,88px)] leading-[1.02] tracking-tight">
              {project.title}
            </h1>
          </Reveal>
          <Reveal delay={100} className="mt-4 font-mono text-xs uppercase tracking-wide text-dim max-w-xl">
            {project.category} · {project.year}
          </Reveal>
        </div>
      </section>

      {project.overview && (
        <Reveal delay={150} className="container">
          <p className="text-2xl md:text-3xl font-display font-light leading-snug max-w-4xl text-foreground/90">
            {project.overview}
          </p>
        </Reveal>
      )}

      {project.video && (
        <Reveal delay={200} className="container mt-14 md:mt-20">
          <div className="relative rounded-sm overflow-hidden bg-neutral-900">
            <video
              src={project.video}
              controls
              playsInline
              preload="metadata"
              className="w-full h-auto max-h-[85vh] object-contain bg-black"
            />
          </div>
          <div className="mt-3 font-mono text-[11px] uppercase tracking-wide text-dim">
            הסרטון המלא — לחצו להפעלה עם קול
          </div>
        </Reveal>
      )}

      <section className="py-24 md:py-32">
        <div className="container flex flex-col gap-14">
          {blocks.map((b, i) => (
            <Block key={b.label} n={String(i + 1).padStart(2, "0")} label={b.label} text={b.text} />
          ))}

          {project.tools?.length > 0 && (
            <Reveal className="grid md:grid-cols-[100px_1fr] gap-4 md:gap-10 border-t border-white/10 pt-8">
              <div className="font-mono text-xs uppercase tracking-wide text-dim">כלים</div>
              <div className="flex flex-wrap gap-3">
                {project.tools.map((t) => (
                  <span key={t} className="border border-white/15 rounded-full px-4 py-2 text-sm">
                    {t}
                  </span>
                ))}
              </div>
            </Reveal>
          )}
        </div>
      </section>

      {next && (
        <Link
          to={`/work/${next.slug}`}
          className="block border-t border-white/10 py-16 md:py-24 hover:bg-white/[0.02] transition-colors"
        >
          <div className="container">
            <div className="font-mono text-xs uppercase tracking-wide text-dim mb-3">
              הפרויקט הבא
            </div>
            <div className="font-display font-medium text-3xl md:text-5xl">
              ← {next.title}
            </div>
          </div>
        </Link>
      )}
    </>
  )
}
