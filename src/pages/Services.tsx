import { Link } from "react-router-dom"
import { useDocumentMeta } from "@/hooks/useDocumentMeta"
import { Reveal } from "@/components/Reveal"

const SERVICES = [
  {
    n: "01",
    title: "אתרים וחוויות דיגיטליות",
    items: ["אתרי מותג", "דפי נחיתה", "איקומרס", "חוויות אינטראקטיביות", "אפליקציות ווב", "WordPress", "פיתוח מותאם אישית"],
    cta: "להתחיל פרויקט אתר",
  },
  {
    n: "02",
    title: "הפקה ויזואלית AI",
    items: ["קמפיינים", "פרסומות", "סרטוני מוצר", "תוכן לרשתות חברתיות", "קונספט ארט"],
    cta: "להתחיל פרויקט ויזואל",
  },
  {
    n: "03",
    title: "שדרוג אתרים קיימים",
    items: ["עיצוב מחדש", "מעבר פלטפורמה", "פיתוח WordPress", "ביצועים", "תחזוקה שוטפת"],
    cta: "לשדרג את האתר שלי",
  },
]

export function Services() {
  useDocumentMeta(
    "שירותים — RAZ",
    "אתרים, פיתוח מותאם אישית ושדרוג אתרים קיימים לצד הפקה ויזואלית מבוססת AI — פרסומות, סרטוני מוצר וקמפיינים."
  )

  return (
    <section className="pt-32 pb-28 md:pt-40 md:pb-40">
      <div className="container">
        <Reveal className="font-mono text-xs uppercase tracking-wide text-dim mb-4">
          ( שירותים )
        </Reveal>
        <Reveal>
          <h1 className="font-display font-medium text-[clamp(28px,4.6vw,54px)] leading-[1.15] tracking-tight">
            מה אפשר לבנות?
          </h1>
        </Reveal>

        <div className="mt-20 flex flex-col gap-20">
          {SERVICES.map((s, i) => (
            <Reveal key={s.n} delay={i * 100} className="grid md:grid-cols-[100px_1fr] gap-6 md:gap-10 border-t border-white/10 pt-10">
              <div className="font-mono text-xs text-dim">{s.n}</div>
              <div>
                <h2 className="font-display font-medium text-2xl md:text-4xl mb-6">{s.title}</h2>
                <div className="flex flex-wrap gap-2 mb-8">
                  {s.items.map((it) => (
                    <span key={it} className="border border-white/15 rounded-full px-4 py-1.5 text-sm">
                      {it}
                    </span>
                  ))}
                </div>
                <Link
                  to="/contact"
                  className="inline-block font-mono text-xs uppercase tracking-wide border border-white/30 rounded-full px-6 py-3 hover:bg-foreground hover:text-background transition-colors"
                >
                  {s.cta} ←
                </Link>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
