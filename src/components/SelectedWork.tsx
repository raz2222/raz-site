import { projects } from "@/lib/data"
import { Reveal } from "./Reveal"
import { cn } from "@/lib/utils"

export function SelectedWork() {
  return (
    <section id="work" className="py-28 md:py-40">
      <div className="container">
        <Reveal className="font-mono text-xs uppercase tracking-wide text-dim mb-4">
          Selected Work
        </Reveal>
        <Reveal>
          <h2 className="font-display font-medium text-[clamp(28px,4.4vw,52px)] leading-[1.1] tracking-tight">
            A few things worth your time.
          </h2>
        </Reveal>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-px bg-white/10 border-t border-white/10">
          {projects.map((p, i) => (
            <Reveal
              key={p.slug}
              delay={i * 80}
              className={cn("bg-background p-8 md:p-10", p.thumbClass === "wide" && "md:col-span-2")}
            >
              <div className="flex justify-between items-start gap-6 mb-6">
                <div>
                  <div className="font-mono text-[11px] uppercase tracking-wide text-dim mb-2">
                    {p.number} {p.concept && "· Concept"}
                  </div>
                  <div className="font-display text-2xl md:text-3xl font-medium">{p.title}</div>
                </div>
                <div className="text-right font-mono text-[11px] text-dim uppercase max-w-[220px]">
                  {p.category}
                </div>
              </div>
              <a
                href="#"
                className={cn(
                  "block relative overflow-hidden rounded-sm bg-neutral-900",
                  p.thumbClass === "wide" ? "aspect-[21/9]" : p.thumbClass === "tall" ? "aspect-[3/4]" : "aspect-[4/3]"
                )}
              >
                {p.video && (
                  <video
                    src={p.video}
                    muted
                    loop
                    playsInline
                    autoPlay
                    className="absolute inset-0 w-full h-full object-cover grayscale contrast-[1.05] brightness-[0.75]"
                  />
                )}
                <span className="absolute bottom-4 left-4 font-mono text-[11px] uppercase tracking-wide text-white/80">
                  View Project →
                </span>
              </a>
              <div className="mt-4 flex flex-wrap gap-x-3 gap-y-1 font-mono text-[11px] text-dim uppercase">
                {p.disciplines.map((d) => (
                  <span key={d}>{d}</span>
                ))}
                <span>{p.year}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
