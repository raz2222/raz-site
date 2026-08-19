import { useDocumentMeta } from "@/hooks/useDocumentMeta"
import { Reveal } from "@/components/Reveal"
import { Breadcrumbs } from "@/components/Breadcrumbs"
import { useSiteContent } from "@/hooks/useSiteContent"
import { TERMS_DEFAULT, CONTACT_INFO_DEFAULT } from "@/lib/siteContentDefaults"

export function Terms() {
  useDocumentMeta(
    "תנאי שימוש — RAZ",
    "תנאי השימוש באתר ותנאי ההתקשרות לפרויקטים מול רז אברמוב."
  )
  const { content: terms } = useSiteContent("terms_content", TERMS_DEFAULT)
  const { content: contact } = useSiteContent("shared_contact", CONTACT_INFO_DEFAULT)

  return (
    <section className="pt-32 pb-28 md:pt-40 md:pb-40">
      <div className="container max-w-2xl">
        <Breadcrumbs items={[{ label: "בית", to: "/" }, { label: "תנאי שימוש" }]} />
        <Reveal className="font-mono text-xs uppercase tracking-wide text-dim mb-4">
          ( תנאי שימוש )
        </Reveal>
        <Reveal>
          <h1 className="font-display font-medium text-[clamp(32px,5.2vw,62px)] leading-[1.15] tracking-tight mb-10">
            תנאי שימוש
          </h1>
        </Reveal>

        <div className="flex flex-col gap-8 text-base leading-relaxed text-foreground/85">
          <p>
            עדכון אחרון: {terms.updated_date}. {terms.intro}{" "}
            <a href="/privacy" className="underline underline-offset-4 hover:text-[#D1FE17] transition-colors">מדיניות הפרטיות</a>.
          </p>

          {terms.sections.map((s) => (
            <div key={s.heading}>
              <h2 className="font-display font-medium text-xl mb-3">{s.heading}</h2>
              <p>{s.body}</p>
            </div>
          ))}

          <div>
            <h2 className="font-display font-medium text-xl mb-3">יצירת קשר</h2>
            <p>
              שאלות לגבי התנאים? כתבו ל־
              <a href={`mailto:${contact.email}`} className="underline underline-offset-4 hover:text-[#D1FE17] transition-colors">{contact.email}</a>.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
