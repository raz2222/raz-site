import { useEffect, useRef } from "react"
import { useContactForm } from "@/hooks/useContactForm"
import { useContactModal } from "@/hooks/useContactModal"
import { useFocusTrap } from "@/hooks/useFocusTrap"
import { ConsentCheckbox } from "@/components/ConsentCheckbox"
import { LegalLink } from "@/components/LegalLink"
import { cn } from "@/lib/utils"

const inputClass =
  "w-full bg-transparent border border-white/30 rounded px-4 py-3 text-sm focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:border-white/50"
const labelClass = "block text-xs font-mono text-dim uppercase tracking-wide mb-2"

// A lean, single-step stand-in for ContactModal.tsx's multi-step lead
// qualification funnel — the showcase is judge-facing, not a sales flow, so
// it just asks for the basics and reuses useContactForm's submit/validation.
export function ShowcaseContactModal() {
  const { open, closeModal, metadata } = useContactModal()
  const dialogRef = useRef<HTMLDivElement>(null)

  const form = useContactForm(() => closeModal(), { isEnglish: true, metadata })

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

  useFocusTrap(dialogRef, open)

  if (!open) return null

  return (
    <div
      dir="ltr"
      className="fixed inset-0 z-[100] flex items-start md:items-center justify-center overflow-y-auto bg-black/92 backdrop-blur-md px-4 py-6 md:py-8"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) closeModal()
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="showcase-contact-heading"
        tabIndex={-1}
        className="relative w-full max-w-lg bg-black rounded-[24px] p-5 md:p-10 outline-none text-left"
      >
        <button
          onClick={closeModal}
          aria-label="Close"
          className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors text-2xl leading-none"
        >
          ×
        </button>

        <h2
          id="showcase-contact-heading"
          className="font-display font-black text-[clamp(22px,4vw,34px)] leading-[1.15] tracking-[-0.04em] mb-6 text-gradient-accent"
        >
          Let&apos;s talk.
        </h2>

        <div className="flex flex-col gap-3 md:gap-4">
          <div>
            <label htmlFor="showcase-contact-name" className={labelClass}>
              Full name *
            </label>
            <input
              id="showcase-contact-name"
              required
              aria-invalid={!!form.fieldErrors.name}
              aria-describedby={form.fieldErrors.name ? "showcase-contact-name-error" : undefined}
              placeholder="Full name"
              value={form.name}
              onChange={(e) => form.setName(e.target.value)}
              className={cn(inputClass, form.fieldErrors.name && "border-red-400")}
            />
            {form.fieldErrors.name && (
              <p id="showcase-contact-name-error" role="alert" className="text-xs text-red-400 mt-1.5">
                {form.fieldErrors.name}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="showcase-contact-email" className={labelClass}>
              Email *
            </label>
            <input
              id="showcase-contact-email"
              required
              type="email"
              aria-invalid={!!form.fieldErrors.email}
              aria-describedby={form.fieldErrors.email ? "showcase-contact-email-error" : undefined}
              placeholder="Email"
              value={form.email}
              onChange={(e) => form.setEmail(e.target.value)}
              className={cn(inputClass, form.fieldErrors.email && "border-red-400")}
            />
            {form.fieldErrors.email && (
              <p id="showcase-contact-email-error" role="alert" className="text-xs text-red-400 mt-1.5">
                {form.fieldErrors.email}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="showcase-contact-message" className={labelClass}>
              Tell me a bit about the project
            </label>
            <textarea
              id="showcase-contact-message"
              placeholder="Tell me a bit about the project"
              rows={4}
              value={form.message}
              onChange={(e) => form.setMessage(e.target.value)}
              className={inputClass}
            />
          </div>

          {form.error && (
            <p role="alert" className="text-sm text-red-400">
              {form.error}
            </p>
          )}

          <ConsentCheckbox id="showcase-contact-consent" checked={form.consent} onChange={form.setConsent} error={form.fieldErrors.consent}>
            I&apos;ve read and agree to the{" "}
            <LegalLink to="/privacy" className="underline underline-offset-4 hover:text-[#D1FE17] transition-colors">
              privacy policy
            </LegalLink>
            , and consent to my details being used to get back to me about this project and never shared with third parties. *
          </ConsentCheckbox>

          <button
            onClick={form.handleSubmit}
            disabled={form.submitting}
            className="mt-2 font-mono text-sm font-bold uppercase tracking-wide bg-[#D1FE17] text-black rounded-[8px] px-6 py-3 hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100 w-fit"
          >
            {form.submitting ? "Sending…" : "Send message →"}
          </button>
        </div>
      </div>
    </div>
  )
}
