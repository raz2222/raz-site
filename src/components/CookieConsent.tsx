import { useEffect, useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { disableAnalytics, initAnalytics } from "@/lib/analytics"
import { getStoredConsent, storeConsent } from "@/lib/consent"

export function CookieConsent() {
  const [open, setOpen] = useState(false)
  const isEnglish = useLocation().pathname.startsWith("/en")

  useEffect(() => {
    if (getStoredConsent() === "granted") initAnalytics()
    else disableAnalytics()
    if (getStoredConsent() === null) setOpen(true)

    function reopen() {
      setOpen(true)
    }
    window.addEventListener("open-cookie-settings", reopen)
    return () => window.removeEventListener("open-cookie-settings", reopen)
  }, [])

  function accept() {
    storeConsent("granted")
    initAnalytics()
    setOpen(false)
  }

  function decline() {
    storeConsent("denied")
    disableAnalytics()
    setOpen(false)
  }

  if (!open) return null

  return (
    <div
      dir={isEnglish ? "ltr" : "rtl"}
      role="dialog"
      aria-live="polite"
      aria-label={isEnglish ? "Cookie consent" : "הסכמה לעוגיות"}
      className="fixed inset-x-0 bottom-[4.5rem] px-4 md:inset-x-auto md:bottom-6 md:right-6 md:px-0 z-[60]"
    >
      <div className="max-w-md w-full bg-[#0A0A0A] border border-white/10 rounded-2xl p-5 md:p-6 shadow-2xl shadow-black/50">
        <p className="text-sm leading-relaxed text-[#F6F6F4]/90">
          {isEnglish ? (
            <>
              This site uses cookies for basic traffic analytics (Google Analytics). They only run after you say
              yes. See the{" "}
              <Link to="/privacy" className="underline underline-offset-4 hover:text-[#D1FE17] transition-colors">
                privacy policy
              </Link>
              .
            </>
          ) : (
            <>
              האתר משתמש בעוגיות לצורך אנליטיקס בסיסי (Google Analytics). הן יופעלו רק אם תאשרו זאת. פרטים נוספים ב
              <Link to="/privacy" className="underline underline-offset-4 hover:text-[#D1FE17] transition-colors">
                {" "}מדיניות הפרטיות
              </Link>
              .
            </>
          )}
        </p>
        <div className="flex items-center gap-3 mt-4">
          <button
            onClick={accept}
            className="font-mono text-[10px] uppercase tracking-wide bg-[#D1FE17] text-black rounded-full px-5 py-2.5 hover:scale-105 transition-transform"
          >
            {isEnglish ? "Accept" : "מאשר/ת"}
          </button>
          <button
            onClick={decline}
            className="font-mono text-xs uppercase tracking-wide border border-white/20 text-[#F6F6F4] rounded-full px-5 py-2.5 hover:border-[#D1FE17] transition-colors"
          >
            {isEnglish ? "Decline" : "דוחה"}
          </button>
        </div>
      </div>
    </div>
  )
}
