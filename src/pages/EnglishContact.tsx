import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { supabase } from "@/lib/supabase"
import { useDocumentMeta } from "@/hooks/useDocumentMeta"
import { useHreflang } from "@/hooks/useHreflang"
import { Reveal } from "@/components/Reveal"
import { cn } from "@/lib/utils"

const PROJECT_TYPES = ["New website", "Redesign / upgrade existing site", "Migrate existing site to AI", "AI-managed website", "AI ad / campaign", "Product or brand video", "Something else"]
const BUDGETS = ["Under $1,500", "$1,500–4,000", "$4,000–8,000", "Over $8,000", "Not sure yet"]

export function EnglishContact() {
  useDocumentMeta(
    "Contact — RAZ",
    "Start a project — website, AI campaign, or video. AI content packages include a free bonus film."
  )
  useHreflang("/contact", "/en/contact")
  const navigate = useNavigate()

  useEffect(() => {
    document.documentElement.lang = "en"
    document.documentElement.dir = "ltr"
    return () => {
      document.documentElement.lang = "he"
      document.documentElement.dir = "rtl"
    }
  }, [])

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
  const [consent, setConsent] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; email?: string; consent?: string }>({})

  function validate() {
    const errors: { name?: string; email?: string; consent?: string } = {}
    if (!name.trim()) errors.name = "Required"
    if (!email.trim()) errors.email = "Required"
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errors.email = "Invalid email address"
    if (!consent) errors.consent = "You need to accept the privacy policy to send the form"
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function handleSubmit() {
    if (!validate()) return
    setSubmitting(true)
    setError(null)
    const { error } = await supabase.from("leads").insert({
      name, email, phone: phone || null, company: company || null,
      project_type: projectType, budget: budget || null, message: message || null,
    })
    setSubmitting(false)
    if (error) {
      setError("Something went wrong — please try again or email me directly.")
      return
    }
    fetch("/api/notify-lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, phone, company, projectType, budget, message }),
    }).catch(() => {})
    navigate("/en/thank-you")
  }

  return (
    <section dir="ltr" className="pt-32 pb-28 md:pt-40 md:pb-40 min-h-[90dvh] text-left">
      <div className="container max-w-2xl">
        <Reveal className="font-mono text-xs uppercase tracking-wide text-dim mb-4">( Contact )</Reveal>
        <Reveal>
          <h1 className="font-display font-black text-[clamp(34px,6.1vw,68px)] leading-[1.1] tracking-tight mb-6">
            Let's build something.
          </h1>
        </Reveal>

        <div className="mb-10 flex gap-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= step ? "bg-foreground" : "bg-white/10"}`} />
          ))}
        </div>

        {step === 0 && (
          <div>
            <h2 className="font-display text-xl md:text-2xl font-medium mb-6">What are we building?</h2>
            <div className="flex flex-col gap-3">
              {PROJECT_TYPES.map((t) => (
                <button
                  key={t}
                  onClick={() => { setProjectType(t); setStep(1) }}
                  className={`text-left border rounded-lg px-5 py-4 transition-colors ${projectType === t ? "border-foreground bg-white/5" : "border-white/15 hover:border-[#D1FE17]"}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 1 && (
          <div>
            <h2 className="font-display text-xl md:text-2xl font-medium mb-6">Estimated budget?</h2>
            <div className="flex flex-col gap-3">
              {BUDGETS.map((b) => (
                <button
                  key={b}
                  onClick={() => { setBudget(b); setStep(2) }}
                  className={`text-left border rounded-lg px-5 py-4 transition-colors ${budget === b ? "border-foreground bg-white/5" : "border-white/15 hover:border-[#D1FE17]"}`}
                >
                  {b}
                </button>
              ))}
            </div>
            <button onClick={() => setStep(0)} className="mt-6 font-mono text-xs uppercase text-dim underline underline-offset-4 hover:text-[#D1FE17] transition-colors">← Back</button>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="font-display text-xl md:text-2xl font-medium mb-6">How can we reach you?</h2>
            <div className="flex flex-col gap-4">
              <div>
                <label htmlFor="en-name" className="block text-xs font-mono text-dim uppercase tracking-wide mb-2">Full name *</label>
                <input
                  id="en-name"
                  required
                  aria-invalid={!!fieldErrors.name}
                  aria-describedby={fieldErrors.name ? "en-name-error" : undefined}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={cn(
                    "w-full bg-transparent border rounded px-4 py-3 text-sm focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
                    fieldErrors.name ? "border-red-400" : "border-white/30 focus-visible:border-white/50"
                  )}
                />
                {fieldErrors.name && <p id="en-name-error" role="alert" className="text-xs text-red-400 mt-1.5">{fieldErrors.name}</p>}
              </div>
              <div>
                <label htmlFor="en-email" className="block text-xs font-mono text-dim uppercase tracking-wide mb-2">Email *</label>
                <input
                  id="en-email"
                  required
                  type="email"
                  aria-invalid={!!fieldErrors.email}
                  aria-describedby={fieldErrors.email ? "en-email-error" : undefined}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={cn(
                    "w-full bg-transparent border rounded px-4 py-3 text-sm focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
                    fieldErrors.email ? "border-red-400" : "border-white/30 focus-visible:border-white/50"
                  )}
                />
                {fieldErrors.email && <p id="en-email-error" role="alert" className="text-xs text-red-400 mt-1.5">{fieldErrors.email}</p>}
              </div>
              <div>
                <label htmlFor="en-phone" className="block text-xs font-mono text-dim uppercase tracking-wide mb-2">Phone (optional)</label>
                <input id="en-phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-transparent border border-white/30 rounded px-4 py-3 text-sm focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:border-white/50" />
              </div>
              <div>
                <label htmlFor="en-company" className="block text-xs font-mono text-dim uppercase tracking-wide mb-2">Company (optional)</label>
                <input id="en-company" value={company} onChange={(e) => setCompany(e.target.value)} className="w-full bg-transparent border border-white/30 rounded px-4 py-3 text-sm focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:border-white/50" />
              </div>
              <div>
                <label htmlFor="en-message" className="block text-xs font-mono text-dim uppercase tracking-wide mb-2">Tell me about the project</label>
                <textarea id="en-message" rows={4} value={message} onChange={(e) => setMessage(e.target.value)} className="w-full bg-transparent border border-white/30 rounded px-4 py-3 text-sm focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:border-white/50" />
              </div>
              {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
              <p className="text-xs text-dim leading-relaxed">
                Your details are used only to get back to you about this project and are never shared with third parties.
              </p>
              <div>
                <label className="flex items-start gap-2.5 text-xs text-dim leading-relaxed cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    aria-invalid={!!fieldErrors.consent}
                    aria-describedby={fieldErrors.consent ? "en-consent-error" : undefined}
                    className="mt-0.5 h-4 w-4 flex-none accent-[#D1FE17]"
                  />
                  <span>
                    I've read and agree to the{" "}
                    <Link to="/privacy" className="underline underline-offset-4 hover:text-[#D1FE17] transition-colors">privacy policy</Link>
                    , and consent to my details being used to get back to me about this project. *
                  </span>
                </label>
                {fieldErrors.consent && <p id="en-consent-error" role="alert" className="text-xs text-red-400 mt-1.5">{fieldErrors.consent}</p>}
              </div>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="mt-2 font-mono text-xs uppercase tracking-wide bg-[#D1FE17] text-black rounded-full px-6 py-3 hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
              >
                {submitting ? "Sending…" : "Send project →"}
              </button>
              <button onClick={() => setStep(1)} className="font-mono text-xs uppercase text-dim underline underline-offset-4 self-start hover:text-[#D1FE17] transition-colors">← Back</button>
            </div>
          </div>
        )}

        <div className="mt-14 pt-6 border-t border-white/10 font-mono text-xs text-dim uppercase tracking-wide">
          Prefer WhatsApp? <a href="https://wa.me/972506944443" target="_blank" rel="noreferrer" className="underline underline-offset-4 text-foreground hover:text-[#D1FE17] transition-colors">Message me here →</a>
        </div>
      </div>
    </section>
  )
}
