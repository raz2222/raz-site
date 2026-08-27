import { useEffect, useRef, useState } from "react"
import gsap from "gsap"
import { SHOWCASE_EASE } from "@/lib/showcaseMotion"
import { cn } from "@/lib/utils"

type Variant = "default" | "interactive" | "text"

// A from-scratch cursor for the showcase only — unrelated to CustomCursor.tsx
// on the on-hold claude/awwwards-design-polish branch, which this never
// touches or reuses. Fully inert on touch/coarse pointers: the media query
// check below means no listener is ever attached and nothing renders, so
// there's no mobile cost at all.
export function ShowcaseCursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const [enabled, setEnabled] = useState(false)
  const [variant, setVariant] = useState<Variant>("default")

  useEffect(() => {
    setEnabled(window.matchMedia("(pointer: fine)").matches)
  }, [])

  useEffect(() => {
    if (!enabled) return

    const dot = dotRef.current
    const ring = ringRef.current
    if (!dot || !ring) return

    document.documentElement.classList.add("showcase-cursor-active")

    const setDotX = gsap.quickTo(dot, "x", { duration: 0.12, ease: SHOWCASE_EASE })
    const setDotY = gsap.quickTo(dot, "y", { duration: 0.12, ease: SHOWCASE_EASE })
    const setRingX = gsap.quickTo(ring, "x", { duration: 0.45, ease: SHOWCASE_EASE })
    const setRingY = gsap.quickTo(ring, "y", { duration: 0.45, ease: SHOWCASE_EASE })

    function onPointerMove(e: PointerEvent) {
      if (e.pointerType !== "mouse" && e.pointerType !== "pen") return
      let x = e.clientX
      let y = e.clientY

      const hovered = e.target as HTMLElement | null
      const interactiveEl = hovered?.closest<HTMLElement>("a, button, [data-cursor='interactive']")

      if (interactiveEl) {
        // Magnetic pull: bias the ring toward the hovered element's center
        // instead of tracking the raw pointer position 1:1.
        const rect = interactiveEl.getBoundingClientRect()
        const cx = rect.left + rect.width / 2
        const cy = rect.top + rect.height / 2
        x += (cx - x) * 0.35
        y += (cy - y) * 0.35
        setVariant("interactive")
      } else {
        const textEl = hovered?.closest<HTMLElement>("h1, h2, h3, [data-cursor='text']")
        setVariant(textEl ? "text" : "default")
      }

      setDotX(x)
      setDotY(y)
      setRingX(x)
      setRingY(y)
    }

    window.addEventListener("pointermove", onPointerMove, { passive: true })
    return () => {
      window.removeEventListener("pointermove", onPointerMove)
      document.documentElement.classList.remove("showcase-cursor-active")
    }
  }, [enabled])

  if (!enabled) return null

  return (
    <>
      <style>{`
        html.showcase-cursor-active, html.showcase-cursor-active * { cursor: none !important; }
      `}</style>
      <div ref={dotRef} aria-hidden="true" className="pointer-events-none fixed left-0 top-0 z-[200] -ml-[3px] -mt-[3px]">
        <div
          className={cn(
            "w-1.5 h-1.5 rounded-full bg-[#D1FE17] transition-opacity duration-150",
            variant === "interactive" && "opacity-0"
          )}
        />
      </div>
      <div ref={ringRef} aria-hidden="true" className="pointer-events-none fixed left-0 top-0 z-[199] w-10 h-10 -ml-5 -mt-5">
        <div
          className={cn(
            "absolute inset-0 rounded-full border transition-all duration-300 ease-out",
            variant === "interactive" && "scale-[1.6] border-[#D1FE17] bg-[#D1FE17]/10",
            variant === "text" &&
              "scale-x-[0.12] scale-y-[0.7] border-0 bg-white rounded-none [mix-blend-mode:difference]",
            variant === "default" && "border-white/30"
          )}
        />
      </div>
    </>
  )
}
