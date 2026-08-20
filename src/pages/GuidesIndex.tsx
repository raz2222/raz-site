import { Link } from "react-router-dom"
import { useGuides } from "@/hooks/useContent"
import { useDocumentMeta } from "@/hooks/useDocumentMeta"
import { useHreflang } from "@/hooks/useHreflang"
import { PageHeader } from "@/components/PageHeader"

export function GuidesIndex() {
  useDocumentMeta(
    "מדריכים — RAZ",
    "מדריכים אמיתיים על בניית אתרים, WordPress, תחזוקה בעזרת AI וסרטוני AI לעסקים — בלי תוכן שיווקי ריק."
  )
  useHreflang("/guides", "/en/guides")
  const { guides } = useGuides()

  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: "בית", to: "/" }, { label: "מדריכים" }]}
        eyebrow="( מדריכים )"
        title={<>תוכן שנותן תשובות אמיתיות,<br />לא רק מילות מפתח.</>}
      />
      <section className="pb-28 md:pb-40">
        <div className="container">
        <div className="mt-4 grid gap-4 max-w-3xl">
          {guides.map((g) => (
            <Link
              key={g.slug}
              to={`/guides/${g.slug}`}
              className="flex gap-5 items-stretch border border-white/10 rounded-lg p-6 hover:border-[#D1FE17] hover:bg-white/[0.02] transition-colors duration-200"
            >
              {(g.hero_image || g.image) && (
                <div className="hidden sm:block shrink-0 w-32 aspect-video rounded-sm overflow-hidden bg-neutral-900">
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
