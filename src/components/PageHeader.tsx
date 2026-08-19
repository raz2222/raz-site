import type { ReactNode } from "react"
import { AutoVideo } from "./AutoVideo"
import { Breadcrumbs, type Crumb } from "./Breadcrumbs"
import { Reveal } from "./Reveal"

export function PageHeader({
  breadcrumbs,
  eyebrow,
  title,
  subtitle,
  cta,
  video = "/videos/raz-showreel.mp4",
  image,
}: {
  breadcrumbs: Crumb[]
  eyebrow?: ReactNode
  title: ReactNode
  subtitle?: ReactNode
  cta?: ReactNode
  video?: string | null
  image?: string
}) {
  return (
    <section className="relative overflow-hidden pt-32 pb-16 md:pt-40 md:pb-20">
      <div className="absolute inset-0" aria-hidden="true">
        {video ? (
          <AutoVideo src={video} poster={image} className="w-full h-full object-cover contrast-[1.05] brightness-[0.45]" />
        ) : image ? (
          <img src={image} alt="" className="w-full h-full object-cover brightness-[0.45]" />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/85 to-background/50" />
      </div>

      <div className="relative container text-right">
        <Breadcrumbs items={breadcrumbs} className="mb-4" />
        {eyebrow && (
          <Reveal delay={40} className="font-mono text-xs uppercase tracking-wide text-dim mb-4">
            {eyebrow}
          </Reveal>
        )}
        <Reveal delay={70}>
          <h1 className="font-display font-black text-[clamp(32px,5.2vw,62px)] leading-[1.1] tracking-tight">
            {title}
          </h1>
        </Reveal>
        {subtitle && (
          <Reveal delay={110} className="mt-5 text-dim text-base md:text-lg leading-relaxed max-w-2xl mr-0 ml-auto">
            {subtitle}
          </Reveal>
        )}
        {cta && (
          <Reveal delay={140} className="mt-8">
            {cta}
          </Reveal>
        )}
      </div>
    </section>
  )
}
