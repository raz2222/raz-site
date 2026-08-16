import { Link } from "react-router-dom"
import { serviceHubs } from "@/lib/serviceHubs"
import { subServices } from "@/lib/subServices"
import { useDocumentMeta } from "@/hooks/useDocumentMeta"
import { Reveal } from "@/components/Reveal"

export function Services() {
  useDocumentMeta(
    "שירותים — RAZ",
    "בניית אתרים באמצעות AI ו-WordPress, והפקת תוכן ויזואלי AI — שני תחומי עבודה, כל אחד עם עמוד Hub מלא."
  )

  return (
    <section className="pt-32 pb-28 md:pt-40 md:pb-40">
      <div className="container">
        <Reveal className="font-mono text-xs uppercase tracking-wide text-dim mb-4">
          ( שירותים )
        </Reveal>
        <Reveal>
          <h1 className="font-display font-medium text-[clamp(28px,4.6vw,54px)] leading-[1.15] tracking-tight max-w-2xl">
            מה אפשר לבנות?
          </h1>
        </Reveal>

        <div className="mt-20 flex flex-col gap-6">
          {serviceHubs.map((hub, i) => {
            const items = subServices.filter((s) => s.hubSlug === hub.slug)
            return (
              <Reveal key={hub.slug} delay={i * 100}>
                <Link
                  to={`/services/${hub.slug}`}
                  className="group block border-t border-white/10 pt-10 pb-10 hover:pr-2 transition-all"
                >
                  <div className="grid md:grid-cols-[100px_1fr_auto] gap-6 md:gap-10 items-start md:items-center">
                    <div className="font-mono text-xs text-dim">{String(i + 1).padStart(2, "0")}</div>
                    <div>
                      <h2 className="font-display font-medium text-2xl md:text-4xl mb-3 group-hover:text-[#D1FE17] transition-colors">
                        {hub.title}
                      </h2>
                      <p className="text-dim text-base max-w-xl">{hub.tagline}</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {items.slice(0, 4).map((sub) => (
                          <span key={sub.slug} className="border border-white/15 rounded-full px-3 py-1 text-xs text-dim">
                            {sub.title}
                          </span>
                        ))}
                        {items.length > 4 && <span className="text-xs text-dim px-1 py-1">+{items.length - 4} עוד</span>}
                      </div>
                    </div>
                    <div className="font-mono text-xs uppercase tracking-wide underline underline-offset-4 flex-none hover:text-[#D1FE17] transition-colors">
                      לעמוד המלא ←
                    </div>
                  </div>
                </Link>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
