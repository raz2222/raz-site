import { useEffect } from "react"
import { Link } from "react-router-dom"
import { guidesEn } from "@/lib/guidesEn"
import { useDocumentMeta } from "@/hooks/useDocumentMeta"
import { useHreflang } from "@/hooks/useHreflang"
import { Reveal } from "@/components/Reveal"

export function EnglishGuidesIndex() {
  useDocumentMeta(
    "Guides — RAZ",
    "Real guides on building websites, WordPress, AI-powered maintenance, and AI video for businesses — no empty marketing filler."
  )
  useHreflang("/guides", "/en/guides")

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
        <Reveal className="font-mono text-xs uppercase tracking-wide text-dim mb-4">( Guides )</Reveal>
        <Reveal>
          <h1 className="font-display font-medium text-[clamp(28px,4.6vw,54px)] leading-[1.15] tracking-tight max-w-2xl">
            Content that gives real answers,
            <br />
            not just keywords.
          </h1>
        </Reveal>

        <div className="mt-16 grid gap-4 max-w-3xl">
          {guidesEn.map((g) => (
            <Link
              key={g.slug}
              to={`/en/guides/${g.slug}`}
              className="flex gap-5 border border-white/10 rounded-lg p-6 hover:border-[#D1FE17] hover:bg-white/[0.02] transition-colors duration-200"
            >
              {g.heroImage && (
                <div className="hidden sm:block shrink-0 w-32 aspect-video rounded-sm overflow-hidden bg-neutral-900">
                  <img src={g.heroImage} alt="" loading="lazy" className="w-full h-full object-cover" />
                </div>
              )}
              <div>
                <div className="font-mono text-[11px] uppercase tracking-wide text-dim mb-2">
                  {g.category} · {g.readTime}
                </div>
                <h2 className="font-display text-xl md:text-2xl font-medium mb-2">{g.title}</h2>
                <p className="text-dim text-sm leading-relaxed">{g.excerpt}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
