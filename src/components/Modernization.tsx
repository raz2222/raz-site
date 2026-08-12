import { Reveal } from "./Reveal"

const ITEMS = ["Website Redesign", "WordPress Rebuild", "Performance", "Migration", "Modernization", "Ongoing Care"]

export function Modernization() {
  return (
    <section className="relative py-28 md:py-40 border-t border-white/10 overflow-hidden">
      <video
        src="/videos/raz-showreel-4.mp4"
        muted
        loop
        playsInline
        autoPlay
        className="absolute inset-0 w-full h-full object-cover opacity-20 contrast-[1.05] brightness-[0.7]"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-transparent" />
      <div className="container relative">
        <Reveal>
          <h2 className="font-display font-medium text-[clamp(26px,4vw,44px)] leading-[1.15] tracking-tight max-w-2xl">
            Already have a website?
            <br />
            Let's make it worth visiting again.
          </h2>
        </Reveal>
        <Reveal delay={100}>
          <p className="mt-6 max-w-xl text-dim text-base md:text-lg leading-relaxed">
            I redesign, rebuild and modernize existing websites without forcing businesses to
            start from zero.
          </p>
        </Reveal>
        <Reveal delay={180} className="flex flex-wrap gap-3 mt-8">
          {ITEMS.map((i) => (
            <span key={i} className="border border-white/15 rounded-full px-4 py-1.5 text-sm">
              {i}
            </span>
          ))}
        </Reveal>
        <Reveal delay={240}>
          <a
            href="#contact"
            className="inline-block mt-10 font-mono text-xs uppercase tracking-wide border border-white/20 rounded-full px-6 py-3 hover:bg-foreground hover:text-background transition-colors"
          >
            Modernize My Website →
          </a>
        </Reveal>
      </div>
    </section>
  )
}
