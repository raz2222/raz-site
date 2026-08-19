import { Reveal } from "./Reveal"
import { Eyebrow } from "./Eyebrow"
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
              <h2 className="font-display font-bold text-[clamp(26px,4vw,46px)] leading-[1.15] tracking-[-0.04em] mb-6 text-gradient-accent text-shimmer">
                {about.heading}
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
              <div className="font-mono text-[11px] uppercase tracking-wide text-dim">
                {profile.tools.join(" · ")}
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}
