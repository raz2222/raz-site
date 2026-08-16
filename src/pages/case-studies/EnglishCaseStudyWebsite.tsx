import { Link } from "react-router-dom"
import type { ProjectRow } from "@/lib/supabase"
import type { ProjectTranslation } from "@/lib/projectTranslations"
import { translateLabels } from "@/lib/projectTranslations"
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

export function EnglishCaseStudyWebsite({ project, t, next }: { project: ProjectRow; t: ProjectTranslation; next: ProjectRow | null }) {
  const blocks = [
    { label: "Background & Problem", text: t.challenge },
    { label: "UX/UI Direction", text: t.direction },
    { label: "Development & Functionality", text: t.digitalExperience },
    { label: "Integrations & Mobile", text: t.behindTheScenes },
    { label: "Result", text: t.result },
  ].filter((b): b is { label: string; text: string } => !!b.text)

  return (
    <>
      <section dir="ltr" className="pt-28 pb-8 md:pt-36 text-left">
        <div className="container">
          <Reveal className="font-mono text-xs uppercase tracking-wide text-dim mb-4 flex items-center gap-3">
            <span>{project.number}</span>
            <span className="border border-white/20 rounded-full px-3 py-0.5">Website</span>
            {project.concept && <span className="border border-white/20 rounded-full px-3 py-0.5">Independent concept project</span>}
          </Reveal>
          <Reveal>
            <h1 className="font-display font-black text-[clamp(38px,8.5vw,110px)] leading-[0.98] tracking-tight">
              {project.title}
            </h1>
          </Reveal>
          <Reveal delay={100} className="mt-5 font-mono text-xs uppercase tracking-wide text-dim">
            {t.category} · {project.year}
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

      <Reveal delay={200} className="container mt-16 md:mt-24 text-left">
        <p className="text-2xl md:text-4xl font-display font-light leading-[1.3] max-w-4xl text-foreground/90">
          {t.overview}
        </p>
      </Reveal>

      <section dir="ltr" className="py-24 md:py-32 text-left">
        <div className="container flex flex-col gap-16 md:gap-20">
          {blocks.map((b, i) => (
            <Block key={b.label} n={String(i + 1).padStart(2, "0")} label={b.label} text={b.text} />
          ))}

          {project.tech_stack?.length > 0 && (
            <Reveal className="grid md:grid-cols-[120px_1fr] gap-4 md:gap-14 border-t border-white/10 pt-10 md:pt-12">
              <div className="font-mono text-xs uppercase tracking-wide text-dim">Stack</div>
              <div className="flex flex-wrap gap-3">
                {translateLabels(project.tech_stack).map((tag) => (
                  <span key={tag} className="border border-white/30 rounded-full px-4 py-2 text-sm">{tag}</span>
                ))}
              </div>
            </Reveal>
          )}
          {project.ai_tools?.length > 0 && (
            <Reveal className="grid md:grid-cols-[120px_1fr] gap-4 md:gap-14 border-t border-white/10 pt-10 md:pt-12">
              <div className="font-mono text-xs uppercase tracking-wide text-dim">AI in the process</div>
              <div className="flex flex-wrap gap-3">
                {translateLabels(project.ai_tools).map((tag) => (
                  <span key={tag} className="border border-white/30 rounded-full px-4 py-2 text-sm">{tag}</span>
                ))}
              </div>
            </Reveal>
          )}
        </div>
      </section>

      <section dir="ltr" className="border-t border-white/10 py-20 md:py-28 text-center">
        <div className="container">
          <Reveal><p className="font-display text-2xl md:text-3xl font-light mb-8 max-w-xl mx-auto">Want a similar site for your business?</p></Reveal>
          <Reveal delay={80}>
            <Link to="/en/services" className="inline-block font-mono text-sm uppercase tracking-wide bg-[#D1FE17] text-black rounded-full px-7 py-3.5 hover:scale-105 transition-transform">
              Web design services →
            </Link>
          </Reveal>
        </div>
      </section>

      {next && (
        <Link to={`/en/work/${next.slug}`} dir="ltr" className="block border-t border-white/10 py-16 md:py-24 hover:bg-white/[0.02] transition-colors text-left">
          <div className="container">
            <div className="font-mono text-xs uppercase tracking-wide text-dim mb-3">Next project</div>
            <div className="font-display font-medium text-3xl md:text-5xl">{next.title} →</div>
          </div>
        </Link>
      )}
    </>
  )
}
