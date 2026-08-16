import { useEffect, useLayoutEffect, useRef } from "react"
import gsap from "gsap"
import { useReducedMotion } from "@/hooks/useReducedMotion"
import { cn } from "@/lib/utils"

export function SectionHeading({
  children,
  className,
  headingClassName = "font-display font-medium text-[clamp(26px,4vw,46px)] leading-[1.4] tracking-tight",
}: {
  children: React.ReactNode
  className?: string
  headingClassName?: string
}) {
  const observeRef = useRef<HTMLDivElement>(null)
  const clipRef = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  // The clip-path is applied to an inner element, not the one IntersectionObserver
  // watches — a clipped-to-zero target reports zero intersection area in some
  // browsers, so observing it directly means it can never be seen to reveal itself.
  useLayoutEffect(() => {
    const el = clipRef.current
    if (!el || reduced) return
    el.style.clipPath = "inset(0 100% 0 0)"
  }, [reduced])

  useEffect(() => {
    const target = observeRef.current
    const clipped = clipRef.current
    if (!target || !clipped || reduced) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        gsap.to(clipped, { clipPath: "inset(0 0% 0 0)", duration: 1, ease: "expo.out" })
        io.disconnect()
      },
      { threshold: 0.3 }
    )
    io.observe(target)
    return () => io.disconnect()
  }, [reduced])

  return (
    <div ref={observeRef} className={cn("inline-block", className)}>
      <div ref={clipRef} className="inline-block">
        <h2 className={headingClassName}>
          <span
            style={{ WebkitBoxDecorationBreak: "clone", boxDecorationBreak: "clone" }}
            className="bg-[#D1FE17] text-black px-2.5 md:px-3.5 py-0.5 md:py-1 rounded-[2px]"
          >
            {children}
          </span>
        </h2>
      </div>
    </div>
  )
}
