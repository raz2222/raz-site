import { Reveal } from "./Reveal"
import { AutoVideo } from "./AutoVideo"
import { useSiteContent } from "@/hooks/useSiteContent"
import { POSITIONING_DEFAULT } from "@/lib/siteContentDefaults"

export function Positioning() {
  const { content: positioning } = useSiteContent("home_positioning", POSITIONING_DEFAULT)
  return (
    <section className="py-28 md:py-40 section-divider">
      <div className="container grid md:grid-cols-[1.2fr_1fr] gap-14 items-center">
        <div>
          <Reveal>
            <h2 className="font-display font-bold text-[clamp(26px,4vw,46px)] leading-[1.2] tracking-[-0.04em] max-w-3xl text-gradient-neutral">
              {positioning.heading_line1}
              <br />
              {positioning.heading_line2}
            </h2>
          </Reveal>
          <Reveal delay={120}>
            <p className="mt-8 max-w-xl text-dim text-base md:text-lg leading-relaxed">
              {positioning.body}
            </p>
          </Reveal>
        </div>
        <Reveal delay={180} className="relative aspect-[4/5] rounded-sm overflow-hidden bg-neutral-900">
          <AutoVideo
            src="/videos/raz-showreel-5.mp4"
            className="absolute inset-0 w-full h-full object-cover contrast-[1.05] brightness-[0.9]"
          />
        </Reveal>
      </div>
    </section>
  )
}
