import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { useProjects } from "@/hooks/useProjects"
import { PROJECT_CATEGORIES } from "@/lib/supabase"
import { useDocumentMeta } from "@/hooks/useDocumentMeta"
import { useHreflang } from "@/hooks/useHreflang"
import { AutoVideo } from "@/components/AutoVideo"
import { Reveal } from "@/components/Reveal"
import { Breadcrumbs } from "@/components/Breadcrumbs"
import { BrowserProjectCard } from "@/components/BrowserProjectCard"
import { getProjectTranslation, translateLabels, translateCategory } from "@/lib/projectTranslations"
import { cn } from "@/lib/utils"

export function EnglishWorkIndex() {
  const { projects, loading } = useProjects()
  const [filter, setFilter] = useState<string>("הכל")
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

  const activeCategories = useMemo(() => {
    const used = new Set<string>()
    projects.forEach((p) => p.categories?.forEach((c) => used.add(c)))
    return PROJECT_CATEGORIES.filter((c) => used.has(c))
  }, [projects])

  const filtered = filter === "הכל" ? projects : projects.filter((p) => p.categories?.includes(filter))

  return (
    <>
      <section dir="ltr" className="relative overflow-hidden pt-32 pb-16 md:pt-40 md:pb-20">
        <div className="absolute inset-0" aria-hidden="true">
          <AutoVideo
            src="/videos/raz-showreel.mp4"
            className="w-full h-full object-cover contrast-[1.05] brightness-[0.45]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/85 to-background/50" />
        </div>

        <div className="relative container text-left">
          <Breadcrumbs items={[{ label: "Home", to: "/en" }, { label: "Selected Work" }]} className="mb-4" />
          <Reveal delay={40} className="font-mono text-xs uppercase tracking-wide text-dim mb-4">
            ( Selected Work )
          </Reveal>
          <Reveal delay={70}>
            <h1 className="font-display font-black text-[clamp(32px,5.2vw,62px)] leading-[1.1] tracking-tight">
              Everything, from anywhere.
            </h1>
          </Reveal>
        </div>
      </section>

      <section dir="ltr" className="pb-28 md:pb-40 text-left">
        <div className="container">
          <Reveal delay={80} className="flex flex-wrap gap-2 mt-4">
            <button
              onClick={() => setFilter("הכל")}
              className={cn(
                "font-mono text-[10px] font-bold uppercase tracking-wide rounded-full px-4 py-2 border transition-colors",
                filter === "הכל" ? "border-[#D1FE17] bg-[#D1FE17] text-black" : "border-white/15 text-dim hover:border-[#D1FE17]"
              )}
            >
              All
            </button>
            {activeCategories.map((c) => (
              <button
                key={c}
                onClick={() => setFilter(c)}
                className={cn(
                  "font-mono text-[10px] font-bold uppercase tracking-wide rounded-full px-4 py-2 border transition-colors",
                  filter === c ? "border-[#D1FE17] bg-[#D1FE17] text-black" : "border-white/15 text-dim hover:border-[#D1FE17]"
                )}
              >
                {translateCategory(c)}
              </button>
            ))}
          </Reveal>

          {loading && (
            <div className="mt-16 font-mono text-xs text-dim uppercase">Loading…</div>
          )}

          <div key={filter} className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-px bg-white/10 border-t border-white/10 animate-[fadeIn_0.3s_ease]">
            {filtered.map((p, i) => {
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
                    <div className="text-right font-mono text-[11px] text-dim uppercase max-w-[220px]">{t?.category ?? translateCategory(p.category)}</div>
                  </div>
                  {p.project_type === "website" ? (
                    <BrowserProjectCard project={p} href={`/en/work/${p.slug}`} />
                  ) : (
                    <Link
                      to={`/en/work/${p.slug}`}
                      className="block relative overflow-hidden rounded-sm bg-neutral-900 aspect-[4/3] border border-[#D1FE17]/70 hover:border-[#D1FE17] transition-colors duration-200"
                    >
                      {p.video && (
                        <AutoVideo
                          src={p.video}
                          className="absolute inset-0 w-full h-full object-cover contrast-[1.05] brightness-[0.85]"
                        />
                      )}
                      <span className="absolute bottom-4 left-4 font-mono text-[11px] uppercase tracking-wide text-white/80">
                        View →
                      </span>
                    </Link>
                  )}
                  <div className="mt-4 flex flex-wrap gap-x-3 gap-y-1 font-mono text-[11px] text-dim uppercase">
                    {translateLabels(p.disciplines).map((d) => (
                      <span key={d}>{d}</span>
                    ))}
                    <span>{p.year}</span>
                  </div>
                </Reveal>
              )
            })}
          </div>

          {!loading && filtered.length === 0 && (
            <p className="mt-16 text-dim text-sm">No projects in this category yet.</p>
          )}
        </div>
      </section>
    </>
  )
}
