import { useEffect, useRef, useState } from "react"
import { useLocation } from "react-router-dom"
import gsap from "gsap"
import { useReducedMotion } from "@/hooks/useReducedMotion"

export function IntroLoader() {
  const location = useLocation()
  const [shouldShow] = useState(() => location.pathname === "/" || location.pathname === "/en")
  const reduceMotion = useReducedMotion()
  const [done, setDone] = useState(false)
  const overlayRef = useRef<HTMLDivElement>(null)
  const wordmarkRef = useRef<HTMLDivElement>(null)
  const barRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!shouldShow || reduceMotion) {
      setDone(true)
      return
    }
    const tl = gsap.timeline({ onComplete: () => setDone(true) })
    tl.fromTo(wordmarkRef.current, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.4, ease: "expo.out" })
      .fromTo(barRef.current, { scaleX: 0 }, { scaleX: 1, duration: 0.7, ease: "power2.inOut" }, "-=0.1")
      .to(overlayRef.current, { clipPath: "inset(0 0 100% 0)", duration: 0.6, ease: "expo.inOut" }, "+=0.15")
    return () => {
      tl.kill()
    }
  }, [shouldShow, reduceMotion])

  if (!shouldShow || done) return null

  return (
    <div
      ref={overlayRef}
      aria-hidden="true"
      className="fixed inset-0 z-[120] flex flex-col items-center justify-center bg-background"
      style={{ clipPath: "inset(0 0 0% 0)" }}
    >
      <div ref={wordmarkRef} className="font-display font-black text-xl md:text-2xl tracking-[-0.02em] text-foreground opacity-0">
        MADE BY RAZ
      </div>
      <div className="mt-4 w-36 md:w-48 h-[2px] bg-white/10 overflow-hidden rounded-full">
        <div ref={barRef} className="h-full w-full bg-[#D1FE17] origin-left scale-x-0" />
      </div>
    </div>
  )
}
