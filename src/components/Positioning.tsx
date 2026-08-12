import { Reveal } from "./Reveal"

export function Positioning() {
  return (
    <section className="py-28 md:py-40">
      <div className="container grid md:grid-cols-[1.2fr_1fr] gap-14 items-center">
        <div>
          <Reveal>
            <h2 className="font-display font-medium text-[clamp(28px,4.4vw,52px)] leading-[1.1] tracking-tight max-w-3xl">
              Being good isn't enough
              <br />
              if you look like everyone else.
            </h2>
          </Reveal>
          <Reveal delay={120}>
            <p className="mt-8 max-w-xl text-dim text-base md:text-lg leading-relaxed">
              Businesses can be excellent and still look average online. I connect design,
              development and AI to turn ideas into digital experiences people actually remember.
            </p>
          </Reveal>
        </div>
        <Reveal delay={180} className="relative aspect-[4/5] rounded-sm overflow-hidden bg-neutral-900">
          <video
            src="/videos/raz-showreel-5.mp4"
            muted
            loop
            playsInline
            autoPlay
            className="absolute inset-0 w-full h-full object-cover contrast-[1.05] brightness-[0.9]"
          />
        </Reveal>
      </div>
    </section>
  )
}
