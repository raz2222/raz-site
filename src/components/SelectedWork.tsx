import { Link } from "react-router-dom"
import { useProjects } from "@/hooks/useProjects"
import { Reveal } from "./Reveal"
import { AutoVideo } from "./AutoVideo"
import { Eyebrow } from "./Eyebrow"
import { cn } from "@/lib/utils"

export function SelectedWork() {
  const { projects, loading } = useProjects()

  return (
    <section id="work" className="py-28 md:py-40 section-divider">
      <div className="container">
        <Reveal className="mb-4">
          <Eyebrow>עבודות נבחרות</Eyebrow>
        </Reveal>
        <Reveal>
          <h2 className="font-display font-bold text-[clamp(30px,4.6vw,54px)] leading-[1.15] tracking-[-0.04em] text-gradient-accent text-shimmer">
            עבודה טובה נראית טוב.
            <br />
            עבודה נכונה גם עובדת.
          </h2>
        </Reveal>

        {loading && (
          <div className="mt-16 font-mono text-xs text-dim uppercase">טוען…</div>
        )}

        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 gap-5">
          {projects.map((p, i) => (
            <Reveal key={p.slug} delay={i * 80} className={p.thumb_class === "wide" ? "sm:col-span-2" : undefined}>
              <Link
                to={`/work/${p.slug}`}
                className={cn(
                  "group block relative overflow-hidden rounded-2xl surface-raised transition-colors duration-200 hover:bg-white/[0.08]",
                  p.thumb_class === "wide" ? "aspect-[21/9]" : p.thumb_class === "tall" ? "aspect-[3/4]" : "aspect-[4/3]"
                )}
              >
                {p.video && (
                  <AutoVideo
                    src={p.video}
                    className="absolute inset-0 w-full h-full object-cover contrast-[1.05] brightness-[0.85] transition-transform duration-500 group-hover:scale-105"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />

                <div className="absolute top-4 inset-x-4 flex items-start justify-between gap-4">
                  <span className="font-mono text-[11px] uppercase tracking-wide text-white/70">
                    {p.number} {p.concept && "· קונספט"}
                  </span>
                  <span className="font-mono text-[11px] uppercase tracking-wide text-white/70 opacity-0 group-hover:opacity-100 transition-opacity">
                    צפייה ←
                  </span>
                </div>

                <div className="absolute bottom-4 right-4 left-4">
                  <div className="font-display text-xl md:text-2xl font-bold text-white">{p.title}</div>
                  <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 font-mono text-[11px] text-white/60 uppercase">
                    <span>{p.category}</span>
                    {p.disciplines.map((d) => (
                      <span key={d}>{d}</span>
                    ))}
                    <span>{p.year}</span>
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-12">
          <Link
            to="/work"
            className="inline-flex items-center justify-center w-full sm:w-fit font-mono text-xs uppercase tracking-wide bg-[#D1FE17] text-black rounded-[8px] px-6 py-3 hover:scale-105 transition-transform"
          >
            כל העבודות ←
          </Link>
        </Reveal>
      </div>
    </section>
  )
}
