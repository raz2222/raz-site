import { useId, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { useFaqHub, FAQ_TOPICS, type FaqTopic } from "@/hooks/useContent"
import { useDocumentMeta } from "@/hooks/useDocumentMeta"
import { useWhatsAppMessage } from "@/hooks/useWhatsAppMessage"
import { Reveal } from "@/components/Reveal"
import { Breadcrumbs } from "@/components/Breadcrumbs"
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
        className="w-full flex items-center justify-between text-right gap-6"
      >
        <span className="font-display text-lg md:text-xl font-medium">{q}</span>
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
  useWhatsAppMessage("היי, יש לי שאלה שלא מצאתי עליה תשובה ב-FAQ.")
  const [topic, setTopic] = useState<FaqTopic | "הכל">("הכל")
  const { faqHub } = useFaqHub()

  const usedTopics = useMemo(() => {
    const used = new Set(faqHub.map((f) => f.topic))
    return FAQ_TOPICS.filter((t) => used.has(t))
  }, [])

  const filtered = topic === "הכל" ? faqHub : faqHub.filter((f) => f.topic === topic)

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
    <section className="pt-32 pb-28 md:pt-40 md:pb-40">
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      <div className="container">
        <Breadcrumbs items={[{ label: "בית", to: "/" }, { label: "שאלות ותשובות" }]} />
        <Reveal className="font-mono text-xs uppercase tracking-wide text-dim mb-4">
          ( שאלות ותשובות )
        </Reveal>
        <Reveal>
          <h1 className="font-display font-medium text-[clamp(28px,4.6vw,54px)] leading-[1.15] tracking-tight">
            שאלות שאנשים שואלים
            <br />
            לפני שהם כותבים לי.
          </h1>
        </Reveal>

        <Reveal delay={80} className="flex flex-wrap gap-2 mt-10">
          <button
            onClick={() => setTopic("הכל")}
            className={cn(
              "font-mono text-xs uppercase tracking-wide rounded-full px-4 py-2 border transition-colors",
              topic === "הכל" ? "border-[#D1FE17] bg-[#D1FE17] text-black" : "border-white/15 text-dim hover:border-[#D1FE17]"
            )}
          >
            הכל
          </button>
          {usedTopics.map((t) => (
            <button
              key={t}
              onClick={() => setTopic(t)}
              className={cn(
                "font-mono text-xs uppercase tracking-wide rounded-full px-4 py-2 border transition-colors",
                topic === t ? "border-[#D1FE17] bg-[#D1FE17] text-black" : "border-white/15 text-dim hover:border-[#D1FE17]"
              )}
            >
              {t}
            </button>
          ))}
        </Reveal>

        <div key={topic} className="mt-12 max-w-3xl animate-[fadeIn_0.3s_ease]">
          {filtered.map((f) => (
            <FaqItem key={f.q} q={f.q} a={f.a} source={f.source} sourceHref={f.sourceHref} />
          ))}
          {filtered.length === 0 && <p className="text-dim text-sm">אין שאלות בנושא הזה עדיין.</p>}
        </div>
      </div>
    </section>
  )
}
