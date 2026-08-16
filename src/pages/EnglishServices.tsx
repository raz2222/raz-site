import { useEffect } from "react"
import { Link } from "react-router-dom"
import { useDocumentMeta } from "@/hooks/useDocumentMeta"
import { Reveal } from "@/components/Reveal"

const SERVICES = [
  {
    title: "AI-Powered Websites",
    tagline: "A full website, from idea to live site, in a fraction of the traditional timeline.",
    items: ["Vibe Coding", "AI-assisted UX/UI", "Custom components & features", "Landing pages", "AI integrations", "Automations"],
  },
  {
    title: "WordPress & Elementor",
    tagline: "When content-management flexibility is what you need — the world's most proven platform, done professionally.",
    items: ["Brochure sites", "WooCommerce stores", "Custom development", "API integrations", "Performance optimization", "Ongoing maintenance"],
  },
  {
    title: "AI Creative — Content & Advertising",
    tagline: "Cinematic-quality ads, without a shoot day.",
    items: ["AI commercials", "AI UGC", "Product films", "Social creative", "Concept ads", "Campaign variations"],
  },
]

export function EnglishServices() {
  useDocumentMeta(
    "Services — RAZ",
    "AI-powered websites, WordPress & Elementor, and AI creative content production — three areas of work."
  )

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
        <Reveal className="font-mono text-xs uppercase tracking-wide text-dim mb-4">( Services )</Reveal>
        <Reveal>
          <h1 className="font-display font-medium text-[clamp(28px,4.6vw,54px)] leading-[1.15] tracking-tight max-w-2xl">
            What can we build?
          </h1>
        </Reveal>

        <div className="mt-20 flex flex-col gap-6">
          {SERVICES.map((s, i) => (
            <Reveal key={s.title} delay={i * 100} className="border-t border-white/10 pt-10 pb-10">
              <div className="grid md:grid-cols-[100px_1fr] gap-6 md:gap-10 items-start">
                <div className="font-mono text-xs text-dim">{String(i + 1).padStart(2, "0")}</div>
                <div>
                  <h2 className="font-display font-medium text-2xl md:text-4xl mb-3">{s.title}</h2>
                  <p className="text-dim text-base max-w-xl mb-6">{s.tagline}</p>
                  <div className="flex flex-wrap gap-2">
                    {s.items.map((item) => (
                      <span key={item} className="border border-white/30 rounded-full px-4 py-1.5 text-sm">{item}</span>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-20 text-center">
          <Link
            to="/en/contact"
            className="inline-block font-mono text-sm uppercase tracking-wide bg-[#D1FE17] text-black rounded-full px-8 py-4 hover:scale-105 transition-transform"
          >
            Start a project →
          </Link>
        </Reveal>
      </div>
    </section>
  )
}
