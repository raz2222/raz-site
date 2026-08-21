import { useEffect, useId, useMemo, useState } from "react"
import { useDocumentMeta } from "@/hooks/useDocumentMeta"
import { useHreflang } from "@/hooks/useHreflang"
import { Reveal } from "@/components/Reveal"
import { AutoVideo } from "@/components/AutoVideo"
import { Breadcrumbs } from "@/components/Breadcrumbs"
import { cn } from "@/lib/utils"

type EnTopic = "Websites" | "Design" | "WordPress" | "E-commerce" | "AI" | "AI Videos" | "AI Photography" | "Process" | "Pricing"

const EN_TOPICS: EnTopic[] = ["Websites", "Design", "WordPress", "E-commerce", "AI", "AI Videos", "AI Photography", "Process", "Pricing"]

type EnFaqItem = { q: string; a: string; topic: EnTopic }

const EN_FAQ: EnFaqItem[] = [
  {
    topic: "Process",
    q: "How long does it take to build a website?",
    a: "Depends on scope — a landing page can be ready within a few days, a full multi-page site usually takes a few weeks. I give a clear timeline for every project after a brief call.",
  },
  {
    topic: "Websites",
    q: "WordPress or custom development — which is better?",
    a: "There's no single answer. WordPress fits when you need independent content-management flexibility. Custom development (React / Next.js) fits when you need performance, interactive experiences, or something that doesn't exist as a template. I choose based on the project, not on my favorite tool.",
  },
  {
    topic: "Websites",
    q: "I already have an old WordPress site — can I upgrade without starting from scratch?",
    a: "Yes. A big part of my work is exactly this — redesign, performance upgrades, and even moving to a more modern stack, without the business having to start over.",
  },
  {
    topic: "Websites",
    q: "Do you use AI to build websites?",
    a: "Yes, as part of the workflow — not as a replacement for it. AI accelerates development and code, but design decisions and final quality are always under human control.",
  },
  {
    topic: "AI",
    q: "How does an AI video actually replace a shoot day?",
    a: "Instead of coordinating a location, crew and equipment for a full day, the work happens with dedicated AI tools — building a concept, creating consistent assets (character, product, location) and producing the scenes around them. The result can look cinematic at the same level, at a fraction of the time and cost.",
  },
  {
    topic: "AI",
    q: "Doesn't it look artificial?",
    a: "It depends entirely on the work invested. A proper process (character/product consistency, lighting, film grain, editing) is the difference between content that looks like an AI experiment and content that looks like real production. That's exactly the job.",
  },
  {
    topic: "AI",
    q: "Can this be used for a real business ad?",
    a: "Yes — ads, product films, social content and full campaigns. I'm always clear about which projects are commissioned work and which are self-initiated concept pieces.",
  },
  {
    topic: "AI",
    q: "What about copyright and real brands?",
    a: "I don't produce content that uses real brands or intellectual property without permission — not even as portfolio examples. Concept work is built with fictional brands and characters.",
  },
  {
    topic: "AI Videos",
    q: "Do you need the physical product?",
    a: "No — good quality product photos are enough as a starting point.",
  },
  {
    topic: "Process",
    q: "How long does a product video take?",
    a: "Usually a few days, depending on complexity and how many versions are needed.",
  },
  {
    topic: "AI Videos",
    q: "How many variations can you produce for a campaign?",
    a: "AI makes it possible to produce a significant number of versions quickly — set based on the specific campaign's needs.",
  },
  {
    topic: "AI Videos",
    q: "Does this work for a brand with an existing visual identity?",
    a: "Yes, the existing direction is used as the base for the new material rather than starting from zero.",
  },
  {
    topic: "AI",
    q: "Are there monthly content packages?",
    a: "Yes, a fixed monthly scope can be agreed on — more efficient than one-off projects.",
  },
  {
    topic: "AI",
    q: "How much content can you produce in a month?",
    a: "Depends on the agreed scope, but AI enables a meaningfully higher output pace than traditional production.",
  },
  {
    topic: "AI Photography",
    q: "Can you change the background of an existing photo?",
    a: "Yes, that's one of the most common uses — same product, new background.",
  },
  {
    topic: "AI Photography",
    q: "Do you need a professional photo as the base image?",
    a: "A clear, good-quality photo significantly improves the result, but it doesn't need to be a full studio shoot.",
  },
  {
    topic: "AI",
    q: "Is creative direction a separate service from the content production itself?",
    a: "It's usually an integral part of every project, not a separate add-on — it's the layer that makes sure the result is actually good.",
  },
  {
    topic: "AI",
    q: "Is concept development a separate paid stage?",
    a: "Usually it's part of the overall project process, not a separate service — unless it's concept consulting alone.",
  },
  {
    topic: "AI",
    q: "Can I get just the concept, without production afterward?",
    a: "Yes, you can commission just the concept-development stage if that's what you need.",
  },
  {
    topic: "Process",
    q: "How long does a full website design take?",
    a: "2–4 weeks on average, depending on the number of pages and rounds of feedback.",
  },
  {
    topic: "Design",
    q: "Do you use ready-made templates?",
    a: "Not as a starting point. Templates are, at most, a technical reference — never the final design.",
  },
  {
    topic: "Design",
    q: "Can I see a few directions before choosing one?",
    a: "Yes, that's a standard part of the process — 2–3 directions before going deeper into one.",
  },
  {
    topic: "Design",
    q: "Will the design work on mobile too?",
    a: "Yes, every page is designed for desktop and mobile in parallel, not just checked at the end.",
  },
  {
    topic: "Design",
    q: "Doesn't this hurt site speed?",
    a: "If built correctly — no. The code is written and tested for performance, not just visual effect.",
  },
  {
    topic: "Design",
    q: "Can this be added to a site I already have?",
    a: "Yes, absolutely — targeted creative development can be added to an existing site.",
  },
  {
    topic: "Design",
    q: "Can I see examples?",
    a: "Yes, the work page has several projects with full creative development.",
  },
  {
    topic: "Websites",
    q: "Is an interactive site more expensive than a regular one?",
    a: "Depends on the complexity of the logic — something relatively simple (a basic calculator) isn't meaningfully different in price from a regular page.",
  },
  {
    topic: "Websites",
    q: "Does it need special maintenance?",
    a: "If the logic is stable, no. If it depends on changing data, it's worth planning content updates in advance.",
  },
  {
    topic: "E-commerce",
    q: "WooCommerce or custom development?",
    a: "WooCommerce fits most cases and gives management flexibility. Custom development matters when you need performance or logic that doesn't exist as a plugin.",
  },
  {
    topic: "E-commerce",
    q: "How many products can you manage?",
    a: "From a few dozen up to large catalogs, with the right planning in advance.",
  },
  {
    topic: "E-commerce",
    q: "Which payment providers are supported?",
    a: "Most of the common Israeli payment providers, through the appropriate integrations.",
  },
  {
    topic: "Process",
    q: "How long does it take to build a landing page?",
    a: "Usually 2–4 working days from a locked brief.",
  },
  {
    topic: "Websites",
    q: "Can I test a few versions?",
    a: "Yes — that's exactly one of the advantages of a focused landing page, it's easy to produce variations and test them.",
  },
  {
    topic: "Pricing",
    q: "How much does it cost?",
    a: "There's a detailed pricing guide on the site — a landing page is usually the cheapest and fastest project.",
  },
  {
    topic: "WordPress",
    q: "Why WordPress and not custom development?",
    a: "When you need ongoing management independence without depending on a developer, WordPress is the right choice.",
  },
  {
    topic: "WordPress",
    q: "What about Elementor Pro?",
    a: "Included when the project needs a Theme Builder, advanced forms, or consistent templates across the site.",
  },
  {
    topic: "WordPress",
    q: "Can you upgrade an existing WordPress site?",
    a: "Yes, that's a big part of the work — upgrading without rebuilding from scratch.",
  },
  {
    topic: "Websites",
    q: "Is custom development more expensive than WordPress?",
    a: "Depends on scope — simple projects are similarly priced, more complex ones cost more depending on the flexibility required.",
  },
  {
    topic: "Websites",
    q: "What is \"vibe coding\"?",
    a: "Working with AI tools that write code from a natural-language description, under a developer's review and control throughout the process.",
  },
  {
    topic: "Websites",
    q: "Can someone else continue developing it later?",
    a: "Yes — it's regular code any developer can keep working on, not a closed proprietary platform.",
  },
  {
    topic: "AI",
    q: "Is it expensive to run?",
    a: "The API cost for most use cases is relatively low for a mid-sized business — checked and priced in advance.",
  },
  {
    topic: "AI",
    q: "Can this be added to a site I already have?",
    a: "Yes, absolutely — AI features can be added to an existing site without rebuilding it.",
  },
]

function EnglishFaqItem({ q, a }: { q: string; a: string }) {
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
  const [topic, setTopic] = useState<EnTopic | "All">("All")

  useEffect(() => {
    document.documentElement.lang = "en"
    document.documentElement.dir = "ltr"
    return () => {
      document.documentElement.lang = "he"
      document.documentElement.dir = "rtl"
    }
  }, [])

  const filtered = useMemo(() => (topic === "All" ? EN_FAQ : EN_FAQ.filter((f) => f.topic === topic)), [topic])

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: EN_FAQ.map((f) => ({
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
              onClick={() => setTopic("All")}
              className={cn(
                "font-mono text-[10px] font-bold uppercase tracking-wide rounded-full px-4 py-2 border transition-colors",
                topic === "All" ? "border-[#D1FE17] bg-[#D1FE17] text-black" : "border-white/15 text-dim hover:border-[#D1FE17]"
              )}
            >
              All
            </button>
            {EN_TOPICS.map((t) => (
              <button
                key={t}
                onClick={() => setTopic(t)}
                className={cn(
                  "font-mono text-[10px] font-bold uppercase tracking-wide rounded-full px-4 py-2 border transition-colors",
                  topic === t ? "border-[#D1FE17] bg-[#D1FE17] text-black" : "border-white/15 text-dim hover:border-[#D1FE17]"
                )}
              >
                {t}
              </button>
            ))}
          </Reveal>

          <div key={topic} className="mt-12 max-w-3xl animate-[fadeIn_0.3s_ease]">
            {filtered.map((f) => (
              <EnglishFaqItem key={f.q} q={f.q} a={f.a} />
            ))}
            {filtered.length === 0 && <p className="text-dim text-sm">No questions in this topic yet.</p>}
          </div>
        </div>
      </section>
    </div>
  )
}
