import { Link } from "react-router-dom"
import { useProjects } from "@/hooks/useProjects"
import { Reveal } from "./Reveal"
import { AutoVideo } from "./AutoVideo"
import { cn } from "@/lib/utils"

export function SelectedWork() {
  const { projects, loading } = useProjects()

  return (
    <section id="work" className="py-28 md:py-40">
      <div className="container">
        <Reveal className="font-mono text-xs uppercase tracking-wide text-dim mb-4">
          ( עבודות נבחרות )
        </Reveal>
        <Reveal>
          <h2 className="font-display font-medium text-[clamp(26px,4vw,46px)] leading-[1.15] tracking-tight">
            עבודה טובה נראית טוב.
            <br />
            עבודה נכונה גם עובדת.
          </h2>
        </Reveal>

        {loading && (
          <div className="mt-16 font-mono text-xs text-dim uppercase">טוען…</div>
        )}

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-px bg-white/10 border-t border-white/10">
          {projects.map((p, i) => (
            <Reveal
              key={p.slug}
              delay={i * 80}
              className={cn("bg-background p-8 md:p-10", p.thumb_class === "wide" && "md:col-span-2")}
            >
              <div className="flex justify-between items-start gap-6 mb-6">
                <div>
                  <div className="font-mono text-[11px] uppercase tracking-wide text-dim mb-2">
                    {p.number} {p.concept && "· קונספט"}
                  </div>
                  <div className="font-display text-2xl md:text-3xl font-medium">{p.title}</div>
                </div>
                <div className="text-right font-mono text-[11px] text-dim uppercase max-w-[220px]">
                  {p.category}
                </div>
              </div>
              <Link
                to={`/work/${p.slug}`}
                className={cn(
                  "block relative overflow-hidden rounded-sm bg-neutral-900",
                  p.thumb_class === "wide" ? "aspect-[21/9]" : p.thumb_class === "tall" ? "aspect-[3/4]" : "aspect-[4/3]"
                )}
              >
                {p.video && (
                  <AutoVideo
                    src={p.video}
                    className="absolute inset-0 w-full h-full object-cover contrast-[1.05] brightness-[0.85]"
                  />
                )}
                <span className="absolute bottom-4 right-4 font-mono text-[11px] uppercase tracking-wide text-white/80">
                  צפייה ←
                </span>
              </Link>
              <div className="mt-4 flex flex-wrap gap-x-3 gap-y-1 font-mono text-[11px] text-dim uppercase">
                {p.disciplines.map((d) => (
                  <span key={d}>{d}</span>
                ))}
                <span>{p.year}</span>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-12">
          <Link
            to="/work"
            className="inline-block font-mono text-xs uppercase tracking-wide underline underline-offset-4"
          >
            כל העבודות ←
          </Link>
        </Reveal>
      </div>
    </section>
  )
}
