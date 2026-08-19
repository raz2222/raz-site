import { useEffect, useRef, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useContactForm } from "@/hooks/useContactForm"
import { useContactModal } from "@/hooks/useContactModal"
import { useSiteContent } from "@/hooks/useSiteContent"
import { CONTACT_PAGE_DEFAULT } from "@/lib/siteContentDefaults"
import { PROJECT_TYPES, AI_GIFT_TYPES } from "@/lib/contactFormData"
import { cn } from "@/lib/utils"

const inputClass =
  "w-full bg-transparent border border-white/30 rounded px-4 py-3 text-sm focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:border-white/50"
const labelClass = "block text-xs font-mono text-dim uppercase tracking-wide mb-2"
const optionClass =
  "text-right border rounded-[8px] px-5 py-4 transition-colors"
const optionSelectedClass = "border-foreground bg-white/5"
const optionIdleClass = "border-white/15 hover:border-[#D1FE17]"

export function ContactModal() {
  const { open, closeModal } = useContactModal()
  const navigate = useNavigate()
  const { content: page } = useSiteContent("contact_page", CONTACT_PAGE_DEFAULT)
  const dialogRef = useRef<HTMLDivElement>(null)
  const [step, setStep] = useState(0)

  const form = useContactForm(() => {
    closeModal()
    navigate("/thank-you")
  })

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
      className="fixed inset-0 z-[100] flex items-start md:items-center justify-center overflow-y-auto bg-black/70 backdrop-blur-sm px-4 py-8"
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
        className="relative w-full max-w-lg bg-background surface-raised rounded-[24px] p-6 md:p-10 outline-none"
      >
        <button
          onClick={closeModal}
          aria-label="סגירה"
          className="absolute top-4 left-4 w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors text-2xl leading-none"
        >
          ×
        </button>

        <h2 id="contact-modal-heading" className="font-display font-black text-[clamp(24px,4vw,34px)] leading-[1.15] tracking-[-0.04em] mb-6 text-gradient-accent">
          {page.heading}
        </h2>

        {step > 0 && form.projectType && AI_GIFT_TYPES.includes(form.projectType) && page.gift_note && (
          <div className="border border-[#D1FE17] rounded-lg p-5 mb-6 bg-[#D1FE17]/10">
            <p className="text-sm leading-relaxed text-[#D1FE17] font-medium">{page.gift_note}</p>
          </div>
        )}

        <div className="mb-8 flex gap-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className={cn("h-1 flex-1 rounded-full transition-colors", i <= step ? "bg-foreground" : "bg-white/10")} />
          ))}
        </div>

        {step === 0 && (
          <div>
            <h3 className="font-display text-xl md:text-2xl font-medium mb-6">מה אנחנו בונים?</h3>
            <div className="flex flex-col gap-3">
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
          <div>
            <h3 className="font-display text-xl md:text-2xl font-medium mb-6">מה התקציב המשוער?</h3>
            <div className="flex flex-col gap-3">
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
              <div className="mt-8">
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

            <div className="mt-8 flex items-center gap-5">
              <button
                onClick={() => setStep(2)}
                disabled={!form.budget}
                className="font-mono text-xs uppercase tracking-wide bg-[#D1FE17] text-black rounded-[8px] px-6 py-3 hover:scale-105 transition-transform disabled:opacity-40 disabled:hover:scale-100"
              >
                המשך ←
              </button>
              <button onClick={() => setStep(0)} className="font-mono text-xs uppercase text-dim underline underline-offset-4 hover:text-[#D1FE17] transition-colors">
                → חזרה
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h3 className="font-display text-xl md:text-2xl font-medium mb-6">איך יוצרים איתכם קשר?</h3>
            <div className="flex flex-col gap-4">
              <div>
                <label htmlFor="contact-modal-name" className={labelClass}>שם מלא *</label>
                <input
                  id="contact-modal-name"
                  required
                  aria-invalid={!!form.fieldErrors.name}
                  aria-describedby={form.fieldErrors.name ? "contact-modal-name-error" : undefined}
                  placeholder="שם מלא"
                  value={form.name}
                  onChange={(e) => form.setName(e.target.value)}
                  className={cn(inputClass, form.fieldErrors.name && "border-red-400")}
                />
                {form.fieldErrors.name && <p id="contact-modal-name-error" role="alert" className="text-xs text-red-400 mt-1.5">{form.fieldErrors.name}</p>}
              </div>

              <div>
                <label htmlFor="contact-modal-email" className={labelClass}>אימייל *</label>
                <input
                  id="contact-modal-email"
                  required
                  type="email"
                  aria-invalid={!!form.fieldErrors.email}
                  aria-describedby={form.fieldErrors.email ? "contact-modal-email-error" : undefined}
                  placeholder="אימייל"
                  value={form.email}
                  onChange={(e) => form.setEmail(e.target.value)}
                  className={cn(inputClass, form.fieldErrors.email && "border-red-400")}
                />
                {form.fieldErrors.email && <p id="contact-modal-email-error" role="alert" className="text-xs text-red-400 mt-1.5">{form.fieldErrors.email}</p>}
              </div>

              <div>
                <label htmlFor="contact-modal-phone" className={labelClass}>טלפון (אופציונלי)</label>
                <input
                  id="contact-modal-phone"
                  placeholder="טלפון"
                  value={form.phone}
                  onChange={(e) => form.setPhone(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="contact-modal-company" className={labelClass}>חברה / עסק (אופציונלי)</label>
                <input
                  id="contact-modal-company"
                  placeholder="חברה / עסק"
                  value={form.company}
                  onChange={(e) => form.setCompany(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="contact-modal-message" className={labelClass}>ספרו לי קצת על הפרויקט</label>
                <textarea
                  id="contact-modal-message"
                  placeholder="ספרו לי קצת על הפרויקט"
                  rows={4}
                  value={form.message}
                  onChange={(e) => form.setMessage(e.target.value)}
                  className={inputClass}
                />
              </div>

              {form.error && <p role="alert" className="text-sm text-red-400">{form.error}</p>}
              <p className="text-xs text-dim leading-relaxed">
                הפרטים שתשלחו ישמשו רק כדי לחזור אליכם בנוגע לפרויקט ולא יועברו לצד שלישי. ראו{" "}
                <Link to="/privacy" className="underline underline-offset-4 hover:text-[#D1FE17] transition-colors">מדיניות הפרטיות</Link>.
              </p>

              <div>
                <label className="flex items-start gap-2.5 text-xs text-dim leading-relaxed cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={form.consent}
                    onChange={(e) => form.setConsent(e.target.checked)}
                    aria-invalid={!!form.fieldErrors.consent}
                    aria-describedby={form.fieldErrors.consent ? "contact-modal-consent-error" : undefined}
                    className="mt-0.5 h-4 w-4 flex-none accent-[#D1FE17]"
                  />
                  <span>
                    קראתי ואני מסכים/ה ל
                    <Link to="/privacy" className="underline underline-offset-4 hover:text-[#D1FE17] transition-colors">מדיניות הפרטיות</Link>
                    , ומאשר/ת שהפרטים שמסרתי ישמשו ליצירת קשר בנוגע לפרויקט. *
                  </span>
                </label>
                {form.fieldErrors.consent && <p id="contact-modal-consent-error" role="alert" className="text-xs text-red-400 mt-1.5">{form.fieldErrors.consent}</p>}
              </div>

              <button
                onClick={form.handleSubmit}
                disabled={form.submitting}
                className="mt-2 font-mono text-xs uppercase tracking-wide bg-[#D1FE17] text-black rounded-[8px] px-6 py-3 hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100 w-fit"
              >
                {form.submitting ? "שולח…" : "שליחת הפרויקט ←"}
              </button>
              <button onClick={() => setStep(1)} className="font-mono text-xs uppercase text-dim underline underline-offset-4 self-start hover:text-[#D1FE17] transition-colors">
                → חזרה
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
