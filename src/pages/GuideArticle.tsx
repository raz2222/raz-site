import { Link, useParams } from "react-router-dom"
import { guides } from "@/lib/guides"
import { serviceHubs } from "@/lib/serviceHubs"
import { useDocumentMeta } from "@/hooks/useDocumentMeta"
import { useWhatsAppMessage } from "@/hooks/useWhatsAppMessage"
import { Reveal } from "@/components/Reveal"
import { AutoVideo } from "@/components/AutoVideo"

export function GuideArticle() {
  const { slug } = useParams()
  const guide = guides.find((g) => g.slug === slug)

  useDocumentMeta(
    guide ? `${guide.title} — RAZ` : "מדריך — RAZ",
    guide?.excerpt
  )
  useWhatsAppMessage(guide ? `היי, קראתי את הכתבה "${guide.title}" ורציתי לשאול משהו.` : undefined)

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
  const another = guides[(currentIndex + 2) % guides.length]
  const relatedService = serviceHubs.find((s) => s.slug === guide.relatedServiceSlug)

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.title,
    description: guide.excerpt,
    datePublished: guide.datePublished,
    dateModified: guide.datePublished,
    author: { "@type": "Person", name: "Raz Avramov" },
    publisher: { "@type": "Person", name: "Raz Avramov" },
    mainEntityOfPage: `https://madebyraz.co.il/guides/${guide.slug}`,
    inLanguage: "he",
  }

  return (
    <>
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      <section className="pt-32 pb-10 md:pt-40">
        <div className="container max-w-3xl">
          <Reveal className="font-mono text-xs uppercase tracking-wide text-dim mb-4">
            {guide.category} · {guide.readTime}
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

      {guide.heroVideo && (
        <Reveal delay={150} className="container max-w-3xl mt-10">
          <div className="relative aspect-video rounded-sm overflow-hidden bg-neutral-900">
            <AutoVideo src={guide.heroVideo} className="absolute inset-0 w-full h-full object-cover contrast-[1.05] brightness-[0.9]" />
          </div>
        </Reveal>
      )}

      <section className="py-16 md:py-20">
        <div className="container max-w-3xl flex flex-col gap-14">
          {guide.sections.map((s, i) => (
            <Reveal key={s.heading} delay={i * 30} className="border-t border-white/10 pt-8">
              <h2 className="font-display font-medium text-xl md:text-2xl mb-4">{s.heading}</h2>
              <div className="flex flex-col gap-4">
                {s.paragraphs.map((p, j) => (
                  <p key={j} className="text-base md:text-lg leading-relaxed text-foreground/85">
                    {p}
                  </p>
                ))}
              </div>
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

          <div className="border-t border-white/10 pt-8">
            <Link
              to="/contact"
              className="inline-block font-mono text-sm uppercase tracking-wide bg-[#D1FE17] text-black rounded-full px-6 py-3 hover:scale-105 transition-transform"
            >
              רוצים לדבר על הפרויקט שלכם? ←
            </Link>
          </div>

          <Reveal className="border-t border-white/10 pt-8">
            <div className="font-mono text-xs uppercase tracking-wide text-dim mb-4">מדריכים נוספים</div>
            <div className="grid sm:grid-cols-2 gap-3">
              {[next, another].map((g) => (
                <Link
                  key={g.slug}
                  to={`/guides/${g.slug}`}
                  className="block border border-white/15 rounded-lg p-4 hover:border-[#D1FE17] transition-colors text-sm"
                >
                  {g.title}
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
