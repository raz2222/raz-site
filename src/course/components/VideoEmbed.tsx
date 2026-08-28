import { useCallback, useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"

/**
 * YouTube (unlisted) player. The lesson stores a full
 * https://www.youtube-nocookie.com/embed/XXXX address in `video_url`.
 *
 * The video does not play inline — a poster with a play button opens it in a
 * lightbox (Esc / backdrop / ✕ to close). When `url` is missing we show a
 * "recording soon" placeholder so the layout still reads while filming.
 */
export function VideoEmbed({
  url,
  title,
  className = "",
}: {
  url: string | null
  title: string
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)

  const close = useCallback(() => {
    setOpen(false)
    triggerRef.current?.focus()
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close()
    document.addEventListener("keydown", onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = prev
    }
  }, [open, close])

  const posterBase =
    "group relative flex aspect-video w-full items-center justify-center overflow-hidden rounded border border-white/10 bg-gradient-to-br from-white/[0.08] to-transparent"

  if (!url) {
    return (
      <div className={`${posterBase} ${className}`}>
        <div className="grid place-items-center gap-2 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-[#D1FE17] text-background md:h-16 md:w-16">
            <svg width="20" height="20" viewBox="0 0 26 26" fill="currentColor" aria-hidden="true">
              <path d="M8 5.5v15l13-7.5z" />
            </svg>
          </span>
          <p className="px-4 font-mono text-[0.7rem] uppercase tracking-wide text-dim">
            הסרטון בהקלטה — יעלה בקרוב
          </p>
        </div>
      </div>
    )
  }

  const src = url.includes("?") ? `${url}&rel=0&autoplay=1` : `${url}?rel=0&autoplay=1`

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`נגן: ${title}`}
        className={`${posterBase} cursor-pointer transition-colors hover:border-white/25 ${className}`}
      >
        <span
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage: "linear-gradient(hsl(60 9% 96% / 0.05) 1px, transparent 1px)",
            backgroundSize: "100% 3px",
          }}
        />
        <span className="relative grid h-16 w-16 place-items-center rounded-full bg-[#D1FE17] text-background transition-transform group-hover:scale-105 md:h-[70px] md:w-[70px]">
          <svg width="24" height="24" viewBox="0 0 26 26" fill="currentColor" aria-hidden="true">
            <path d="M8 5.5v15l13-7.5z" />
          </svg>
        </span>
      </button>

      {open &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            onClick={close}
            className="fixed inset-0 z-[120] flex items-center justify-center bg-background/90 p-4 backdrop-blur-sm md:p-8"
          >
            <div
              dir="ltr"
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl"
            >
              <button
                type="button"
                onClick={close}
                aria-label="סגירה"
                className="absolute -top-10 right-0 p-2 font-mono text-xs uppercase tracking-wide text-dim hover:text-foreground md:-top-11"
              >
                סגירה ✕
              </button>
              <div className="aspect-video w-full overflow-hidden rounded border border-white/15 bg-black">
                <iframe
                  src={src}
                  title={title}
                  className="h-full w-full"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  )
}
