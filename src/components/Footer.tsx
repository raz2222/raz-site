import { Link, useLocation } from "react-router-dom"
import { useSiteContent } from "@/hooks/useSiteContent"
import { FOOTER_DEFAULT, CONTACT_INFO_DEFAULT } from "@/lib/siteContentDefaults"
import { Wordmark } from "@/components/icons/Wordmark"

export function Footer() {
  const isEnglish = useLocation().pathname.startsWith("/en")
  const { content: footer } = useSiteContent("footer_content", FOOTER_DEFAULT)
  const { content: contact } = useSiteContent("shared_contact", CONTACT_INFO_DEFAULT)

  if (isEnglish) {
    return (
      <footer dir="ltr" className="bg-[#D1FE17] text-black pt-20 pb-10 text-left">
        <div className="container">
          <div className="font-display font-black text-[clamp(28px,4.4vw,52px)] leading-[1.1] tracking-[-0.04em] max-w-2xl mb-14">
            {footer.tagline_en}
          </div>

          <div className="flex flex-wrap gap-x-10 gap-y-3 font-mono text-sm font-medium uppercase tracking-wide mb-16">
            <Link to="/en/work" className="hover:opacity-60 transition-opacity">Work</Link>
            <Link to="/en/services" className="hover:opacity-60 transition-opacity">Services</Link>
            <Link to="/en/about" className="hover:opacity-60 transition-opacity">About</Link>
            <Link to="/en/guides" className="hover:opacity-60 transition-opacity">Guides</Link>
            <Link to="/en/faq" className="hover:opacity-60 transition-opacity">FAQ</Link>
            <Link to="/en/contact" className="hover:opacity-60 transition-opacity">Contact</Link>
            <a href={contact.instagram_url} target="_blank" rel="noreferrer" className="hover:opacity-60 transition-opacity">Instagram</a>
          </div>

          <div className="flex flex-wrap gap-6 font-mono text-[11px] uppercase tracking-wide opacity-70 mb-16">
            <a href={`mailto:${contact.email}`} className="hover:opacity-60 transition-opacity">{contact.email}</a>
            <Link to="/privacy" className="hover:opacity-60 transition-opacity">Privacy Policy</Link>
            <Link to="/terms" className="hover:opacity-60 transition-opacity">Terms of Service</Link>
          </div>

          <div className="w-full leading-none select-none">
            <span className="font-display font-bold text-[clamp(60px,15vw,220px)] tracking-tight text-black/90">
              RAZ
            </span>
          </div>

          <div className="mt-6 pt-6 border-t border-black/15 font-mono text-[11px] uppercase tracking-wide opacity-70">
            © RAZ / Raz Avramov
          </div>
        </div>
      </footer>
    )
  }

  return (
    <footer className="bg-[#D1FE17] text-black pt-20 pb-10">
      <div className="container">
        <div className="font-display font-black text-[clamp(28px,4.4vw,52px)] leading-[1.1] tracking-[-0.04em] max-w-2xl mb-14">
          {footer.tagline_he}
        </div>

        <div className="flex flex-wrap gap-x-10 gap-y-3 font-mono text-sm font-medium uppercase tracking-wide mb-16">
          <Link to="/work" className="hover:opacity-60 transition-opacity">עבודות</Link>
          <Link to="/services" className="hover:opacity-60 transition-opacity">שירותים</Link>
          <Link to="/about" className="hover:opacity-60 transition-opacity">עליי</Link>
          <Link to="/guides" className="hover:opacity-60 transition-opacity">מדריכים</Link>
          <Link to="/faq" className="hover:opacity-60 transition-opacity">שאלות ותשובות</Link>
          <Link to="/tools" className="hover:opacity-60 transition-opacity">כלים</Link>
          <Link to="/contact" className="hover:opacity-60 transition-opacity">צור קשר</Link>
          <a href={contact.instagram_url} target="_blank" rel="noreferrer" className="hover:opacity-60 transition-opacity">אינסטגרם</a>
        </div>

        <div className="flex flex-wrap gap-6 font-mono text-[11px] uppercase tracking-wide opacity-70 mb-16">
          <a href={`mailto:${contact.email}`} className="hover:opacity-60 transition-opacity">{contact.email}</a>
          <Link to="/privacy" className="hover:opacity-60 transition-opacity">מדיניות פרטיות</Link>
          <Link to="/terms" className="hover:opacity-60 transition-opacity">תנאי שימוש</Link>
        </div>

        <div className="w-full select-none text-black/90">
          <Wordmark className="h-[clamp(48px,12vw,176px)] w-auto" />
        </div>

        <div className="mt-6 pt-6 border-t border-black/15 font-mono text-[11px] uppercase tracking-wide opacity-70">
          © RAZ / Raz Avramov
        </div>
      </div>
    </footer>
  )
}
