import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { trackEvent } from "@/lib/analytics"
import { getAttribution } from "@/lib/attribution"
import { BUDGETS_BY_TYPE, QUESTIONS_BY_TYPE } from "@/lib/contactFormData"
import { BUDGETS_BY_TYPE_EN, QUESTIONS_BY_TYPE_EN } from "@/lib/contactFormDataEn"

export function useContactForm(onSuccess: () => void, opts?: { requireEmail?: boolean; isEnglish?: boolean; metadata?: Record<string, unknown> | null }) {
  const requireEmail = opts?.requireEmail ?? true
  const isEnglish = opts?.isEnglish ?? false
  const metadata = opts?.metadata ?? null
  const budgetsByType = isEnglish ? (BUDGETS_BY_TYPE_EN as Record<string, string[]>) : (BUDGETS_BY_TYPE as Record<string, string[]>)
  const questionsByType = isEnglish
    ? (QUESTIONS_BY_TYPE_EN as Partial<Record<string, { label: string; options: string[] }>>)
    : (QUESTIONS_BY_TYPE as Partial<Record<string, { label: string; options: string[] }>>)
  const [projectTypes, setProjectTypes] = useState<string[]>([])
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
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; email?: string; phone?: string; consent?: string }>({})

  const budgetOptions = (() => {
    const seen = new Set<string>()
    const options: string[] = []
    for (const t of projectTypes) {
      for (const b of budgetsByType[t] ?? []) {
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
      const q = questionsByType[t]
      return q ? { type: t as string, label: q.label, options: q.options } : null
    })
    .filter((q): q is { type: string; label: string; options: string[] } => q !== null)

  function toggleProjectType(t: string) {
    setProjectTypes((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]))
  }

  function setQualifyingAnswer(type: string, answer: string) {
    setQualifyingAnswers((prev) => ({ ...prev, [type]: answer }))
  }

  function validate() {
    const errors: { name?: string; email?: string; phone?: string; consent?: string } = {}
    if (!name.trim()) errors.name = isEnglish ? "Required" : "שדה חובה"
    if (requireEmail) {
      if (!email.trim()) errors.email = isEnglish ? "Required" : "שדה חובה"
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errors.email = isEnglish ? "Invalid email address" : "כתובת אימייל לא תקינה"
    } else if (!phone.trim()) {
      errors.phone = isEnglish ? "Required" : "שדה חובה"
    }
    if (!consent) errors.consent = isEnglish ? "You need to accept the privacy policy to send the form" : "צריך לאשר את מדיניות הפרטיות כדי לשלוח את הטופס"
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
    const projectTypeStr = projectTypes.join(", ")

    // Stored on the lead itself rather than left to Meta's reporting, which is consent-gated
    // and blocked by ad blockers. This is the copy that can be trusted when working out which
    // ad actually paid for itself.
    const attribution = getAttribution()
    const leadMetadata = attribution ? { ...(metadata ?? {}), attribution } : metadata

    const { error } = await supabase.from("leads").insert({
      name,
      email,
      phone: phone || null,
      company: company || null,
      project_type: projectTypeStr || null,
      budget: budget || null,
      message: fullMessage || null,
      metadata: leadMetadata,
    })
    setSubmitting(false)
    if (error) {
      setError(isEnglish ? "Something went wrong: please try again or email me directly." : "משהו השתבש, נסו שוב או שלחו מייל ישירות.")
      return
    }
    fetch("/api/notify-lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        phone,
        company,
        projectType: projectTypeStr,
        budget,
        message: fullMessage,
        source: attribution ? [attribution.source, attribution.campaign, attribution.content].filter(Boolean).join(" · ") : null,
      }),
    }).catch(() => {})
    trackEvent("lead_submit", {
      project_type: projectTypeStr,
      budget,
      campaign: attribution?.campaign,
      ad: attribution?.content,
    })
    onSuccess()
  }

  return {
    projectTypes,
    toggleProjectType,
    budget,
    setBudget,
    qualifyingAnswers,
    setQualifyingAnswer,
    qualifyingQuestions,
    name,
    setName,
    email,
    setEmail,
    phone,
    setPhone,
    company,
    setCompany,
    message,
    setMessage,
    submitting,
    error,
    consent,
    setConsent,
    fieldErrors,
    budgetOptions,
    handleSubmit,
  }
}
