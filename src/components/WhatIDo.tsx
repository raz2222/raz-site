import { Reveal } from "./Reveal"

const PILLARS = [
  {
    n: "01",
    title: "Digital Experiences",
    tagline: "Websites that don't feel like templates.",
    items: [
      "Web Design",
      "Creative Development",
      "Interactive Websites",
      "E-commerce",
      "Landing Pages",
      "WordPress Development",
      "Custom Development",
      "AI-powered functionality",
    ],
    cta: "Explore Web Projects →",
  },
  {
    n: "02",
    title: "AI Visuals & Content",
    tagline: "Visual ideas without traditional production limits.",
    items: [
      "AI Commercials",
      "Product Films",
      "Campaign Visuals",
      "Social Content",
      "AI Photography",
      "Creative Direction",
      "Concept Development",
    ],
    cta: "Explore Visual Projects →",
  },
]

export function WhatIDo() {
  return (
    <section id="services" className="py-28 md:py-40">
      <div className="container">
        <Reveal className="font-mono text-xs uppercase tracking-wide text-dim mb-4">
          What I Do
        </Reveal>
        <div className="grid md:grid-cols-2 gap-16 mt-16">
          {PILLARS.map((p, i) => (
            <Reveal key={p.n} delay={i * 120}>
              <div className="font-mono text-xs text-dim mb-3">{p.n}</div>
              <h3 className="font-display font-medium text-2xl md:text-3xl mb-3">{p.title}</h3>
              <p className="text-dim mb-8">{p.tagline}</p>
              <div className="flex flex-col">
                {p.items.map((item) => (
                  <div key={item} className="flex items-center gap-3 py-4 border-b border-white/10 text-[15px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-foreground flex-none" />
                    {item}
                  </div>
                ))}
              </div>
              <a href="#work" className="inline-block mt-8 font-mono text-xs uppercase tracking-wide underline underline-offset-4">
                {p.cta}
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
