import { Link, useParams } from "react-router-dom"
import { useSubServices, useServiceHubs } from "@/hooks/useContent"
import { useDocumentMeta } from "@/hooks/useDocumentMeta"
import { useWhatsAppMessage } from "@/hooks/useWhatsAppMessage"
import { Reveal } from "@/components/Reveal"
import { AutoVideo } from "@/components/AutoVideo"
import { Breadcrumbs } from "@/components/Breadcrumbs"

function PrimaryCta({ children, to }: { children: React.ReactNode; to: string }) {
  return (
    <Link
      to={to}
      className="inline-block font-mono text-sm uppercase tracking-wide bg-[#D1FE17] text-black rounded-full px-7 py-3.5 hover:scale-105 transition-transform"
    >
      {children}
    </Link>
  )
}

export function SubServicePage() {
  const { hubSlug, subSlug } = useParams()
  const { subServices, loading: loadingSubs } = useSubServices()
  const { serviceHubs, loading: loadingHubs } = useServiceHubs()

  const sub = subServices.find((s) => s.hub_slug === hubSlug && s.slug === subSlug)
  const hub = serviceHubs.find((h) => h.slug === hubSlug)

  useDocumentMeta(
    sub ? `${sub.title} · RAZ` : "שירות · RAZ",
    sub?.tagline
  )
  useWhatsAppMessage(sub ? `היי, אני מתעניין בשירות ${sub.title}.` : undefined)

  if (loadingSubs || loadingHubs) {
    return <div className="pt-40 pb-40 container font-mono text-xs text-dim uppercase">טוען…</div>
  }

  if (!sub || !hub) {
    return (
      <div className="pt-40 pb-40 container">
        <p className="font-mono text-sm text-dim uppercase">השירות לא נמצא.</p>
        <Link to="/services" className="inline-block mt-6 underline underline-offset-4 text-sm hover:text-[#D1FE17] transition-colors">
          → חזרה לשירותים
        </Link>
      </div>
    )
  }

  const related = subServices.filter((s) => sub.related_slugs.includes(s.slug))

  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: sub.title,
    description: sub.tagline,
    provider: { "@type": "Person", name: "Raz Avramov" },
    areaServed: "IL",
  }

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: sub.faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  }

  return (
    <>
      <script type="application/ld+json">{JSON.stringify(serviceJsonLd)}</script>
      <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>

      <section className="pt-32 pb-10 md:pt-40">
        <div className="container">
          <Breadcrumbs
            items={[
              { label: "בית", to: "/" },
              { label: "שירותים", to: "/services" },
              { label: hub.title, to: `/services/${hub.slug}` },
              { label: sub.title },
            ]}
          />
          <Reveal>
            <h1 className="font-display font-black text-[clamp(30px,5.5vw,64px)] leading-[1.1] tracking-tight max-w-3xl">
              {sub.title}
            </h1>
          </Reveal>
          <Reveal delay={100}>
            <p className="mt-6 text-xl md:text-2xl font-display font-light text-foreground/85 max-w-2xl">
              {sub.tagline}
            </p>
          </Reveal>
          <Reveal delay={160} className="mt-8">
            <PrimaryCta to="/contact">{hub.cta_label} ←</PrimaryCta>
          </Reveal>
        </div>
      </section>

      {sub.hero_video && (
        <Reveal delay={100} className="mt-10 relative aspect-video md:aspect-[21/9] overflow-hidden bg-neutral-900">
          <AutoVideo src={sub.hero_video} className="absolute inset-0 w-full h-full object-cover contrast-[1.05] brightness-[0.85]" />
        </Reveal>
      )}

      <section className="py-16 border-t border-white/10">
        <div className="container max-w-3xl">
          <p className="text-lg leading-relaxed text-foreground/85">{sub.explanation}</p>
        </div>
      </section>

      <section className="py-16 border-t border-white/10">
        <div className="container grid md:grid-cols-2 gap-14">
          <Reveal>
            <h2 className="font-mono text-xs uppercase tracking-wide text-dim mb-4">למי זה מתאים</h2>
            <ul className="flex flex-col gap-3">
              {sub.who_for.map((w) => (
                <li key={w} className="flex items-start gap-3 text-base leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D1FE17] flex-none mt-2.5" />
                  {w}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="font-mono text-xs uppercase tracking-wide text-dim mb-4">איזו בעיה זה פותר</h2>
            <p className="text-base leading-relaxed text-foreground/85">{sub.problem}</p>
          </Reveal>
        </div>
      </section>

      <section className="py-16 border-t border-white/10">
        <div className="container">
          <Reveal className="font-mono text-xs uppercase tracking-wide text-dim mb-6">יתרונות</Reveal>
          <div className="grid md:grid-cols-3 gap-4">
            {sub.benefits.map((b, i) => (
              <Reveal key={b} delay={i * 40} className="border border-white/15 rounded-lg p-5 text-base leading-relaxed">
                {b}
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 border-t border-white/10">
        <div className="container">
          <Reveal className="font-mono text-xs uppercase tracking-wide text-dim mb-10">תהליך העבודה</Reveal>
          <div className="flex flex-col gap-8">
            {sub.process.map((p, i) => (
              <Reveal key={p.title} delay={i * 60} className="grid md:grid-cols-[80px_1fr] gap-4 md:gap-10">
                <div className="font-mono text-xs text-dim">{String(i + 1).padStart(2, "0")}</div>
                <div>
                  <div className="font-display font-medium text-lg mb-1">{p.title}</div>
                  <p className="text-dim text-sm leading-relaxed max-w-xl">{p.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 border-t border-white/10">
        <div className="container grid md:grid-cols-2 gap-14">
          <Reveal>
            <h2 className="font-mono text-xs uppercase tracking-wide text-dim mb-4">מה מקבלים</h2>
            <ul className="flex flex-col gap-3">
              {sub.deliverables.map((d) => (
                <li key={d} className="flex items-start gap-3 text-base leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-foreground flex-none mt-2.5" />
                  {d}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="font-mono text-xs uppercase tracking-wide text-dim mb-4">Use Cases</h2>
            <ul className="flex flex-col gap-3">
              {sub.use_cases.map((u) => (
                <li key={u} className="flex items-start gap-3 text-base leading-relaxed text-dim">
                  <span className="w-1.5 h-1.5 rounded-full bg-white/30 flex-none mt-2.5" />
                  {u}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      <section className="py-20 border-t border-white/10 bg-white/[0.015] text-center">
        <div className="container">
          <Reveal>
            <p className="font-display text-2xl md:text-3xl font-light mb-6 max-w-2xl mx-auto">
              יש לכם פרויקט ב{sub.title}?
            </p>
          </Reveal>
          <Reveal delay={80}><PrimaryCta to="/contact">{hub.cta_label} ←</PrimaryCta></Reveal>
        </div>
      </section>

      <section className="py-16 border-t border-white/10">
        <div className="container">
          <Reveal className="font-mono text-xs uppercase tracking-wide text-dim mb-10">שאלות ותשובות</Reveal>
          <div className="max-w-2xl flex flex-col gap-6">
            {sub.faq.map((f) => (
              <Reveal key={f.q}>
                <div className="font-display font-medium text-lg mb-2">{f.q}</div>
                <p className="text-dim text-sm leading-relaxed">{f.a}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {sub.related_guide_slug && (
        <section className="py-16 border-t border-white/10">
          <div className="container">
            <Link
              to={`/guides/${sub.related_guide_slug}`}
              className="inline-block font-mono text-xs uppercase tracking-wide underline underline-offset-4 hover:text-[#D1FE17] transition-colors"
            >
              מדריך מורחב בנושא →
            </Link>
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="py-16 border-t border-white/10">
          <div className="container">
            <Reveal className="font-mono text-xs uppercase tracking-wide text-dim mb-6">שירותים קשורים</Reveal>
            <div className="grid md:grid-cols-2 gap-4">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  to={`/services/${r.hub_slug}/${r.slug}`}
                  className="block border border-white/15 rounded-lg p-6 hover:border-[#D1FE17] transition-colors"
                >
                  <div className="font-display font-medium text-lg mb-2">{r.title}</div>
                  <div className="text-dim text-sm">{r.tagline}</div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-16 border-t border-white/10">
        <div className="container">
          <Reveal className="font-mono text-xs uppercase tracking-wide text-dim mb-4">עוד עבודות</Reveal>
          <Reveal delay={60}>
            <Link to="/work" className="font-display text-2xl md:text-3xl font-medium hover:opacity-70 transition-opacity">
              לצפייה בכל הפרויקטים ←
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  )
}
