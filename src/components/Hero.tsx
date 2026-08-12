import { useEffect, useRef } from "react"
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

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const tl = gsap.timeline({ delay: 0.2 })
    tl.fromTo(
      headlineRef.current,
      { clipPath: "inset(0 100% 0 0)" },
      { clipPath: "inset(0 0% 0 0)", duration: 1.1, ease: "expo.out" }
    )
      .fromTo(subRef.current, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.8 }, "-=0.5")
      .fromTo(scrollRef.current, { opacity: 0 }, { opacity: 1, duration: 0.8 }, "-=0.5")

    if (reduceMotion) return

    const videoA = videoARef.current
    const videoB = videoBRef.current
    if (!videoA || !videoB) return

    let index = 0
    let showing = videoA
    let hidden = videoB

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
      loadInto(hidden, CLIPS[nextIndex], () => {
        hiddenReady = true
      })
    }

    function crossfade() {
      const swap = () => {
        index = (index + 1) % CLIPS.length
        hidden.currentTime = 0
        hidden.play().catch(() => {})
        gsap.to(hidden, { opacity: 1, duration: 1 })
        gsap.to(showing, { opacity: 0, duration: 1 })
        const tmp = showing
        showing = hidden
        hidden = tmp
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

    loadInto(showing, CLIPS[index], () => {
      showing.play().catch(() => {})
      gsap.to(showing, { opacity: 1, duration: 1 })
      preloadNext()
    })

    const interval = setInterval(crossfade, 3200)
    return () => clearInterval(interval)
  }, [])

  return (
    <section id="top" className="relative h-[100dvh] min-h-[600px] overflow-hidden flex flex-col justify-between">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-[#141412] via-[#0b0b0b] to-black" />
        <video
          ref={videoARef}
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-0 grayscale contrast-[1.05] brightness-[0.75]"
        />
        <video
          ref={videoBRef}
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-0 grayscale contrast-[1.05] brightness-[0.75]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/40" />
      </div>

      <div className="flex-1 flex flex-col justify-end px-5 md:px-12 pb-6">
        <div ref={headlineRef} className="max-w-4xl">
          <h1 className="font-display font-bold text-[clamp(38px,7vw,88px)] leading-[1.02] tracking-tight text-foreground">
            Digital experiences
            <br />
            built to be remembered.
          </h1>
        </div>
        <p ref={subRef} className="mt-6 max-w-xl text-dim text-base md:text-lg leading-relaxed">
          I design and build websites, digital experiences and AI-powered visuals for brands
          that want to stand out.
        </p>
      </div>

      <div className="px-5 md:px-12 pb-8 flex items-end justify-between">
        <div ref={scrollRef} className="font-mono text-xs uppercase tracking-widest text-dim">
          Selected Work ↓
        </div>
        <div className="hidden md:block text-right font-mono text-[11px] uppercase tracking-widest text-dim leading-relaxed">
          <div>RAZ AVRAMOV</div>
          <div>CREATIVE DEVELOPER</div>
          <div>ISRAEL / WORLDWIDE</div>
        </div>
      </div>
    </section>
  )
}
