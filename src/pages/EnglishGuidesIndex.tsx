import { useEffect } from "react"
import { Link } from "react-router-dom"
import { guidesEn } from "@/lib/guidesEn"
import { useDocumentMeta } from "@/hooks/useDocumentMeta"
import { useHreflang } from "@/hooks/useHreflang"
import { AutoVideo } from "@/components/AutoVideo"
import { Breadcrumbs } from "@/components/Breadcrumbs"
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

  const today = new Date().toISOString().slice(0, 10)
  const publishedGuides = guidesEn
    .filter((g) => g.datePublished <= today)
    .sort((a, b) => (a.datePublished < b.datePublished ? 1 : a.datePublished > b.datePublished ? -1 : 0))

  return (
    <>
      <section dir="ltr" className="relative overflow-hidden pt-32 pb-16 md:pt-40 md:pb-20 text-left">
        <div className="absolute inset-0" aria-hidden="true">
          <AutoVideo
            src="/videos/raz-showreel.mp4"
            className="w-full h-full object-cover contrast-[1.05] brightness-[0.45]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/85 to-background/50" />
        </div>

        <div className="relative container text-left">
          <Breadcrumbs items={[{ label: "Home", to: "/en" }, { label: "Guides" }]} className="mb-4" />
          <Reveal delay={40} className="font-mono text-xs uppercase tracking-wide text-dim mb-4">
            ( Guides )
          </Reveal>
          <Reveal delay={70}>
            <h1 className="font-display font-black text-[clamp(32px,5.2vw,62px)] leading-[1.1] tracking-tight">
              Content that gives real answers,
              <br />
              not just keywords.
            </h1>
          </Reveal>
        </div>
      </section>
      <section dir="ltr" className="pb-28 md:pb-40 text-left">
        <div className="container">
          <div className="mt-4 grid gap-4 max-w-3xl">
            {publishedGuides.map((g) => (
              <Link
                key={g.slug}
                to={`/en/guides/${g.slug}`}
                className="flex gap-5 items-stretch border border-white/10 rounded-lg p-6 hover:border-[#D1FE17] hover:bg-white/[0.02] transition-colors duration-200"
              >
                {(g.heroImage || g.image) && (
                  <div className="hidden sm:block shrink-0 w-32 aspect-video rounded-sm overflow-hidden bg-neutral-900">
                    <img src={g.heroImage ?? g.image} alt={g.title} loading="lazy" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="min-w-0">
                  <div className="font-mono text-[11px] uppercase tracking-wide text-dim mb-2">
                    {g.category} · {g.readTime} · {new Date(g.datePublished).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })}
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
