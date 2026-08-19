import { Reveal } from "./Reveal"
import { Eyebrow } from "./Eyebrow"
import { useSiteContent } from "@/hooks/useSiteContent"
import { TESTIMONIALS_DEFAULT } from "@/lib/siteContentDefaults"

export function Testimonials() {
  const { content } = useSiteContent("home_testimonials", TESTIMONIALS_DEFAULT)

  if (!content.items.length) return null

  return (
    <section className="py-28 md:py-40 section-divider">
      <div className="container">
        <Reveal className="mb-4">
          <Eyebrow>מה אומרים</Eyebrow>
        </Reveal>
        <div className="mt-14 grid md:grid-cols-2 gap-x-16 gap-y-14">
          {content.items.map((t, i) => (
            <Reveal key={t.name} delay={i * 80}>
              <p className="font-display text-xl md:text-2xl leading-snug mb-6">"{t.quote}"</p>
              <div className="font-mono text-xs uppercase tracking-wide text-dim">
                {t.name}
                {t.role && <span> · {t.role}</span>}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
