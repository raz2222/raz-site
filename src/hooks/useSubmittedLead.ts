import { useLocation } from "react-router-dom"
import { SUBMITTED_LEAD_KEY, type SubmittedLead } from "@/hooks/useContactForm"

/** Who just wrote in: from the navigation, or from the session on a reload. */
export function useSubmittedLead(): SubmittedLead | null {
  const state = useLocation().state as SubmittedLead | null
  if (state && typeof state.name === "string") return state
  try {
    const saved = sessionStorage.getItem(SUBMITTED_LEAD_KEY)
    return saved ? (JSON.parse(saved) as SubmittedLead) : null
  } catch {
    return null
  }
}
