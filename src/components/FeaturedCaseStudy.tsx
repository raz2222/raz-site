import { Link } from "react-router-dom"
import { useEffect, useState } from "react"
import { supabase, type ProjectRow } from "@/lib/supabase"
import { Reveal } from "./Reveal"
import { AutoVideo } from "./AutoVideo"
import { useSiteContent } from "@/hooks/useSiteContent"
import { FEATURED_CASE_STUDY_DEFAULT } from "@/lib/siteContentDefaults"

export function FeaturedCaseStudy() {
  const [cs, setCs] = useState<ProjectRow | null>(null)
  const { content: extra } = useSiteContent("home_featured_case_study", FEATURED_CASE_STUDY_DEFAULT)

  useEffect(() => {
    supabase
      .from("projects")
      .select("*")
      .eq("featured", true)
      .maybeSingle()
      .then(({ data }) => setCs(data))
  }, [])

  if (!cs) return null

  const blocks = [
    { label: "סקירה", text: cs.overview },
    ...cs.challenges.slice(0, 1).map((c) => ({ label: "האתגר", text: c.description })),
    ...cs.solutions.slice(0, 2).map((s) => ({ label: s.title, text: s.description })),
  ].filter((b) => b.text)

  return (
    <section className="py-28 md:py-40 section-divider">
      <div className="container">
        <Reveal className="font-mono text-xs uppercase tracking-wide text-dim mb-6">
          קייס סטאדי נבחר · פרויקט קונספט עצמאי
        </Reveal>
        <Reveal>
          <h2 className="font-display font-bold text-[clamp(32px,5vw,60px)] leading-[1.1] tracking-[-0.04em] max-w-3xl text-gradient-accent text-shimmer">
            {cs.overview}
          </h2>
        </Reveal>
        <Reveal delay={80} className="mt-6 max-w-2xl space-y-3">
          <p className="text-dim text-base md:text-lg leading-relaxed">{extra.paragraph1}</p>
          <p className="text-dim text-base md:text-lg leading-relaxed">{extra.paragraph2}</p>
        </Reveal>

        {cs.video && (
          <Reveal delay={150} className="mt-14 relative aspect-video rounded-2xl overflow-hidden bg-neutral-900">
            <AutoVideo
              src={cs.video}
              className="absolute inset-0 w-full h-full object-cover contrast-[1.05] brightness-[0.85]"
            />
            <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="absolute bottom-6 left-6 font-display font-bold text-3xl md:text-5xl text-white">
              {cs.title}
            </div>
          </Reveal>
        )}

        <div className="grid md:grid-cols-2 gap-x-16 gap-y-10 mt-16">
          {blocks.map((b, i) => (
            <Reveal key={b.label} delay={i * 100}>
              <div className="font-display font-bold text-xl mb-2">{b.label}</div>
              <p className="text-lg">{b.text}</p>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-14">
          <div className="font-display font-bold text-xl mb-4">כלים / יכולות</div>
          <div className="flex flex-wrap gap-3">
            {[...cs.tech_stack, ...cs.ai_tools].map((t) => (
              <span key={t} className="surface-raised rounded-full px-4 py-2 text-sm">
                {t}
              </span>
            ))}
          </div>
          <Link
            to={`/work/${cs.slug}`}
            className="inline-flex items-center justify-center w-full sm:w-fit mt-10 font-mono text-sm font-bold uppercase tracking-wide bg-[#D1FE17] text-black rounded-[8px] px-6 py-3 hover:scale-105 transition-transform"
          >
            {extra.cta_label}
          </Link>
        </Reveal>
      </div>
    </section>
  )
}
