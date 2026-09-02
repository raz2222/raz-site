import { useContext } from "react"
import { WhatsAppMessageContext } from "@/hooks/useWhatsAppMessage"
import { trackEvent } from "@/lib/analytics"
import { whatsappHref } from "@/lib/whatsapp"

export function WhatsAppButton() {
  const { message } = useContext(WhatsAppMessageContext)
  return (
    <a
      href={whatsappHref({ message })}
      target="_blank"
      rel="noreferrer"
      aria-label="שלחו הודעה בוואטסאפ"
      onClick={() => trackEvent("whatsapp_click", { location: "floating_button" })}
      className="hidden md:flex fixed bottom-6 left-6 z-50 w-14 h-14 rounded-full bg-[#D1FE17] items-center justify-center shadow-lg hover:scale-105 transition-transform"
    >
      <svg viewBox="0 0 24 24" fill="black" className="w-7 h-7">
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm5.78 14.15c-.24.68-1.4 1.3-1.94 1.38-.5.08-1.12.11-1.81-.11-.42-.13-.95-.31-1.64-.6-2.88-1.24-4.76-4.15-4.9-4.34-.14-.19-1.17-1.56-1.17-2.98 0-1.42.74-2.11 1-2.4.26-.29.57-.36.76-.36.19 0 .38 0 .55.01.18.01.41-.07.64.49.24.58.81 1.99.88 2.13.07.15.12.32.02.51-.1.19-.15.31-.29.48-.15.17-.31.38-.44.51-.15.15-.3.31-.13.6.17.29.76 1.25 1.63 2.02 1.12 1 2.06 1.31 2.35 1.46.29.15.46.13.63-.08.17-.21.72-.84.91-1.13.19-.29.38-.24.64-.14.26.1 1.64.77 1.92.91.28.14.47.21.54.33.07.12.07.68-.17 1.36Z" />
      </svg>
    </a>
  )
}
