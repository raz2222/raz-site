import { useEffect } from "react"
import { useDocumentMeta } from "@/hooks/useDocumentMeta"
import { useHreflang } from "@/hooks/useHreflang"
import { Reveal } from "@/components/Reveal"

const CAPABILITIES = ["Design", "Development", "WordPress", "React / Next.js", "Creative Coding", "AI Visual Production", "Automation"]
const TOOLS = ["Claude", "ChatGPT", "Figma", "WordPress", "React", "Next.js", "GSAP", "Higgsfield", "Kling", "Veo"]

export function EnglishAbout() {
  useDocumentMeta(
    "About — RAZ",
    "Raz Avramov — a creative developer working at the intersection of design, technology and AI."
  )
  useHreflang("/about", "/en/about")

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
        <Reveal className="font-mono text-xs uppercase tracking-wide text-dim mb-6">( About )</Reveal>

        <div className="grid md:grid-cols-[1fr_1.2fr] gap-14 items-start mb-24">
          <Reveal>
            <div className="relative aspect-[4/5] rounded-sm overflow-hidden bg-neutral-900">
              <img src="/images/raz-portrait.jpeg" alt="Raz Avramov" className="absolute inset-0 w-full h-full object-cover grayscale" />
            </div>
          </Reveal>
          <div>
            <Reveal>
              <h1 className="font-display font-bold text-[clamp(30px,5.4vw,64px)] leading-[1.1] tracking-tight mb-8">
                Hi, I'm Raz.
              </h1>
            </Reveal>
            <Reveal delay={100}>
              <p className="text-dim text-base md:text-lg leading-relaxed mb-4">
                I started in development — code, logic, building things that work. Over time design
                entered the picture, because a good website isn't just correct code, it's also a
                decision about how something should feel.
              </p>
              <p className="text-dim text-base md:text-lg leading-relaxed">
                AI changed the way I work — not because it replaces skill, but because it shortens
                the distance between an idea and a finished product. What once required a crew and
                a shoot day can now be produced solo, at the same level of finish.
              </p>
            </Reveal>
          </div>
        </div>

        <Reveal className="max-w-2xl mb-24">
          <div className="font-mono text-xs uppercase tracking-wide text-dim mb-4">Philosophy</div>
          <p className="text-xl md:text-2xl font-display font-light leading-snug">
            The tool doesn't matter. The result does. A project that needs WordPress gets WordPress.
            A project that needs Next.js gets Next.js. If AI can shorten production without hurting
            quality, it's part of the process. I don't sell a tool — I choose the one that fits the result.
          </p>
        </Reveal>

        <div className="grid md:grid-cols-2 gap-14">
          <Reveal>
            <div className="font-mono text-xs uppercase tracking-wide text-dim mb-4">Capabilities</div>
            <div className="flex flex-wrap gap-2">
              {CAPABILITIES.map((c) => (
                <span key={c} className="border border-white/30 rounded-full px-4 py-1.5 text-sm">{c}</span>
              ))}
            </div>
          </Reveal>
          <Reveal delay={80}>
            <div className="font-mono text-xs uppercase tracking-wide text-dim mb-4">Tools</div>
            <div className="font-mono text-[13px] text-dim leading-relaxed">{TOOLS.join(" · ")}</div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
