import { Reveal } from "./Reveal"
import { useSiteContent } from "@/hooks/useSiteContent"
import { PROCESS_DEFAULT } from "@/lib/siteContentDefaults"

export function Process() {
  const { content: process } = useSiteContent("home_process", PROCESS_DEFAULT)
  return (
    <section className="py-28 md:py-40 section-divider">
      <div className="container">
        <Reveal>
          <h2 className="font-display font-bold text-[clamp(30px,4.6vw,54px)] leading-[1.15] tracking-[-0.04em] text-gradient-accent text-shimmer">
            {process.heading}
          </h2>
        </Reveal>
        <Reveal delay={40}>
          <p className="mt-4 text-dim text-base md:text-lg">{process.subheading}</p>
        </Reveal>
        <div className="relative mt-16">
          <div
            aria-hidden="true"
            className="hidden md:block absolute top-8 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D1FE17]/40 to-transparent"
          />
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8 relative">
            {process.steps.map((s, i) => (
              <Reveal key={s.title} delay={i * 90} className="group cursor-default">
                <div className="relative z-10 inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-xl bg-[#D1FE17] text-black font-display font-black text-2xl md:text-3xl mb-5 transition-transform duration-300 ease-out group-hover:scale-110 group-hover:-rotate-3">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <h3 className="font-display font-bold text-xl mb-2 transition-colors duration-200 group-hover:text-[#D1FE17]">{s.title}</h3>
                <p className="text-dim text-sm leading-relaxed">{s.text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
