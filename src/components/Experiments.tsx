import { experiments } from "@/lib/data"
import { Reveal } from "./Reveal"
import { AutoVideo } from "./AutoVideo"
import { Eyebrow } from "./Eyebrow"

export function Experiments() {
  return (
    <section className="py-28 md:py-40 section-divider">
      <div className="container">
        <Reveal className="mb-4">
          <Eyebrow>ניסויים</Eyebrow>
        </Reveal>
        <Reveal>
          <h2 className="font-display font-bold text-[clamp(30px,4.6vw,54px)] leading-[1.15] tracking-[-0.04em] text-gradient-accent text-shimmer">
            דברים שאני עושה כשאף אחד לא מבקש.
          </h2>
        </Reveal>
        <Reveal delay={40}>
          <p className="mt-4 max-w-xl text-dim text-base md:text-lg leading-relaxed">
            לפעמים זה סרט. לפעמים אתר מוזר. לפעמים דמות, אנימציה או רעיון שאין לי מושג עדיין מה לעשות איתו. זה המקום שבו אני מנסה דברים חדשים לפני שהם הופכים לעבודה אמיתית.
          </p>
        </Reveal>

        <div className="mt-14 grid grid-cols-2 md:grid-cols-3 gap-3">
          {experiments.map((e, i) => (
            <Reveal
              key={e.title}
              delay={i * 60}
              className="relative aspect-square rounded-xl overflow-hidden bg-neutral-900 group"
            >
              <AutoVideo
                src={e.video}
                className="absolute inset-0 w-full h-full object-cover contrast-[1.05] brightness-[0.85] transition-transform duration-500 group-hover:scale-105"
              />
              <span className="absolute bottom-3 left-3 font-mono text-[11px] uppercase tracking-wide text-white/70">
                {e.title}
              </span>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
