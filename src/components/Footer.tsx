import { Link, useLocation } from "react-router-dom"
import { useSiteContent } from "@/hooks/useSiteContent"
import { FOOTER_DEFAULT, CONTACT_INFO_DEFAULT } from "@/lib/siteContentDefaults"
import { Wordmark } from "@/components/icons/Wordmark"
import { clearConsent } from "@/lib/consent"
import { useSubServices } from "@/hooks/useContent"
import { useProjects } from "@/hooks/useProjects"
import { FooterContactForm } from "@/components/FooterContactForm"

const COLUMN_LIMIT = 6

export function Footer() {
  const isEnglish = useLocation().pathname.startsWith("/en")
  const { content: footer } = useSiteContent("footer_content", FOOTER_DEFAULT)
  const { content: contact } = useSiteContent("shared_contact", CONTACT_INFO_DEFAULT)
  const { subServices } = useSubServices()
  const { projects } = useProjects()
  const aiProjects = projects.filter((p) => p.project_type === "ai")
  const websiteProjects = projects.filter((p) => p.project_type === "website")

  if (isEnglish) {
    return (
      <footer dir="ltr" className="bg-[#D1FE17] text-black pt-20 pb-10 text-left">
        <div className="container">
          <div className="font-display font-black text-[clamp(32px,5vw,60px)] leading-[1.1] tracking-[-0.04em] max-w-2xl mb-14">
            {footer.tagline_en}
          </div>

          <div className="flex flex-col md:flex-row gap-x-16 gap-y-12 mb-10">
            <div className="md:flex-none md:w-[300px]">
              <FooterContactForm isEnglish />
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-10 md:flex-1">
              <div className="flex flex-col gap-3">
                <div className="font-mono text-base font-bold uppercase tracking-wide">Sitemap</div>
                <div className="flex flex-col gap-2.5 font-mono text-sm font-medium uppercase tracking-wide">
                  <Link to="/en/work" className="hover:opacity-60 transition-opacity">Work</Link>
                  <Link to="/en/services" className="hover:opacity-60 transition-opacity">Services</Link>
                  <Link to="/en/about" className="hover:opacity-60 transition-opacity">About</Link>
                  <Link to="/en/guides" className="hover:opacity-60 transition-opacity">Guides</Link>
                  <Link to="/en/faq" className="hover:opacity-60 transition-opacity">FAQ</Link>
                  <Link to="/en/contact" className="hover:opacity-60 transition-opacity">Contact</Link>
                  <a href={contact.instagram_url} target="_blank" rel="noreferrer" className="hover:opacity-60 transition-opacity">Instagram</a>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <div className="font-mono text-base font-bold uppercase tracking-wide">Services</div>
                <div className="flex flex-col gap-2.5 font-mono text-sm font-medium">
                  {subServices.slice(0, COLUMN_LIMIT).map((s) => (
                    <Link key={s.slug} to={`/en/services`} className="hover:opacity-60 transition-opacity">{s.title}</Link>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <div className="font-mono text-base font-bold uppercase tracking-wide">AI Work</div>
                <div className="flex flex-col gap-2.5 font-mono text-sm font-medium">
                  {aiProjects.slice(0, COLUMN_LIMIT).map((p) => (
                    <Link key={p.slug} to={`/en/work/${p.slug}`} className="hover:opacity-60 transition-opacity">{p.title}</Link>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <div className="font-mono text-base font-bold uppercase tracking-wide">Website Projects</div>
                <div className="flex flex-col gap-2.5 font-mono text-sm font-medium">
                  {websiteProjects.slice(0, COLUMN_LIMIT).map((p) => (
                    <Link key={p.slug} to={`/en/work/${p.slug}`} className="hover:opacity-60 transition-opacity">{p.title}</Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 font-mono text-[11px] uppercase tracking-wide opacity-70 mb-16">
            <a href={`mailto:${contact.email}`} className="hover:opacity-60 transition-opacity">{contact.email}</a>
            <Link to="/privacy" className="hover:opacity-60 transition-opacity">Privacy Policy</Link>
            <Link to="/terms" className="hover:opacity-60 transition-opacity">Terms of Service</Link>
            <button onClick={clearConsent} className="text-left hover:opacity-60 transition-opacity">Cookie Settings</button>
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
        <div className="font-display font-black text-[clamp(32px,5vw,60px)] leading-[1.1] tracking-[-0.04em] max-w-2xl mb-14">
          {footer.tagline_he}
        </div>

        <div className="flex flex-col md:flex-row gap-x-16 gap-y-12 mb-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-10 text-right md:flex-1">
            <div className="flex flex-col items-start gap-3">
              <div className="font-mono text-base font-bold uppercase tracking-wide">מפת אתר</div>
              <div className="flex flex-col items-start gap-2.5 font-mono text-sm font-medium uppercase tracking-wide">
                <Link to="/work" className="hover:opacity-60 transition-opacity">עבודות</Link>
                <Link to="/services" className="hover:opacity-60 transition-opacity">שירותים</Link>
                <Link to="/about" className="hover:opacity-60 transition-opacity">עליי</Link>
                <Link to="/guides" className="hover:opacity-60 transition-opacity">מדריכים</Link>
                <Link to="/faq" className="hover:opacity-60 transition-opacity">שאלות ותשובות</Link>
                <Link to="/tools" className="hover:opacity-60 transition-opacity">כלים</Link>
                <Link to="/contact" className="hover:opacity-60 transition-opacity">צור קשר</Link>
                <a href={contact.instagram_url} target="_blank" rel="noreferrer" className="hover:opacity-60 transition-opacity">אינסטגרם</a>
              </div>
            </div>

            <div className="flex flex-col items-start gap-3">
              <div className="font-mono text-base font-bold uppercase tracking-wide">כל השירותים</div>
              <div className="flex flex-col items-start gap-2.5 font-mono text-sm font-medium">
                {subServices.slice(0, COLUMN_LIMIT).map((s) => (
                  <Link key={s.slug} to={`/services/${s.hub_slug}/${s.slug}`} className="hover:opacity-60 transition-opacity">{s.title}</Link>
                ))}
              </div>
            </div>

            <div className="flex flex-col items-start gap-3">
              <div className="font-mono text-base font-bold uppercase tracking-wide">פרויקטי AI</div>
              <div className="flex flex-col items-start gap-2.5 font-mono text-sm font-medium">
                {aiProjects.slice(0, COLUMN_LIMIT).map((p) => (
                  <Link key={p.slug} to={`/work/${p.slug}`} className="hover:opacity-60 transition-opacity">{p.title}</Link>
                ))}
              </div>
            </div>

            <div className="flex flex-col items-start gap-3">
              <div className="font-mono text-base font-bold uppercase tracking-wide">פרויקטי בניית אתרים</div>
              <div className="flex flex-col items-start gap-2.5 font-mono text-sm font-medium">
                {websiteProjects.slice(0, COLUMN_LIMIT).map((p) => (
                  <Link key={p.slug} to={`/work/${p.slug}`} className="hover:opacity-60 transition-opacity">{p.title}</Link>
                ))}
              </div>
            </div>
          </div>

          <div className="md:flex-none md:w-[300px]">
            <FooterContactForm isEnglish={false} />
          </div>
        </div>

        <div className="flex flex-col items-start gap-2 font-mono text-[11px] uppercase tracking-wide opacity-70 mb-16">
          <a href={`mailto:${contact.email}`} className="hover:opacity-60 transition-opacity">{contact.email}</a>
          <Link to="/privacy" className="hover:opacity-60 transition-opacity">מדיניות פרטיות</Link>
          <Link to="/terms" className="hover:opacity-60 transition-opacity">תנאי שימוש</Link>
          <button onClick={clearConsent} className="hover:opacity-60 transition-opacity">הגדרות עוגיות</button>
        </div>

        <div className="w-full flex justify-start select-none text-black/90">
          <Wordmark className="h-[clamp(92px,12vw,176px)] w-auto" />
        </div>

        <div className="mt-6 pt-6 border-t border-black/15 font-mono text-[11px] uppercase tracking-wide opacity-70">
          © RAZ / Raz Avramov
        </div>
      </div>
    </footer>
  )
}
