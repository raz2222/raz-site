import { Reveal } from "./Reveal"
import { useSiteContent } from "@/hooks/useSiteContent"
import { TRUST_DEFAULT } from "@/lib/siteContentDefaults"

export function TrustProof() {
  const { content: trust } = useSiteContent("home_trust", TRUST_DEFAULT)
  return (
    <section className="py-24 md:py-32 section-divider">
      <div className="container">
        <div className="grid md:grid-cols-[1.2fr_1fr] gap-10 items-center">
          <div>
            <Reveal>
              <h2 className="font-display font-bold text-[clamp(28px,4vw,46px)] leading-[1.15] tracking-[-0.04em] text-gradient-accent text-shimmer">
                {trust.heading_line1}
                <br />
                {trust.heading_line2}
              </h2>
            </Reveal>
            <Reveal delay={60}>
              <p className="mt-4 max-w-lg text-dim text-base md:text-lg leading-relaxed">{trust.body}</p>
            </Reveal>
          </div>
          <Reveal delay={100} className="grid grid-cols-3 md:flex md:flex-col gap-6 md:gap-5 md:border-r md:border-white/10 md:pr-10">
            {trust.stats.map((s) => (
              <div key={s.label}>
                <div className="font-display font-bold text-3xl md:text-4xl text-foreground">{s.value}</div>
                <div className="mt-1 font-mono text-[11px] uppercase tracking-wide text-dim">{s.label}</div>
              </div>
            ))}
          </Reveal>
        </div>
      </div>
    </section>
  )
}
