import { Reveal } from "./Reveal"

export function Positioning() {
  return (
    <section className="py-28 md:py-40">
      <div className="container">
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
    </section>
  )
}
