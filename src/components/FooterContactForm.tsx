import { Link, useNavigate } from "react-router-dom"
import { useContactForm } from "@/hooks/useContactForm"
import { ConsentCheckbox } from "@/components/ConsentCheckbox"

const inputClass =
  "w-full bg-transparent border border-black/25 rounded px-4 py-3 text-sm placeholder:text-black/50 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:border-black/60"
const labelClass = "block text-xs font-mono uppercase tracking-wide opacity-60 mb-2"

export function FooterContactForm({ isEnglish }: { isEnglish: boolean }) {
  const navigate = useNavigate()
  const form = useContactForm(() => navigate(isEnglish ? "/en/thank-you" : "/thank-you"))

  return (
    <div className="border-t border-black/15 pt-10 mb-10">
      <h2 className="font-display font-bold text-xl md:text-2xl mb-6">
        {isEnglish ? "Send a quick message" : "כתבו לי כמה מילים"}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">
        <div>
          <label htmlFor="footer-name" className={labelClass}>{isEnglish ? "Full name *" : "שם מלא *"}</label>
          <input
            id="footer-name"
            required
            aria-invalid={!!form.fieldErrors.name}
            aria-describedby={form.fieldErrors.name ? "footer-name-error" : undefined}
            value={form.name}
            onChange={(e) => form.setName(e.target.value)}
            className={inputClass}
          />
          {form.fieldErrors.name && <p id="footer-name-error" role="alert" className="text-xs text-red-700 mt-1.5">{form.fieldErrors.name}</p>}
        </div>
        <div>
          <label htmlFor="footer-email" className={labelClass}>{isEnglish ? "Email *" : "אימייל *"}</label>
          <input
            id="footer-email"
            required
            type="email"
            aria-invalid={!!form.fieldErrors.email}
            aria-describedby={form.fieldErrors.email ? "footer-email-error" : undefined}
            value={form.email}
            onChange={(e) => form.setEmail(e.target.value)}
            className={inputClass}
          />
          {form.fieldErrors.email && <p id="footer-email-error" role="alert" className="text-xs text-red-700 mt-1.5">{form.fieldErrors.email}</p>}
        </div>
        <div className="md:col-span-2">
          <label htmlFor="footer-message" className={labelClass}>{isEnglish ? "Message (optional)" : "הודעה (אופציונלי)"}</label>
          <textarea
            id="footer-message"
            rows={3}
            value={form.message}
            onChange={(e) => form.setMessage(e.target.value)}
            className={inputClass}
          />
        </div>

        {form.error && <p role="alert" className="md:col-span-2 text-sm text-red-700">{form.error}</p>}

        <div className="md:col-span-2">
          <ConsentCheckbox
            id="footer-consent"
            checked={form.consent}
            onChange={form.setConsent}
            error={form.fieldErrors.consent}
            dark={false}
          >
            {isEnglish ? (
              <>
                I've read and agree to the{" "}
                <Link to="/privacy" className="underline underline-offset-4 hover:opacity-60">privacy policy</Link>
                , and consent to my details being used to get back to me. *
              </>
            ) : (
              <>
                קראתי ואני מסכים/ה ל
                <Link to="/privacy" className="underline underline-offset-4 hover:opacity-60">מדיניות הפרטיות</Link>
                , ומאשר/ת שהפרטים שמסרתי ישמשו ליצירת קשר בלבד. *
              </>
            )}
          </ConsentCheckbox>
        </div>

        <button
          onClick={form.handleSubmit}
          disabled={form.submitting}
          className="md:col-span-2 mt-1 font-mono text-xs uppercase tracking-wide bg-black text-[#D1FE17] rounded-full px-6 py-3 hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100 w-fit"
        >
          {form.submitting ? (isEnglish ? "Sending…" : "שולח…") : isEnglish ? "Send →" : "שליחה ←"}
        </button>
      </div>
    </div>
  )
}
