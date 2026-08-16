import { createContext, useContext, useEffect } from "react"

export const WhatsAppMessageContext = createContext<{
  message: string | undefined
  setMessage: (m: string | undefined) => void
}>({ message: undefined, setMessage: () => {} })

export function useWhatsAppMessage(message?: string) {
  const { setMessage } = useContext(WhatsAppMessageContext)
  useEffect(() => {
    setMessage(message)
    return () => setMessage(undefined)
  }, [message, setMessage])
}
