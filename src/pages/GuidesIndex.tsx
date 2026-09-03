import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { useGuides } from "@/hooks/useContent"
import { useDocumentMeta } from "@/hooks/useDocumentMeta"
import { useHreflang } from "@/hooks/useHreflang"
import { PageHeader } from "@/components/PageHeader"
import { Reveal } from "@/components/Reveal"
import { cn } from "@/lib/utils"
import { SECTIONS, type GuideSectionKey } from "@/lib/guideSections"

const ALL = "הכל"

export function GuidesIndex({ section = "blog" }: { section?: GuideSectionKey }) {
  const meta = SECTIONS[section]
  useDocumentMeta(meta.metaTitle, meta.metaDescription)
  useHreflang(meta.path, meta.enPath)
  const { guides, loading } = useGuides(meta.kind)
  const [topic, setTopic] = useState<string>(ALL)

  // Topics come from what is actually published, not a hardcoded list, so a
  // tab can never point at an empty shelf and a new category needs no code.
  const topics = useMemo(() => {
    const counts = new Map<string, number>()
    for (const g of guides) counts.set(g.category, (counts.get(g.category) ?? 0) + 1)
    return [...counts.entries()].sort((a, b) => b[1] - a[1])
  }, [guides])

  // The filter is client-side and defaults to everything, so the prerendered
  // HTML a crawler reads still contains a link to every guide.
  const visible = topic === ALL ? guides : guides.filter((g) => g.category === topic)

  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: "בית", to: "/" }, { label: meta.label }]}
        eyebrow={`( ${meta.label} )`}
        title={meta.heading}
      />
      <section className="pb-28 md:pb-40">
        <div className="container">
          {topics.length > 1 && (
            <Reveal delay={80} className="flex flex-wrap gap-2 mt-4">
              <button
                onClick={() => setTopic(ALL)}
                aria-pressed={topic === ALL}
                className={cn(
                  "font-mono text-[10px] font-bold uppercase tracking-wide rounded-full px-4 py-2 border transition-colors",
                  topic === ALL ? "border-[#D1FE17] bg-[#D1FE17] text-black" : "border-white/15 text-dim hover:border-[#D1FE17]"
                )}
              >
                {ALL} ({guides.length})
              </button>
              {topics.map(([name, count]) => (
                <button
                  key={name}
                  onClick={() => setTopic(name)}
                  aria-pressed={topic === name}
                  className={cn(
                    "font-mono text-[10px] font-bold uppercase tracking-wide rounded-full px-4 py-2 border transition-colors",
                    topic === name ? "border-[#D1FE17] bg-[#D1FE17] text-black" : "border-white/15 text-dim hover:border-[#D1FE17]"
                  )}
                >
                  {name} ({count})
                </button>
              ))}
            </Reveal>
          )}

          {!loading && guides.length === 0 && (
            <p className="mt-8 font-mono text-sm text-dim">עוד לא פורסם כאן כלום. בקרוב.</p>
          )}

          <div className="mt-4 grid gap-4 max-w-3xl">
            {visible.map((g) => (
              <Link
                key={g.slug}
                to={`${meta.path}/${g.slug}`}
                className="flex flex-col sm:flex-row gap-4 sm:gap-5 sm:items-stretch border border-white/10 rounded-lg p-6 hover:border-[#D1FE17] hover:bg-white/[0.02] transition-colors duration-200"
              >
                {(g.hero_image || g.image) && (
                  <div className="w-full sm:w-32 sm:shrink-0 aspect-video rounded-sm overflow-hidden bg-neutral-900">
                    <img src={g.hero_image ?? g.image ?? ""} alt={g.title} loading="lazy" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="min-w-0">
                  <div className="font-mono text-[11px] uppercase tracking-wide text-dim mb-2">
                    {g.category} · {g.read_time} · {new Date(g.date_published).toLocaleDateString("he-IL", { day: "numeric", month: "long", year: "numeric" })}
                  </div>
                  <h2 className="font-display text-xl md:text-2xl font-medium mb-2 text-[#D1FE17]">{g.title}</h2>
                  <p className="text-dim text-sm leading-relaxed">{g.excerpt}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
