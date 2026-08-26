import { useEffect, useRef, useState } from "react"
import { useReducedMotion } from "@/hooks/useReducedMotion"
import { cn } from "@/lib/utils"

export function AutoVideo({ src, poster, className }: { src: string; poster?: string; className?: string }) {
  const reduced = useReducedMotion()
  const ref = useRef<HTMLVideoElement>(null)
  const [inView, setInView] = useState(false)
  const [failed, setFailed] = useState(false)

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

  // A missing/broken video source otherwise renders as a flat bg-neutral-900
  // box with no indication anything went wrong — fall back to the same
  // gradient treatment used when there's no video at all.
  if (reduced || failed) {
    return poster ? (
      <img src={poster} alt="" className={cn("bg-neutral-900 object-cover", className)} />
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
      onError={() => setFailed(true)}
      className={cn("bg-neutral-900", className)}
    />
  )
}
