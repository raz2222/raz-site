import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useContactForm } from "@/hooks/useContactForm"
import { useSiteContent } from "@/hooks/useSiteContent"
import { CONTACT_PAGE_DEFAULT } from "@/lib/siteContentDefaults"
import { PROJECT_TYPES, AI_GIFT_TYPES } from "@/lib/contactFormData"
import { cn } from "@/lib/utils"
import { ConsentCheckbox } from "@/components/ConsentCheckbox"

const inputClass =
  "w-full bg-transparent border border-black/30 rounded px-4 py-3 text-sm placeholder:text-black/50 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:border-black/60"
const labelClass = "block text-xs font-mono uppercase tracking-wide text-black/60 mb-2"
const optionClass = "text-right border rounded-[8px] px-4 py-3 transition-colors"
const optionSelectedClass = "border-black bg-black text-[#D1FE17]"
const optionIdleClass = "border-black/25 hover:border-black"

export function FooterContactForm({ isEnglish }: { isEnglish: boolean }) {
  const navigate = useNavigate()
  const { content: page } = useSiteContent("contact_page", CONTACT_PAGE_DEFAULT)
  const [step, setStep] = useState(0)
  const form = useContactForm(() => navigate(isEnglish ? "/en/thank-you" : "/thank-you"))

  return (
    <div>
      <h2 className="font-display font-bold text-xl md:text-2xl mb-6">
        {isEnglish ? "Send a quick message" : "כתבו לי כמה מילים"}
      </h2>

      {step > 0 && form.projectType && AI_GIFT_TYPES.includes(form.projectType) && page.gift_note && (
        <div className="border border-black/30 rounded-lg p-4 mb-6 bg-black/5 max-w-md">
          <span className="inline-block font-mono text-[10px] uppercase tracking-wide bg-black text-[#D1FE17] rounded-full px-2.5 py-1 mb-2">
            {isEnglish ? "Gift" : "מתנה"}
          </span>
          <p className="text-sm leading-relaxed">{page.gift_note}</p>
        </div>
      )}

      <div className="mb-6 flex gap-2 max-w-md">
        {[0, 1, 2].map((i) => (
          <div key={i} className={cn("h-1 flex-1 rounded-full transition-colors", i <= step ? "bg-black" : "bg-black/15")} />
        ))}
      </div>

      {step === 0 && (
        <div className="max-w-md">
          <h3 className="font-display text-lg md:text-xl font-medium mb-4">
            {isEnglish ? "What are we building?" : "מה אנחנו בונים?"}
          </h3>
          <div className="flex flex-col gap-2.5">
            {PROJECT_TYPES.map((t) => (
              <button
                key={t}
                onClick={() => {
                  form.handleProjectTypeChange(t)
                  setStep(1)
                }}
                className={cn(optionClass, form.projectType === t ? optionSelectedClass : optionIdleClass)}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="max-w-md">
          <h3 className="font-display text-lg md:text-xl font-medium mb-4">
            {isEnglish ? "Estimated budget?" : "מה התקציב המשוער?"}
          </h3>
          <div className="flex flex-col gap-2.5">
            {form.budgetOptions.map((b) => (
              <button
                key={b}
                onClick={() => form.setBudget(b)}
                className={cn(optionClass, form.budget === b ? optionSelectedClass : optionIdleClass)}
              >
                {b}
              </button>
            ))}
          </div>

          {form.qualifyingQuestion && (
            <div className="mt-6">
              <h4 className="font-mono text-xs uppercase tracking-wide text-black/60 mb-3">{form.qualifyingQuestion.label}</h4>
              <div className="flex flex-wrap gap-2">
                {form.qualifyingQuestion.options.map((o) => (
                  <button
                    key={o}
                    onClick={() => form.setQualifyingAnswer(o)}
                    className={cn(
                      "text-sm border rounded-[8px] px-4 py-2 transition-colors",
                      form.qualifyingAnswer === o ? optionSelectedClass : optionIdleClass
                    )}
                  >
                    {o}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 flex items-center gap-5">
            <button
              onClick={() => setStep(2)}
              disabled={!form.budget}
              className="font-mono text-xs uppercase tracking-wide bg-black text-[#D1FE17] rounded-[8px] px-6 py-3 hover:scale-105 transition-transform disabled:opacity-40 disabled:hover:scale-100"
            >
              {isEnglish ? "Continue →" : "המשך ←"}
            </button>
            <button onClick={() => setStep(0)} className="font-mono text-xs uppercase text-black/60 underline underline-offset-4 hover:text-black transition-colors">
              {isEnglish ? "← Back" : "→ חזרה"}
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="max-w-2xl">
          <h3 className="font-display text-lg md:text-xl font-medium mb-4">
            {isEnglish ? "How can we reach you?" : "איך יוצרים איתכם קשר?"}
          </h3>
          <div className="grid grid-cols-1 gap-4">
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

            <div className="md:col-span-2 flex items-center gap-5">
              <button
                onClick={form.handleSubmit}
                disabled={form.submitting}
                className="font-mono text-xs uppercase tracking-wide bg-black text-[#D1FE17] rounded-full px-6 py-3 hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100 w-fit"
              >
                {form.submitting ? (isEnglish ? "Sending…" : "שולח…") : isEnglish ? "Send →" : "שליחה ←"}
              </button>
              <button onClick={() => setStep(1)} className="font-mono text-xs uppercase text-black/60 underline underline-offset-4 hover:text-black transition-colors">
                {isEnglish ? "← Back" : "→ חזרה"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
