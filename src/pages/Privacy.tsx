import { useDocumentMeta } from "@/hooks/useDocumentMeta"
import { Reveal } from "@/components/Reveal"
import { useSiteContent } from "@/hooks/useSiteContent"
import { PRIVACY_DEFAULT, CONTACT_INFO_DEFAULT } from "@/lib/siteContentDefaults"

export function Privacy() {
  useDocumentMeta(
    "מדיניות פרטיות — RAZ",
    "אילו פרטים נאספים באתר, איך הם נשמרים ומי רואה אותם."
  )
  const { content: privacy } = useSiteContent("privacy_content", PRIVACY_DEFAULT)
  const { content: contact } = useSiteContent("shared_contact", CONTACT_INFO_DEFAULT)

  return (
    <section className="pt-32 pb-28 md:pt-40 md:pb-40">
      <div className="container max-w-2xl">
        <Reveal className="font-mono text-xs uppercase tracking-wide text-dim mb-4">
          ( מדיניות פרטיות )
        </Reveal>
        <Reveal>
          <h1 className="font-display font-medium text-[clamp(28px,4.6vw,54px)] leading-[1.15] tracking-tight mb-10">
            מדיניות פרטיות
          </h1>
        </Reveal>

        <div className="flex flex-col gap-8 text-base leading-relaxed text-foreground/85">
          <p>
            עדכון אחרון: {privacy.updated_date}. {privacy.intro}
          </p>

          {privacy.sections.map((s) => (
            <div key={s.heading}>
              <h2 className="font-display font-medium text-xl mb-3">{s.heading}</h2>
              <p>{s.body}</p>
            </div>
          ))}

          <div>
            <h2 className="font-display font-medium text-xl mb-3">יצירת קשר בנושא פרטיות</h2>
            <p>
              שאלות לגבי המסמך הזה או הפרטים שלכם? כתבו ל־
              <a href={`mailto:${contact.email}`} className="underline underline-offset-4 hover:text-[#D1FE17] transition-colors">{contact.email}</a>.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
