import { useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { useContactForm } from "@/hooks/useContactForm"
import { useContactModal } from "@/hooks/useContactModal"
import { useSiteContent } from "@/hooks/useSiteContent"
import { CONTACT_PAGE_DEFAULT } from "@/lib/siteContentDefaults"
import { ContactFormFields } from "./ContactFormFields"

export function ContactModal() {
  const { open, closeModal } = useContactModal()
  const navigate = useNavigate()
  const { content: page } = useSiteContent("contact_page", CONTACT_PAGE_DEFAULT)
  const dialogRef = useRef<HTMLDivElement>(null)

  const form = useContactForm(() => {
    closeModal()
    navigate("/thank-you")
  })

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal()
    }
    document.addEventListener("keydown", onKeyDown)
    document.body.style.overflow = "hidden"
    dialogRef.current?.focus()
    return () => {
      document.removeEventListener("keydown", onKeyDown)
      document.body.style.overflow = ""
    }
  }, [open, closeModal])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start md:items-center justify-center overflow-y-auto bg-black/70 backdrop-blur-sm px-4 py-8"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) closeModal()
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="contact-modal-heading"
        tabIndex={-1}
        className="relative w-full max-w-lg bg-background surface-raised rounded-[24px] p-6 md:p-10 outline-none"
      >
        <button
          onClick={closeModal}
          aria-label="סגירה"
          className="absolute top-4 left-4 w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors text-2xl leading-none"
        >
          ×
        </button>

        <h2 id="contact-modal-heading" className="font-display font-black text-[clamp(24px,4vw,34px)] leading-[1.15] tracking-[-0.04em] mb-6 text-gradient-accent">
          {page.heading}
        </h2>

        <ContactFormFields form={form} giftNote={page.gift_note} />
      </div>
    </div>
  )
}
