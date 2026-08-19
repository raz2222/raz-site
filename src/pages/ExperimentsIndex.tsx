import { experiments } from "@/lib/data"
import { useDocumentMeta } from "@/hooks/useDocumentMeta"
import { AutoVideo } from "@/components/AutoVideo"
import { Reveal } from "@/components/Reveal"
import { PageHeader } from "@/components/PageHeader"

export function ExperimentsIndex() {
  useDocumentMeta(
    "ניסויים — RAZ",
    "דברים שרז אברמוב יוצר כשאף אחד לא מבקש — סרטים, אתרים מוזרים, דמויות ורעיונות בעבודה."
  )

  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: "בית", to: "/" }, { label: "ניסויים" }]}
        eyebrow="( ניסויים )"
        title="דברים שאני עושה כשאף אחד לא מבקש."
      />
      <section className="pb-28 md:pb-40">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {experiments.map((e, i) => (
              <Reveal
                key={e.title}
                delay={i * 60}
                className="relative aspect-square rounded-xl overflow-hidden bg-neutral-900 group"
              >
                <AutoVideo
                  src={e.video}
                  className="absolute inset-0 w-full h-full object-cover contrast-[1.05] brightness-[0.85] transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute bottom-3 left-3 font-mono text-[11px] uppercase tracking-wide text-white/70">
                  {e.title}
                </span>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
