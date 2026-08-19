import { useNavigate } from "react-router-dom"
import { useDocumentMeta } from "@/hooks/useDocumentMeta"
import { useHreflang } from "@/hooks/useHreflang"
import { Reveal } from "@/components/Reveal"
import { Breadcrumbs } from "@/components/Breadcrumbs"
import { useSiteContent } from "@/hooks/useSiteContent"
import { CONTACT_PAGE_DEFAULT, CONTACT_INFO_DEFAULT } from "@/lib/siteContentDefaults"
import { trackEvent } from "@/lib/analytics"
import { useContactForm } from "@/hooks/useContactForm"
import { ContactFormFields } from "@/components/ContactFormFields"

export function Contact() {
  useDocumentMeta(
    "צור קשר — RAZ",
    "בואו נתחיל פרויקט — אתר, קמפיין AI או סרטון. חבילת יצירת תוכן AI כוללת סרטון מתנה."
  )
  useHreflang("/contact", "/en/contact")
  const navigate = useNavigate()
  const { content: page } = useSiteContent("contact_page", CONTACT_PAGE_DEFAULT)
  const { content: contact } = useSiteContent("shared_contact", CONTACT_INFO_DEFAULT)
  const form = useContactForm(() => navigate("/thank-you"))

  return (
    <section className="pt-32 pb-28 md:pt-40 md:pb-40 min-h-[90dvh]">
      <div className="container max-w-2xl">
        <Breadcrumbs items={[{ label: "בית", to: "/" }, { label: "צור קשר" }]} />
        <Reveal className="font-mono text-xs uppercase tracking-wide text-dim mb-4">
          ( צור קשר )
        </Reveal>
        <Reveal>
          <h1 className="font-display font-black text-[clamp(34px,6.1vw,68px)] leading-[1.1] tracking-tight mb-6">
            {page.heading}
          </h1>
        </Reveal>

        <Reveal delay={140}>
          <ContactFormFields form={form} giftNote={page.gift_note} />
        </Reveal>

        <div className="mt-14 pt-6 border-t border-white/10 font-mono text-xs text-dim uppercase tracking-wide">
          מעדיפים וואטסאפ? <a href={contact.whatsapp_url} target="_blank" rel="noreferrer" onClick={() => trackEvent("whatsapp_click", { location: "contact_page" })} className="underline underline-offset-4 text-foreground hover:text-[#D1FE17] transition-colors">כתבו לי כאן ←</a>
        </div>
      </div>
    </section>
  )
}
