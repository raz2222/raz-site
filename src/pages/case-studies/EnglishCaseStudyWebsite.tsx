import { Link } from "react-router-dom"
import type { ProjectRow } from "@/lib/supabase"
import type { ProjectTranslation } from "@/lib/projectTranslations"
import { translateLabels } from "@/lib/projectTranslations"
import { Reveal } from "@/components/Reveal"

function MetaItem({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="font-mono text-[11px] uppercase tracking-wide text-dim mb-2">{label}</div>
      <div className="text-sm">{children}</div>
    </div>
  )
}

export function EnglishCaseStudyWebsite({ project, t, next }: { project: ProjectRow; t: ProjectTranslation; next: ProjectRow | null }) {
  const allTags = translateLabels([...project.tech_stack, ...project.ai_tools])

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

      <Reveal delay={240} className="container mt-16 pt-10 border-t border-white/10 text-left">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <MetaItem label="Project Date">{project.year}</MetaItem>
          <MetaItem label="Duration">{t.duration}</MetaItem>
          <MetaItem label="Client">{t.clientName}</MetaItem>
          {allTags.length > 0 && (
            <MetaItem label="Technologies">
              <div className="flex flex-wrap gap-2">
                {allTags.map((tag) => (
                  <span key={tag} className="border border-white/20 rounded-full px-2.5 py-1 text-xs">{tag}</span>
                ))}
              </div>
            </MetaItem>
          )}
        </div>
        {project.live_url && (
          <a
            href={project.live_url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center w-full sm:w-fit mt-8 font-mono text-[10px] uppercase tracking-wide bg-[#D1FE17] text-black rounded-[8px] px-6 py-3 hover:scale-105 transition-transform"
          >
            Project link →
          </a>
        )}
      </Reveal>

      <section dir="ltr" className="py-24 md:py-32 text-left">
        <div className="container flex flex-col gap-16 md:gap-20">
          {t.challenges.length > 0 && (
            <div className="grid md:grid-cols-[120px_1fr] gap-4 md:gap-14 border-t border-white/10 pt-10 md:pt-12">
              <div className="font-mono text-xs uppercase tracking-wide text-dim">Challenges</div>
              <div className="flex flex-col gap-8">
                {t.challenges.map((c, i) => (
                  <Reveal key={i}>
                    <div className="font-display font-medium text-lg mb-2">{c.title}</div>
                    <p className="text-base leading-relaxed text-foreground/85">{c.description}</p>
                  </Reveal>
                ))}
              </div>
            </div>
          )}

          {t.solutions.length > 0 && (
            <div className="grid md:grid-cols-[120px_1fr] gap-4 md:gap-14 border-t border-white/10 pt-10 md:pt-12">
              <div className="font-mono text-xs uppercase tracking-wide text-dim">Solutions</div>
              <div className="flex flex-col gap-8">
                {t.solutions.map((s, i) => (
                  <Reveal key={i}>
                    <div className="font-display font-medium text-lg mb-2">{s.title}</div>
                    <p className="text-base leading-relaxed text-foreground/85">{s.description}</p>
                  </Reveal>
                ))}
              </div>
            </div>
          )}

          {t.results.length > 0 && (
            <div className="grid md:grid-cols-[120px_1fr] gap-4 md:gap-14 border-t border-white/10 pt-10 md:pt-12">
              <div className="font-mono text-xs uppercase tracking-wide text-dim">Results</div>
              <ul className="flex flex-col gap-4">
                {t.results.map((r, i) => (
                  <Reveal key={i} className="flex gap-3 text-lg md:text-xl leading-relaxed font-display font-light text-foreground/90">
                    <span className="text-[#D1FE17]">—</span>
                    <span>{r}</span>
                  </Reveal>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      {project.testimonial_quote && (
        <Reveal className="border-t border-white/10 py-20 md:py-28">
          <div className="container max-w-2xl text-center">
            <p className="font-display font-light text-2xl md:text-3xl leading-[1.4] mb-8">
              "{project.testimonial_quote}"
            </p>
            {project.testimonial_author && (
              <p className="font-mono text-xs uppercase tracking-wide text-dim">
                {project.testimonial_author}{project.testimonial_role && ` · ${project.testimonial_role}`}
              </p>
            )}
          </div>
        </Reveal>
      )}

      <section dir="ltr" className="border-t border-white/10 py-20 md:py-28 text-center">
        <div className="container">
          <Reveal><p className="font-display text-2xl md:text-3xl font-light mb-8 max-w-xl mx-auto">Want a similar site for your business?</p></Reveal>
          <Reveal delay={80}>
            <Link to="/en/services" className="inline-block font-mono text-[10px] uppercase tracking-wide bg-[#D1FE17] text-black rounded-full px-7 py-3.5 hover:scale-105 transition-transform">
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
