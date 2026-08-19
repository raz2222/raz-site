import { Link } from "react-router-dom"
import { Reveal } from "./Reveal"
import { Eyebrow } from "./Eyebrow"
import { ToolIcon } from "./icons/ToolIcon"
import { useSiteContent } from "@/hooks/useSiteContent"
import { HOME_ABOUT_DEFAULT, PROFILE_DEFAULT } from "@/lib/siteContentDefaults"

export function About() {
  const { content: about } = useSiteContent("home_about", HOME_ABOUT_DEFAULT)
  const { content: profile } = useSiteContent("shared_profile", PROFILE_DEFAULT)
  return (
    <section id="about" className="py-28 md:py-40 section-divider">
      <div className="container">
        <Reveal className="mb-6">
          <Eyebrow>עליי</Eyebrow>
        </Reveal>
        <div className="grid md:grid-cols-[1fr_1.2fr] gap-14 items-start">
          <Reveal>
            <div className="relative aspect-[4/5] rounded-sm overflow-hidden bg-neutral-900">
              <img
                src="/images/raz-portrait.jpeg"
                alt="רז אברמוב"
                className="absolute inset-0 w-full h-full object-cover grayscale"
              />
            </div>
          </Reveal>
          <div>
            <Reveal>
              <h2 className="font-display font-bold text-[clamp(30px,4.6vw,54px)] leading-[1.15] tracking-[-0.04em] mb-6">
                <span className="text-foreground">אני </span>
                <span className="text-gradient-accent text-shimmer">רז.</span>
              </h2>
            </Reveal>
            <Reveal delay={100}>
              <p className="text-dim text-base md:text-lg leading-relaxed mb-4">
                {about.paragraph1}
              </p>
              <p className="text-dim text-base md:text-lg leading-relaxed mb-10">
                {about.paragraph2}
              </p>
            </Reveal>

            <Reveal delay={140} className="mb-10">
              <Link to="/about" className="inline-flex items-center gap-1 font-mono text-xs uppercase tracking-wide text-dim hover:text-[#D1FE17] transition-colors border-b border-dim/40 hover:border-[#D1FE17] pb-0.5">
                עוד עליי ←
              </Link>
            </Reveal>

            <Reveal delay={180}>
              <div className="font-mono text-xs uppercase tracking-wide text-dim mb-4">יכולות</div>
              <div className="flex flex-wrap gap-2 mb-10">
                {profile.capabilities.map((c) => (
                  <span key={c} className="surface-raised rounded-full px-4 py-1.5 text-sm">
                    {c}
                  </span>
                ))}
              </div>
            </Reveal>

            <Reveal delay={240}>
              <div className="flex flex-wrap gap-x-5 gap-y-3 font-mono text-[11px] uppercase tracking-wide text-dim">
                {profile.tools.map((t) => (
                  <span key={t} className="flex items-center gap-1.5">
                    <ToolIcon name={t} className="w-3.5 h-3.5 flex-none opacity-70" />
                    {t}
                  </span>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}
