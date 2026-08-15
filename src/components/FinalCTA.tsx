import { Reveal } from "./Reveal"

export function FinalCTA() {
  return (
    <section id="contact" className="min-h-[90dvh] flex flex-col justify-center py-28">
      <div className="container text-center">
        <Reveal>
          <h2 className="font-display font-bold text-[clamp(30px,6vw,72px)] leading-[1.15] tracking-tight">
            יש לכם משהו בראש?
            <br />
            בואו נהפוך את זה למציאות.
          </h2>
        </Reveal>
        <Reveal delay={150}>
          <a
            href="mailto:hello@raz.dev"
            className="inline-block mt-10 font-mono text-sm uppercase tracking-wide border border-white/20 rounded-full px-8 py-4 hover:bg-foreground hover:text-background transition-colors"
          >
            בואו נתחיל ←
          </a>
        </Reveal>
        <Reveal delay={220} className="mt-10 flex items-center justify-center gap-6 font-mono text-xs uppercase tracking-wide text-dim">
          <a href="mailto:hello@raz.dev" className="hover:text-foreground transition-colors">אימייל</a>
          <a href="#" className="hover:text-foreground transition-colors">אינסטגרם</a>
          <a href="#" className="hover:text-foreground transition-colors">לינקדאין</a>
        </Reveal>
        <Reveal delay={280} className="mt-4 font-mono text-[11px] text-dim uppercase tracking-wide">
          מבוסס בישראל. עובד ברחבי העולם.
        </Reveal>
      </div>
    </section>
  )
}
