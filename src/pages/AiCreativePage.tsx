import { Link } from "react-router-dom"
import { useSubServices, useFaqGroups } from "@/hooks/useContent"
import { useProjects } from "@/hooks/useProjects"
import { useDocumentMeta } from "@/hooks/useDocumentMeta"
import { useWhatsAppMessage } from "@/hooks/useWhatsAppMessage"
import { Reveal } from "@/components/Reveal"
import { AutoVideo } from "@/components/AutoVideo"
import { Breadcrumbs } from "@/components/Breadcrumbs"

const SITE = "https://madebyraz.co.il"

// Authority page for the head term "קריאייטיב AI".
//
// Deliberately not a second copy of /services/ai-content: that hub is the
// service catalogue ("here is what you can order"), this answers "who does AI
// creative and can they actually do it" and links down into the hub. Two pages
// on one topic only work if they answer different questions, otherwise they
// compete with each other in search.
//
// All content is pulled from the same Supabase tables the rest of the site
// uses, so nothing here can drift from or contradict the service pages.
export function AiCreativePage() {
  const { subServices } = useSubServices("ai-content")
  const { projects } = useProjects()
  const { faqGroups } = useFaqGroups()

  useDocumentMeta(
    "קריאייטיב AI למותגים · RAZ",
    "קריאייטיב AI לעסקים ומותגים: פרסומות, סרטוני מוצר, ויז'ואלים לקמפיינים וצילום AI. בימוי קריאייטיבי מקצה לקצה, בלי יום צילום."
  )
  useWhatsAppMessage("היי, אני מתעניין בקריאייטיב AI למותג שלי.")

  const aiProjects = projects.filter((p) => p.project_type === "ai")
  const faq = faqGroups.find((g) => g.title.includes("AI"))?.items ?? []

  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "קריאייטיב AI למותגים",
    serviceType: "AI Creative",
    description:
      "קריאייטיב AI לעסקים ומותגים: פרסומות, סרטוני מוצר, ויז'ואלים לקמפיינים, תוכן לרשתות וצילום AI.",
    provider: { "@type": "Person", name: "Raz Avramov", url: SITE },
    areaServed: "IL",
    url: `${SITE}/ai-creative`,
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "קריאייטיב AI",
      itemListElement: subServices.map((s) => ({
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: s.title, description: s.tagline },
      })),
    },
  }

  const faqJsonLd = faq.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faq.map((item) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: { "@type": "Answer", text: item.a },
        })),
      }
    : null

  return (
    <>
      <script type="application/ld+json">{JSON.stringify(serviceJsonLd)}</script>
      {faqJsonLd && <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>}

      <section className="relative min-h-[80dvh] overflow-hidden flex flex-col justify-center pt-24">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-[#141412] via-[#0b0b0b] to-black" />
          <AutoVideo
            src="/videos/raz-showreel-5.mp4"
            className="absolute inset-0 w-full h-full object-cover opacity-30 contrast-[1.05] brightness-[0.85]"
          />
        </div>
        <div className="container">
          <Breadcrumbs items={[{ label: "בית", to: "/" }, { label: "קריאייטיב AI" }]} />
          <Reveal>
            <h1 className="font-display font-black text-[clamp(36px,6.6vw,80px)] leading-[1.05] tracking-tight max-w-3xl">
              קריאייטיב AI למותגים שרוצים להיראות אחרת.
            </h1>
          </Reveal>
          <Reveal delay={100}>
            <p className="mt-6 text-lg text-dim leading-relaxed max-w-2xl">
              פרסומות, סרטוני מוצר, ויז'ואלים לקמפיינים וצילום מוצר, שנוצרים בעזרת AI תחת בימוי
              קריאייטיבי. לא ניסויים עם כלים, תוכן שנראה כמו קמפיין אמיתי.
            </p>
          </Reveal>
          <Reveal delay={160} className="mt-8">
            <Link
              to="/contact"
              className="inline-block font-mono text-sm font-bold uppercase tracking-wide bg-[#D1FE17] text-black rounded-full px-7 py-3.5 hover:scale-105 transition-transform"
            >
              בואו נדבר ←
            </Link>
          </Reveal>
        </div>
      </section>

      <section className="py-16 border-t border-white/10">
        <div className="container">
          <Reveal className="font-mono text-xs uppercase tracking-wide text-dim mb-3">מה זה כולל</Reveal>
          <Reveal delay={60}>
            <p className="text-dim text-base leading-relaxed max-w-2xl mb-10">
              הקריאייטיב הוא מה שמחליט אם עוצרים על המודעה או גוללים הלאה. אלה התחומים שאני מפיק בהם
              תוכן, כל אחד עם עמוד משלו.
            </p>
          </Reveal>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
            {subServices.map((s, i) => (
              <Reveal key={s.slug} delay={Math.min(i * 40, 240)}>
                <Link
                  to={`/services/${s.hub_slug}/${s.slug}`}
                  className="group block relative aspect-square rounded-sm overflow-hidden bg-neutral-900"
                >
                  {s.hero_video && (
                    <AutoVideo
                      src={s.hero_video}
                      className="absolute inset-0 w-full h-full object-cover contrast-[1.05] brightness-[0.8] transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
                  <div className="absolute bottom-4 right-4 left-4">
                    <div className="font-display font-medium text-lg text-white">{s.title}</div>
                    <div className="font-mono text-[11px] uppercase tracking-wide text-white/60 mt-1">
                      {s.tagline}
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
          <Reveal delay={120} className="mt-8">
            <Link
              to="/services/ai-content"
              className="font-mono text-xs uppercase tracking-wide underline underline-offset-4 hover:text-[#D1FE17] transition-colors"
            >
              לכל שירותי יצירת התוכן ב-AI ←
            </Link>
          </Reveal>
        </div>
      </section>

      {aiProjects.length > 0 && (
        <section className="py-16 border-t border-white/10">
          <div className="container">
            <Reveal className="font-mono text-xs uppercase tracking-wide text-dim mb-8">עבודות AI</Reveal>
            <div className="grid md:grid-cols-3 gap-4">
              {aiProjects.slice(0, 6).map((p, i) => (
                <Reveal key={p.slug} delay={Math.min(i * 60, 240)}>
                  <Link
                    to={`/work/${p.slug}`}
                    className="block relative aspect-[4/5] rounded-sm overflow-hidden bg-neutral-900 group"
                  >
                    {p.video && (
                      <AutoVideo
                        src={p.video}
                        className="absolute inset-0 w-full h-full object-cover contrast-[1.05] brightness-[0.85] transition-transform duration-500 group-hover:scale-105"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <div className="absolute bottom-4 right-4 left-4">
                      <div className="font-display font-medium text-white">{p.title}</div>
                      <div className="font-mono text-[11px] uppercase tracking-wide text-white/60 mt-1">
                        {p.category}
                      </div>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {faq.length > 0 && (
        <section className="py-16 border-t border-white/10">
          <div className="container max-w-3xl">
            <Reveal className="font-mono text-xs uppercase tracking-wide text-dim mb-8">שאלות נפוצות</Reveal>
            <div className="flex flex-col gap-6">
              {faq.map((item, i) => (
                <Reveal key={item.q} delay={Math.min(i * 50, 200)}>
                  <h2 className="font-display font-medium text-lg mb-2">{item.q}</h2>
                  <p className="text-dim leading-relaxed">{item.a}</p>
                </Reveal>
              ))}
            </div>
            <Reveal delay={120} className="mt-8">
              <Link
                to="/faq"
                className="font-mono text-xs uppercase tracking-wide underline underline-offset-4 hover:text-[#D1FE17] transition-colors"
              >
                לכל השאלות והתשובות ←
              </Link>
            </Reveal>
          </div>
        </section>
      )}

      <section className="py-16 border-t border-white/10 text-center">
        <div className="container">
          <Reveal>
            <h2 className="font-display font-bold text-[clamp(30px,4.6vw,54px)] leading-[1.15] tracking-[-0.04em] text-gradient-accent text-shimmer max-w-xl mx-auto mb-8">
              יש לכם רעיון לקמפיין? בואו נהפוך אותו לתוכן.
            </h2>
          </Reveal>
          <Reveal delay={80}>
            <Link
              to="/contact"
              className="inline-block font-mono text-sm font-bold uppercase tracking-wide bg-[#D1FE17] text-black rounded-full px-7 py-3.5 hover:scale-105 transition-transform"
            >
              בואו נדבר ←
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  )
}
