import { experiments } from "@/lib/data"
import { Reveal } from "./Reveal"
import { AutoVideo } from "./AutoVideo"

export function Experiments() {
  return (
    <section className="py-28 md:py-40">
      <div className="container">
        <Reveal className="font-mono text-xs uppercase tracking-wide text-dim mb-4">
          ( ניסויים )
        </Reveal>
        <Reveal>
          <h2 className="font-display font-medium text-[clamp(26px,4vw,46px)] leading-[1.15] tracking-tight">
            דברים שאני יוצר כשאף אחד לא מבקש.
          </h2>
        </Reveal>

        <div className="mt-14 grid grid-cols-2 md:grid-cols-3 gap-3">
          {experiments.map((e, i) => (
            <Reveal
              key={e.title}
              delay={i * 60}
              className="relative aspect-square rounded-sm overflow-hidden bg-neutral-900 group"
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
