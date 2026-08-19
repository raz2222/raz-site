import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { trackEvent } from "@/lib/analytics"
import { BUDGETS_BY_TYPE, QUESTIONS_BY_TYPE, type ProjectType } from "@/lib/contactFormData"

export function useContactForm(onSuccess: () => void, opts?: { requireEmail?: boolean }) {
  const requireEmail = opts?.requireEmail ?? true
  const [projectType, setProjectType] = useState<ProjectType | "">("")
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

  const budgetOptions = projectType ? BUDGETS_BY_TYPE[projectType] : []
  const qualifyingQuestion = projectType ? QUESTIONS_BY_TYPE[projectType] : undefined

  function handleProjectTypeChange(t: string) {
    setProjectType(t as ProjectType)
    setBudget("")
    setQualifyingAnswer("")
  }

  function validate() {
    const errors: { name?: string; email?: string; phone?: string; consent?: string } = {}
    if (!name.trim()) errors.name = "שדה חובה"
    if (requireEmail) {
      if (!email.trim()) errors.email = "שדה חובה"
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errors.email = "כתובת אימייל לא תקינה"
    } else if (!phone.trim()) {
      errors.phone = "שדה חובה"
    }
    if (!consent) errors.consent = "צריך לאשר את מדיניות הפרטיות כדי לשלוח את הטופס"
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
    })
    setSubmitting(false)
    if (error) {
      setError("משהו השתבש, נסו שוב או שלחו מייל ישירות.")
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
