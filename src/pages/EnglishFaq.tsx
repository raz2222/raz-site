import { useEffect, useId, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { useDocumentMeta } from "@/hooks/useDocumentMeta"
import { useHreflang } from "@/hooks/useHreflang"
import { Reveal } from "@/components/Reveal"
import { AutoVideo } from "@/components/AutoVideo"
import { Breadcrumbs } from "@/components/Breadcrumbs"
import { SUB_SERVICES_EN } from "@/lib/servicesEn"
import { cn } from "@/lib/utils"

type EnFaqItem = { q: string; a: string; serviceSlug?: string; serviceTitle?: string; sourceHref?: string }

const GENERAL_EN_FAQ: EnFaqItem[] = [
  {
    q: "How long does it take to build a website?",
    a: "Depends on scope: a landing page can be ready within a few days, a full multi-page site usually takes a few weeks. I give a clear timeline for every project after a brief call.",
  },
  {
    q: "WordPress or custom development: which is better?",
    a: "There's no single answer. WordPress fits when you need independent content-management flexibility. Custom development (React / Next.js) fits when you need performance, interactive experiences, or something that doesn't exist as a template. I choose based on the project, not on my favorite tool.",
  },
  {
    q: "Do you use AI to build websites?",
    a: "Yes, as part of the workflow, not as a replacement for it. AI accelerates development and code, but design decisions and final quality are always under human control.",
  },
  {
    q: "How does an AI video actually replace a shoot day?",
    a: "Instead of coordinating a location, crew and equipment for a full day, the work happens with dedicated AI tools: building a concept, creating consistent assets (character, product, location) and producing the scenes around them. The result can look cinematic at the same level, at a fraction of the time and cost.",
  },
  {
    q: "Doesn't it look artificial?",
    a: "It depends entirely on the work invested. A proper process (character/product consistency, lighting, film grain, editing) is the difference between content that looks like an AI experiment and content that looks like real production. That's exactly the job.",
  },
  {
    q: "Can this be used for a real business ad?",
    a: "Yes: ads, product films, social content and full campaigns. I'm always clear about which projects are commissioned work and which are self-initiated concept pieces.",
  },
  {
    q: "What about copyright and real brands?",
    a: "I don't produce content that uses real brands or intellectual property without permission, not even as portfolio examples. Concept work is built with fictional brands and characters.",
  },
  {
    q: "Are there monthly content packages?",
    a: "Yes, a fixed monthly scope can be agreed on: more efficient than one-off projects.",
  },
  {
    q: "How much content can you produce in a month?",
    a: "Depends on the agreed scope, but AI enables a meaningfully higher output pace than traditional production.",
  },
]

function useEnFaq() {
  return useMemo(() => {
    const services = [...SUB_SERVICES_EN]
    const items: EnFaqItem[] = [
      ...GENERAL_EN_FAQ,
      ...services.flatMap((s) =>
        s.faq.map((f) => ({
          q: f.q,
          a: f.a,
          serviceSlug: s.slug,
          serviceTitle: s.title,
          sourceHref: `/en/services/${s.hubSlug}/${s.slug}`,
        }))
      ),
    ]
    return { items, services }
  }, [])
}

function EnglishFaqItem({ q, a, source, sourceHref }: { q: string; a: string; source?: string; sourceHref?: string }) {
  const [open, setOpen] = useState(false)
  const id = useId()
  return (
    <div className="border-b border-white/10 py-6">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={id}
        className="w-full flex items-center justify-between text-left gap-6 group"
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
          {source && sourceHref && (
            <Link to={sourceHref} className="inline-block mt-3 font-mono text-[11px] uppercase tracking-wide underline underline-offset-4 text-dim hover:text-[#D1FE17]">
              More about {source} →
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

export function EnglishFaq() {
  useDocumentMeta(
    "FAQ · RAZ",
    "Frequently asked questions about website development, WordPress, custom development, and AI content production for businesses."
  )
  useHreflang("/faq", "/en/faq")
  const [serviceSlug, setServiceSlug] = useState<string | "All">("All")
  const { items, services } = useEnFaq()

  useEffect(() => {
    document.documentElement.lang = "en"
    document.documentElement.dir = "ltr"
    return () => {
      document.documentElement.lang = "he"
      document.documentElement.dir = "rtl"
    }
  }, [])

  const filtered = useMemo(
    () => (serviceSlug === "All" ? items : items.filter((f) => f.serviceSlug === serviceSlug)),
    [items, serviceSlug]
  )

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  }

  return (
    <div dir="ltr">
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      <section className="relative overflow-hidden pt-32 pb-16 md:pt-40 md:pb-20">
        <div className="absolute inset-0" aria-hidden="true">
          <AutoVideo src="/videos/raz-showreel.mp4" className="w-full h-full object-cover contrast-[1.05] brightness-[0.45]" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/85 to-background/50" />
        </div>
        <div className="relative container text-left">
          <Breadcrumbs items={[{ label: "Home", to: "/en" }, { label: "FAQ" }]} className="mb-4" />
          <Reveal delay={40} className="font-mono text-xs uppercase tracking-wide text-dim mb-4">( FAQ )</Reveal>
          <Reveal delay={70}>
            <h1 className="font-display font-black text-[clamp(32px,5.2vw,62px)] leading-[1.1] tracking-tight">
              Questions people ask
              <br />
              before they write to me.
            </h1>
          </Reveal>
        </div>
      </section>

      <section className="pb-28 md:pb-40 text-left">
        <div className="container">
          <Reveal delay={80} className="flex flex-wrap gap-2 mt-4">
            <button
              onClick={() => setServiceSlug("All")}
              className={cn(
                "font-mono text-[10px] font-bold uppercase tracking-wide rounded-full px-4 py-2 border transition-colors",
                serviceSlug === "All" ? "border-[#D1FE17] bg-[#D1FE17] text-black" : "border-white/15 text-dim hover:border-[#D1FE17]"
              )}
            >
              All
            </button>
            {services.map((s) => (
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
              <EnglishFaqItem key={f.q} q={f.q} a={f.a} source={f.serviceTitle} sourceHref={f.sourceHref} />
            ))}
            {filtered.length === 0 && <p className="text-dim text-sm">No questions in this topic yet.</p>}
          </div>
        </div>
      </section>
    </div>
  )
}
