import { Link } from "react-router-dom"
import { Reveal } from "./Reveal"
import { useSiteContent } from "@/hooks/useSiteContent"
import { TRUST_DEFAULT } from "@/lib/siteContentDefaults"

export function TrustProof() {
  const { content: trust } = useSiteContent("home_trust", TRUST_DEFAULT)
  return (
    <section className="py-24 md:py-32 section-divider">
      <div className="container">
        <Reveal>
          <h2 className="font-display font-bold text-[clamp(28px,4vw,46px)] leading-[1.15] tracking-[-0.04em] text-gradient-accent text-shimmer">
            {trust.heading_line1}
            <br />
            {trust.heading_line2}
          </h2>
        </Reveal>
        <Reveal delay={60} className="mt-6 max-w-2xl space-y-3">
          {trust.paragraphs.map((p) => (
            <p key={p} className="text-dim text-base md:text-lg leading-relaxed">
              {p}
            </p>
          ))}
        </Reveal>
        <Reveal delay={120} className="mt-10">
          <Link
            to="/work"
            className="inline-flex items-center justify-center w-full sm:w-fit font-mono text-sm font-bold uppercase tracking-wide bg-[#D1FE17] text-black rounded-[8px] px-6 py-3 hover:scale-105 transition-transform"
          >
            {trust.cta_label}
          </Link>
        </Reveal>
      </div>
    </section>
  )
}
