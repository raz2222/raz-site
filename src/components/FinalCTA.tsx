import { Reveal } from "./Reveal"

export function FinalCTA() {
  return (
    <section id="contact" className="min-h-[90dvh] flex flex-col justify-center py-28">
      <div className="container text-center">
        <Reveal>
          <h2 className="font-display font-bold text-[clamp(34px,7vw,84px)] leading-[1.05] tracking-tight">
            Have something in mind?
            <br />
            Let's make it real.
          </h2>
        </Reveal>
        <Reveal delay={150}>
          <a
            href="mailto:hello@raz.dev"
            className="inline-block mt-10 font-mono text-sm uppercase tracking-wide border border-white/20 rounded-full px-8 py-4 hover:bg-foreground hover:text-background transition-colors"
          >
            Start a Project →
          </a>
        </Reveal>
        <Reveal delay={220} className="mt-10 flex items-center justify-center gap-6 font-mono text-xs uppercase tracking-wide text-dim">
          <a href="mailto:hello@raz.dev" className="hover:text-foreground transition-colors">Email</a>
          <a href="#" className="hover:text-foreground transition-colors">Instagram</a>
          <a href="#" className="hover:text-foreground transition-colors">LinkedIn</a>
        </Reveal>
        <Reveal delay={280} className="mt-4 font-mono text-[11px] text-dim uppercase tracking-wide">
          Based in Israel. Working worldwide.
        </Reveal>
      </div>
    </section>
  )
}
