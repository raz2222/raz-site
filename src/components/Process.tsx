import { Reveal } from "./Reveal"

const STEPS = [
  { n: "01", title: "Discover", text: "Understanding the business, the goal and the audience." },
  { n: "02", title: "Direction", text: "Defining the concept and the visual language." },
  { n: "03", title: "Build", text: "Design + Development + AI production." },
  { n: "04", title: "Launch", text: "Testing, polish and going live." },
]

export function Process() {
  return (
    <section className="py-28 md:py-40">
      <div className="container">
        <Reveal>
          <h2 className="font-display font-medium text-[clamp(28px,4.4vw,52px)] leading-[1.1] tracking-tight">
            From idea to launch.
          </h2>
        </Reveal>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8 mt-16">
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 90}>
              <div className="font-mono text-xs text-dim mb-4">{s.n}</div>
              <div className="font-display font-medium text-xl mb-2">{s.title}</div>
              <p className="text-dim text-sm leading-relaxed">{s.text}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
