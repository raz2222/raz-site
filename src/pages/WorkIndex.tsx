import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { useProjects } from "@/hooks/useProjects"
import { PROJECT_CATEGORIES } from "@/lib/supabase"
import { useDocumentMeta } from "@/hooks/useDocumentMeta"
import { AutoVideo } from "@/components/AutoVideo"
import { Reveal } from "@/components/Reveal"
import { Breadcrumbs } from "@/components/Breadcrumbs"
import { cn } from "@/lib/utils"

export function WorkIndex() {
  const { projects, loading } = useProjects()
  const [filter, setFilter] = useState<string>("הכל")
  useDocumentMeta(
    "עבודות נבחרות — RAZ",
    "כל הפרויקטים של רז אברמוב — אתרים, סרטי AI וקמפיינים ויזואליים."
  )

  const activeCategories = useMemo(() => {
    const used = new Set<string>()
    projects.forEach((p) => p.categories?.forEach((c) => used.add(c)))
    return PROJECT_CATEGORIES.filter((c) => used.has(c))
  }, [projects])

  const filtered = filter === "הכל" ? projects : projects.filter((p) => p.categories?.includes(filter))

  return (
    <section className="pt-32 pb-28 md:pt-40 md:pb-40">
      <div className="container">
        <Breadcrumbs items={[{ label: "בית", to: "/" }, { label: "עבודות נבחרות" }]} />
        <Reveal className="font-mono text-xs uppercase tracking-wide text-dim mb-4">
          ( עבודות נבחרות )
        </Reveal>
        <Reveal>
          <h1 className="font-display font-medium text-[clamp(28px,4.6vw,54px)] leading-[1.15] tracking-tight">
            הכל, מכל מקום.
          </h1>
        </Reveal>

        <Reveal delay={80} className="flex flex-wrap gap-2 mt-10">
          <button
            onClick={() => setFilter("הכל")}
            className={cn(
              "font-mono text-xs uppercase tracking-wide rounded-full px-4 py-2 border transition-colors",
              filter === "הכל" ? "border-[#D1FE17] bg-[#D1FE17] text-black" : "border-white/15 text-dim hover:border-[#D1FE17]"
            )}
          >
            הכל
          </button>
          {activeCategories.map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={cn(
                "font-mono text-xs uppercase tracking-wide rounded-full px-4 py-2 border transition-colors",
                filter === c ? "border-[#D1FE17] bg-[#D1FE17] text-black" : "border-white/15 text-dim hover:border-[#D1FE17]"
              )}
            >
              {c}
            </button>
          ))}
        </Reveal>

        {loading && (
          <div className="mt-16 font-mono text-xs text-dim uppercase">טוען…</div>
        )}

        <div key={filter} className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-px bg-white/10 border-t border-white/10 animate-[fadeIn_0.3s_ease]">
          {filtered.map((p, i) => (
            <Reveal key={p.slug} delay={i * 60} className="bg-background p-8 md:p-10">
              <div className="flex justify-between items-start gap-6 mb-6">
                <div>
                  <div className="font-mono text-[11px] uppercase tracking-wide text-dim mb-2">
                    {p.number} {p.concept && "· קונספט"}
                  </div>
                  <div className="font-display text-2xl md:text-3xl font-medium">{p.title}</div>
                </div>
                <div className="text-right font-mono text-[11px] text-dim uppercase max-w-[220px]">
                  {p.category}
                </div>
              </div>
              <Link
                to={`/work/${p.slug}`}
                className="block relative overflow-hidden rounded-sm bg-neutral-900 aspect-[4/3] border border-transparent hover:border-[#D1FE17] transition-colors duration-200"
              >
                {p.video && (
                  <AutoVideo
                    src={p.video}
                    className="absolute inset-0 w-full h-full object-cover contrast-[1.05] brightness-[0.85]"
                  />
                )}
                <span className="absolute bottom-4 right-4 font-mono text-[11px] uppercase tracking-wide text-white/80">
                  צפייה ←
                </span>
              </Link>
              <div className="mt-4 flex flex-wrap gap-x-3 gap-y-1 font-mono text-[11px] text-dim uppercase">
                {p.disciplines.map((d) => (
                  <span key={d}>{d}</span>
                ))}
                <span>{p.year}</span>
              </div>
            </Reveal>
          ))}
        </div>

        {!loading && filtered.length === 0 && (
          <p className="mt-16 text-dim text-sm">אין עדיין עבודות בקטגוריה הזו.</p>
        )}
      </div>
    </section>
  )
}
