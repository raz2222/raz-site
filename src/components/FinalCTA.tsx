import { Link } from "react-router-dom"
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
          <Link
            to="/contact"
            className="inline-block mt-10 font-mono text-sm uppercase tracking-wide border border-white/30 rounded-full px-8 py-4 hover:bg-foreground hover:text-background transition-colors"
          >
            בואו נתחיל ←
          </Link>
        </Reveal>
        <Reveal delay={220} className="mt-10 flex items-center justify-center gap-6 font-mono text-xs uppercase tracking-wide text-dim">
          <a href="mailto:razavramov2@gmail.com" className="hover:text-foreground transition-colors">אימייל</a>
          <a href="https://instagram.com/raz2222" target="_blank" rel="noreferrer" className="hover:text-foreground transition-colors">אינסטגרם</a>
          <a href="https://wa.me/972506944443" target="_blank" rel="noreferrer" className="hover:text-foreground transition-colors">וואטסאפ</a>
        </Reveal>
        <Reveal delay={280} className="mt-4 font-mono text-[11px] text-dim uppercase tracking-wide">
          מבוסס בישראל. עובד ברחבי העולם.
        </Reveal>
      </div>
    </section>
  )
}
