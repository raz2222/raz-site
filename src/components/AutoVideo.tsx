import { useEffect, useRef, useState } from "react"
import { useReducedMotion } from "@/hooks/useReducedMotion"
import { posterFor } from "@/lib/videoPosters"
import { cn } from "@/lib/utils"

export function AutoVideo({ src, poster, className }: { src: string; poster?: string; className?: string }) {
  const reduced = useReducedMotion()
  // Every clip in public/videos has an extracted first frame (see
  // scripts/generate-video-posters.mjs). Without one the element paints a flat
  // black box until the video buffers, and Google will not index a video it
  // cannot pull a thumbnail from. An explicit poster still wins.
  const frame = poster ?? posterFor(src)
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
    return frame ? (
      <img src={frame} alt="" className={cn("bg-neutral-900 object-cover", className)} />
    ) : (
      <div className={cn("bg-gradient-to-br from-neutral-800 to-neutral-950", className)} />
    )
  }

  return (
    <video
      ref={ref}
      src={inView ? src : undefined}
      poster={frame}
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
