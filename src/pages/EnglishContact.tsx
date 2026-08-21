import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { supabase } from "@/lib/supabase"
import { useDocumentMeta } from "@/hooks/useDocumentMeta"
import { useHreflang } from "@/hooks/useHreflang"
import { Reveal } from "@/components/Reveal"
import { Breadcrumbs } from "@/components/Breadcrumbs"
import { cn } from "@/lib/utils"
import { ConsentCheckbox } from "@/components/ConsentCheckbox"
import { trackEvent } from "@/lib/analytics"

const PROJECT_TYPES = [
  "New website",
  "Redesign / upgrade existing site",
  "Migrate existing site to AI",
  "AI-managed website",
  "AI ad / campaign",
  "Product or brand video",
  "Something else",
] as const

type ProjectType = (typeof PROJECT_TYPES)[number]

const BUDGETS_BY_TYPE: Record<ProjectType, string[]> = {
  "New website": ["Under ₪5,000", "₪5,000–15,000", "₪15,000–30,000", "Over ₪30,000", "Not sure yet"],
  "Redesign / upgrade existing site": ["Under ₪3,000", "₪3,000–8,000", "₪8,000–20,000", "Over ₪20,000", "Not sure yet"],
  "Migrate existing site to AI": ["Under ₪5,000", "₪5,000–15,000", "₪15,000–30,000", "Over ₪30,000", "Not sure yet"],
  "AI-managed website": ["Under ₪500/mo", "₪500–1,500/mo", "₪1,500–3,000/mo", "Over ₪3,000/mo", "Not sure yet"],
  "AI ad / campaign": ["Under ₪1,500", "₪1,500–4,000", "₪4,000–10,000", "Over ₪10,000", "Not sure yet"],
  "Product or brand video": ["Under ₪1,000", "₪1,000–3,000", "₪3,000–7,000", "Over ₪7,000", "Not sure yet"],
  "Something else": ["Under ₪5,000", "₪5,000–15,000", "₪15,000–30,000", "Over ₪30,000", "Not sure yet"],
}

// One qualifying question per project type, shown alongside budget (not as a forced extra
// step) so the lead is more useful without gating the form behind more taps.
const QUESTIONS_BY_TYPE: Partial<Record<ProjectType, { label: string; options: string[] }>> = {
  "New website": {
    label: "Roughly how many pages?",
    options: ["Up to 5 pages", "5–10 pages", "10+ pages", "Not sure yet"],
  },
  "Redesign / upgrade existing site": {
    label: "What bothers you most about the current site?",
    options: ["Looks outdated", "Not mobile-friendly", "Technically slow", "Not generating leads/sales"],
  },
  "Migrate existing site to AI": {
    label: "How much content needs to move over?",
    options: ["A little (up to 5 pages)", "Medium (5–15 pages)", "A lot of content/articles"],
  },
  "AI-managed website": {
    label: "What matters most in ongoing management?",
    options: ["Regular content updates", "Technical & security checks", "Performance & SEO improvements"],
  },
  "AI ad / campaign": {
    label: "Which platform mainly?",
    options: ["Instagram / Facebook", "TikTok", "YouTube", "A few platforms"],
  },
  "Product or brand video": {
    label: "Do you already have raw footage (photos/video)?",
    options: ["Yes, I have material", "No, all AI-generated", "A bit of both"],
  },
}

const GIFT_NOTE =
  "Free gift with AI content packages: anyone who signs a package gets a short (up to 15 seconds) brand or product video, on the house."

const inputClass =
  "w-full bg-transparent border border-white/30 rounded px-4 py-3 text-sm focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:border-white/50"
const labelClass = "block text-xs font-mono text-dim uppercase tracking-wide mb-2"

export function EnglishContact() {
  useDocumentMeta(
    "Contact · RAZ",
    "Start a project: website, AI campaign, or video. AI content packages include a free bonus film."
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

  const [projectTypes, setProjectTypes] = useState<ProjectType[]>([])
  const [budget, setBudget] = useState("")
  const [qualifyingAnswers, setQualifyingAnswers] = useState<Record<string, string>>({})
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [company, setCompany] = useState("")
  const [message, setMessage] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [consent, setConsent] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; email?: string; consent?: string }>({})

  const budgetOptions = (() => {
    const seen = new Set<string>()
    const options: string[] = []
    for (const t of projectTypes) {
      for (const b of BUDGETS_BY_TYPE[t] ?? []) {
        if (!seen.has(b)) {
          seen.add(b)
          options.push(b)
        }
      }
    }
    return options
  })()

  const qualifyingQuestions = projectTypes
    .map((t) => {
      const q = QUESTIONS_BY_TYPE[t]
      return q ? { type: t as string, label: q.label, options: q.options } : null
    })
    .filter((q): q is { type: string; label: string; options: string[] } => q !== null)

  function toggleProjectType(t: string) {
    setProjectTypes((prev) => (prev.includes(t as ProjectType) ? prev.filter((x) => x !== t) : [...prev, t as ProjectType]))
  }

  function setQualifyingAnswer(type: string, answer: string) {
    setQualifyingAnswers((prev) => ({ ...prev, [type]: answer }))
  }

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
    const qaLines = qualifyingQuestions
      .filter((q) => qualifyingAnswers[q.type])
      .map((q) => `${q.label} ${qualifyingAnswers[q.type]}`)
    const fullMessage = [...qaLines, message].filter(Boolean).join("\n\n")
    const projectType = projectTypes.join(", ")

    const { error } = await supabase.from("leads").insert({
      name,
      email,
      phone: phone || null,
      company: company || null,
      project_type: projectType || null,
      budget: budget || null,
      message: fullMessage || null,
    })
    setSubmitting(false)
    if (error) {
      setError("Something went wrong. Please try again or email me directly.")
      return
    }
    fetch("/api/notify-lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, phone, company, projectType, budget, message: fullMessage }),
    }).catch(() => {})
    trackEvent("lead_submit", { project_type: projectType, budget })
    navigate("/en/thank-you")
  }

  return (
    <section dir="ltr" className="pt-32 pb-28 md:pt-40 md:pb-40 min-h-[90dvh] text-left">
      <div className="container max-w-2xl">
        <Breadcrumbs items={[{ label: "Home", to: "/en" }, { label: "Contact" }]} />
        <Reveal className="font-mono text-xs uppercase tracking-wide text-dim mb-4">( Contact )</Reveal>
        <Reveal>
          <h1 className="font-display font-black text-[clamp(34px,6.1vw,68px)] leading-[1.1] tracking-tight mb-6">
            Let's build something.
          </h1>
        </Reveal>

        <Reveal delay={140}>
          <div className="flex flex-col gap-4">
            {projectTypes.length > 0 && (
              <div className="border border-[#D1FE17]/40 rounded-lg p-5 bg-[#D1FE17]/[0.06]">
                <span className="inline-block font-mono text-[10px] font-bold uppercase tracking-wide bg-[#D1FE17] text-black rounded-full px-2.5 py-1 mb-2">Gift 🎁</span>
                <p className="text-sm leading-relaxed text-[#D1FE17]">{GIFT_NOTE}</p>
              </div>
            )}

            <div>
              <label className={labelClass}>What are we building? (pick as many as apply)</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {PROJECT_TYPES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => toggleProjectType(t)}
                    className={cn(
                      "text-sm text-left border rounded px-4 py-3 transition-colors",
                      projectTypes.includes(t) ? "border-[#D1FE17] bg-[#D1FE17]/10 text-[#D1FE17]" : "border-white/30 hover:border-white/50"
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {qualifyingQuestions.map((q) => (
              <div key={q.type}>
                <label htmlFor={`en-qualifying-${q.type}`} className={labelClass}>{q.label}</label>
                <select
                  id={`en-qualifying-${q.type}`}
                  value={qualifyingAnswers[q.type] ?? ""}
                  onChange={(e) => setQualifyingAnswer(q.type, e.target.value)}
                  className={cn(inputClass, "appearance-none")}
                >
                  <option value="">Choose an answer</option>
                  {q.options.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </div>
            ))}

            {projectTypes.length > 0 && (
              <div>
                <label htmlFor="en-budget" className={labelClass}>Estimated budget?</label>
                <select
                  id="en-budget"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className={cn(inputClass, "appearance-none")}
                >
                  <option value="">Choose a budget range</option>
                  {budgetOptions.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label htmlFor="en-name" className={labelClass}>Full name *</label>
              <input
                id="en-name"
                required
                aria-invalid={!!fieldErrors.name}
                aria-describedby={fieldErrors.name ? "en-name-error" : undefined}
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={cn(inputClass, fieldErrors.name && "border-red-400")}
              />
              {fieldErrors.name && <p id="en-name-error" role="alert" className="text-xs text-red-400 mt-1.5">{fieldErrors.name}</p>}
            </div>

            <div>
              <label htmlFor="en-email" className={labelClass}>Email *</label>
              <input
                id="en-email"
                required
                type="email"
                aria-invalid={!!fieldErrors.email}
                aria-describedby={fieldErrors.email ? "en-email-error" : undefined}
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={cn(inputClass, fieldErrors.email && "border-red-400")}
              />
              {fieldErrors.email && <p id="en-email-error" role="alert" className="text-xs text-red-400 mt-1.5">{fieldErrors.email}</p>}
            </div>

            <div>
              <label htmlFor="en-phone" className={labelClass}>Phone (optional)</label>
              <input id="en-phone" placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} />
            </div>

            <div>
              <label htmlFor="en-company" className={labelClass}>Company / business (optional)</label>
              <input id="en-company" placeholder="Company / business" value={company} onChange={(e) => setCompany(e.target.value)} className={inputClass} />
            </div>

            <div>
              <label htmlFor="en-message" className={labelClass}>Tell me a bit about the project</label>
              <textarea id="en-message" placeholder="Tell me a bit about the project" rows={4} value={message} onChange={(e) => setMessage(e.target.value)} className={inputClass} />
            </div>

            {error && <p role="alert" className="text-sm text-red-400">{error}</p>}

            <ConsentCheckbox
              id="en-consent"
              checked={consent}
              onChange={setConsent}
              error={fieldErrors.consent}
            >
              I've read and agree to the{" "}
              <Link to="/privacy" className="underline underline-offset-4 hover:text-[#D1FE17] transition-colors">privacy policy</Link>
              , and consent to my details being used to get back to me about this project and never shared with third parties. *
            </ConsentCheckbox>

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="mt-2 font-mono text-sm font-bold uppercase tracking-wide bg-[#D1FE17] text-black rounded-[8px] px-6 py-3 hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100 w-fit"
            >
              {submitting ? "Sending…" : "Send project →"}
            </button>
          </div>
        </Reveal>

        <div className="mt-14 pt-6 border-t border-white/10 font-mono text-xs text-dim uppercase tracking-wide">
          Prefer WhatsApp? <a href="https://wa.me/972506944443" target="_blank" rel="noreferrer" onClick={() => trackEvent("whatsapp_click", { location: "contact_page" })} className="underline underline-offset-4 text-foreground hover:text-[#D1FE17] transition-colors">Message me here →</a>
        </div>
      </div>
    </section>
  )
}
