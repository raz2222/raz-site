import { Link } from "react-router-dom"
import { cn } from "@/lib/utils"
import { PROJECT_TYPES, AI_GIFT_TYPES } from "@/lib/contactFormData"
import type { useContactForm } from "@/hooks/useContactForm"
import { ConsentCheckbox } from "@/components/ConsentCheckbox"

const inputClass =
  "w-full bg-transparent border border-white/30 rounded px-4 py-3 text-sm focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:border-white/50"
const labelClass = "block text-xs font-mono text-dim uppercase tracking-wide mb-2"

export function ContactFormFields({
  form,
  giftNote,
}: {
  form: ReturnType<typeof useContactForm>
  giftNote?: string
}) {
  return (
    <div className="flex flex-col gap-4">
      {form.projectType && AI_GIFT_TYPES.includes(form.projectType) && giftNote && (
        <div className="border border-[#D1FE17]/40 rounded-lg p-5 bg-[#D1FE17]/[0.06]">
          <span className="inline-block font-mono text-[10px] uppercase tracking-wide bg-[#D1FE17] text-black rounded-full px-2.5 py-1 mb-2">מתנה 🎁</span>
          <p className="text-sm leading-relaxed text-[#D1FE17]">{giftNote}</p>
        </div>
      )}

      <div>
        <label htmlFor="contact-type" className={labelClass}>מה בונים?</label>
        <select
          id="contact-type"
          value={form.projectType}
          onChange={(e) => form.handleProjectTypeChange(e.target.value)}
          className={cn(inputClass, "appearance-none")}
        >
          <option value="">בחרו סוג פרויקט</option>
          {PROJECT_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      {form.qualifyingQuestion && (
        <div>
          <label htmlFor="contact-qualifying" className={labelClass}>{form.qualifyingQuestion.label}</label>
          <select
            id="contact-qualifying"
            value={form.qualifyingAnswer}
            onChange={(e) => form.setQualifyingAnswer(e.target.value)}
            className={cn(inputClass, "appearance-none")}
          >
            <option value="">בחרו תשובה</option>
            {form.qualifyingQuestion.options.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </div>
      )}

      {form.projectType && (
        <div>
          <label htmlFor="contact-budget" className={labelClass}>מה התקציב המשוער?</label>
          <select
            id="contact-budget"
            value={form.budget}
            onChange={(e) => form.setBudget(e.target.value)}
            className={cn(inputClass, "appearance-none")}
          >
            <option value="">בחרו טווח תקציב</option>
            {form.budgetOptions.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label htmlFor="contact-name" className={labelClass}>שם מלא *</label>
        <input
          id="contact-name"
          required
          aria-invalid={!!form.fieldErrors.name}
          aria-describedby={form.fieldErrors.name ? "contact-name-error" : undefined}
          placeholder="שם מלא"
          value={form.name}
          onChange={(e) => form.setName(e.target.value)}
          className={cn(inputClass, form.fieldErrors.name && "border-red-400")}
        />
        {form.fieldErrors.name && <p id="contact-name-error" role="alert" className="text-xs text-red-400 mt-1.5">{form.fieldErrors.name}</p>}
      </div>

      <div>
        <label htmlFor="contact-email" className={labelClass}>אימייל *</label>
        <input
          id="contact-email"
          required
          type="email"
          aria-invalid={!!form.fieldErrors.email}
          aria-describedby={form.fieldErrors.email ? "contact-email-error" : undefined}
          placeholder="אימייל"
          value={form.email}
          onChange={(e) => form.setEmail(e.target.value)}
          className={cn(inputClass, form.fieldErrors.email && "border-red-400")}
        />
        {form.fieldErrors.email && <p id="contact-email-error" role="alert" className="text-xs text-red-400 mt-1.5">{form.fieldErrors.email}</p>}
      </div>

      <div>
        <label htmlFor="contact-phone" className={labelClass}>טלפון (אופציונלי)</label>
        <input
          id="contact-phone"
          placeholder="טלפון"
          value={form.phone}
          onChange={(e) => form.setPhone(e.target.value)}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="contact-company" className={labelClass}>חברה / עסק (אופציונלי)</label>
        <input
          id="contact-company"
          placeholder="חברה / עסק"
          value={form.company}
          onChange={(e) => form.setCompany(e.target.value)}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="contact-message" className={labelClass}>ספרו לי קצת על הפרויקט</label>
        <textarea
          id="contact-message"
          placeholder="ספרו לי קצת על הפרויקט"
          rows={4}
          value={form.message}
          onChange={(e) => form.setMessage(e.target.value)}
          className={inputClass}
        />
      </div>

      {form.error && <p role="alert" className="text-sm text-red-400">{form.error}</p>}

      <ConsentCheckbox
        id="contact-consent"
        checked={form.consent}
        onChange={form.setConsent}
        error={form.fieldErrors.consent}
      >
        קראתי ואני מסכים/ה ל
        <Link to="/privacy" className="underline underline-offset-4 hover:text-[#D1FE17] transition-colors">מדיניות הפרטיות</Link>
        , ומאשר/ת שהפרטים שמסרתי ישמשו ליצירת קשר בנוגע לפרויקט ולא יועברו לצד שלישי. *
      </ConsentCheckbox>

      <button
        onClick={form.handleSubmit}
        disabled={form.submitting}
        className="mt-2 font-mono text-xs uppercase tracking-wide bg-[#D1FE17] text-black rounded-[8px] px-6 py-3 hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100 w-fit"
      >
        {form.submitting ? "שולח…" : "שליחת הפרויקט ←"}
      </button>
    </div>
  )
}
