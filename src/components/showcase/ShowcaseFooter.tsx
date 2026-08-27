import { useSiteContent } from "@/hooks/useSiteContent"
import { CONTACT_INFO_DEFAULT } from "@/lib/siteContentDefaults"
import { Wordmark } from "@/components/icons/Wordmark"
import { LegalLink } from "@/components/LegalLink"

export function ShowcaseFooter() {
  const { content: contact } = useSiteContent("shared_contact", CONTACT_INFO_DEFAULT)

  return (
    <footer dir="ltr" className="border-t border-white/10 pt-16 pb-10 text-left">
      <div className="container flex flex-col md:flex-row md:items-end md:justify-between gap-10">
        <div>
          <Wordmark className="h-6 w-auto mb-4" />
          <a href={`mailto:${contact.email}`} className="font-mono text-sm text-dim hover:text-[#D1FE17] transition-colors">
            {contact.email}
          </a>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2 font-mono text-xs uppercase tracking-wide text-dim">
          <a href={contact.instagram_url} target="_blank" rel="noreferrer" className="hover:text-[#D1FE17] transition-colors">
            Instagram
          </a>
          <a href={contact.linkedin_url} target="_blank" rel="noreferrer" className="hover:text-[#D1FE17] transition-colors">
            LinkedIn
          </a>
        </div>
      </div>
      <div className="container mt-14 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 font-mono text-[11px] uppercase tracking-wide text-dim">
        <span>© RAZ / Raz Avramov</span>
        <LegalLink to="/privacy" className="hover:text-[#D1FE17] transition-colors">
          Privacy Policy
        </LegalLink>
      </div>
    </footer>
  )
}
