import { useId, useState } from "react"
import { Link } from "react-router-dom"
import { useFaqHub } from "@/hooks/useContent"
import { useDocumentMeta } from "@/hooks/useDocumentMeta"
import { useHreflang } from "@/hooks/useHreflang"
import { useWhatsAppMessage } from "@/hooks/useWhatsAppMessage"
import { Reveal } from "@/components/Reveal"
import { PageHeader } from "@/components/PageHeader"
import { cn } from "@/lib/utils"

function FaqItem({ q, a, source, sourceHref }: { q: string; a: string; source?: string; sourceHref?: string }) {
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
        <span className={cn("font-mono text-xl transition-transform flex-none", open && "rotate-45")}>
          +
        </span>
      </button>
      <div
        id={id}
        role="region"
        aria-hidden={!open}
        className={cn("grid transition-all duration-300", open ? "grid-rows-[1fr] mt-4" : "grid-rows-[0fr]")}
      >
        <div className="overflow-hidden">
          <p className="text-dim text-base leading-relaxed max-w-2xl">{a}</p>
          {source && sourceHref && (
            <Link to={sourceHref} className="inline-block mt-3 font-mono text-[11px] uppercase tracking-wide underline underline-offset-4 text-dim hover:text-[#D1FE17]">
              עוד על {source} ←
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

export function Faq() {
  useDocumentMeta(
    "שאלות ותשובות · RAZ",
    "כל השאלות והתשובות באתר במקום אחד: בניית אתרים, WordPress, איקומרס, תוכן AI, תהליך עבודה ומחירים."
  )
  useHreflang("/faq", "/en/faq")
  useWhatsAppMessage("היי, יש לי שאלה שלא מצאתי עליה תשובה ב-FAQ.")
  const [serviceSlug, setServiceSlug] = useState<string | "הכל">("הכל")
  const { faqHub, subServices } = useFaqHub()

  const filtered = serviceSlug === "הכל" ? faqHub : faqHub.filter((f) => f.serviceSlug === serviceSlug)

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqHub.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  }

  return (
    <>
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      <PageHeader
        breadcrumbs={[{ label: "בית", to: "/" }, { label: "שאלות ותשובות" }]}
        eyebrow="( שאלות ותשובות )"
        title={<>שאלות שאנשים שואלים<br />לפני שהם כותבים לי.</>}
      />
      <section className="pb-28 md:pb-40">
      <div className="container">
        <Reveal delay={80} className="flex flex-wrap gap-2 mt-4">
          <button
            onClick={() => setServiceSlug("הכל")}
            className={cn(
              "font-mono text-[10px] font-bold uppercase tracking-wide rounded-full px-4 py-2 border transition-colors",
              serviceSlug === "הכל" ? "border-[#D1FE17] bg-[#D1FE17] text-black" : "border-white/15 text-dim hover:border-[#D1FE17]"
            )}
          >
            הכל
          </button>
          {subServices.map((s) => (
            <button
              key={s.slug}
              onClick={() => setServiceSlug(s.slug)}
              className={cn(
                "font-mono text-[10px] font-bold uppercase tracking-wide rounded-full px-4 py-2 border transition-colors",
                serviceSlug === s.slug ? "border-[#D1FE17] bg-[#D1FE17] text-black" : "border-white/15 text-dim hover:border-[#D1FE17]"
              )}
            >
              {s.title}
            </button>
          ))}
        </Reveal>

        <div key={serviceSlug} className="mt-12 max-w-3xl animate-[fadeIn_0.3s_ease]">
          {filtered.map((f) => (
            <FaqItem key={f.q} q={f.q} a={f.a} source={f.source} sourceHref={f.sourceHref} />
          ))}
          {filtered.length === 0 && <p className="text-dim text-sm">אין שאלות בנושא הזה עדיין.</p>}
        </div>
      </div>
      </section>
    </>
  )
}
