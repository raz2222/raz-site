import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { supabase } from "@/lib/supabase"
import { useDocumentMeta } from "@/hooks/useDocumentMeta"
import { useHreflang } from "@/hooks/useHreflang"
import { Reveal } from "@/components/Reveal"
import { Breadcrumbs } from "@/components/Breadcrumbs"
import { cn } from "@/lib/utils"
import { useSiteContent } from "@/hooks/useSiteContent"
import { CONTACT_PAGE_DEFAULT, CONTACT_INFO_DEFAULT } from "@/lib/siteContentDefaults"
import { trackEvent } from "@/lib/analytics"

const PROJECT_TYPES = [
  "אתר חדש",
  "עיצוב מחדש / שדרוג אתר",
  "העברת אתר קיים לאתר AI",
  "ניהול אתר בבינה מלאכותית",
  "פרסומת / קמפיין AI",
  "סרטון תדמית או מוצר",
  "משהו אחר",
] as const

const AI_GIFT_TYPES: string[] = ["פרסומת / קמפיין AI", "סרטון תדמית או מוצר", "העברת אתר קיים לאתר AI"]

const BUDGETS_BY_TYPE: Record<(typeof PROJECT_TYPES)[number], string[]> = {
  "אתר חדש": ["עד ₪5,000", "₪5,000–15,000", "₪15,000–30,000", "מעל ₪30,000", "עדיין לא יודע/ת"],
  "עיצוב מחדש / שדרוג אתר": ["עד ₪3,000", "₪3,000–8,000", "₪8,000–20,000", "מעל ₪20,000", "עדיין לא יודע/ת"],
  "העברת אתר קיים לאתר AI": ["עד ₪5,000", "₪5,000–15,000", "₪15,000–30,000", "מעל ₪30,000", "עדיין לא יודע/ת"],
  "ניהול אתר בבינה מלאכותית": ["עד ₪500 לחודש", "₪500–1,500 לחודש", "₪1,500–3,000 לחודש", "מעל ₪3,000 לחודש", "עדיין לא יודע/ת"],
  "פרסומת / קמפיין AI": ["עד ₪1,500", "₪1,500–4,000", "₪4,000–10,000", "מעל ₪10,000", "עדיין לא יודע/ת"],
  "סרטון תדמית או מוצר": ["עד ₪1,000", "₪1,000–3,000", "₪3,000–7,000", "מעל ₪7,000", "עדיין לא יודע/ת"],
  "משהו אחר": ["עד ₪5,000", "₪5,000–15,000", "₪15,000–30,000", "מעל ₪30,000", "עדיין לא יודע/ת"],
}

export function Contact() {
  useDocumentMeta(
    "צור קשר — RAZ",
    "בואו נתחיל פרויקט — אתר, קמפיין AI או סרטון. חבילת יצירת תוכן AI כוללת סרטון מתנה."
  )
  useHreflang("/contact", "/en/contact")
  const navigate = useNavigate()
  const { content: page } = useSiteContent("contact_page", CONTACT_PAGE_DEFAULT)
  const { content: contact } = useSiteContent("shared_contact", CONTACT_INFO_DEFAULT)

  const [projectType, setProjectType] = useState<(typeof PROJECT_TYPES)[number] | "">("")
  const [budget, setBudget] = useState("")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [company, setCompany] = useState("")
  const [message, setMessage] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; email?: string }>({})

  const budgetOptions = projectType ? BUDGETS_BY_TYPE[projectType] : []

  function handleProjectTypeChange(t: string) {
    setProjectType(t as (typeof PROJECT_TYPES)[number])
    setBudget("")
  }

  function validate() {
    const errors: { name?: string; email?: string } = {}
    if (!name.trim()) errors.name = "שדה חובה"
    if (!email.trim()) errors.email = "שדה חובה"
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errors.email = "כתובת אימייל לא תקינה"
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function handleSubmit() {
    if (!validate()) return
    setSubmitting(true)
    setError(null)
    const { error } = await supabase.from("leads").insert({
      name,
      email,
      phone: phone || null,
      company: company || null,
      project_type: projectType,
      budget: budget || null,
      message: message || null,
    })
    setSubmitting(false)
    if (error) {
      setError("משהו השתבש, נסו שוב או שלחו מייל ישירות.")
      return
    }
    fetch("/api/notify-lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, phone, company, projectType, budget, message }),
    }).catch(() => {})
    trackEvent("lead_submit", { project_type: projectType, budget })
    navigate("/thank-you")
  }

  const inputClass =
    "w-full bg-transparent border border-white/30 rounded px-4 py-3 text-sm focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:border-white/50"
  const labelClass = "block text-xs font-mono text-dim uppercase tracking-wide mb-2"

  return (
    <section className="pt-32 pb-28 md:pt-40 md:pb-40 min-h-[90dvh]">
      <div className="container max-w-2xl">
        <Breadcrumbs items={[{ label: "בית", to: "/" }, { label: "צור קשר" }]} />
        <Reveal className="font-mono text-xs uppercase tracking-wide text-dim mb-4">
          ( צור קשר )
        </Reveal>
        <Reveal>
          <h1 className="font-display font-black text-[clamp(30px,5.5vw,60px)] leading-[1.1] tracking-tight mb-6">
            {page.heading}
          </h1>
        </Reveal>

        {projectType && AI_GIFT_TYPES.includes(projectType) && (
          <Reveal className="border border-white/15 rounded-lg p-5 mb-10 bg-white/[0.02]">
            <p className="text-sm leading-relaxed">{page.gift_note}</p>
          </Reveal>
        )}

        <Reveal delay={140} className="flex flex-col gap-4">
          <div>
            <label htmlFor="contact-type" className={labelClass}>מה בונים?</label>
            <select
              id="contact-type"
              value={projectType}
              onChange={(e) => handleProjectTypeChange(e.target.value)}
              className={cn(inputClass, "appearance-none")}
            >
              <option value="">בחרו סוג פרויקט</option>
              {PROJECT_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {projectType && (
            <div>
              <label htmlFor="contact-budget" className={labelClass}>מה התקציב המשוער?</label>
              <select
                id="contact-budget"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className={cn(inputClass, "appearance-none")}
              >
                <option value="">בחרו טווח תקציב</option>
                {budgetOptions.map((b) => (
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
              aria-invalid={!!fieldErrors.name}
              aria-describedby={fieldErrors.name ? "contact-name-error" : undefined}
              placeholder="שם מלא"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={cn(inputClass, fieldErrors.name && "border-red-400")}
            />
            {fieldErrors.name && <p id="contact-name-error" role="alert" className="text-xs text-red-400 mt-1.5">{fieldErrors.name}</p>}
          </div>

          <div>
            <label htmlFor="contact-email" className={labelClass}>אימייל *</label>
            <input
              id="contact-email"
              required
              type="email"
              aria-invalid={!!fieldErrors.email}
              aria-describedby={fieldErrors.email ? "contact-email-error" : undefined}
              placeholder="אימייל"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={cn(inputClass, fieldErrors.email && "border-red-400")}
            />
            {fieldErrors.email && <p id="contact-email-error" role="alert" className="text-xs text-red-400 mt-1.5">{fieldErrors.email}</p>}
          </div>

          <div>
            <label htmlFor="contact-phone" className={labelClass}>טלפון (אופציונלי)</label>
            <input
              id="contact-phone"
              placeholder="טלפון"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="contact-company" className={labelClass}>חברה / עסק (אופציונלי)</label>
            <input
              id="contact-company"
              placeholder="חברה / עסק"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="contact-message" className={labelClass}>ספרו לי קצת על הפרויקט</label>
            <textarea
              id="contact-message"
              placeholder="ספרו לי קצת על הפרויקט"
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className={inputClass}
            />
          </div>

          {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
          <p className="text-xs text-dim leading-relaxed">
            הפרטים שתשלחו ישמשו רק כדי לחזור אליכם בנוגע לפרויקט ולא יועברו לצד שלישי. ראו{" "}
            <Link to="/privacy" className="underline underline-offset-4 hover:text-[#D1FE17] transition-colors">מדיניות הפרטיות</Link>.
          </p>

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="mt-2 font-mono text-xs uppercase tracking-wide bg-[#D1FE17] text-black rounded-full px-6 py-3 hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100 w-fit"
          >
            {submitting ? "שולח…" : "שליחת הפרויקט ←"}
          </button>
        </Reveal>

        <div className="mt-14 pt-6 border-t border-white/10 font-mono text-xs text-dim uppercase tracking-wide">
          מעדיפים וואטסאפ? <a href={contact.whatsapp_url} target="_blank" rel="noreferrer" onClick={() => trackEvent("whatsapp_click", { location: "contact_page" })} className="underline underline-offset-4 text-foreground hover:text-[#D1FE17] transition-colors">כתבו לי כאן ←</a>
        </div>
      </div>
    </section>
  )
}
