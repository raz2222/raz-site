import { Link } from "react-router-dom"
import { useSubServices, useFaqGroups } from "@/hooks/useContent"
import { useProjects } from "@/hooks/useProjects"
import { useSiteContent } from "@/hooks/useSiteContent"
import { useDocumentMeta } from "@/hooks/useDocumentMeta"
import { useWhatsAppMessage } from "@/hooks/useWhatsAppMessage"
import { PROFILE_DEFAULT } from "@/lib/siteContentDefaults"
import { Reveal } from "@/components/Reveal"
import { AutoVideo } from "@/components/AutoVideo"
import { Breadcrumbs } from "@/components/Breadcrumbs"

const SITE = "https://madebyraz.co.il"

// Authority page for the head terms around "בניית אתרים" / "פיתוח אתרים".
//
// Covers design and development together, because that pairing is the actual
// differentiator: most listings are either a designer who hands off a file or a
// developer who needs one. /services/web-design stays the service catalogue;
// this page answers "who builds it and what can they actually build".
//
// Everything renders from the live Supabase content and the shared profile, so
// it stays in sync with the rest of the site on its own.
export function WebDevelopmentPage() {
  const { subServices } = useSubServices("web-design")
  const { projects } = useProjects()
  const { faqGroups } = useFaqGroups()
  const { content: profile } = useSiteContent("shared_profile", PROFILE_DEFAULT)

  useDocumentMeta(
    "בניית ופיתוח אתרים · RAZ",
    "עיצוב ופיתוח אתרים לעסקים: WordPress, איקומרס, דפי נחיתה ופיתוח מותאם אישית ב-React ו-Next.js. מעל 200 אתרים."
  )
  useWhatsAppMessage("היי, אני מתעניין בבניית אתר.")

  const webProjects = projects.filter((p) => p.project_type === "website")
  const faq = faqGroups.find((g) => g.title.includes("אתרים"))?.items ?? []

  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "בניית ופיתוח אתרים",
    serviceType: "Web Design and Development",
    description:
      "עיצוב ופיתוח אתרים לעסקים: WordPress, איקומרס, דפי נחיתה, אתרים אינטראקטיביים ופיתוח מותאם אישית.",
    provider: { "@type": "Person", name: "Raz Avramov", url: SITE },
    areaServed: "IL",
    url: `${SITE}/web-development`,
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "בניית ופיתוח אתרים",
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
            src="/videos/raz-showreel-7.mp4"
            className="absolute inset-0 w-full h-full object-cover opacity-30 contrast-[1.05] brightness-[0.85]"
          />
        </div>
        <div className="container">
          <Breadcrumbs items={[{ label: "בית", to: "/" }, { label: "בניית ופיתוח אתרים" }]} />
          <Reveal>
            <h1 className="font-display font-black text-[clamp(36px,6.6vw,80px)] leading-[1.05] tracking-tight max-w-3xl">
              בניית אתרים שגם מעוצבים וגם נבנים כמו שצריך.
            </h1>
          </Reveal>
          <Reveal delay={100}>
            <p className="mt-6 text-lg text-dim leading-relaxed max-w-2xl">
              עיצוב ופיתוח באותן ידיים, מ-WordPress ואיקומרס ועד קוד מותאם אישית. בלי מסירה באמצע
              שבה העיצוב אומר דבר אחד והמימוש יוצא דבר אחר.
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
          <Reveal className="font-mono text-xs uppercase tracking-wide text-dim mb-3">מה אפשר לבנות</Reveal>
          <Reveal delay={60}>
            <p className="text-dim text-base leading-relaxed max-w-2xl mb-10">
              הכלי נבחר לפי מה שהפרויקט צריך, לא לפי מה שנוח לי. אתר שצריך ניהול תוכן גמיש מקבל
              WordPress, אתר שצריך ביצועים ואינטראקטיביות מקבל קוד.
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
              to="/services/web-design"
              className="font-mono text-xs uppercase tracking-wide underline underline-offset-4 hover:text-[#D1FE17] transition-colors"
            >
              לכל שירותי בניית האתרים ←
            </Link>
          </Reveal>
        </div>
      </section>

      <section className="py-16 border-t border-white/10">
        <div className="container">
          <Reveal className="font-mono text-xs uppercase tracking-wide text-dim mb-8">
            עיצוב · פיתוח · הכלים
          </Reveal>
          <div className="grid md:grid-cols-2 gap-10">
            <Reveal>
              <h2 className="font-display font-medium text-xl mb-4">מה אני עושה</h2>
              <div className="flex flex-wrap gap-2">
                {profile.capabilities.map((c) => (
                  <span key={c} className="border border-white/15 rounded-full px-3 py-1 text-xs text-dim">
                    {c}
                  </span>
                ))}
              </div>
            </Reveal>
            <Reveal delay={80}>
              <h2 className="font-display font-medium text-xl mb-4">במה אני עובד</h2>
              <div className="flex flex-wrap gap-2">
                {profile.tools.map((t) => (
                  <span key={t} className="border border-white/15 rounded-full px-3 py-1 text-xs text-dim">
                    {t}
                  </span>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {webProjects.length > 0 && (
        <section className="py-16 border-t border-white/10">
          <div className="container">
            <Reveal className="font-mono text-xs uppercase tracking-wide text-dim mb-8">עבודות</Reveal>
            <div className="grid md:grid-cols-3 gap-4">
              {webProjects.slice(0, 6).map((p, i) => (
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
            <Reveal delay={120} className="mt-8">
              <Link
                to="/work"
                className="font-mono text-xs uppercase tracking-wide underline underline-offset-4 hover:text-[#D1FE17] transition-colors"
              >
                לכל העבודות ←
              </Link>
            </Reveal>
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
              יש לכם פרויקט? בואו נבנה אותו.
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
