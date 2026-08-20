import { useEffect, useRef, type RefObject } from "react"

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * Traps Tab focus inside `containerRef` while `active`, marks #main inert so
 * screen readers can't reach content behind the overlay, and restores focus
 * to whatever triggered it on close.
 */
export function useFocusTrap(containerRef: RefObject<HTMLElement | null>, active: boolean) {
  const previouslyFocused = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!active) return
    previouslyFocused.current = document.activeElement as HTMLElement | null

    const main = document.getElementById("main")
    main?.setAttribute("inert", "")

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return
      const container = containerRef.current
      if (!container) return
      const focusable = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
        (el) => el.offsetParent !== null
      )
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      main?.removeAttribute("inert")
      previouslyFocused.current?.focus?.()
    }
  }, [active, containerRef])
}
