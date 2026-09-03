import { useId, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { useSubServices, useServiceHubs } from "@/hooks/useContent"
import { useProjects } from "@/hooks/useProjects"
import { useDocumentMeta } from "@/hooks/useDocumentMeta"
import { useHreflang } from "@/hooks/useHreflang"
import { useWhatsAppMessage } from "@/hooks/useWhatsAppMessage"
import { useContactModal } from "@/hooks/useContactModal"
import { Reveal } from "@/components/Reveal"
import { PageHeader } from "@/components/PageHeader"
import { BrowserProjectCard } from "@/components/BrowserProjectCard"
import { ProjectVideoCard } from "@/components/ProjectVideoCard"
import { AutoVideo } from "@/components/AutoVideo"
import { cn } from "@/lib/utils"

function PrimaryCta({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="inline-block font-mono text-sm font-bold uppercase tracking-wide bg-[#D1FE17] text-black rounded-[8px] px-7 py-3.5 hover:scale-105 transition-transform"
    >
      {children}
    </button>
  )
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  const id = useId()
  return (
    <div className="border-b border-white/10 py-6">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={id}
        className="w-full flex items-center justify-between text-right gap-6 group"
      >
        <span className="font-display text-lg md:text-xl font-medium group-hover:text-[#D1FE17] transition-colors">{q}</span>
        <span className={cn("font-mono text-xl transition-transform flex-none", open && "rotate-45")}>+</span>
      </button>
      <div
        id={id}
        role="region"
        aria-hidden={!open}
        className={cn("grid transition-all duration-300", open ? "grid-rows-[1fr] mt-4" : "grid-rows-[0fr]")}
      >
        <div className="overflow-hidden">
          <p className="text-dim text-base leading-relaxed max-w-2xl">{a}</p>
        </div>
      </div>
    </div>
  )
}

export function SubServicePage() {
  const { hubSlug, subSlug } = useParams()
  const { subServices, loading: loadingSubs } = useSubServices()
  const { serviceHubs, loading: loadingHubs } = useServiceHubs()
  const { projects } = useProjects()
  const { openModal } = useContactModal()

  const sub = subServices.find((s) => s.hub_slug === hubSlug && s.slug === subSlug)
  const hub = serviceHubs.find((h) => h.slug === hubSlug)

  useDocumentMeta(
    sub ? sub.meta_title || `${sub.title} · RAZ` : "שירות · RAZ",
    sub?.meta_description || sub?.tagline
  )
  useHreflang(
    hubSlug && subSlug ? `/services/${hubSlug}/${subSlug}` : "/services",
    hubSlug && subSlug ? `/en/services/${hubSlug}/${subSlug}` : "/en/services"
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

      <PageHeader
        breadcrumbs={[
          { label: "בית", to: "/" },
          { label: "שירותים", to: "/services" },
          { label: hub.title, to: `/services/${hub.slug}` },
          { label: sub.title },
        ]}
        title={sub.seo_h1 || sub.title}
        subtitle={sub.tagline}
        cta={<PrimaryCta onClick={() => openModal()}>{hub.cta_label} ←</PrimaryCta>}
        video={sub.hero_video ?? null}
      />

      <section className="py-16 border-t border-white/10">
        <div className="container max-w-3xl">
          <p className="text-lg leading-relaxed text-foreground/85">{sub.explanation}</p>
        </div>
      </section>

      <section className="py-16 border-t border-white/10">
        <div className="container grid md:grid-cols-2 gap-14">
          <Reveal>
            <h2 className="font-display font-bold text-[clamp(30px,4.6vw,54px)] leading-[1.15] tracking-[-0.04em] text-gradient-accent text-shimmer mb-4">למי זה מתאים</h2>
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
            <h2 className="font-display font-bold text-[clamp(30px,4.6vw,54px)] leading-[1.15] tracking-[-0.04em] text-gradient-accent text-shimmer mb-4">איזו בעיה זה פותר</h2>
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
          <div className="relative">
            <div
              aria-hidden="true"
              className="hidden md:block absolute top-8 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D1FE17]/40 to-transparent"
            />
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8 relative">
              {sub.process.map((p, i) => (
                <Reveal key={p.title} delay={i * 90} className="group cursor-default">
                  <div className="relative z-10 inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-xl bg-[#D1FE17] text-black font-display font-black text-2xl md:text-3xl mb-5 transition-transform duration-300 ease-out group-hover:scale-110 group-hover:-rotate-3">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <div className="font-display font-bold text-xl mb-2 transition-colors duration-200 group-hover:text-[#D1FE17]">{p.title}</div>
                  <p className="text-dim text-sm leading-relaxed">{p.text}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 border-t border-white/10">
        <div className="container grid md:grid-cols-2 gap-14">
          <Reveal>
            <h2 className="font-display font-bold text-[clamp(30px,4.6vw,54px)] leading-[1.15] tracking-[-0.04em] text-gradient-accent text-shimmer mb-4">מה מקבלים</h2>
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
            <h2 className="font-display font-bold text-[clamp(30px,4.6vw,54px)] leading-[1.15] tracking-[-0.04em] text-gradient-accent text-shimmer mb-4">מתי משתמשים בזה</h2>
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

      <section className="relative overflow-hidden py-20 border-t border-white/10 text-center">
        {sub.hero_video && (
          <div className="absolute inset-0" aria-hidden="true">
            <AutoVideo src={sub.hero_video} className="w-full h-full object-cover contrast-[1.05] brightness-[0.4]" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/85 to-background/60" />
          </div>
        )}
        <div className="relative container">
          <Reveal>
            <p className="font-display text-2xl md:text-3xl font-light mb-6 max-w-2xl mx-auto">
              יש לכם פרויקט ב{sub.title}?
            </p>
          </Reveal>
          <Reveal delay={80}><PrimaryCta onClick={() => openModal()}>{hub.cta_label} ←</PrimaryCta></Reveal>
        </div>
      </section>

      <section className="py-16 border-t border-white/10">
        <div className="container">
          <Reveal className="font-mono text-xs uppercase tracking-wide text-dim mb-10">שאלות ותשובות</Reveal>
          <div className="max-w-2xl">
            {sub.faq.map((f) => (
              <FaqItem key={f.q} q={f.q} a={f.a} />
            ))}
          </div>
        </div>
      </section>

      {sub.related_guide_slug && (
        <section className="py-16 border-t border-white/10">
          <div className="container">
            <Link
              to={`/guides/${sub.related_guide_slug}`}
              className="inline-flex items-center justify-center w-full sm:w-fit font-mono text-sm font-bold uppercase tracking-wide bg-[#D1FE17] text-black rounded-[8px] px-6 py-3 hover:scale-105 transition-transform"
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

      {(() => {
        const relevantType = hub.slug === "web-design" ? "website" : "ai"
        const relevantProjects = projects.filter((p) => p.project_type === relevantType).slice(0, 3)
        if (relevantProjects.length === 0) return null
        return (
          <section className="py-16 border-t border-white/10">
            <div className="container">
              <Reveal className="font-mono text-xs uppercase tracking-wide text-[#D1FE17] mb-6">עבודות רלוונטיות</Reveal>
              <div className={relevantType === "website" ? "grid md:grid-cols-3 gap-6" : "grid sm:grid-cols-2 md:grid-cols-3 gap-5"}>
                {relevantProjects.map((p, i) => (
                  <Reveal key={p.slug} delay={i * 60}>
                    {relevantType === "website" ? <BrowserProjectCard project={p} /> : <ProjectVideoCard project={p} />}
                  </Reveal>
                ))}
              </div>
              <Reveal delay={relevantProjects.length * 60 + 40} className="mt-8">
                <Link
                  to="/work"
                  className="inline-flex items-center justify-center w-full sm:w-fit font-mono text-sm font-bold uppercase tracking-wide bg-[#D1FE17] text-black rounded-[8px] px-6 py-3 hover:scale-105 transition-transform"
                >
                  לכל העבודות ←
                </Link>
              </Reveal>
            </div>
          </section>
        )
      })()}
    </>
  )
}
