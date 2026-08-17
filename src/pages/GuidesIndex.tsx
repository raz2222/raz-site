import { Link } from "react-router-dom"
import { useGuides } from "@/hooks/useContent"
import { useDocumentMeta } from "@/hooks/useDocumentMeta"
import { useHreflang } from "@/hooks/useHreflang"
import { Reveal } from "@/components/Reveal"
import { Breadcrumbs } from "@/components/Breadcrumbs"

export function GuidesIndex() {
  useDocumentMeta(
    "מדריכים — RAZ",
    "מדריכים אמיתיים על בניית אתרים, WordPress, תחזוקה בעזרת AI וסרטוני AI לעסקים — בלי תוכן שיווקי ריק."
  )
  useHreflang("/guides", "/en/guides")
  const { guides } = useGuides()

  return (
    <section className="pt-32 pb-28 md:pt-40 md:pb-40">
      <div className="container">
        <Breadcrumbs items={[{ label: "בית", to: "/" }, { label: "מדריכים" }]} />
        <Reveal className="font-mono text-xs uppercase tracking-wide text-dim mb-4">
          ( מדריכים )
        </Reveal>
        <Reveal>
          <h1 className="font-display font-medium text-[clamp(28px,4.6vw,54px)] leading-[1.15] tracking-tight max-w-2xl">
            תוכן שנותן תשובות אמיתיות,
            <br />
            לא רק מילות מפתח.
          </h1>
        </Reveal>

        <div className="mt-16 grid gap-4 max-w-3xl">
          {guides.map((g) => (
            <Link
              key={g.slug}
              to={`/guides/${g.slug}`}
              className="block border border-white/10 rounded-lg p-6 hover:border-[#D1FE17] hover:bg-white/[0.02] transition-colors duration-200"
            >
              <div className="font-mono text-[11px] uppercase tracking-wide text-dim mb-2">
                {g.category} · {g.read_time}
              </div>
              <h2 className="font-display text-xl md:text-2xl font-medium mb-2">{g.title}</h2>
              <p className="text-dim text-sm leading-relaxed">{g.excerpt}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
