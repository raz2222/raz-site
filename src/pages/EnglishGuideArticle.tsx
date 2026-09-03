import { useEffect } from "react"
import { Link, useParams } from "react-router-dom"
import { publishedGuidesEn } from "@/lib/guidesEn"
import { useDocumentMeta } from "@/hooks/useDocumentMeta"
import { useHreflang } from "@/hooks/useHreflang"
import { useWhatsAppMessage } from "@/hooks/useWhatsAppMessage"
import { Reveal } from "@/components/Reveal"
import { AutoVideo } from "@/components/AutoVideo"
import { Breadcrumbs } from "@/components/Breadcrumbs"
import { RichParagraph } from "@/components/RichParagraph"

const SERVICE_LABEL_EN: Record<string, string> = {
  "web-design": "Web Design",
  "ai-content": "AI Content",
}

export function EnglishGuideArticle() {
  const { slug } = useParams()
  const publishedGuides = publishedGuidesEn()
  const guide = publishedGuides.find((g) => g.slug === slug)

  useDocumentMeta(guide ? `${guide.title} · RAZ` : "Guide · RAZ", guide?.excerpt, guide?.heroImage ?? guide?.image, guide?.datePublished)
  useHreflang(`/guides/${slug}`, `/en/guides/${slug}`)
  useWhatsAppMessage(guide ? `Hi, I read the article "${guide.title}" and wanted to ask something.` : undefined)

  useEffect(() => {
    document.documentElement.lang = "en"
    document.documentElement.dir = "ltr"
    return () => {
      document.documentElement.lang = "he"
      document.documentElement.dir = "rtl"
    }
  }, [])

  if (!guide) {
    return (
      <div dir="ltr" className="pt-40 pb-40 container text-left">
        <p className="font-mono text-sm text-dim uppercase">Guide not found.</p>
        <Link to="/en/guides" className="inline-block mt-6 underline underline-offset-4 text-sm hover:text-[#D1FE17] transition-colors">
          ← Back to guides
        </Link>
      </div>
    )
  }

  const currentIndex = publishedGuides.findIndex((g) => g.slug === guide.slug)
  const next = publishedGuides[(currentIndex + 1) % publishedGuides.length]
  const related = [1, 2, 3].map((offset) => publishedGuides[(currentIndex + offset) % publishedGuides.length])
  const relatedServiceLabel = guide.relatedServiceSlug ? SERVICE_LABEL_EN[guide.relatedServiceSlug] : undefined

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.title,
    description: guide.excerpt,
    image: `https://madebyraz.co.il${guide.heroImage ?? guide.image}`,
    datePublished: guide.datePublished,
    dateModified: guide.datePublished,
    author: { "@type": "Person", name: "Raz Avramov" },
    publisher: { "@type": "Person", name: "Raz Avramov" },
    mainEntityOfPage: `https://madebyraz.co.il/en/guides/${guide.slug}`,
    inLanguage: "en",
  }

  return (
    <>
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      <section dir="ltr" className="relative overflow-hidden pt-32 pb-16 md:pt-40 md:pb-20 text-left">
        <div className="absolute inset-0" aria-hidden="true">
          {guide.heroVideo ? (
            <AutoVideo
              src={guide.heroVideo}
              poster={guide.heroImage ?? guide.image}
              className="w-full h-full object-cover contrast-[1.05] brightness-[0.45]"
            />
          ) : (
            <img src={guide.heroImage ?? guide.image} alt="" className="w-full h-full object-cover brightness-[0.45]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/85 to-background/50" />
        </div>

        <div className="relative container text-left">
          <Breadcrumbs
            items={[
              { label: "Home", to: "/en" },
              { label: "Guides", to: "/en/guides" },
              { label: guide.title },
            ]}
            className="mb-4"
          />
          <Reveal delay={40} className="font-mono text-xs uppercase tracking-wide text-dim mb-4">
            {guide.category} · {guide.readTime} · {new Date(guide.datePublished).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })}
          </Reveal>
          <Reveal delay={70}>
            <h1 className="font-display font-black text-[clamp(32px,5.2vw,62px)] leading-[1.1] tracking-tight">
              {guide.title}
            </h1>
          </Reveal>
          <Reveal delay={110} className="mt-5 text-dim text-base md:text-lg leading-relaxed max-w-2xl">
            {guide.excerpt}
          </Reveal>
        </div>
      </section>

      {guide.sections.length > 1 && (
        <section dir="ltr" className="pt-10 md:pt-14 text-left">
          <div className="container max-w-3xl">
            <nav aria-label="Table of contents" className="surface-raised rounded-lg p-6">
              <div className="font-mono text-xs uppercase tracking-wide text-dim mb-4">Table of contents</div>
              <ol className="flex flex-col gap-2.5">
                {guide.sections.map((s, i) => (
                  <li key={s.heading}>
                    <a href={`#section-${i}`} className="text-[#D1FE17] hover:opacity-70 transition-opacity text-sm md:text-base">
                      {i + 1}. {s.heading}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </div>
        </section>
      )}

      <section dir="ltr" className="py-16 md:py-20 text-left">
        <div className="container max-w-3xl flex flex-col gap-14">
          {guide.sections.map((s, i) => (
            <Reveal key={s.heading} delay={i * 30} className="border-t border-white/10 pt-8">
              <h2 id={`section-${i}`} className="font-display font-medium text-xl md:text-2xl mb-4 text-[#D1FE17] scroll-mt-28">{s.heading}</h2>
              <div className="flex flex-col gap-4">
                {s.paragraphs.map((p, j) => (
                  <p key={j} className="text-base md:text-lg leading-relaxed text-foreground/85">
                    <RichParagraph text={p} />
                  </p>
                ))}
              </div>
              {s.image && (
                <div className="mt-2 rounded-lg overflow-hidden border border-white/10">
                  <img src={s.image} alt={s.heading} className="w-full h-auto object-cover" loading="lazy" />
                </div>
              )}
            </Reveal>
          ))}

          {relatedServiceLabel && (
            <Reveal className="border-t border-white/10 pt-8">
              <Link
                to="/en/services"
                className="block border border-white/15 rounded-lg p-6 hover:border-[#D1FE17] hover:bg-white/[0.02] transition-colors"
              >
                <div className="font-mono text-xs uppercase tracking-wide text-dim mb-2">Related service</div>
                <div className="font-display font-medium text-xl mb-2">{relatedServiceLabel} →</div>
              </Link>
            </Reveal>
          )}

          <Reveal className="border-t border-white/10 pt-10 text-center">
            <div className="border border-white/15 rounded-lg p-8 md:p-10 bg-white/[0.02]">
              <p className="font-display text-xl md:text-2xl font-light mb-6 max-w-lg mx-auto">
                Ready to take the next step? Let's talk about your project.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link
                  to="/en/contact"
                  className="inline-block font-mono text-[10px] font-bold uppercase tracking-wide bg-[#D1FE17] text-black rounded-full px-6 py-3 hover:scale-105 transition-transform"
                >
                  Get a quote →
                </Link>
                <Link
                  to="/en/work"
                  className="inline-block font-mono text-[10px] font-bold uppercase tracking-wide border border-white/30 rounded-full px-6 py-3 hover:border-[#D1FE17] transition-colors"
                >
                  View my work
                </Link>
              </div>
            </div>
          </Reveal>

          <Reveal className="border-t border-white/10 pt-8">
            <div className="font-mono text-xs uppercase tracking-wide text-dim mb-6">More articles you might like</div>
            <div className="grid sm:grid-cols-3 gap-4">
              {related.map((g) => (
                <Link
                  key={g.slug}
                  to={`/en/guides/${g.slug}`}
                  className="block border border-white/15 rounded-lg p-5 hover:border-[#D1FE17] hover:bg-white/[0.02] transition-colors"
                >
                  <div className="font-mono text-[10px] uppercase tracking-wide text-dim mb-2">{g.category}</div>
                  <div className="font-display font-medium text-base mb-2 leading-snug">{g.title}</div>
                  <div className="text-dim text-xs leading-relaxed line-clamp-3 mb-3">{g.excerpt}</div>
                  <div className="font-mono text-[10px] uppercase tracking-wide text-dim">{g.readTime}</div>
                </Link>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <Link
        to={`/en/guides/${next.slug}`}
        dir="ltr"
        className="block border-t border-white/10 py-16 md:py-24 hover:bg-white/[0.02] transition-colors text-left"
      >
        <div className="container max-w-3xl">
          <div className="font-mono text-xs uppercase tracking-wide text-dim mb-3">Next guide</div>
          <div className="font-display font-medium text-2xl md:text-4xl">{next.title} →</div>
        </div>
      </Link>
    </>
  )
}
