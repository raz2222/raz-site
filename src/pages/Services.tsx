import { Link } from "react-router-dom"
import { services } from "@/lib/services"
import { useDocumentMeta } from "@/hooks/useDocumentMeta"
import { useHreflang } from "@/hooks/useHreflang"
import { Reveal } from "@/components/Reveal"

export function Services() {
  useDocumentMeta(
    "שירותים — RAZ",
    "בניית אתרים באמצעות AI, וורדפרס ואלמנטור, והפקת תוכן ויזואלי AI — שלושה תחומי עבודה, כל אחד עם עמוד מלא."
  )
  useHreflang("/services", "/en/services")

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
          {services.map((s, i) => (
            <Reveal key={s.slug} delay={i * 100}>
              <Link
                to={`/services/${s.slug}`}
                className="group block border-t border-white/10 pt-10 pb-10 hover:pr-2 transition-all"
              >
                <div className="grid md:grid-cols-[100px_1fr_auto] gap-6 md:gap-10 items-start md:items-center">
                  <div className="font-mono text-xs text-dim">{String(i + 1).padStart(2, "0")}</div>
                  <div>
                    <h2 className="font-display font-medium text-2xl md:text-4xl mb-3 group-hover:text-[#D1FE17] transition-colors">
                      {s.navTitle}
                    </h2>
                    <p className="text-dim text-base max-w-xl">{s.tagline}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {s.subServices.slice(0, 4).map((sub) => (
                        <span key={sub.title} className="border border-white/15 rounded-full px-3 py-1 text-xs text-dim">
                          {sub.title}
                        </span>
                      ))}
                      <span className="text-xs text-dim px-1 py-1">+{s.subServices.length - 4} עוד</span>
                    </div>
                  </div>
                  <div className="font-mono text-xs uppercase tracking-wide underline underline-offset-4 flex-none">
                    לעמוד המלא ←
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
