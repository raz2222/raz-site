import { useState } from "react"
import { Link } from "react-router-dom"
import { Reveal } from "./Reveal"
import { AutoVideo } from "./AutoVideo"
import { Eyebrow } from "./Eyebrow"
import { useServiceHubs, useSubServices } from "@/hooks/useContent"
import { cn } from "@/lib/utils"

const HUB_META: Record<string, { video: string; cta: string }> = {
  "web-design": { video: "/videos/raz-showreel-7.mp4", cta: "אני צריך אתר ←" },
  "ai-content": { video: "/videos/raz-showreel-2.mp4", cta: "לראות פרויקטים ←" },
}

export function WhatIDo() {
  const [activeHub, setActiveHub] = useState<string>("ai-content")
  const { serviceHubs } = useServiceHubs()
  const { subServices } = useSubServices()
  const hub = serviceHubs.find((h) => h.slug === activeHub)
  const items = subServices.filter((s) => s.hub_slug === activeHub)
  const meta = HUB_META[activeHub]

  if (!hub) return null

  return (
    <section id="services" className="py-28 md:py-40 section-divider">
      <div className="container">
        <Reveal className="mb-4">
          <Eyebrow>מה אני עושה</Eyebrow>
        </Reveal>
        <Reveal delay={60}>
          <h2 className="font-display font-bold text-[clamp(30px,4.6vw,54px)] leading-[1.15] tracking-[-0.04em] text-gradient-accent text-shimmer">
            בעיקר שני דברים.
          </h2>
        </Reveal>

        <Reveal delay={100} className="flex flex-wrap gap-3 mt-10">
          {serviceHubs.map((h) => (
            <button
              key={h.slug}
              onClick={() => setActiveHub(h.slug)}
              className={cn(
                "font-mono text-sm md:text-base font-medium uppercase tracking-wide px-6 py-4 md:px-8 md:py-5 rounded-full border-2 transition-colors",
                activeHub === h.slug
                  ? "bg-[#D1FE17] border-[#D1FE17] text-black"
                  : "border-white/20 text-dim hover:border-[#D1FE17] hover:text-foreground"
              )}
            >
              {h.title}
            </button>
          ))}
        </Reveal>

        <div key={activeHub} className="grid md:grid-cols-2 gap-16 mt-12 animate-[fadeIn_0.4s_ease]">
          <Reveal>
            <div className="relative aspect-video rounded-sm overflow-hidden bg-neutral-900">
              <AutoVideo src={meta.video} className="absolute inset-0 w-full h-full object-cover contrast-[1.05] brightness-[0.9]" />
            </div>
          </Reveal>
          <Reveal delay={60}>
            <div className="space-y-3 mb-8">
              {hub.hero_description.split("\n\n").map((p) => (
                <p key={p} className="text-dim text-base md:text-lg leading-relaxed">{p}</p>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {items.map((item) => (
                <Link
                  key={item.slug}
                  to={`/services/${item.hub_slug}/${item.slug}`}
                  className="group flex items-center gap-2 rounded-xl surface-raised border border-[#D1FE17]/25 px-4 py-3 text-sm transition-colors hover:bg-[#D1FE17] hover:border-[#D1FE17] hover:text-black"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current flex-none" />
                  {item.title}
                </Link>
              ))}
            </div>
            <Link to={`/services/${activeHub}`} className="inline-flex items-center justify-center w-full sm:w-fit mt-8 font-mono text-[10px] uppercase tracking-wide bg-[#D1FE17] text-black rounded-[8px] px-6 py-3 hover:scale-105 transition-transform">
              {meta.cta}
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
