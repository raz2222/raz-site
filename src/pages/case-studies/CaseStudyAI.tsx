import { Link } from "react-router-dom"
import type { ProjectRow } from "@/lib/supabase"
import { Reveal } from "@/components/Reveal"

export function CaseStudyAI({ project, next }: { project: ProjectRow; next: ProjectRow | null }) {
  const blocks = [
    { label: "Brief ומטרת הקמפיין", text: project.challenge },
    { label: "הקונספט", text: project.direction },
    { label: "Creative Direction", text: project.digital_experience },
    { label: "הפקה ועריכה", text: project.behind_the_scenes },
  ].filter((b): b is { label: string; text: string } => !!b.text)

  return (
    <>
      <section className="relative pt-28 pb-16 md:pt-36 overflow-hidden">
        {project.video && (
          <div className="absolute inset-0 -z-10">
            <video src={project.video} autoPlay muted loop playsInline className="w-full h-full object-cover opacity-30" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-background/60 to-background" />
          </div>
        )}
        <div className="container">
          <Reveal className="font-mono text-xs uppercase tracking-wide text-dim mb-4 flex items-center gap-3">
            <span>{project.number}</span>
            <span className="border border-white/20 rounded-full px-3 py-0.5">פרויקט AI</span>
            {project.concept && <span className="border border-white/20 rounded-full px-3 py-0.5">קונספט עצמאי — ללא לקוח אמיתי</span>}
          </Reveal>
          <Reveal>
            <h1 className="font-display font-black text-[clamp(38px,8.5vw,110px)] leading-[0.98] tracking-tight">
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
          <div className="container mt-3 font-mono text-[11px] uppercase tracking-wide text-dim">
            הסרטון הסופי — לחצו להפעלה עם קול
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
        <div className="container grid md:grid-cols-2 gap-x-16 gap-y-16">
          {blocks.map((b) => (
            <Reveal key={b.label} className="border-t border-white/10 pt-8">
              <div className="font-mono text-xs uppercase tracking-wide text-dim mb-3">{b.label}</div>
              <p className="text-lg leading-relaxed text-foreground/85">{b.text}</p>
            </Reveal>
          ))}
        </div>

        {project.result && (
          <Reveal className="container mt-16 border-t border-white/10 pt-10">
            <div className="font-mono text-xs uppercase tracking-wide text-dim mb-3">התוצאה</div>
            <p className="text-2xl md:text-3xl font-display font-light max-w-3xl">{project.result}</p>
          </Reveal>
        )}

        {project.ai_tools?.length > 0 && (
          <Reveal className="container mt-16 border-t border-white/10 pt-10">
            <div className="font-mono text-xs uppercase tracking-wide text-dim mb-4">הכלים והמודלים</div>
            <div className="flex flex-wrap gap-3">
              {project.ai_tools.map((t) => (
                <span key={t} className="border border-white/30 rounded-full px-4 py-2 text-sm">{t}</span>
              ))}
            </div>
          </Reveal>
        )}
      </section>

      <section className="border-t border-white/10 py-20 md:py-28 text-center">
        <div className="container">
          <Reveal><p className="font-display text-2xl md:text-3xl font-light mb-8 max-w-xl mx-auto">רוצים תוכן AI ברמה הזאת לעסק שלכם?</p></Reveal>
          <Reveal delay={80}>
            <Link to="/services/ai-content" className="inline-block font-mono text-sm uppercase tracking-wide bg-[#D1FE17] text-black rounded-full px-7 py-3.5 hover:scale-105 transition-transform">
              לשירותי תוכן AI ←
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
