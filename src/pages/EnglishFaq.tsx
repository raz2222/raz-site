import { useEffect, useState } from "react"
import { useDocumentMeta } from "@/hooks/useDocumentMeta"
import { useHreflang } from "@/hooks/useHreflang"
import { Reveal } from "@/components/Reveal"
import { cn } from "@/lib/utils"

const FAQ_GROUPS = [
  {
    title: "Websites & Development",
    items: [
      {
        q: "How long does it take to build a website?",
        a: "Depends on scope — a landing page can be ready within a few days, a full multi-page site usually takes a few weeks. I give a clear timeline for every project after a brief call.",
      },
      {
        q: "WordPress or custom development — which is better?",
        a: "There's no single answer. WordPress fits when you need independent content-management flexibility. Custom development (React / Next.js) fits when you need performance, interactive experiences, or something that doesn't exist as a template. I choose based on the project, not on my favorite tool.",
      },
      {
        q: "I already have an old WordPress site — can I upgrade without starting from scratch?",
        a: "Yes. A big part of my work is exactly this — redesign, performance upgrades, and even moving to a more modern stack, without the business having to start over.",
      },
      {
        q: "Do you use AI to build websites?",
        a: "Yes, as part of the workflow — not as a replacement for it. AI accelerates development and code, but design decisions and final quality are always under human control.",
      },
    ],
  },
  {
    title: "Visuals & AI Content",
    items: [
      {
        q: "How does an AI video actually replace a shoot day?",
        a: "Instead of coordinating a location, crew and equipment for a full day, the work happens with dedicated AI tools — building a concept, creating consistent assets (character, product, location) and producing the scenes around them. The result can look cinematic at the same level, at a fraction of the time and cost.",
      },
      {
        q: "Doesn't it look artificial?",
        a: "It depends entirely on the work invested. A proper process (character/product consistency, lighting, film grain, editing) is the difference between content that looks like an AI experiment and content that looks like real production. That's exactly the job.",
      },
      {
        q: "Can this be used for a real business ad?",
        a: "Yes — ads, product films, social content and full campaigns. I'm always clear about which projects are commissioned work and which are self-initiated concept pieces.",
      },
      {
        q: "What about copyright and real brands?",
        a: "I don't produce content that uses real brands or intellectual property without permission — not even as portfolio examples. Concept work is built with fictional brands and characters.",
      },
    ],
  },
]

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-white/10 py-6">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full flex items-center justify-between text-left gap-6 group"
      >
        <span className="font-display text-lg md:text-xl font-medium group-hover:text-[#D1FE17] transition-colors">{q}</span>
        <span className={cn("font-mono text-xl transition-transform flex-none", open && "rotate-45")}>+</span>
      </button>
      <div className={cn("grid transition-all duration-300", open ? "grid-rows-[1fr] mt-4" : "grid-rows-[0fr]")}>
        <div className="overflow-hidden">
          <p className="text-dim text-base leading-relaxed max-w-2xl">{a}</p>
        </div>
      </div>
    </div>
  )
}

export function EnglishFaq() {
  useDocumentMeta(
    "FAQ — RAZ",
    "Frequently asked questions about website development, WordPress, custom development, and AI content production for businesses."
  )
  useHreflang("/faq", "/en/faq")

  useEffect(() => {
    document.documentElement.lang = "en"
    document.documentElement.dir = "ltr"
    return () => {
      document.documentElement.lang = "he"
      document.documentElement.dir = "rtl"
    }
  }, [])

  return (
    <section dir="ltr" className="pt-32 pb-28 md:pt-40 md:pb-40 text-left">
      <div className="container">
        <Reveal className="font-mono text-xs uppercase tracking-wide text-dim mb-4">( FAQ )</Reveal>
        <Reveal>
          <h1 className="font-display font-medium text-[clamp(32px,5.2vw,62px)] leading-[1.15] tracking-tight">
            Questions people ask
            <br />
            before they write to me.
          </h1>
        </Reveal>

        <div className="mt-16 flex flex-col gap-16 max-w-3xl">
          {FAQ_GROUPS.map((group) => (
            <div key={group.title}>
              <h2 className="font-mono text-xs uppercase tracking-wide text-dim mb-2">{group.title}</h2>
              <div>
                {group.items.map((item) => (
                  <FaqItem key={item.q} q={item.q} a={item.a} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
