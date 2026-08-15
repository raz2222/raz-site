import { useId, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { services } from "@/lib/services"
import { useDocumentMeta } from "@/hooks/useDocumentMeta"
import { Reveal } from "@/components/Reveal"
import { cn } from "@/lib/utils"

function SubFaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  const id = useId()
  return (
    <div className="border-b border-white/10 py-4">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={id}
        className="w-full flex items-center justify-between text-right gap-6"
      >
        <span className="font-display text-base md:text-lg font-medium">{q}</span>
        <span className={cn("font-mono text-lg transition-transform flex-none", open && "rotate-45")}>+</span>
      </button>
      <div id={id} role="region" aria-hidden={!open} className={cn("grid transition-all duration-300", open ? "grid-rows-[1fr] mt-3" : "grid-rows-[0fr]")}>
        <div className="overflow-hidden">
          <p className="text-dim text-sm leading-relaxed max-w-2xl">{a}</p>
        </div>
      </div>
    </div>
  )
}

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

export function ServiceDetail() {
  const { slug } = useParams()
  const service = services.find((s) => s.slug === slug)
  const others = services.filter((s) => s.slug !== slug)

  useDocumentMeta(
    service ? `${service.title} — RAZ` : "שירות — RAZ",
    service?.heroDescription
  )

  if (!service) {
    return (
      <div className="pt-40 pb-40 container">
        <p className="font-mono text-sm text-dim uppercase">השירות לא נמצא.</p>
        <Link to="/services" className="inline-block mt-6 underline underline-offset-4 text-sm">
          → חזרה לשירותים
        </Link>
      </div>
    )
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: service.subServices.flatMap((s) =>
      s.faq.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      }))
    ),
  }

  return (
    <>
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>

      <section className="pt-32 pb-16 md:pt-40">
        <div className="container">
          <Reveal className="font-mono text-xs uppercase tracking-wide text-dim mb-4">
            <Link to="/services" className="hover:text-foreground transition-colors">שירותים</Link> / {service.navTitle}
          </Reveal>
          <Reveal>
            <h1 className="font-display font-bold text-[clamp(30px,5.5vw,64px)] leading-[1.1] tracking-tight max-w-3xl">
              {service.title}
            </h1>
          </Reveal>
          <Reveal delay={100}>
            <p className="mt-6 text-xl md:text-2xl font-display font-light text-foreground/85 max-w-2xl">
              {service.tagline}
            </p>
          </Reveal>
          <Reveal delay={160}>
            <p className="mt-6 text-base md:text-lg text-dim leading-relaxed max-w-2xl">
              {service.heroDescription}
            </p>
          </Reveal>
          <Reveal delay={220} className="mt-8">
            <PrimaryCta to="/contact">{service.ctaLabel} ←</PrimaryCta>
          </Reveal>
        </div>
      </section>

      <section className="py-16 border-t border-white/10">
        <div className="container grid md:grid-cols-2 gap-14">
          <Reveal>
            <h2 className="font-mono text-xs uppercase tracking-wide text-dim mb-4">למי זה מתאים</h2>
            <ul className="flex flex-col gap-3">
              {service.whoFor.map((w) => (
                <li key={w} className="flex items-start gap-3 text-base leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D1FE17] flex-none mt-2.5" />
                  {w}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="font-mono text-xs uppercase tracking-wide text-dim mb-4">איזו בעיה זה פותר</h2>
            <p className="text-base leading-relaxed text-foreground/85">{service.problem}</p>
          </Reveal>
        </div>
      </section>

      <section className="py-16 border-t border-white/10">
        <div className="container">
          <Reveal className="font-mono text-xs uppercase tracking-wide text-dim mb-6">מה מקבלים בפועל</Reveal>
          <div className="grid md:grid-cols-2 gap-4">
            {service.deliverables.map((d, i) => (
              <Reveal key={d} delay={i * 40} className="border border-white/15 rounded-lg p-5 text-base leading-relaxed">
                {d}
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 border-t border-white/10">
        <div className="container">
          <Reveal className="font-mono text-xs uppercase tracking-wide text-dim mb-10">תהליך העבודה</Reveal>
          <div className="flex flex-col gap-8">
            {service.process.map((p, i) => (
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

      <section className="py-20 border-t border-white/10 bg-white/[0.015]">
        <div className="container text-center">
          <Reveal>
            <p className="font-display text-2xl md:text-3xl font-light mb-6 max-w-2xl mx-auto">
              יש לכם פרויקט ב{service.navTitle}?
            </p>
          </Reveal>
          <Reveal delay={80}>
            <PrimaryCta to="/contact">{service.ctaLabel} ←</PrimaryCta>
          </Reveal>
        </div>
      </section>

      <section className="py-16 border-t border-white/10">
        <div className="container">
          <Reveal className="font-mono text-xs uppercase tracking-wide text-dim mb-10">מה כולל השירות — פירוט מלא</Reveal>
          <div className="flex flex-col gap-16">
            {service.subServices.map((sub, i) => (
              <Reveal key={sub.title} delay={Math.min(i * 20, 200)} className="border-t border-white/10 pt-10">
                <h3 className="font-display font-medium text-xl md:text-2xl mb-3">{sub.title}</h3>
                <p className="text-base leading-relaxed text-foreground/80 max-w-2xl mb-6">{sub.description}</p>
                <div className="max-w-2xl">
                  {sub.faq.map((f) => (
                    <SubFaqItem key={f.q} q={f.q} a={f.a} />
                  ))}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 border-t border-white/10">
        <div className="container">
          <Reveal className="font-mono text-xs uppercase tracking-wide text-dim mb-4">עוד עבודות</Reveal>
          <Reveal delay={60} className="flex items-center gap-6">
            <Link
              to="/work"
              className="font-display text-2xl md:text-3xl font-medium hover:opacity-70 transition-opacity"
            >
              לצפייה בכל הפרויקטים ←
            </Link>
          </Reveal>
        </div>
      </section>

      <section className="py-20 border-t border-white/10 text-center">
        <div className="container">
          <Reveal>
            <h2 className="font-display font-bold text-[clamp(26px,4.4vw,48px)] leading-[1.15] tracking-tight max-w-xl mx-auto mb-8">
              בואו נדבר על הפרויקט שלכם.
            </h2>
          </Reveal>
          <Reveal delay={80}>
            <PrimaryCta to="/contact">{service.ctaLabel} ←</PrimaryCta>
          </Reveal>
        </div>
      </section>

      {others.length > 0 && (
        <section className="py-16 border-t border-white/10">
          <div className="container">
            <Reveal className="font-mono text-xs uppercase tracking-wide text-dim mb-6">שירותים משלימים</Reveal>
            <div className="grid md:grid-cols-2 gap-4">
              {others.map((s) => (
                <Link
                  key={s.slug}
                  to={`/services/${s.slug}`}
                  className="block border border-white/15 rounded-lg p-6 hover:border-white/30 hover:bg-white/[0.02] transition-colors"
                >
                  <div className="font-display font-medium text-lg mb-2">{s.navTitle}</div>
                  <div className="text-dim text-sm">{s.tagline}</div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  )
}
