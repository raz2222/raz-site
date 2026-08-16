import { useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"
import gsap from "gsap"

const CLIPS = [
  "/videos/raz-showreel.mp4",
  "/videos/raz-showreel-5.mp4",
  "/videos/raz-showreel-2.mp4",
  "/videos/raz-showreel-7.mp4",
  "/videos/raz-showreel-4.mp4",
]

export function Hero() {
  const videoARef = useRef<HTMLVideoElement>(null)
  const videoBRef = useRef<HTMLVideoElement>(null)
  const headlineRef = useRef<HTMLDivElement>(null)
  const subRef = useRef<HTMLParagraphElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const stateRef = useRef<{ showing: HTMLVideoElement | null; hidden: HTMLVideoElement | null }>({
    showing: null,
    hidden: null,
  })
  const intervalRef = useRef<number | null>(null)
  const crossfadeRef = useRef<(() => void) | null>(null)
  const [reduceMotion, setReduceMotion] = useState(false)
  const [playing, setPlaying] = useState(true)
  const [hasVideo, setHasVideo] = useState(false)

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    setReduceMotion(reduce)
    const tl = gsap.timeline({ delay: 0.2 })
    tl.fromTo(
      headlineRef.current,
      { clipPath: "inset(0 100% 0 0)" },
      { clipPath: "inset(0 0% 0 0)", duration: 1.1, ease: "expo.out" }
    )
      .fromTo(subRef.current, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.8 }, "-=0.5")
      .fromTo(scrollRef.current, { opacity: 0 }, { opacity: 1, duration: 0.8 }, "-=0.5")

    if (reduce) return

    const videoA = videoARef.current
    const videoB = videoBRef.current
    if (!videoA || !videoB) return
    setHasVideo(true)

    let index = 0
    stateRef.current.showing = videoA
    stateRef.current.hidden = videoB

    function loadInto(el: HTMLVideoElement, src: string, onReady: () => void) {
      let fired = false
      const mark = () => {
        if (fired) return
        fired = true
        el.removeEventListener("canplaythrough", mark)
        el.removeEventListener("loadeddata", mark)
        onReady()
      }
      el.addEventListener("canplaythrough", mark)
      el.addEventListener("loadeddata", mark)
      el.src = src
      el.load()
      setTimeout(mark, 1500)
    }

    let hiddenReady = false
    function preloadNext() {
      hiddenReady = false
      const nextIndex = (index + 1) % CLIPS.length
      const hidden = stateRef.current.hidden!
      loadInto(hidden, CLIPS[nextIndex], () => {
        hiddenReady = true
      })
    }

    function crossfade() {
      const swap = () => {
        const showing = stateRef.current.showing!
        const hidden = stateRef.current.hidden!
        index = (index + 1) % CLIPS.length
        hidden.currentTime = 0
        hidden.play().catch(() => {})
        gsap.to(hidden, { opacity: 1, duration: 1 })
        gsap.to(showing, { opacity: 0, duration: 1 })
        stateRef.current.showing = hidden
        stateRef.current.hidden = showing
        preloadNext()
      }
      if (hiddenReady) swap()
      else {
        const wait = setInterval(() => {
          if (hiddenReady) {
            clearInterval(wait)
            swap()
          }
        }, 80)
      }
    }

    loadInto(stateRef.current.showing, CLIPS[index], () => {
      stateRef.current.showing?.play().catch(() => {})
      gsap.to(stateRef.current.showing, { opacity: 1, duration: 1 })
      preloadNext()
    })

    crossfadeRef.current = crossfade
    intervalRef.current = window.setInterval(crossfade, 3200)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  function togglePlayback() {
    const next = !playing
    setPlaying(next)
    const { showing } = stateRef.current
    if (next) {
      showing?.play().catch(() => {})
      if (!intervalRef.current && crossfadeRef.current) {
        intervalRef.current = window.setInterval(crossfadeRef.current, 3200)
      }
    } else {
      showing?.pause()
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }

  return (
    <section id="top" className="relative h-[100dvh] min-h-[600px] overflow-hidden flex flex-col justify-between">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-[#141412] via-[#0b0b0b] to-black" />
        <video
          ref={videoARef}
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-0 contrast-[1.05] brightness-[0.85]"
        />
        <video
          ref={videoBRef}
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-0 contrast-[1.05] brightness-[0.85]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/40" />
      </div>

      <div className="flex-1 flex flex-col justify-end px-5 md:px-12 pb-6">
        <div ref={headlineRef} className="max-w-4xl">
          <h1 className="font-display font-black text-[clamp(34px,6.4vw,80px)] leading-[1.1] tracking-tight text-foreground">
            חוויות דיגיטליות
            <br />
            שנשארות בזיכרון.
          </h1>
        </div>
        <p ref={subRef} className="mt-6 max-w-xl text-dim text-base md:text-lg leading-relaxed">
          אני מעצב ובונה אתרים, חוויות דיגיטליות וויז&apos;ואלים מבוססי AI למותגים שרוצים לבלוט.
        </p>
        <Link
          to="/contact"
          className="mt-8 inline-block w-fit font-mono text-sm uppercase tracking-wide bg-[#D1FE17] text-black rounded-full px-7 py-3.5 hover:scale-105 transition-transform"
        >
          בואו נתחיל ←
        </Link>
      </div>

      <div className="px-5 md:px-12 pb-8 flex items-end justify-between">
        <div ref={scrollRef} className="font-mono text-xs uppercase tracking-widest text-dim flex items-center gap-4">
          עבודות נבחרות ↓
          {!reduceMotion && hasVideo && (
            <button
              onClick={togglePlayback}
              aria-label={playing ? "עצירת וידאו הרקע" : "הפעלת וידאו הרקע"}
              className="w-7 h-7 rounded-full border border-white/30 flex items-center justify-center hover:border-white/60 transition-colors flex-none"
            >
              {playing ? (
                <span className="flex gap-[3px]">
                  <span className="w-[2px] h-2.5 bg-current" />
                  <span className="w-[2px] h-2.5 bg-current" />
                </span>
              ) : (
                <span className="w-0 h-0 border-y-[5px] border-y-transparent border-r-0 border-l-[7px] border-l-current mr-[-2px]" />
              )}
            </button>
          )}
        </div>
        <div className="hidden md:block text-left font-mono text-[11px] uppercase tracking-widest text-dim leading-relaxed">
          <div>RAZ AVRAMOV</div>
          <div>CREATIVE DEVELOPER</div>
          <div>ISRAEL / WORLDWIDE</div>
        </div>
      </div>
    </section>
  )
}
