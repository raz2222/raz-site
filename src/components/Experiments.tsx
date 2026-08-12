import { experiments } from "@/lib/data"
import { Reveal } from "./Reveal"

export function Experiments() {
  return (
    <section className="py-28 md:py-40">
      <div className="container">
        <Reveal className="font-mono text-xs uppercase tracking-wide text-dim mb-4">
          Experiments
        </Reveal>
        <Reveal>
          <h2 className="font-display font-medium text-[clamp(28px,4.4vw,52px)] leading-[1.1] tracking-tight">
            Things I make when nobody asks me to.
          </h2>
        </Reveal>

        <div className="mt-14 grid grid-cols-2 md:grid-cols-3 gap-3">
          {experiments.map((e, i) => (
            <Reveal
              key={e.title}
              delay={i * 60}
              className="relative aspect-square rounded-sm overflow-hidden bg-neutral-900 group"
            >
              {e.video ? (
                <video
                  src={e.video}
                  muted
                  loop
                  playsInline
                  autoPlay
                  className="absolute inset-0 w-full h-full object-cover contrast-[1.05] brightness-[0.85] transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-neutral-800 to-neutral-950" />
              )}
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
