import { Link, useParams } from "react-router-dom"
import { useGuides, useServiceHubs } from "@/hooks/useContent"
import { useDocumentMeta } from "@/hooks/useDocumentMeta"
import { useHreflang } from "@/hooks/useHreflang"
import { useWhatsAppMessage } from "@/hooks/useWhatsAppMessage"
import { useContactModal } from "@/hooks/useContactModal"
import { Reveal } from "@/components/Reveal"
import { RichParagraph } from "@/components/RichParagraph"
import { PageHeader } from "@/components/PageHeader"

export function GuideArticle() {
  const { slug } = useParams()
  const { guides, loading } = useGuides()
  const { serviceHubs } = useServiceHubs()
  const { openModal } = useContactModal()
  const guide = guides.find((g) => g.slug === slug)

  useDocumentMeta(
    guide ? `${guide.title} — RAZ` : "מדריך — RAZ",
    guide?.excerpt,
    guide?.hero_image ?? guide?.image ?? undefined,
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
    image: guide.hero_image
      ? `https://madebyraz.co.il${guide.hero_image}`
      : guide.image
        ? `https://madebyraz.co.il${guide.image}`
        : undefined,
    datePublished: guide.date_published,
    dateModified: guide.date_published,
    author: { "@type": "Person", name: "Raz Avramov" },
    publisher: { "@type": "Person", name: "Raz Avramov" },
    mainEntityOfPage: `https://madebyraz.co.il/guides/${guide.slug}`,
    inLanguage: "he",
  }

  return (
    <>
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      <PageHeader
        breadcrumbs={[
          { label: "בית", to: "/" },
          { label: "מדריכים", to: "/guides" },
          { label: guide.title },
        ]}
        eyebrow={`${guide.category} · ${guide.read_time} · ${new Date(guide.date_published).toLocaleDateString("he-IL", { day: "numeric", month: "long", year: "numeric" })}`}
        title={guide.title}
        subtitle={guide.excerpt}
        video={guide.hero_video ?? null}
        image={guide.hero_image ?? guide.image ?? undefined}
      />

      {guide.sections.length > 1 && (
        <section className="pt-10 md:pt-14">
          <div className="container max-w-3xl">
            <nav aria-label="תוכן העניינים" className="surface-raised rounded-lg p-6">
              <div className="font-mono text-xs uppercase tracking-wide text-dim mb-4">תוכן העניינים</div>
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

      <section className="py-16 md:py-20">
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
                <button
                  onClick={() => openModal()}
                  className="inline-block font-mono text-[10px] font-bold uppercase tracking-wide bg-[#D1FE17] text-black rounded-full px-6 py-3 hover:scale-105 transition-transform"
                >
                  קבלו הצעת מחיר ←
                </button>
                <Link
                  to="/work"
                  className="inline-block font-mono text-[10px] font-bold uppercase tracking-wide border border-white/30 rounded-full px-6 py-3 hover:border-[#D1FE17] transition-colors"
                >
                  צפו בעבודות שלי
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
