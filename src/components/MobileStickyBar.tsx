import { useContext } from "react"
import { Link, useLocation } from "react-router-dom"
import { WhatsAppMessageContext } from "@/hooks/useWhatsAppMessage"
import { trackEvent } from "@/lib/analytics"
import { whatsappHref } from "@/lib/whatsapp"

export function MobileStickyBar() {
  const { message } = useContext(WhatsAppMessageContext)
  const isEnglish = useLocation().pathname.startsWith("/en")

  return (
    <div
      dir={isEnglish ? "ltr" : "rtl"}
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 grid grid-cols-2 border-t border-white/10 bg-background/95 backdrop-blur-xl"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <Link
        to={isEnglish ? "/en/contact" : "/contact"}
        onClick={() => trackEvent("contact_click", { location: "mobile_sticky_bar" })}
        className="flex items-center justify-center py-3.5 font-mono text-[10px] font-bold uppercase tracking-wide border-l border-white/10 bg-[#D1FE17] text-black"
      >
        {isEnglish ? "Contact" : "יצירת קשר"}
      </Link>
      <a
        href={whatsappHref({ message, isEnglish })}
        target="_blank"
        rel="noreferrer"
        onClick={() => trackEvent("whatsapp_click", { location: "mobile_sticky_bar" })}
        className="flex items-center justify-center gap-2 py-3.5 font-mono text-[10px] font-bold uppercase tracking-wide"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
          <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm5.78 14.15c-.24.68-1.4 1.3-1.94 1.38-.5.08-1.12.11-1.81-.11-.42-.13-.95-.31-1.64-.6-2.88-1.24-4.76-4.15-4.9-4.34-.14-.19-1.17-1.56-1.17-2.98 0-1.42.74-2.11 1-2.4.26-.29.57-.36.76-.36.19 0 .38 0 .55.01.18.01.41-.07.64.49.24.58.81 1.99.88 2.13.07.15.12.32.02.51-.1.19-.15.31-.29.48-.15.17-.31.38-.44.51-.15.15-.3.31-.13.6.17.29.76 1.25 1.63 2.02 1.12 1 2.06 1.31 2.35 1.46.29.15.46.13.63-.08.17-.21.72-.84.91-1.13.19-.29.38-.24.64-.14.26.1 1.64.77 1.92.91.28.14.47.21.54.33.07.12.07.68-.17 1.36Z" />
        </svg>
        WhatsApp
      </a>
    </div>
  )
}
