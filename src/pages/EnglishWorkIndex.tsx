import { useEffect } from "react"
import { Link } from "react-router-dom"
import { useProjects } from "@/hooks/useProjects"
import { useDocumentMeta } from "@/hooks/useDocumentMeta"
import { useHreflang } from "@/hooks/useHreflang"
import { AutoVideo } from "@/components/AutoVideo"
import { Reveal } from "@/components/Reveal"
import { getProjectTranslation, translateLabels } from "@/lib/projectTranslations"

export function EnglishWorkIndex() {
  const { projects, loading } = useProjects()
  useDocumentMeta("Selected Work · RAZ", "All of Raz Avramov's projects: websites, AI films and visual campaigns.")
  useHreflang("/work", "/en/work")

  useEffect(() => {
    document.documentElement.lang = "en"
    document.documentElement.dir = "ltr"
    return () => {
      document.documentElement.lang = "he"
      document.documentElement.dir = "rtl"
    }
  }, [])

  return (
    <section dir="ltr" className="pt-32 pb-28 md:pt-40 md:pb-40 text-left">
      <div className="container">
        <Reveal className="font-mono text-xs uppercase tracking-wide text-dim mb-4">( Selected Work )</Reveal>
        <Reveal>
          <h1 className="font-display font-medium text-[clamp(28px,4.6vw,54px)] leading-[1.15] tracking-tight">
            Everything, from anywhere.
          </h1>
        </Reveal>

        {loading && <div className="mt-16 font-mono text-xs text-dim uppercase">Loading…</div>}

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-px bg-white/10 border-t border-white/10">
          {projects.map((p, i) => {
            const t = getProjectTranslation(p.slug)
            return (
              <Reveal key={p.slug} delay={i * 60} className="bg-background p-8 md:p-10">
                <div className="flex justify-between items-start gap-6 mb-6">
                  <div>
                    <div className="font-mono text-[11px] uppercase tracking-wide text-dim mb-2">
                      {p.number} {p.concept && "· Concept"}
                    </div>
                    <div className="font-display text-2xl md:text-3xl font-medium">{p.title}</div>
                  </div>
                  <div className="text-right font-mono text-[11px] text-dim uppercase max-w-[220px]">{t?.category ?? p.category}</div>
                </div>
                <Link to={`/en/work/${p.slug}`} className="block relative overflow-hidden rounded-sm bg-neutral-900 aspect-[4/3] border border-transparent hover:border-[#D1FE17] transition-colors duration-200">
                  {p.video && <AutoVideo src={p.video} className="absolute inset-0 w-full h-full object-cover contrast-[1.05] brightness-[0.85]" />}
                  <span className="absolute bottom-4 left-4 font-mono text-[11px] uppercase tracking-wide text-white/80">View →</span>
                </Link>
                <div className="mt-4 flex flex-wrap gap-x-3 gap-y-1 font-mono text-[11px] text-dim uppercase">
                  {translateLabels(p.disciplines).map((d) => <span key={d}>{d}</span>)}
                  <span>{p.year}</span>
                </div>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
