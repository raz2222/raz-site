import { useEffect, useRef, useState, type ReactNode } from "react"
import { useReducedMotion } from "@/hooks/useReducedMotion"
import { cn } from "@/lib/utils"

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
  const videoRef = useRef<HTMLVideoElement>(null)
  const [muted, setMuted] = useState(true)

  useEffect(() => {
    const el = videoRef.current
    if (!el || !video || reduced) return
    el.muted = false
    const playPromise = el.play()
    if (playPromise !== undefined) {
      playPromise
        .then(() => setMuted(false))
        .catch(() => {
          el.muted = true
          setMuted(true)
          el.play().catch(() => {})
        })
    }
  }, [video, reduced])

  const toggleMute = () => {
    const el = videoRef.current
    if (!el) return
    const next = !el.muted
    el.muted = next
    setMuted(next)
    if (!next) el.play().catch(() => {})
  }

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
                <video
                  ref={videoRef}
                  src={video}
                  poster={poster || undefined}
                  preload="auto"
                  muted={muted}
                  loop
                  playsInline
                  autoPlay
                  className="absolute inset-0 w-full h-full object-cover contrast-[1.05] brightness-[0.9]"
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
                    onClick={toggleMute}
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
            <div className="absolute inset-0 flex items-center justify-center p-6 text-center">{fallback}</div>
          )}
        </div>
      </div>
    </div>
  )
}
