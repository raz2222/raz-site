import { Search, Compass, Hammer, Rocket } from "lucide-react"
import { Reveal } from "./Reveal"
import { useSiteContent } from "@/hooks/useSiteContent"
import { PROCESS_DEFAULT } from "@/lib/siteContentDefaults"

const STEP_ICONS = [Search, Compass, Hammer, Rocket]

export function Process() {
  const { content: process } = useSiteContent("home_process", PROCESS_DEFAULT)
  return (
    <section className="py-28 md:py-40">
      <div className="container">
        <Reveal>
          <h2 className="font-display font-medium text-[clamp(26px,4vw,46px)] leading-[1.15] tracking-tight">
            {process.heading}
          </h2>
        </Reveal>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8 mt-16">
          {process.steps.map((s, i) => {
            const Icon = STEP_ICONS[i % STEP_ICONS.length]
            return (
              <Reveal key={s.title} delay={i * 90}>
                <div className="flex items-center gap-3 mb-4">
                  <Icon className="w-4 h-4 text-[#D1FE17]" strokeWidth={1.75} />
                  <div className="font-mono text-xs text-dim">{String(i + 1).padStart(2, "0")}</div>
                </div>
                <div className="font-display font-medium text-xl mb-2">{s.title}</div>
                <p className="text-dim text-sm leading-relaxed">{s.text}</p>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
