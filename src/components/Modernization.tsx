import { Link } from "react-router-dom"
import { Reveal } from "./Reveal"
import { AutoVideo } from "./AutoVideo"

const ITEMS = ["עיצוב מחדש", "בנייה מחדש ב-WordPress", "ביצועים", "מעבר פלטפורמה", "חידוש", "תחזוקה שוטפת"]

export function Modernization() {
  return (
    <section className="relative py-28 md:py-40 border-t border-white/10 overflow-hidden">
      <AutoVideo
        src="/videos/raz-showreel-4.mp4"
        className="absolute inset-0 w-full h-full object-cover opacity-20 contrast-[1.05] brightness-[0.7]"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-transparent" />
      <div className="container relative">
        <Reveal>
          <h2 className="font-display font-medium text-[clamp(24px,3.6vw,40px)] leading-[1.25] tracking-tight max-w-2xl">
            כבר יש לכם אתר?
            <br />
            בואו נהפוך אותו לשווה ביקור מחדש.
          </h2>
        </Reveal>
        <Reveal delay={100}>
          <p className="mt-6 max-w-xl text-dim text-base md:text-lg leading-relaxed">
            אני מעצב מחדש, בונה מחדש ומחדש אתרים קיימים בלי לאלץ עסקים להתחיל מאפס.
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
          <Link
            to="/contact"
            className="inline-block mt-10 font-mono text-xs uppercase tracking-wide border border-white/30 rounded-full px-6 py-3 hover:bg-foreground hover:text-background transition-colors"
          >
            לחידוש האתר שלי ←
          </Link>
        </Reveal>
      </div>
    </section>
  )
}
