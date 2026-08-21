import { Link } from "react-router-dom"
import type { ProjectRow } from "@/lib/supabase"
import { Reveal } from "@/components/Reveal"
import { Breadcrumbs } from "@/components/Breadcrumbs"

function MetaItem({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="font-mono text-[11px] uppercase tracking-wide text-dim mb-2">{label}</div>
      <div className="text-sm">{children}</div>
    </div>
  )
}

export function CaseStudyAI({ project, next }: { project: ProjectRow; next: ProjectRow | null }) {
  const allTags = [...project.tech_stack, ...project.ai_tools]

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
          <Breadcrumbs items={[{ label: "בית", to: "/" }, { label: "עבודות נבחרות", to: "/work" }, { label: project.title }]} />
          <Reveal className="font-mono text-xs uppercase tracking-wide text-dim mb-4 flex items-center gap-3">
            <span>{project.number}</span>
            <span className="border border-white/20 rounded-full px-3 py-0.5">פרויקט AI</span>
            {project.concept && <span className="border border-white/20 rounded-full px-3 py-0.5">קונספט עצמאי · ללא לקוח אמיתי</span>}
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
            הסרטון הסופי · לחצו להפעלה עם קול
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

      <Reveal delay={240} className="container mt-16 pt-10 border-t border-white/10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <MetaItem label="תאריך הפרויקט">{project.year}</MetaItem>
          {project.duration && <MetaItem label="משך זמן">{project.duration}</MetaItem>}
          {project.client_name && <MetaItem label="לקוח">{project.client_name}</MetaItem>}
          {allTags.length > 0 && (
            <MetaItem label="הכלים והמודלים">
              <div className="flex flex-wrap gap-2">
                {allTags.map((t) => (
                  <span key={t} className="border border-white/20 rounded-full px-2.5 py-1 text-xs">{t}</span>
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
            className="inline-block mt-8 font-mono text-xs uppercase tracking-wide underline underline-offset-4 hover:text-[#D1FE17] transition-colors"
          >
            קישור לפרויקט ←
          </a>
        )}
      </Reveal>

      <section className="py-24 md:py-32">
        <div className="container flex flex-col gap-16 md:gap-20">
          {project.challenges.length > 0 && (
            <div className="grid md:grid-cols-[120px_1fr] gap-4 md:gap-14 border-t border-white/10 pt-10 md:pt-12">
              <div className="font-mono text-xs uppercase tracking-wide text-dim">אתגרים</div>
              <div className="flex flex-col gap-8">
                {project.challenges.map((c, i) => (
                  <Reveal key={i}>
                    <div className="font-display font-medium text-lg mb-2">{c.title}</div>
                    <p className="text-base leading-relaxed text-foreground/85">{c.description}</p>
                  </Reveal>
                ))}
              </div>
            </div>
          )}

          {project.solutions.length > 0 && (
            <div className="grid md:grid-cols-[120px_1fr] gap-4 md:gap-14 border-t border-white/10 pt-10 md:pt-12">
              <div className="font-mono text-xs uppercase tracking-wide text-dim">פתרונות</div>
              <div className="flex flex-col gap-8">
                {project.solutions.map((s, i) => (
                  <Reveal key={i}>
                    <div className="font-display font-medium text-lg mb-2">{s.title}</div>
                    <p className="text-base leading-relaxed text-foreground/85">{s.description}</p>
                  </Reveal>
                ))}
              </div>
            </div>
          )}

          {project.results.length > 0 && (
            <div className="grid md:grid-cols-[120px_1fr] gap-4 md:gap-14 border-t border-white/10 pt-10 md:pt-12">
              <div className="font-mono text-xs uppercase tracking-wide text-dim">תוצאות</div>
              <ul className="flex flex-col gap-4">
                {project.results.map((r, i) => (
                  <Reveal key={i} className="flex gap-3 text-lg md:text-xl leading-relaxed font-display font-light text-foreground/90">
                    <span className="text-[#D1FE17]">•</span>
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
