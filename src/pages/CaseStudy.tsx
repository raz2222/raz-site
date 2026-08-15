import { Link, useParams } from "react-router-dom"
import { useProject, useProjects } from "@/hooks/useProjects"
import { useDocumentMeta } from "@/hooks/useDocumentMeta"
import { AutoVideo } from "@/components/AutoVideo"
import { Reveal } from "@/components/Reveal"

function Block({ label, text }: { label: string; text: string }) {
  return (
    <Reveal className="border-t border-white/10 pt-6">
      <div className="font-mono text-xs uppercase tracking-wide text-dim mb-3">{label}</div>
      <p className="text-lg leading-relaxed max-w-2xl">{text}</p>
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

  return (
    <>
      <section className="pt-32 pb-16 md:pt-40">
        <div className="container">
          <Reveal className="font-mono text-xs uppercase tracking-wide text-dim mb-4">
            {project.number} {project.concept && "· פרויקט קונספט עצמאי"}
          </Reveal>
          <Reveal>
            <h1 className="font-display font-bold text-[clamp(32px,6vw,72px)] leading-[1.05] tracking-tight">
              {project.title}
            </h1>
          </Reveal>
          <Reveal delay={100} className="mt-4 font-mono text-xs uppercase tracking-wide text-dim max-w-xl">
            {project.category}
          </Reveal>
        </div>
      </section>

      {project.video && (
        <Reveal delay={150} className="container">
          <div className="relative aspect-video rounded-sm overflow-hidden bg-neutral-900">
            <AutoVideo
              src={project.video}
              className="absolute inset-0 w-full h-full object-cover contrast-[1.05] brightness-[0.9]"
            />
          </div>
        </Reveal>
      )}

      <section className="py-20 md:py-28">
        <div className="container flex flex-col gap-12">
          {project.overview && <Block label="סקירה" text={project.overview} />}
          {project.challenge && <Block label="האתגר" text={project.challenge} />}
          {project.direction && <Block label="כיוון" text={project.direction} />}
          {project.digital_experience && (
            <Block label="חוויה דיגיטלית" text={project.digital_experience} />
          )}
          {project.behind_the_scenes && (
            <Block label="מאחורי הקלעים" text={project.behind_the_scenes} />
          )}
          {project.result && <Block label="התוצאה" text={project.result} />}

          {project.tools?.length > 0 && (
            <Reveal className="border-t border-white/10 pt-6">
              <div className="font-mono text-xs uppercase tracking-wide text-dim mb-4">
                כלים / יכולות
              </div>
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
