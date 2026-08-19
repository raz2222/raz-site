import { Link } from "react-router-dom"
import { Reveal } from "./Reveal"
import { AutoVideo } from "./AutoVideo"
import { useSiteContent } from "@/hooks/useSiteContent"
import { MODERNIZATION_DEFAULT } from "@/lib/siteContentDefaults"

export function Modernization() {
  const { content: m } = useSiteContent("home_modernization", MODERNIZATION_DEFAULT)
  return (
    <section className="relative py-28 md:py-40 section-divider overflow-hidden">
      <AutoVideo
        src="/videos/raz-showreel-4.mp4"
        className="absolute inset-0 w-full h-full object-cover opacity-20 contrast-[1.05] brightness-[0.7]"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-transparent" />
      <div className="container relative">
        <Reveal>
          <h2 className="font-display font-bold text-[clamp(24px,3.6vw,40px)] leading-[1.25] tracking-[-0.04em] max-w-2xl text-gradient-accent text-shimmer">
            {m.heading_line1}
            <br />
            {m.heading_line2}
          </h2>
        </Reveal>
        <Reveal delay={100}>
          <p className="mt-6 max-w-xl text-dim text-base md:text-lg leading-relaxed">
            {m.body}
          </p>
        </Reveal>
        <Reveal delay={180} className="flex flex-wrap gap-3 mt-8">
          {m.items.map((i) => (
            <span key={i} className="surface-raised rounded-full px-4 py-1.5 text-sm">
              {i}
            </span>
          ))}
        </Reveal>
        <Reveal delay={240}>
          <Link
            to="/contact"
            className="inline-block mt-10 font-mono text-sm font-medium uppercase tracking-wide bg-[#D1FE17] text-black rounded-[8px] px-5 py-3 hover:scale-105 transition-transform"
          >
            {m.cta_label}
          </Link>
        </Reveal>
      </div>
    </section>
  )
}
