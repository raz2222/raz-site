import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { trackEvent } from "@/lib/analytics"
import { BUDGETS_BY_TYPE, QUESTIONS_BY_TYPE, type ProjectType } from "@/lib/contactFormData"
import { BUDGETS_BY_TYPE_EN, QUESTIONS_BY_TYPE_EN, type ProjectTypeEn } from "@/lib/contactFormDataEn"

export function useContactForm(onSuccess: () => void, opts?: { requireEmail?: boolean; isEnglish?: boolean; metadata?: Record<string, unknown> | null }) {
  const requireEmail = opts?.requireEmail ?? true
  const isEnglish = opts?.isEnglish ?? false
  const metadata = opts?.metadata ?? null
  const budgetsByType = isEnglish ? (BUDGETS_BY_TYPE_EN as Record<string, string[]>) : (BUDGETS_BY_TYPE as Record<string, string[]>)
  const questionsByType = isEnglish
    ? (QUESTIONS_BY_TYPE_EN as Partial<Record<string, { label: string; options: string[] }>>)
    : (QUESTIONS_BY_TYPE as Partial<Record<string, { label: string; options: string[] }>>)
  const [projectType, setProjectType] = useState<ProjectType | ProjectTypeEn | "">("")
  const [budget, setBudget] = useState("")
  const [qualifyingAnswer, setQualifyingAnswer] = useState("")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [company, setCompany] = useState("")
  const [message, setMessage] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [consent, setConsent] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; email?: string; phone?: string; consent?: string }>({})

  const budgetOptions = projectType ? budgetsByType[projectType] ?? [] : []
  const qualifyingQuestion = projectType ? questionsByType[projectType] : undefined

  function handleProjectTypeChange(t: string) {
    setProjectType(t as ProjectType | ProjectTypeEn)
    setBudget("")
    setQualifyingAnswer("")
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
    const fullMessage = qualifyingQuestion && qualifyingAnswer
      ? `${qualifyingQuestion.label} ${qualifyingAnswer}${message ? `\n\n${message}` : ""}`
      : message

    const { error } = await supabase.from("leads").insert({
      name,
      email,
      phone: phone || null,
      company: company || null,
      project_type: projectType,
      budget: budget || null,
      message: fullMessage || null,
      metadata,
    })
    setSubmitting(false)
    if (error) {
      setError(isEnglish ? "Something went wrong — please try again or email me directly." : "משהו השתבש, נסו שוב או שלחו מייל ישירות.")
      return
    }
    fetch("/api/notify-lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, phone, company, projectType, budget, message: fullMessage }),
    }).catch(() => {})
    trackEvent("lead_submit", { project_type: projectType, budget })
    onSuccess()
  }

  return {
    projectType,
    budget,
    setBudget,
    qualifyingAnswer,
    setQualifyingAnswer,
    qualifyingQuestion,
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
    handleProjectTypeChange,
    handleSubmit,
  }
}
