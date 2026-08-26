import { useEffect, useRef } from "react"
import gsap from "gsap"
import { useReducedMotion } from "@/hooks/useReducedMotion"

const INTERACTIVE_SELECTOR = "a, button, [role='button'], input, textarea, select, summary"

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    if (reduceMotion) return
    if (!window.matchMedia("(pointer: fine)").matches) return

    const dot = dotRef.current
    const ring = ringRef.current
    if (!dot || !ring) return

    gsap.set([dot, ring], { xPercent: -50, yPercent: -50, x: -100, y: -100 })

    const prevCursor = document.body.style.cursor
    document.body.style.cursor = "none"
    dot.style.opacity = "1"
    ring.style.opacity = "1"

    const moveDotX = gsap.quickTo(dot, "x", { duration: 0.1, ease: "power3.out" })
    const moveDotY = gsap.quickTo(dot, "y", { duration: 0.1, ease: "power3.out" })
    const moveRingX = gsap.quickTo(ring, "x", { duration: 0.35, ease: "power3.out" })
    const moveRingY = gsap.quickTo(ring, "y", { duration: 0.35, ease: "power3.out" })

    function onMove(e: PointerEvent) {
      moveDotX(e.clientX)
      moveDotY(e.clientY)
      moveRingX(e.clientX)
      moveRingY(e.clientY)
    }

    function onOver(e: PointerEvent) {
      const target = e.target as HTMLElement
      const interactive = !!target.closest?.(INTERACTIVE_SELECTOR)
      gsap.to(ring, { scale: interactive ? 1.8 : 1, duration: 0.25, ease: "power2.out" })
    }

    const onLeave = () => {
      dot.style.opacity = "0"
      ring.style.opacity = "0"
    }

    const onEnter = () => {
      dot.style.opacity = "1"
      ring.style.opacity = "1"
    }

    window.addEventListener("pointermove", onMove)
    window.addEventListener("pointerover", onOver)
    document.documentElement.addEventListener("mouseleave", onLeave)
    document.documentElement.addEventListener("mouseenter", onEnter)
    return () => {
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("pointerover", onOver)
      document.documentElement.removeEventListener("mouseleave", onLeave)
      document.documentElement.removeEventListener("mouseenter", onEnter)
      document.body.style.cursor = prevCursor
    }
  }, [reduceMotion])

  return (
    <>
      <div
        ref={dotRef}
        aria-hidden="true"
        className="fixed top-0 left-0 z-[110] w-1.5 h-1.5 rounded-full bg-[#D1FE17] pointer-events-none opacity-0"
      />
      <div
        ref={ringRef}
        aria-hidden="true"
        className="fixed top-0 left-0 z-[110] w-8 h-8 rounded-full border border-[#D1FE17]/50 pointer-events-none opacity-0"
      />
    </>
  )
}
