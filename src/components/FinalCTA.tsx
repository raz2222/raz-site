import { Link } from "react-router-dom"
import { Reveal } from "./Reveal"
import { useSiteContent } from "@/hooks/useSiteContent"
import { FINAL_CTA_DEFAULT, CONTACT_INFO_DEFAULT } from "@/lib/siteContentDefaults"

export function FinalCTA() {
  const { content: cta } = useSiteContent("home_final_cta", FINAL_CTA_DEFAULT)
  const { content: contact } = useSiteContent("shared_contact", CONTACT_INFO_DEFAULT)
  return (
    <section id="contact" className="min-h-[90dvh] flex flex-col justify-center py-28">
      <div className="container text-center">
        <Reveal>
          <h2 className="font-display font-bold text-[clamp(30px,6vw,72px)] leading-[1.15] tracking-tight">
            {cta.heading_line1}
            <br />
            {cta.heading_line2}
          </h2>
        </Reveal>
        <Reveal delay={150}>
          <Link
            to="/contact"
            className="inline-block mt-10 font-mono text-sm uppercase tracking-wide bg-[#D1FE17] text-black rounded-full px-8 py-4 hover:scale-105 transition-transform"
          >
            {cta.cta_label}
          </Link>
        </Reveal>
        <Reveal delay={220} className="mt-10 flex items-center justify-center gap-6 font-mono text-xs uppercase tracking-wide text-dim">
          <a href={`mailto:${contact.email}`} className="hover:text-[#D1FE17] transition-colors">אימייל</a>
          <a href={contact.instagram_url} target="_blank" rel="noreferrer" className="hover:text-[#D1FE17] transition-colors">אינסטגרם</a>
          <a href={contact.whatsapp_url} target="_blank" rel="noreferrer" className="hover:text-[#D1FE17] transition-colors">וואטסאפ</a>
        </Reveal>
        <Reveal delay={280} className="mt-4 font-mono text-[11px] text-dim uppercase tracking-wide">
          {cta.tagline}
        </Reveal>
      </div>
    </section>
  )
}
