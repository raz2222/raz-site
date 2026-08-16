import { Link } from "react-router-dom"
import type { ProjectRow } from "@/lib/supabase"
import { Reveal } from "@/components/Reveal"

function Block({ n, label, text }: { n: string; label: string; text: string }) {
  return (
    <Reveal className="grid md:grid-cols-[120px_1fr] gap-4 md:gap-14 border-t border-white/10 pt-10 md:pt-12">
      <div className="flex md:flex-col items-baseline md:items-start gap-3 md:gap-2">
        <span className="font-mono text-xs text-dim">{n}</span>
        <span className="font-mono text-xs uppercase tracking-wide text-dim">{label}</span>
      </div>
      <p className="text-xl md:text-2xl leading-[1.5] max-w-2xl font-display font-light">{text}</p>
    </Reveal>
  )
}

export function CaseStudyWebsite({ project, next }: { project: ProjectRow; next: ProjectRow | null }) {
  const blocks = [
    { label: "רקע והבעיה", text: project.challenge },
    { label: "אפיון ועיצוב UX/UI", text: project.direction },
    { label: "פיתוח ופונקציונליות", text: project.digital_experience },
    { label: "אינטגרציות ומובייל", text: project.behind_the_scenes },
    { label: "תוצאה", text: project.result },
  ].filter((b): b is { label: string; text: string } => !!b.text)

  return (
    <>
      <section className="pt-28 pb-8 md:pt-36">
        <div className="container">
          <Reveal className="font-mono text-xs uppercase tracking-wide text-dim mb-4 flex items-center gap-3">
            <span>{project.number}</span>
            <span className="border border-white/20 rounded-full px-3 py-0.5">אתר</span>
            {project.concept && <span className="border border-white/20 rounded-full px-3 py-0.5">פרויקט קונספט עצמאי</span>}
          </Reveal>
          <Reveal>
            <h1 className="font-display font-bold text-[clamp(38px,8.5vw,110px)] leading-[0.98] tracking-tight">
              {project.title}
            </h1>
          </Reveal>
          <Reveal delay={100} className="mt-5 font-mono text-xs uppercase tracking-wide text-dim">
            {project.category} · {project.year}
          </Reveal>
        </div>
      </section>

      {project.video && (
        <Reveal delay={150} className="mt-2 md:mt-6">
          <div className="relative w-full aspect-[16/10] md:aspect-[21/9] overflow-hidden bg-neutral-900">
            <video src={project.video} controls playsInline preload="metadata" className="w-full h-full object-cover" />
          </div>
        </Reveal>
      )}

      {project.overview && (
        <Reveal delay={200} className="container mt-16 md:mt-24">
          <p className="text-2xl md:text-4xl font-display font-light leading-[1.3] max-w-4xl text-foreground/90">
            {project.overview}
          </p>
        </Reveal>
      )}

      <section className="py-24 md:py-32">
        <div className="container flex flex-col gap-16 md:gap-20">
          {blocks.map((b, i) => (
            <Block key={b.label} n={String(i + 1).padStart(2, "0")} label={b.label} text={b.text} />
          ))}

          {project.tech_stack?.length > 0 && (
            <Reveal className="grid md:grid-cols-[120px_1fr] gap-4 md:gap-14 border-t border-white/10 pt-10 md:pt-12">
              <div className="font-mono text-xs uppercase tracking-wide text-dim">Stack</div>
              <div className="flex flex-wrap gap-3">
                {project.tech_stack.map((t) => (
                  <span key={t} className="border border-white/30 rounded-full px-4 py-2 text-sm">{t}</span>
                ))}
              </div>
            </Reveal>
          )}
          {project.ai_tools?.length > 0 && (
            <Reveal className="grid md:grid-cols-[120px_1fr] gap-4 md:gap-14 border-t border-white/10 pt-10 md:pt-12">
              <div className="font-mono text-xs uppercase tracking-wide text-dim">AI בתהליך</div>
              <div className="flex flex-wrap gap-3">
                {project.ai_tools.map((t) => (
                  <span key={t} className="border border-white/30 rounded-full px-4 py-2 text-sm">{t}</span>
                ))}
              </div>
            </Reveal>
          )}
        </div>
      </section>

      <section className="border-t border-white/10 py-20 md:py-28 text-center">
        <div className="container">
          <Reveal><p className="font-display text-2xl md:text-3xl font-light mb-8 max-w-xl mx-auto">רוצים אתר דומה לעסק שלכם?</p></Reveal>
          <Reveal delay={80}>
            <Link to="/services/web-design" className="inline-block font-mono text-sm uppercase tracking-wide bg-[#D1FE17] text-black rounded-full px-7 py-3.5 hover:scale-105 transition-transform">
              לשירותי בניית אתרים ←
            </Link>
          </Reveal>
        </div>
      </section>

      {next && (
        <Link to={`/work/${next.slug}`} className="block border-t border-white/10 py-16 md:py-24 hover:bg-white/[0.02] transition-colors">
          <div className="container">
            <div className="font-mono text-xs uppercase tracking-wide text-dim mb-3">הפרויקט הבא</div>
            <div className="font-display font-medium text-3xl md:text-5xl">← {next.title}</div>
          </div>
        </Link>
      )}
    </>
  )
}
