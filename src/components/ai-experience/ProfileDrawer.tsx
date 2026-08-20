import { useEffect, useRef } from "react"

export function ProfileDrawer({
  images,
  eyebrow,
  title,
  subtitle,
  description,
  ctaLabel,
  onCta,
  onClose,
}: {
  images: string[]
  eyebrow: string
  title: string
  subtitle: string
  description: string
  ctaLabel: string
  onCta: () => void
  onClose: () => void
}) {
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", onKeyDown)
    document.body.style.overflow = "hidden"
    dialogRef.current?.focus()
    return () => {
      document.removeEventListener("keydown", onKeyDown)
      document.body.style.overflow = ""
    }
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start md:items-center justify-center overflow-y-auto bg-black/92 backdrop-blur-md px-4 py-6 md:py-8"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="ai-profile-drawer-heading"
        tabIndex={-1}
        className="relative w-full max-w-2xl bg-black rounded-[24px] p-5 md:p-8 outline-none"
      >
        <button
          onClick={onClose}
          aria-label="סגירה"
          className="absolute top-4 left-4 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-black/60 hover:bg-white/10 transition-colors text-2xl leading-none"
        >
          ×
        </button>

        {images.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mb-6 rounded-xl overflow-hidden">
            {images.map((src, i) => (
              <div key={i} className={i === 0 ? "col-span-2 row-span-2 aspect-square" : "aspect-square"}>
                <img src={src} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        )}

        <div className="font-mono text-xs uppercase tracking-wide text-dim mb-2">{eyebrow}</div>
        <h3 id="ai-profile-drawer-heading" className="font-display font-bold text-2xl md:text-3xl mb-2">{title}</h3>
        <p className="font-mono text-xs uppercase tracking-wide text-[#D1FE17] mb-4">{subtitle}</p>
        <p className="text-dim text-sm leading-relaxed mb-6">{description}</p>

        <button
          onClick={onCta}
          className="font-mono text-sm font-bold uppercase tracking-wide bg-[#D1FE17] text-black rounded-[8px] px-6 py-3 hover:scale-105 transition-transform"
        >
          {ctaLabel}
        </button>
      </div>
    </div>
  )
}
