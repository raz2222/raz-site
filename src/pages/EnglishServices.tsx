import { useEffect } from "react"
import { Link } from "react-router-dom"
import { useDocumentMeta } from "@/hooks/useDocumentMeta"
import { useHreflang } from "@/hooks/useHreflang"
import { Reveal } from "@/components/Reveal"

const SERVICES = [
  {
    title: "Website Building",
    tagline: "A site that looks like your business — not a template.",
    items: ["Site design", "Creative development", "Interactive websites", "E-commerce", "Landing pages", "WordPress development", "Custom development", "AI-powered functionality"],
  },
  {
    title: "AI Content Creation",
    tagline: "Cinematic-quality ads, without a shoot day.",
    items: ["Product videos", "Campaign visuals", "Social content", "AI photography", "Creative direction", "Concept development"],
  },
]

export function EnglishServices() {
  useDocumentMeta(
    "Services — RAZ",
    "Website building with AI and WordPress, and AI content creation — two areas of work."
  )
  useHreflang("/services", "/en/services")

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
          <h1 className="font-display font-medium text-[clamp(32px,5.2vw,62px)] leading-[1.15] tracking-tight max-w-2xl">
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
            className="inline-block font-mono text-[10px] uppercase tracking-wide bg-[#D1FE17] text-black rounded-full px-8 py-4 hover:scale-105 transition-transform"
          >
            Start a project →
          </Link>
        </Reveal>
      </div>
    </section>
  )
}
