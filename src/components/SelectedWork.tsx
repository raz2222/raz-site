import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { useProjects } from "@/hooks/useProjects"
import { Reveal } from "./Reveal"
import { Eyebrow } from "./Eyebrow"
import { BrowserProjectCard } from "./BrowserProjectCard"
import { AutoVideo } from "./AutoVideo"
import { useCarouselProgress, CarouselProgressBar } from "./CarouselProgress"
import { cn } from "@/lib/utils"

type TypeFilter = "הכל" | "website" | "ai"

export function SelectedWork() {
  const { projects, loading } = useProjects()
  const [filter, setFilter] = useState<TypeFilter>("הכל")
  const { ref: carouselRef, thumb } = useCarouselProgress<HTMLDivElement>()

  const tabs = useMemo(() => {
    const list: { value: TypeFilter; label: string }[] = [{ value: "הכל", label: "הכל" }]
    if (projects.some((p) => p.project_type === "website")) list.push({ value: "website", label: "אתרים" })
    if (projects.some((p) => p.project_type === "ai")) list.push({ value: "ai", label: "תוכן AI" })
    return list
  }, [projects])

  const filtered = filter === "הכל" ? projects : projects.filter((p) => p.project_type === filter)

  return (
    <section id="work" className="py-28 md:py-40 section-divider">
      <div className="container">
        <Reveal className="mb-4">
          <Eyebrow>עבודות נבחרות</Eyebrow>
        </Reveal>
        <Reveal>
          <h2 className="font-display font-bold text-[clamp(30px,4.6vw,54px)] leading-[1.15] tracking-[-0.04em] text-gradient-accent text-shimmer">
            קודם תראו מה אני יודע לעשות.
          </h2>
        </Reveal>
        <Reveal delay={40}>
          <p className="mt-4 max-w-xl text-dim text-base md:text-lg leading-relaxed">
            אתרים, סרטים, קמפיינים וכמה רעיונות שהלכו קצת רחוק מדי.
          </p>
        </Reveal>

        {tabs.length > 1 && (
          <Reveal delay={80} className="flex flex-wrap gap-2 mt-8">
            {tabs.map((t) => (
              <button
                key={t.value}
                onClick={() => setFilter(t.value)}
                className={cn(
                  "font-mono text-[10px] font-bold uppercase tracking-wide rounded-full px-4 py-2 border transition-colors",
                  filter === t.value ? "border-[#D1FE17] bg-[#D1FE17] text-black" : "border-white/15 text-dim hover:border-[#D1FE17]"
                )}
              >
                {t.label}
              </button>
            ))}
          </Reveal>
        )}

        {loading && (
          <div className="mt-16 font-mono text-xs text-dim uppercase">טוען…</div>
        )}

        <div
          key={filter}
          ref={carouselRef}
          className="mt-16 flex overflow-x-auto snap-x snap-mandatory gap-4 pb-2 -mx-4 px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:px-0 sm:pb-0 sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible animate-[fadeIn_0.3s_ease]">
          {filtered.map((p, i) => (
            <Reveal
              key={p.slug}
              delay={i * 80}
              className={cn(
                "flex-none w-[78vw] max-w-[320px] aspect-[4/3] snap-center sm:w-auto sm:max-w-none sm:aspect-auto sm:h-auto",
                p.thumb_class === "wide" && "sm:col-span-2"
              )}
            >
              {p.project_type === "website" ? (
                <BrowserProjectCard project={p} className="h-full sm:h-auto" />
              ) : (
                <Link
                  to={`/work/${p.slug}`}
                  className={cn(
                    "group block relative overflow-hidden rounded-2xl surface-raised border border-[#D1FE17]/70 hover:border-[#D1FE17] transition-colors duration-200 h-full",
                    p.thumb_class === "wide"
                      ? "sm:h-auto sm:aspect-[21/9]"
                      : p.thumb_class === "tall"
                        ? "sm:h-auto sm:aspect-[3/4]"
                        : "sm:aspect-auto"
                  )}
                >
                  {p.video && (
                    <AutoVideo
                      src={p.video}
                      className="absolute inset-0 w-full h-full object-cover contrast-[1.05] brightness-[0.85] transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />

                  <div className="absolute top-4 inset-x-4 flex items-start justify-between gap-4">
                    <span className="font-mono text-[11px] uppercase tracking-wide text-white/70">
                      {p.number} {p.concept && "· קונספט"}
                    </span>
                    <span className="font-mono text-[11px] uppercase tracking-wide text-white/70 opacity-0 group-hover:opacity-100 transition-opacity">
                      צפייה ←
                    </span>
                  </div>

                  <div className="absolute bottom-4 right-4 left-4">
                    <div className="font-display text-xl md:text-2xl font-bold text-white">{p.title}</div>
                    <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 font-mono text-[11px] text-white/60 uppercase">
                      <span>{p.category}</span>
                      {p.disciplines.map((d) => (
                        <span key={d}>{d}</span>
                      ))}
                      <span>{p.year}</span>
                    </div>
                  </div>
                </Link>
              )}
            </Reveal>
          ))}
        </div>
        <CarouselProgressBar thumb={thumb} className="mt-3 mx-4 sm:hidden" />

        {!loading && filtered.length === 0 && (
          <p className="mt-16 text-dim text-sm">אין עדיין עבודות מהסוג הזה.</p>
        )}

        <Reveal className="mt-12">
          <Link
            to="/work"
            className="inline-flex items-center justify-center w-full sm:w-fit font-mono text-sm font-bold uppercase tracking-wide bg-[#D1FE17] text-black rounded-[8px] px-6 py-3 hover:scale-105 transition-transform"
          >
            כל העבודות ←
          </Link>
        </Reveal>
      </div>
    </section>
  )
}
