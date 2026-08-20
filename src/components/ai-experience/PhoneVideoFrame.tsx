import { useEffect, useRef, useState, type ReactNode } from "react"
import { useReducedMotion } from "@/hooks/useReducedMotion"
import { cn } from "@/lib/utils"

const NOISE_URL =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"

const VIDEO_LAYER_CLASS = "absolute inset-0 w-full h-full object-cover contrast-[1.05] brightness-[0.9] transition-opacity duration-300"

function SoundOnIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
      <path d="M4 9v6h4l5 5V4L8 9H4Z" fill="black" />
      <path d="M16.5 8.5a5 5 0 0 1 0 7" stroke="black" strokeWidth="2" strokeLinecap="round" />
      <path d="M19 6a9 9 0 0 1 0 12" stroke="black" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function SoundOffIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
      <path d="M4 9v6h4l5 5V4L8 9H4Z" fill="black" />
      <path d="M16 9l5 6M21 9l-5 6" stroke="black" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

/**
 * Crossfades between two <video> elements playing the same clip, restarting
 * the hidden one just before the visible one ends — avoids the black/gray
 * flash a plain `loop` attribute causes when the decoder resets to frame 0.
 */
function SeamlessLoopVideo({
  src,
  poster,
  muted,
  onMutedChange,
  bindToggle,
}: {
  src: string
  poster?: string
  muted: boolean
  onMutedChange: (muted: boolean) => void
  bindToggle: (fn: () => void) => void
}) {
  const refA = useRef<HTMLVideoElement>(null)
  const refB = useRef<HTMLVideoElement>(null)
  const [frontIsA, setFrontIsA] = useState(true)
  const swappingRef = useRef(false)

  useEffect(() => {
    swappingRef.current = false
    setFrontIsA(true)
    const a = refA.current
    const b = refB.current
    if (b) {
      b.pause()
      b.currentTime = 0
    }
    if (a) {
      a.muted = false
      const p = a.play()
      if (p !== undefined) {
        p.then(() => onMutedChange(false)).catch(() => {
          a.muted = true
          onMutedChange(true)
          a.play().catch(() => {})
        })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src])

  useEffect(() => {
    const front = frontIsA ? refA.current : refB.current
    const back = frontIsA ? refB.current : refA.current
    if (!front) return

    const handleTimeUpdate = () => {
      if (swappingRef.current) return
      const d = front.duration
      if (!d || !isFinite(d)) return
      if (d - front.currentTime <= 0.4) {
        swappingRef.current = true
        if (back) {
          back.muted = muted
          back.currentTime = 0
          back.play().catch(() => {})
        }
        setFrontIsA((v) => !v)
      }
    }
    front.addEventListener("timeupdate", handleTimeUpdate)
    return () => front.removeEventListener("timeupdate", handleTimeUpdate)
  }, [frontIsA, muted])

  useEffect(() => {
    swappingRef.current = false
  }, [frontIsA])

  useEffect(() => {
    const front = frontIsA ? refA.current : refB.current
    if (front) front.muted = muted
  }, [muted, frontIsA])

  useEffect(() => {
    bindToggle(() => {
      const front = frontIsA ? refA.current : refB.current
      if (!front) return
      const next = !front.muted
      front.muted = next
      onMutedChange(next)
      if (!next) front.play().catch(() => {})
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frontIsA])

  return (
    <>
      <video
        ref={refA}
        src={src}
        poster={poster}
        preload="auto"
        muted={muted}
        playsInline
        className={cn(VIDEO_LAYER_CLASS, frontIsA ? "opacity-100 z-[1]" : "opacity-0 z-0")}
      />
      <video
        ref={refB}
        src={src}
        preload="auto"
        muted
        playsInline
        className={cn(VIDEO_LAYER_CLASS, frontIsA ? "opacity-0 z-0" : "opacity-100 z-[1]")}
      />
    </>
  )
}

export function PhoneVideoFrame({
  video,
  poster,
  title,
  fallback,
  className,
}: {
  video?: string | null
  poster?: string | null
  title?: string | null
  fallback?: ReactNode
  className?: string
}) {
  const reduced = useReducedMotion()
  const [muted, setMuted] = useState(true)
  const toggleRef = useRef<() => void>(() => {})

  return (
    <div className={cn("mx-auto w-full max-w-[300px]", className)}>
      <div className="relative rounded-[2.2rem] border border-white/15 bg-neutral-950 p-2.5 shadow-2xl shadow-black/40">
        <div className="absolute left-1/2 top-2.5 -translate-x-1/2 w-16 h-4 rounded-full bg-black/80 z-10" />
        <div className="relative aspect-[9/16] rounded-[1.6rem] overflow-hidden bg-neutral-900">
          {video ? (
            <>
              {reduced ? (
                poster ? (
                  <img src={poster} alt="" className="absolute inset-0 w-full h-full object-cover contrast-[1.05] brightness-[0.9]" />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-neutral-800 to-neutral-950" />
                )
              ) : (
                <SeamlessLoopVideo
                  src={video}
                  poster={poster || undefined}
                  muted={muted}
                  onMutedChange={setMuted}
                  bindToggle={(fn) => { toggleRef.current = fn }}
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/10" />
              <div className="absolute bottom-4 right-4 left-4 flex items-center justify-between gap-2">
                {title ? (
                  <span className="font-mono text-[10px] uppercase tracking-wide text-white bg-black/40 backdrop-blur px-2.5 py-1 rounded-full truncate">
                    {title}
                  </span>
                ) : (
                  <span />
                )}
                <div className="flex items-center gap-2 flex-none">
                  <button
                    type="button"
                    onClick={() => toggleRef.current()}
                    aria-label={muted ? "הפעל סאונד" : "השתק סאונד"}
                    aria-pressed={!muted}
                    className="w-7 h-7 rounded-full bg-[#D1FE17] flex items-center justify-center flex-none"
                  >
                    {muted ? <SoundOffIcon /> : <SoundOnIcon />}
                  </button>
                  <span className="w-7 h-7 rounded-full bg-[#D1FE17] flex items-center justify-center flex-none">
                    <span className="w-0 h-0 border-y-[5px] border-y-transparent border-r-0 border-l-[7px] border-l-black mr-[-1px]" />
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className="absolute inset-0">
              <div
                className="absolute inset-0 tv-static"
                style={{ backgroundImage: `url("${NOISE_URL}")`, backgroundSize: "140px 140px", mixBlendMode: "overlay" }}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50" />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
                <span className="w-2 h-2 rounded-full bg-[#D1FE17] animate-[pulse-dot_1.6s_ease-in-out_infinite]" />
                {fallback}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
