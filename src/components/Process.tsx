import { Reveal } from "./Reveal"
import { useSiteContent } from "@/hooks/useSiteContent"
import { PROCESS_DEFAULT } from "@/lib/siteContentDefaults"

export function Process() {
  const { content: process } = useSiteContent("home_process", PROCESS_DEFAULT)
  return (
    <section className="py-28 md:py-40 section-divider">
      <div className="container">
        <Reveal>
          <h2 className="font-display font-bold text-[clamp(26px,4vw,46px)] leading-[1.15] tracking-[-0.04em] text-gradient-neutral">
            {process.heading}
          </h2>
        </Reveal>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8 mt-16">
          {process.steps.map((s, i) => (
            <Reveal key={s.title} delay={i * 90}>
              <div className="inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-xl bg-[#D1FE17] text-black font-display font-black text-2xl md:text-3xl mb-5">
                {String(i + 1).padStart(2, "0")}
              </div>
              <div className="font-display font-bold text-xl mb-2">{s.title}</div>
              <p className="text-dim text-sm leading-relaxed">{s.text}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
