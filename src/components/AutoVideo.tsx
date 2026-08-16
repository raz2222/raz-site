import { useEffect, useRef, useState } from "react"
import { useReducedMotion } from "@/hooks/useReducedMotion"
import { cn } from "@/lib/utils"

export function AutoVideo({ src, className, poster }: { src: string; className?: string; poster?: string }) {
  const reduced = useReducedMotion()
  const ref = useRef<HTMLVideoElement>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    if (reduced) return
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          io.disconnect()
        }
      },
      { rootMargin: "200px" }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [reduced])

  if (reduced) {
    return poster ? (
      <img src={poster} alt="" className={cn("object-cover", className)} />
    ) : (
      <div className={cn("bg-gradient-to-br from-neutral-800 to-neutral-950", className)} />
    )
  }

  return (
    <video
      ref={ref}
      src={inView ? src : undefined}
      poster={poster}
      preload="none"
      muted
      loop
      playsInline
      autoPlay={inView}
      className={cn("bg-neutral-900", className)}
    />
  )
}
