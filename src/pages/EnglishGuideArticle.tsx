import { useEffect } from "react"
import { Link, useParams } from "react-router-dom"
import { guidesEn } from "@/lib/guidesEn"
import { useDocumentMeta } from "@/hooks/useDocumentMeta"
import { useHreflang } from "@/hooks/useHreflang"
import { useWhatsAppMessage } from "@/hooks/useWhatsAppMessage"
import { Reveal } from "@/components/Reveal"
import { AutoVideo } from "@/components/AutoVideo"
import { RichParagraph } from "@/components/RichParagraph"

const SERVICE_LABEL_EN: Record<string, string> = {
  "web-design": "Web Design",
  "ai-content": "AI Content",
}

export function EnglishGuideArticle() {
  const { slug } = useParams()
  const today = new Date().toISOString().slice(0, 10)
  const publishedGuides = guidesEn.filter((g) => g.datePublished <= today)
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

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://madebyraz.co.il/en" },
      { "@type": "ListItem", position: 2, name: "Guides", item: "https://madebyraz.co.il/en/guides" },
      { "@type": "ListItem", position: 3, name: guide.title, item: `https://madebyraz.co.il/en/guides/${guide.slug}` },
    ],
  }

  return (
    <>
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      <script type="application/ld+json">{JSON.stringify(breadcrumbLd)}</script>
      <section dir="ltr" className="pt-32 pb-10 md:pt-40 text-left">
        <div className="container max-w-3xl">
          <Reveal className="font-mono text-xs uppercase tracking-wide text-dim mb-6 flex items-center gap-2 flex-wrap">
            <Link to="/en" className="hover:text-[#D1FE17] transition-colors">Home</Link>
            <span>›</span>
            <Link to="/en/guides" className="hover:text-[#D1FE17] transition-colors">Guides</Link>
            <span>›</span>
            <span className="text-foreground/70">{guide.category}</span>
          </Reveal>
          <Reveal className="font-mono text-xs uppercase tracking-wide text-dim mb-4">
            {guide.category} · {guide.readTime} · {new Date(guide.datePublished).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })}
          </Reveal>
          <Reveal>
            <h1 className="font-display font-black text-[clamp(28px,5vw,52px)] leading-[1.1] tracking-tight">
              {guide.title}
            </h1>
          </Reveal>
          <Reveal delay={100} className="mt-6 text-lg text-dim leading-relaxed">
            {guide.excerpt}
          </Reveal>
        </div>
      </section>

      {guide.heroVideo ? (
        <Reveal delay={150} className="container max-w-3xl mt-10">
          <div className="relative aspect-video rounded-sm overflow-hidden bg-neutral-900">
            <AutoVideo src={guide.heroVideo} poster={guide.heroImage ?? guide.image} className="absolute inset-0 w-full h-full object-cover contrast-[1.05] brightness-[0.9]" />
          </div>
        </Reveal>
      ) : guide.heroImage || guide.image ? (
        <Reveal delay={150} className="container max-w-3xl mt-10">
          <div className="relative aspect-video rounded-sm overflow-hidden bg-neutral-900">
            <img src={guide.heroImage ?? guide.image} alt={guide.title} className="absolute inset-0 w-full h-full object-cover" />
          </div>
        </Reveal>
      ) : null}

      <section dir="ltr" className="py-16 md:py-20 text-left">
        <div className="container max-w-3xl flex flex-col gap-14">
          {guide.sections.map((s, i) => (
            <Reveal key={s.heading} delay={i * 30} className="border-t border-white/10 pt-8">
              <h2 className="font-display font-medium text-xl md:text-2xl mb-4">{s.heading}</h2>
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
                  className="inline-block font-mono text-sm uppercase tracking-wide bg-[#D1FE17] text-black rounded-full px-6 py-3 hover:scale-105 transition-transform"
                >
                  Get a quote →
                </Link>
                <Link
                  to="/en/work"
                  className="inline-block font-mono text-sm uppercase tracking-wide border border-white/30 rounded-full px-6 py-3 hover:border-[#D1FE17] transition-colors"
                >
                  View our work
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
