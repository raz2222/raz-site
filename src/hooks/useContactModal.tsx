import { createContext, useContext } from "react"

export const ContactModalContext = createContext<{
  open: boolean
  metadata: Record<string, unknown> | null
  openModal: (metadata?: Record<string, unknown>) => void
  closeModal: () => void
}>({ open: false, metadata: null, openModal: () => {}, closeModal: () => {} })

export function useContactModal() {
  return useContext(ContactModalContext)
}
