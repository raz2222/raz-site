import { useEffect, useRef, useState } from "react"
import { useReducedMotion } from "@/hooks/useReducedMotion"
import { posterFor } from "@/lib/videoPosters"
import { cn } from "@/lib/utils"
import { youtubeId, youtubeEmbedUrl, youtubeThumbnail } from "@/lib/youtube"

export function AutoVideo({ src, poster, className }: { src: string; poster?: string; className?: string }) {
  // A film too big for the 50MB upload can be hosted on YouTube and pasted in.
  // Anything that is not a YouTube link falls straight through to the <video>
  // element below, so every existing clip behaves exactly as it did.
  const youtube = youtubeId(src)
  if (youtube) return <YouTubeLoop id={youtube} poster={poster} className={className} />
  return <FileVideo src={src} poster={poster} className={className} />
}

/** The same silent loop, from YouTube.
 *
 * Their thumbnail holds the frame until the clip is scrolled to, and only then
 * is the iframe mounted · YouTube's player is several hundred kilobytes of
 * someone else's JavaScript, and this site is main-thread bound. Nothing about
 * it loads on a page nobody scrolled down. */
function YouTubeLoop({ id, poster, className }: { id: string; poster?: string; className?: string }) {
  const reduced = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  const frame = poster ?? youtubeThumbnail(id)

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

  if (reduced) return <img src={frame} alt="" className={cn("bg-neutral-900 object-cover", className)} />

  return (
    <div ref={ref} className={cn("relative overflow-hidden bg-neutral-900", className)}>
      {inView ? (
        <iframe
          src={youtubeEmbedUrl(id)}
          title=""
          aria-hidden="true"
          allow="autoplay; encrypted-media; picture-in-picture"
          // A background loop is decoration, not a control · nothing here is
          // meant to take focus or be reachable by keyboard.
          tabIndex={-1}
          className="absolute inset-0 w-full h-full border-0 pointer-events-none"
        />
      ) : (
        <img src={frame} alt="" className="absolute inset-0 w-full h-full object-cover" />
      )}
    </div>
  )
}

function FileVideo({ src, poster, className }: { src: string; poster?: string; className?: string }) {
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
