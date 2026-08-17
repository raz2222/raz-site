import { Link, useParams } from "react-router-dom"
import { useGuides, useServiceHubs } from "@/hooks/useContent"
import { useDocumentMeta } from "@/hooks/useDocumentMeta"
import { useHreflang } from "@/hooks/useHreflang"
import { useWhatsAppMessage } from "@/hooks/useWhatsAppMessage"
import { Reveal } from "@/components/Reveal"
import { AutoVideo } from "@/components/AutoVideo"
import { RichParagraph } from "@/components/RichParagraph"

export function GuideArticle() {
  const { slug } = useParams()
  const { guides, loading } = useGuides()
  const { serviceHubs } = useServiceHubs()
  const guide = guides.find((g) => g.slug === slug)

  useDocumentMeta(
    guide ? `${guide.title} — RAZ` : "מדריך — RAZ",
    guide?.excerpt,
    guide?.image ?? undefined,
    guide?.date_published
  )
  useHreflang(`/guides/${slug}`, `/en/guides/${slug}`)
  useWhatsAppMessage(guide ? `היי, קראתי את הכתבה "${guide.title}" ורציתי לשאול משהו.` : undefined)

  if (loading) {
    return <div className="pt-40 pb-40 container font-mono text-xs text-dim uppercase">טוען…</div>
  }

  if (!guide) {
    return (
      <div className="pt-40 pb-40 container">
        <p className="font-mono text-sm text-dim uppercase">המדריך לא נמצא.</p>
        <Link to="/guides" className="inline-block mt-6 underline underline-offset-4 text-sm hover:text-[#D1FE17] transition-colors">
          → חזרה למדריכים
        </Link>
      </div>
    )
  }

  const currentIndex = guides.findIndex((g) => g.slug === guide.slug)
  const next = guides[(currentIndex + 1) % guides.length]
  const related = [1, 2, 3].map((offset) => guides[(currentIndex + offset) % guides.length])
  const relatedService = serviceHubs.find((s) => s.slug === guide.related_service_slug)

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.title,
    description: guide.excerpt,
    image: guide.image ? `https://madebyraz.co.il${guide.image}` : undefined,
    datePublished: guide.date_published,
    dateModified: guide.date_published,
    author: { "@type": "Person", name: "Raz Avramov" },
    publisher: { "@type": "Person", name: "Raz Avramov" },
    mainEntityOfPage: `https://madebyraz.co.il/guides/${guide.slug}`,
    inLanguage: "he",
  }

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "עמוד הבית", item: "https://madebyraz.co.il/" },
      { "@type": "ListItem", position: 2, name: "מדריכים", item: "https://madebyraz.co.il/guides" },
      { "@type": "ListItem", position: 3, name: guide.title, item: `https://madebyraz.co.il/guides/${guide.slug}` },
    ],
  }

  return (
    <>
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      <script type="application/ld+json">{JSON.stringify(breadcrumbLd)}</script>
      <section className="pt-32 pb-10 md:pt-40">
        <div className="container max-w-3xl">
          <Reveal className="font-mono text-xs uppercase tracking-wide text-dim mb-6 flex items-center gap-2 flex-wrap">
            <Link to="/" className="hover:text-[#D1FE17] transition-colors">עמוד הבית</Link>
            <span>›</span>
            <Link to="/guides" className="hover:text-[#D1FE17] transition-colors">מדריכים</Link>
            <span>›</span>
            <span className="text-foreground/70">{guide.category}</span>
          </Reveal>
          <Reveal className="font-mono text-xs uppercase tracking-wide text-dim mb-4">
            {guide.category} · {guide.read_time}
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

      {guide.hero_video ? (
        <Reveal delay={150} className="container max-w-3xl mt-10">
          <div className="relative aspect-video rounded-sm overflow-hidden bg-neutral-900">
            <AutoVideo src={guide.hero_video} poster={guide.image ?? undefined} className="absolute inset-0 w-full h-full object-cover contrast-[1.05] brightness-[0.9]" />
          </div>
        </Reveal>
      ) : guide.image ? (
        <Reveal delay={150} className="container max-w-3xl mt-10">
          <div className="relative aspect-video rounded-sm overflow-hidden bg-neutral-900">
            <img src={guide.image} alt={guide.title} className="absolute inset-0 w-full h-full object-cover" />
          </div>
        </Reveal>
      ) : null}

      <section className="py-16 md:py-20">
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

          {relatedService && (
            <Reveal className="border-t border-white/10 pt-8">
              <Link
                to={`/services/${relatedService.slug}`}
                className="block border border-white/15 rounded-lg p-6 hover:border-[#D1FE17] hover:bg-white/[0.02] transition-colors"
              >
                <div className="font-mono text-xs uppercase tracking-wide text-dim mb-2">שירות רלוונטי</div>
                <div className="font-display font-medium text-xl mb-2">{relatedService.title} ←</div>
                <div className="text-dim text-sm">{relatedService.tagline}</div>
              </Link>
            </Reveal>
          )}

          <Reveal className="border-t border-white/10 pt-10 text-center">
            <div className="border border-white/15 rounded-lg p-8 md:p-10 bg-white/[0.02]">
              <p className="font-display text-xl md:text-2xl font-light mb-6 max-w-lg mx-auto">
                מוכנים לקחת את זה לשלב הבא? בואו נדבר על הפרויקט שלכם.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link
                  to="/contact"
                  className="inline-block font-mono text-sm uppercase tracking-wide bg-[#D1FE17] text-black rounded-full px-6 py-3 hover:scale-105 transition-transform"
                >
                  קבלו הצעת מחיר ←
                </Link>
                <Link
                  to="/work"
                  className="inline-block font-mono text-sm uppercase tracking-wide border border-white/30 rounded-full px-6 py-3 hover:border-[#D1FE17] transition-colors"
                >
                  צפו בעבודות שלנו
                </Link>
              </div>
            </div>
          </Reveal>

          <Reveal className="border-t border-white/10 pt-8">
            <div className="font-mono text-xs uppercase tracking-wide text-dim mb-6">עוד מאמרים שאולי יעניינו אותך</div>
            <div className="grid sm:grid-cols-3 gap-4">
              {related.map((g) => (
                <Link
                  key={g.slug}
                  to={`/guides/${g.slug}`}
                  className="block border border-white/15 rounded-lg p-5 hover:border-[#D1FE17] hover:bg-white/[0.02] transition-colors"
                >
                  <div className="font-mono text-[10px] uppercase tracking-wide text-dim mb-2">{g.category}</div>
                  <div className="font-display font-medium text-base mb-2 leading-snug">{g.title}</div>
                  <div className="text-dim text-xs leading-relaxed line-clamp-3 mb-3">{g.excerpt}</div>
                  <div className="font-mono text-[10px] uppercase tracking-wide text-dim">{g.read_time}</div>
                </Link>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <Link
        to={`/guides/${next.slug}`}
        className="block border-t border-white/10 py-16 md:py-24 hover:bg-white/[0.02] transition-colors"
      >
        <div className="container max-w-3xl">
          <div className="font-mono text-xs uppercase tracking-wide text-dim mb-3">
            המדריך הבא
          </div>
          <div className="font-display font-medium text-2xl md:text-4xl">← {next.title}</div>
        </div>
      </Link>
    </>
  )
}
