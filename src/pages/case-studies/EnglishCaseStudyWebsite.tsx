import { Link } from "react-router-dom"
import type { ProjectRow } from "@/lib/supabase"
import type { ProjectTranslation } from "@/lib/projectTranslations"
import { translateLabels } from "@/lib/projectTranslations"
import { Reveal } from "@/components/Reveal"
import { Breadcrumbs } from "@/components/Breadcrumbs"
import { AutoVideo } from "@/components/AutoVideo"

function MetaItem({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="font-mono text-[11px] uppercase tracking-wide text-dim mb-2">{label}</div>
      <div className="text-sm">{children}</div>
    </div>
  )
}

export function EnglishCaseStudyWebsite({
  project,
  t,
  next,
  basePath = "/en",
  hideSalesCTA = false,
}: {
  project: ProjectRow
  t: ProjectTranslation
  next: ProjectRow | null
  basePath?: string
  hideSalesCTA?: boolean
}) {
  const allTags = translateLabels([...project.tech_stack, ...project.ai_tools])

  return (
    <>
      <section dir="ltr" className="pt-28 pb-8 md:pt-36 text-left">
        <div className="container">
          <Breadcrumbs items={[{ label: "Home", to: basePath || "/" }, { label: "Selected Work", to: `${basePath}/work` }, { label: project.title }]} />
          <Reveal className="font-mono text-xs uppercase tracking-wide text-dim mb-4 flex flex-wrap items-center gap-3">
            <span>{project.number}</span>
            <span className="surface-raised rounded-full px-3 py-0.5">Website</span>
            {project.concept && <span className="surface-raised rounded-full px-3 py-0.5">Independent concept project</span>}
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

      {t.overview && (
        <Reveal delay={200} className="container mt-16 md:mt-24 text-left">
          <p className="text-2xl md:text-4xl font-display font-light leading-[1.3] max-w-4xl text-foreground/90">
            {t.overview}
          </p>
        </Reveal>
      )}

      <Reveal delay={240} className="container mt-16 pt-10 border-t border-white/10 text-left">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <MetaItem label="Project Date">{project.year}</MetaItem>
          {project.duration && <MetaItem label="Duration">{t.duration}</MetaItem>}
          {project.client_name && <MetaItem label="Client">{t.clientName}</MetaItem>}
          {allTags.length > 0 && (
            <MetaItem label="Technologies">
              <div className="flex flex-wrap gap-2">
                {allTags.map((tag) => (
                  <span key={tag} className="surface-raised rounded-full px-2.5 py-1 text-xs">{tag}</span>
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
            className="inline-flex items-center justify-center w-full sm:w-fit mt-8 font-mono text-sm font-bold uppercase tracking-wide bg-[#D1FE17] text-black rounded-[8px] px-6 py-3 hover:scale-105 transition-transform"
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
                  <Reveal key={i} as="li" className="flex gap-3 text-lg md:text-xl leading-relaxed font-display font-light text-foreground/90">
                    <span className="text-[#D1FE17]">•</span>
                    <span>{r}</span>
                  </Reveal>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      {project.gallery.length > 0 && (
        <section className="py-16 border-t border-white/10">
          <div className="container">
            <div className="font-mono text-xs uppercase tracking-wide text-dim mb-8">More from the project</div>
            <div className="grid sm:grid-cols-2 gap-4">
              {project.gallery.map((item, i) => (
                <Reveal key={i} delay={i * 60} className="relative aspect-[4/3] rounded-lg overflow-hidden bg-neutral-900">
                  {item.type === "video" ? (
                    <video src={item.url} controls playsInline preload="metadata" className="absolute inset-0 w-full h-full object-cover" />
                  ) : (
                    <img src={item.url} alt={item.caption || project.title} loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
                  )}
                  {item.caption && (
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-4 pointer-events-none">
                      <p className="text-xs text-white/80">{item.caption}</p>
                    </div>
                  )}
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

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

      {!hideSalesCTA && (
        <section dir="ltr" className="relative overflow-hidden section-divider py-20 md:py-28 text-center">
          {project.video && (
            <>
              <AutoVideo src={project.video} className="absolute inset-0 w-full h-full object-cover contrast-[1.05] brightness-[0.35]" />
              <div className="absolute inset-0 bg-background/70" />
            </>
          )}
          <div className="container relative">
            <Reveal><p className="font-display text-2xl md:text-3xl font-light mb-8 max-w-xl mx-auto">Want a similar site for your business?</p></Reveal>
            <Reveal delay={80}>
              <Link to="/en/services" className="inline-block font-mono text-sm font-bold uppercase tracking-wide bg-[#D1FE17] text-black rounded-[8px] px-7 py-3.5 hover:scale-105 transition-transform">
                Web design services →
              </Link>
            </Reveal>
          </div>
        </section>
      )}

      {next && (
        <Link to={`${basePath}/work/${next.slug}`} dir="ltr" className="group relative block overflow-hidden section-divider py-16 md:py-24 text-left">
          {next.video && (
            <AutoVideo src={next.video} className="absolute inset-0 w-full h-full object-cover contrast-[1.05] brightness-[0.4] transition-transform duration-500 group-hover:scale-105" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/40" />
          <div className="container relative">
            <div className="font-mono text-xs uppercase tracking-wide text-dim mb-3">Next project</div>
            <div className="font-display font-bold text-3xl md:text-5xl text-gradient-accent">{next.title} →</div>
          </div>
        </Link>
      )}
    </>
  )
}
