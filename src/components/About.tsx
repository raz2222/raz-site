import { Reveal } from "./Reveal"

const CAPABILITIES = ["Design", "Development", "WordPress", "React / Next.js", "Creative Coding", "AI Visual Production", "Automation"]
const TOOLS = ["Claude", "ChatGPT", "Figma", "WordPress", "React", "Next.js", "GSAP", "Higgsfield", "Kling", "Veo"]

export function About() {
  return (
    <section id="about" className="py-28 md:py-40">
      <div className="container">
        <Reveal className="font-mono text-xs uppercase tracking-wide text-dim mb-6">
          About
        </Reveal>
        <div className="grid md:grid-cols-[1fr_1.2fr] gap-14 items-start">
          <Reveal>
            <div className="relative aspect-[4/5] rounded-sm overflow-hidden bg-gradient-to-br from-neutral-800 via-neutral-900 to-black flex items-center justify-center">
              <span className="font-display font-bold text-[clamp(80px,14vw,180px)] text-white/10 select-none">
                R
              </span>
              <div className="absolute bottom-4 left-4 font-mono text-[10px] uppercase tracking-wide text-dim">
                Portrait — coming soon
              </div>
            </div>
          </Reveal>
          <div>
            <Reveal>
              <h2 className="font-display font-medium text-[clamp(28px,4.4vw,52px)] leading-[1.1] tracking-tight mb-6">
                I'm Raz.
              </h2>
            </Reveal>
            <Reveal delay={100}>
              <p className="text-dim text-base md:text-lg leading-relaxed mb-4">
                I'm a creative developer working at the intersection of design, technology and AI.
              </p>
              <p className="text-dim text-base md:text-lg leading-relaxed mb-10">
                I design and build digital experiences, websites and visual content for brands
                that want to look different, communicate better and make an impact.
              </p>
            </Reveal>

            <Reveal delay={180}>
              <div className="font-mono text-xs uppercase tracking-wide text-dim mb-4">Capabilities</div>
              <div className="flex flex-wrap gap-2 mb-10">
                {CAPABILITIES.map((c) => (
                  <span key={c} className="border border-white/15 rounded-full px-4 py-1.5 text-sm">
                    {c}
                  </span>
                ))}
              </div>
            </Reveal>

            <Reveal delay={240}>
              <div className="font-mono text-[11px] uppercase tracking-wide text-dim">
                {TOOLS.join(" · ")}
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}
