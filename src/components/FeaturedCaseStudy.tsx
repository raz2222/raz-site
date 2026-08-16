import { Link } from "react-router-dom"
import { useEffect, useState } from "react"
import { supabase, type ProjectRow } from "@/lib/supabase"
import { Reveal } from "./Reveal"
import { AutoVideo } from "./AutoVideo"

export function FeaturedCaseStudy() {
  const [cs, setCs] = useState<ProjectRow | null>(null)

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
    { label: "האתגר", text: cs.challenge },
    { label: "כיוון", text: cs.direction },
    { label: "דיגיטל", text: cs.digital_experience },
  ].filter((b) => b.text)

  return (
    <section className="py-28 md:py-40">
      <div className="container">
        <Reveal className="font-mono text-xs uppercase tracking-wide text-dim mb-6">
          קייס סטאדי נבחר · פרויקט קונספט עצמאי
        </Reveal>
        <Reveal>
          <h2 className="font-display font-medium text-[clamp(28px,4.4vw,52px)] leading-[1.1] tracking-tight max-w-3xl">
            {cs.overview}
          </h2>
        </Reveal>

        {cs.video && (
          <Reveal delay={150} className="mt-14 relative aspect-video rounded-sm overflow-hidden bg-neutral-900">
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
              <div className="font-mono text-xs uppercase tracking-wide text-dim mb-2">{b.label}</div>
              <p className="text-lg">{b.text}</p>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-14">
          <div className="font-mono text-xs uppercase tracking-wide text-dim mb-4">כלים / יכולות</div>
          <div className="flex flex-wrap gap-3">
            {[...cs.tech_stack, ...cs.ai_tools].map((t) => (
              <span key={t} className="border border-white/15 rounded-full px-4 py-2 text-sm">
                {t}
              </span>
            ))}
          </div>
          <Link
            to={`/work/${cs.slug}`}
            className="inline-block mt-10 font-mono text-xs uppercase tracking-wide underline underline-offset-4 hover:text-[#D1FE17] transition-colors"
          >
            לצפייה בקייס סטאדי המלא ←
          </Link>
        </Reveal>
      </div>
    </section>
  )
}
