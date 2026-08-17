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

const PROJECT_TYPES = [
  "אתר חדש",
  "עיצוב מחדש / שדרוג אתר",
  "העברת אתר קיים לאתר AI",
  "ניהול אתר בבינה מלאכותית",
  "פרסומת / קמפיין AI",
  "סרטון תדמית או מוצר",
  "משהו אחר",
]
const BUDGETS = ["עד ₪5,000", "₪5,000–15,000", "₪15,000–30,000", "מעל ₪30,000", "עדיין לא יודע/ת"]

export function Contact() {
  useDocumentMeta(
    "צור קשר — RAZ",
    "בואו נתחיל פרויקט — אתר, קמפיין AI או סרטון. חבילת יצירת תוכן AI כוללת סרטון מתנה."
  )
  useHreflang("/contact", "/en/contact")
  const navigate = useNavigate()
  const { content: page } = useSiteContent("contact_page", CONTACT_PAGE_DEFAULT)
  const { content: contact } = useSiteContent("shared_contact", CONTACT_INFO_DEFAULT)

  const [step, setStep] = useState(0)
  const [projectType, setProjectType] = useState("")
  const [budget, setBudget] = useState("")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [company, setCompany] = useState("")
  const [message, setMessage] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; email?: string }>({})

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
    if (error) setError("משהו השתבש, נסו שוב או שלחו מייל ישירות.")
    else navigate("/thank-you")
  }

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

        <Reveal delay={100} className="border border-white/15 rounded-lg p-5 mb-14 bg-white/[0.02]">
          <p className="text-sm leading-relaxed">{page.gift_note}</p>
        </Reveal>

        <div className="mb-10 flex gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={cn("h-1 flex-1 rounded-full transition-colors", i <= step ? "bg-foreground" : "bg-white/10")}
            />
          ))}
        </div>

        {step === 0 && (
          <div>
            <h2 className="font-display text-xl md:text-2xl font-medium mb-6">מה אנחנו בונים?</h2>
            <div className="flex flex-col gap-3">
              {PROJECT_TYPES.map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setProjectType(t)
                    setStep(1)
                  }}
                  className={cn(
                    "text-right border rounded-lg px-5 py-4 transition-colors",
                    projectType === t ? "border-foreground bg-white/5" : "border-white/15 hover:border-[#D1FE17]"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 1 && (
          <div>
            <h2 className="font-display text-xl md:text-2xl font-medium mb-6">מה התקציב המשוער?</h2>
            <div className="flex flex-col gap-3">
              {BUDGETS.map((b) => (
                <button
                  key={b}
                  onClick={() => {
                    setBudget(b)
                    setStep(2)
                  }}
                  className={cn(
                    "text-right border rounded-lg px-5 py-4 transition-colors",
                    budget === b ? "border-foreground bg-white/5" : "border-white/15 hover:border-[#D1FE17]"
                  )}
                >
                  {b}
                </button>
              ))}
            </div>
            <button onClick={() => setStep(0)} className="mt-6 font-mono text-xs uppercase text-dim underline underline-offset-4 hover:text-[#D1FE17] transition-colors">
              → חזרה
            </button>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="font-display text-xl md:text-2xl font-medium mb-6">איך יוצרים איתכם קשר?</h2>
            <div className="flex flex-col gap-4">
              <div>
                <label htmlFor="contact-name" className="block text-xs font-mono text-dim uppercase tracking-wide mb-2">שם מלא *</label>
                <input
                  id="contact-name"
                  required
                  aria-invalid={!!fieldErrors.name}
                  aria-describedby={fieldErrors.name ? "contact-name-error" : undefined}
                  placeholder="שם מלא"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={cn(
                    "w-full bg-transparent border rounded px-4 py-3 text-sm focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
                    fieldErrors.name ? "border-red-400" : "border-white/30 focus-visible:border-white/50"
                  )}
                />
                {fieldErrors.name && <p id="contact-name-error" role="alert" className="text-xs text-red-400 mt-1.5">{fieldErrors.name}</p>}
              </div>
              <div>
                <label htmlFor="contact-email" className="block text-xs font-mono text-dim uppercase tracking-wide mb-2">אימייל *</label>
                <input
                  id="contact-email"
                  required
                  type="email"
                  aria-invalid={!!fieldErrors.email}
                  aria-describedby={fieldErrors.email ? "contact-email-error" : undefined}
                  placeholder="אימייל"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={cn(
                    "w-full bg-transparent border rounded px-4 py-3 text-sm focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
                    fieldErrors.email ? "border-red-400" : "border-white/30 focus-visible:border-white/50"
                  )}
                />
                {fieldErrors.email && <p id="contact-email-error" role="alert" className="text-xs text-red-400 mt-1.5">{fieldErrors.email}</p>}
              </div>
              <div>
                <label htmlFor="contact-phone" className="block text-xs font-mono text-dim uppercase tracking-wide mb-2">טלפון (אופציונלי)</label>
                <input
                  id="contact-phone"
                  placeholder="טלפון"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-transparent border border-white/30 rounded px-4 py-3 text-sm focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:border-white/50"
                />
              </div>
              <div>
                <label htmlFor="contact-company" className="block text-xs font-mono text-dim uppercase tracking-wide mb-2">חברה / עסק (אופציונלי)</label>
                <input
                  id="contact-company"
                  placeholder="חברה / עסק"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full bg-transparent border border-white/30 rounded px-4 py-3 text-sm focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:border-white/50"
                />
              </div>
              <div>
                <label htmlFor="contact-message" className="block text-xs font-mono text-dim uppercase tracking-wide mb-2">ספרו לי קצת על הפרויקט</label>
                <textarea
                  id="contact-message"
                  placeholder="ספרו לי קצת על הפרויקט"
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-transparent border border-white/30 rounded px-4 py-3 text-sm focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:border-white/50"
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
                className="mt-2 font-mono text-xs uppercase tracking-wide bg-[#D1FE17] text-black rounded-full px-6 py-3 hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
              >
                {submitting ? "שולח…" : "שליחת הפרויקט ←"}
              </button>
              <button onClick={() => setStep(1)} className="font-mono text-xs uppercase text-dim underline underline-offset-4 self-start hover:text-[#D1FE17] transition-colors">
                → חזרה
              </button>
            </div>
          </div>
        )}

        <div className="mt-14 pt-6 border-t border-white/10 font-mono text-xs text-dim uppercase tracking-wide">
          מעדיפים וואטסאפ? <a href={contact.whatsapp_url} target="_blank" rel="noreferrer" className="underline underline-offset-4 text-foreground hover:text-[#D1FE17] transition-colors">כתבו לי כאן ←</a>
        </div>
      </div>
    </section>
  )
}
