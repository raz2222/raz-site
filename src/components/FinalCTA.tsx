import { Reveal } from "./Reveal"
import { AutoVideo } from "./AutoVideo"
import { useSiteContent } from "@/hooks/useSiteContent"
import { FINAL_CTA_DEFAULT, CONTACT_INFO_DEFAULT } from "@/lib/siteContentDefaults"
import { trackEvent } from "@/lib/analytics"
import { useContactModal } from "@/hooks/useContactModal"

export function FinalCTA() {
  const { content: cta } = useSiteContent("home_final_cta", FINAL_CTA_DEFAULT)
  const { content: contact } = useSiteContent("shared_contact", CONTACT_INFO_DEFAULT)
  const { openModal } = useContactModal()
  return (
    <section id="contact" className="relative overflow-hidden min-h-[90dvh] flex flex-col justify-center py-28 section-divider">
      <div className="absolute inset-0" aria-hidden="true">
        <AutoVideo src="/videos/raz-showreel.mp4" className="w-full h-full object-cover contrast-[1.05] brightness-[0.6]" />
        <div className="absolute inset-0 bg-black/70" />
      </div>
      <div className="relative container text-center">
        <Reveal>
          <h2 className="font-display font-bold text-[clamp(34px,6.6vw,80px)] leading-[1.15] tracking-[-0.04em] text-gradient-accent text-shimmer">
            {cta.heading_line1}
            <br />
            {cta.heading_line2}
          </h2>
        </Reveal>
        <Reveal delay={90}>
          <p className="mt-6 max-w-lg mx-auto text-dim text-base md:text-lg leading-relaxed">{cta.body}</p>
        </Reveal>
        <Reveal delay={150}>
          <button
            onClick={() => {
              trackEvent("contact_click", { location: "final_cta" })
              openModal()
            }}
            className="inline-flex items-center justify-center w-full sm:w-fit mt-10 font-mono text-sm font-bold uppercase tracking-wide bg-[#D1FE17] text-black rounded-[8px] px-7 py-4 hover:scale-105 transition-transform"
          >
            {cta.cta_label}
          </button>
        </Reveal>
        {/* Only email + WhatsApp here — these keep the conversation with the client going.
            Instagram sends people away from the site instead of toward a reply; it lives in the footer/nav instead. */}
        <Reveal delay={220} className="mt-10 flex items-center justify-center gap-6 font-mono text-xs uppercase tracking-wide text-dim">
          <a href={`mailto:${contact.email}`} className="hover:text-[#D1FE17] transition-colors">אימייל</a>
          <a href={contact.whatsapp_url} target="_blank" rel="noreferrer" onClick={() => trackEvent("whatsapp_click", { location: "final_cta" })} className="hover:text-[#D1FE17] transition-colors">וואטסאפ</a>
        </Reveal>
        <Reveal delay={280} className="mt-4 font-mono text-[11px] text-dim uppercase tracking-wide">
          {cta.tagline}
        </Reveal>
      </div>
    </section>
  )
}
