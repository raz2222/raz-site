import { createContext, useContext } from "react"

export const ContactModalContext = createContext<{
  open: boolean
  openModal: () => void
  closeModal: () => void
}>({ open: false, openModal: () => {}, closeModal: () => {} })

export function useContactModal() {
  return useContext(ContactModalContext)
}
