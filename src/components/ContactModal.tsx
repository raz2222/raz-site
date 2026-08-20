import { useEffect, useRef, useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useContactForm } from "@/hooks/useContactForm"
import { useContactModal } from "@/hooks/useContactModal"
import { useSiteContent } from "@/hooks/useSiteContent"
import { CONTACT_PAGE_DEFAULT } from "@/lib/siteContentDefaults"
import { PROJECT_TYPES } from "@/lib/contactFormData"
import { PROJECT_TYPES_EN } from "@/lib/contactFormDataEn"
import { cn } from "@/lib/utils"
import { ConsentCheckbox } from "@/components/ConsentCheckbox"

const inputClass =
  "w-full bg-transparent border border-white/30 rounded px-4 py-3 text-sm focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:border-white/50"
const labelClass = "block text-xs font-mono text-dim uppercase tracking-wide mb-2"
const optionClass =
  "text-right border rounded-[8px] px-4 py-3 md:px-5 md:py-4 transition-colors"
const optionSelectedClass = "border-[#D1FE17] bg-[#D1FE17] text-black"
const optionIdleClass = "border-white/15 hover:border-[#D1FE17]"

export function ContactModal() {
  const { open, closeModal } = useContactModal()
  const navigate = useNavigate()
  const isEnglish = useLocation().pathname.startsWith("/en")
  const { content: page } = useSiteContent("contact_page", CONTACT_PAGE_DEFAULT)
  const dialogRef = useRef<HTMLDivElement>(null)
  const [step, setStep] = useState(0)
  const projectTypes = isEnglish ? PROJECT_TYPES_EN : PROJECT_TYPES

  const form = useContactForm(() => {
    closeModal()
    navigate(isEnglish ? "/en/thank-you" : "/thank-you")
  }, { isEnglish })

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal()
    }
    document.addEventListener("keydown", onKeyDown)
    document.body.style.overflow = "hidden"
    dialogRef.current?.focus()
    return () => {
      document.removeEventListener("keydown", onKeyDown)
      document.body.style.overflow = ""
    }
  }, [open, closeModal])

  useEffect(() => {
    if (open) setStep(0)
  }, [open])

  if (!open) return null

  return (
    <div
      dir={isEnglish ? "ltr" : "rtl"}
      className="fixed inset-0 z-[100] flex items-start md:items-center justify-center overflow-y-auto bg-black/92 backdrop-blur-md px-4 py-6 md:py-8"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) closeModal()
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="contact-modal-heading"
        tabIndex={-1}
        className={cn("relative w-full max-w-lg bg-black rounded-[24px] p-5 md:p-10 outline-none", isEnglish && "text-left")}
      >
        <button
          onClick={closeModal}
          aria-label={isEnglish ? "Close" : "סגירה"}
          className={cn("absolute top-4 w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors text-2xl leading-none", isEnglish ? "right-4" : "left-4")}
        >
          ×
        </button>

        <h2 id="contact-modal-heading" className="font-display font-black text-[clamp(22px,4vw,34px)] leading-[1.15] tracking-[-0.04em] mb-4 md:mb-6 text-gradient-accent">
          {isEnglish ? "Let's build something." : page.heading}
        </h2>

        {step > 0 && form.projectType && page.gift_note && (
          <div className="border border-[#D1FE17]/40 rounded-lg p-4 md:p-5 mb-4 md:mb-6 bg-[#D1FE17]/[0.06]">
            <span className="inline-block font-mono text-[10px] font-bold uppercase tracking-wide bg-[#D1FE17] text-black rounded-full px-2.5 py-1 mb-2">{isEnglish ? "Gift 🎁" : "מתנה 🎁"}</span>
            <p className="text-sm leading-relaxed text-[#D1FE17]">{page.gift_note}</p>
          </div>
        )}

        <div className="mb-5 md:mb-8 flex gap-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className={cn("h-1 flex-1 rounded-full transition-colors", i <= step ? "bg-foreground" : "bg-white/10")} />
          ))}
        </div>

        {step === 0 && (
          <div>
            <h3 className="font-display text-xl md:text-2xl font-medium mb-4 md:mb-6">{isEnglish ? "What are we building?" : "מה אנחנו בונים?"}</h3>
            <div className="flex flex-col gap-2.5 md:gap-3">
              {projectTypes.map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    form.handleProjectTypeChange(t)
                    setStep(1)
                  }}
                  className={cn(optionClass, isEnglish && "text-left", form.projectType === t ? optionSelectedClass : optionIdleClass)}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 1 && (
          <div>
            <h3 className="font-display text-xl md:text-2xl font-medium mb-4 md:mb-6">{isEnglish ? "Estimated budget?" : "מה התקציב המשוער?"}</h3>
            <div className="flex flex-col gap-2.5 md:gap-3">
              {form.budgetOptions.map((b) => (
                <button
                  key={b}
                  onClick={() => form.setBudget(b)}
                  className={cn(optionClass, isEnglish && "text-left", form.budget === b ? optionSelectedClass : optionIdleClass)}
                >
                  {b}
                </button>
              ))}
            </div>

            {form.qualifyingQuestion && (
              <div className="mt-6 md:mt-8">
                <h4 className="font-mono text-xs uppercase tracking-wide text-dim mb-3">{form.qualifyingQuestion.label}</h4>
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

            <div className="mt-6 md:mt-8 flex items-center gap-5">
              <button
                onClick={() => setStep(2)}
                disabled={!form.budget}
                className="font-mono text-sm font-bold uppercase tracking-wide bg-[#D1FE17] text-black rounded-[8px] px-6 py-3 hover:scale-105 transition-transform disabled:opacity-40 disabled:hover:scale-100"
              >
                {isEnglish ? "Continue →" : "המשך ←"}
              </button>
              <button onClick={() => setStep(0)} className="font-mono text-xs uppercase text-dim underline underline-offset-4 hover:text-[#D1FE17] transition-colors">
                {isEnglish ? "← Back" : "→ חזרה"}
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h3 className="font-display text-xl md:text-2xl font-medium mb-4 md:mb-6">{isEnglish ? "How can we reach you?" : "איך יוצרים איתכם קשר?"}</h3>
            <div className="flex flex-col gap-3 md:gap-4">
              <div>
                <label htmlFor="contact-modal-name" className={labelClass}>{isEnglish ? "Full name *" : "שם מלא *"}</label>
                <input
                  id="contact-modal-name"
                  required
                  aria-invalid={!!form.fieldErrors.name}
                  aria-describedby={form.fieldErrors.name ? "contact-modal-name-error" : undefined}
                  placeholder={isEnglish ? "Full name" : "שם מלא"}
                  value={form.name}
                  onChange={(e) => form.setName(e.target.value)}
                  className={cn(inputClass, form.fieldErrors.name && "border-red-400")}
                />
                {form.fieldErrors.name && <p id="contact-modal-name-error" role="alert" className="text-xs text-red-400 mt-1.5">{form.fieldErrors.name}</p>}
              </div>

              <div>
                <label htmlFor="contact-modal-email" className={labelClass}>{isEnglish ? "Email *" : "אימייל *"}</label>
                <input
                  id="contact-modal-email"
                  required
                  type="email"
                  aria-invalid={!!form.fieldErrors.email}
                  aria-describedby={form.fieldErrors.email ? "contact-modal-email-error" : undefined}
                  placeholder={isEnglish ? "Email" : "אימייל"}
                  value={form.email}
                  onChange={(e) => form.setEmail(e.target.value)}
                  className={cn(inputClass, form.fieldErrors.email && "border-red-400")}
                />
                {form.fieldErrors.email && <p id="contact-modal-email-error" role="alert" className="text-xs text-red-400 mt-1.5">{form.fieldErrors.email}</p>}
              </div>

              <div>
                <label htmlFor="contact-modal-phone" className={labelClass}>{isEnglish ? "Phone (optional)" : "טלפון (אופציונלי)"}</label>
                <input
                  id="contact-modal-phone"
                  placeholder={isEnglish ? "Phone" : "טלפון"}
                  value={form.phone}
                  onChange={(e) => form.setPhone(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="contact-modal-company" className={labelClass}>{isEnglish ? "Company / business (optional)" : "חברה / עסק (אופציונלי)"}</label>
                <input
                  id="contact-modal-company"
                  placeholder={isEnglish ? "Company / business" : "חברה / עסק"}
                  value={form.company}
                  onChange={(e) => form.setCompany(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="contact-modal-message" className={labelClass}>{isEnglish ? "Tell me a bit about the project" : "ספרו לי קצת על הפרויקט"}</label>
                <textarea
                  id="contact-modal-message"
                  placeholder={isEnglish ? "Tell me a bit about the project" : "ספרו לי קצת על הפרויקט"}
                  rows={4}
                  value={form.message}
                  onChange={(e) => form.setMessage(e.target.value)}
                  className={inputClass}
                />
              </div>

              {form.error && <p role="alert" className="text-sm text-red-400">{form.error}</p>}

              <ConsentCheckbox
                id="contact-modal-consent"
                checked={form.consent}
                onChange={form.setConsent}
                error={form.fieldErrors.consent}
              >
                {isEnglish ? (
                  <>
                    I've read and agree to the{" "}
                    <Link to="/privacy" className="underline underline-offset-4 hover:text-[#D1FE17] transition-colors">privacy policy</Link>
                    , and consent to my details being used to get back to me about this project and never shared with third parties. *
                  </>
                ) : (
                  <>
                    קראתי ואני מסכים/ה ל
                    <Link to="/privacy" className="underline underline-offset-4 hover:text-[#D1FE17] transition-colors">מדיניות הפרטיות</Link>
                    , ומאשר/ת שהפרטים שמסרתי ישמשו ליצירת קשר בנוגע לפרויקט ולא יועברו לצד שלישי. *
                  </>
                )}
              </ConsentCheckbox>

              <button
                onClick={form.handleSubmit}
                disabled={form.submitting}
                className="mt-2 font-mono text-sm font-bold uppercase tracking-wide bg-[#D1FE17] text-black rounded-[8px] px-6 py-3 hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100 w-fit"
              >
                {form.submitting ? (isEnglish ? "Sending…" : "שולח…") : isEnglish ? "Send project →" : "שליחת הפרויקט ←"}
              </button>
              <button onClick={() => setStep(1)} className="font-mono text-xs uppercase text-dim underline underline-offset-4 self-start hover:text-[#D1FE17] transition-colors">
                {isEnglish ? "← Back" : "→ חזרה"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
