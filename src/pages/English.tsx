import { useEffect, useMemo, useRef, useState } from "react"
import { Link } from "react-router-dom"
import gsap from "gsap"
import { useProjects } from "@/hooks/useProjects"
import { useDocumentMeta } from "@/hooks/useDocumentMeta"
import { useHreflang } from "@/hooks/useHreflang"
import { Reveal } from "@/components/Reveal"
import { AutoVideo } from "@/components/AutoVideo"
import { BrowserProjectCard } from "@/components/BrowserProjectCard"
import { useContactModal } from "@/hooks/useContactModal"
import { useAIExperience } from "@/hooks/useAIExperience"
import { useReducedMotion } from "@/hooks/useReducedMotion"
import { PhoneVideoFrame } from "@/components/ai-experience/PhoneVideoFrame"
import { trackEvent } from "@/lib/analytics"
import { PROJECT_CATEGORIES } from "@/lib/supabase"
import { translateCategory, translateLabels, getProjectTranslation } from "@/lib/projectTranslations"
import { cn } from "@/lib/utils"

const CLIPS = [
  "/videos/raz-showreel.mp4",
  "/videos/raz-showreel-5.mp4",
  "/videos/raz-showreel-2.mp4",
  "/videos/raz-showreel-7.mp4",
  "/videos/raz-showreel-4.mp4",
]

function EnglishHero() {
  const { openModal } = useContactModal()
  const videoARef = useRef<HTMLVideoElement>(null)
  const videoBRef = useRef<HTMLVideoElement>(null)
  const headlineRef = useRef<HTMLDivElement>(null)
  const subRef = useRef<HTMLParagraphElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [playing, setPlaying] = useState(true)
  const [hasVideo, setHasVideo] = useState(false)
  const [reduceMotion, setReduceMotion] = useState(false)
  const stateRef = useRef<{ showing: HTMLVideoElement | null; hidden: HTMLVideoElement | null }>({ showing: null, hidden: null })
  const intervalRef = useRef<number | null>(null)

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
      loadInto(hidden, CLIPS[nextIndex], () => { hiddenReady = true })
    }

    function crossfade() {
      const swap = () => {
        const { showing, hidden } = stateRef.current
        if (!showing || !hidden) return
        index = (index + 1) % CLIPS.length
        hidden.currentTime = 0
        hidden.play().catch(() => {})
        gsap.to(hidden, { opacity: 1, duration: 1 })
        gsap.to(showing, { opacity: 0, duration: 1 })
        stateRef.current = { showing: hidden, hidden: showing }
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

    const showing = stateRef.current.showing!
    loadInto(showing, CLIPS[index], () => {
      showing.play().catch(() => {})
      gsap.to(showing, { opacity: 1, duration: 1 })
      preloadNext()
    })

    intervalRef.current = window.setInterval(crossfade, 3200)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  function togglePlayback() {
    const { showing, hidden } = stateRef.current
    if (!showing) return
    if (playing) {
      showing.pause()
      hidden?.pause()
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    } else {
      showing.play().catch(() => {})
      intervalRef.current = window.setInterval(() => {}, 3200)
    }
    setPlaying((p) => !p)
  }

  return (
    <section id="top" className="relative h-[100dvh] min-h-[600px] overflow-hidden flex flex-col justify-between">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-[#141412] via-[#0b0b0b] to-black" />
        <video ref={videoARef} muted playsInline className="absolute inset-0 w-full h-full object-cover opacity-0 contrast-[1.05] brightness-[0.85]" />
        <video ref={videoBRef} muted playsInline className="absolute inset-0 w-full h-full object-cover opacity-0 contrast-[1.05] brightness-[0.85]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/40" />
      </div>

      <div className="flex-1 flex flex-col justify-end px-5 md:px-12 pb-6">
        <div ref={headlineRef} className="max-w-4xl">
          <h1 className="font-display font-black text-[clamp(34px,6.4vw,80px)] leading-[1.1] tracking-[-0.04em] text-foreground">
            <span className="text-gradient-accent text-shimmer">Websites &amp; creative</span>
            <br />
            <span className="text-gradient-neutral">that can't be ignored.</span>
          </h1>
        </div>
        <p ref={subRef} className="mt-6 max-w-xl text-dim text-base md:text-lg leading-relaxed">
          I build websites and create AI-powered videos and creative for brands that want to look a lot better online.
        </p>
        <button
          onClick={() => openModal()}
          className="mt-8 inline-block w-fit font-mono text-sm font-bold uppercase tracking-wide bg-[#D1FE17] text-black rounded-[8px] px-6 py-3.5 hover:scale-105 transition-transform"
        >
          Let&apos;s talk →
        </button>
        <div className="mt-5 font-mono text-[11px] uppercase tracking-widest text-dim">
          200+ websites · 6 years experience · design / development / AI
        </div>
      </div>

      <div className="px-5 md:px-12 pb-8 flex items-end justify-between">
        <div ref={scrollRef} className="font-mono text-xs uppercase tracking-widest text-dim flex items-center gap-4">
          Selected Work ↓
          {!reduceMotion && hasVideo && (
            <button
              onClick={togglePlayback}
              aria-label={playing ? "Pause background video" : "Play background video"}
              className="w-7 h-7 rounded-full border border-white/30 flex items-center justify-center hover:border-[#D1FE17] transition-colors flex-none"
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
        <div className="hidden md:block text-right font-mono text-[11px] uppercase tracking-widest text-dim leading-relaxed">
          <div>RAZ AVRAMOV</div>
          <div>CREATIVE DEVELOPER</div>
          <div>ISRAEL / WORLDWIDE</div>
        </div>
      </div>
    </section>
  )
}

const EXPERIMENTS = [
  { title: "Cyberpunk Film", video: "/videos/raz-showreel-4.mp4" },
  { title: "Car Animation", video: "/videos/raz-showreel.mp4" },
  { title: "AI Characters", video: "/videos/raz-showreel-7.mp4" },
  { title: "Interactive Interface", video: "/videos/raz-showreel-5.mp4" },
  { title: "Motion Study", video: "/videos/raz-showreel-2.mp4" },
  { title: "Strange Website", video: "/videos/no-address.mp4" },
]

function EnglishExperiments() {
  return (
    <section className="py-28 md:py-40 section-divider">
      <div className="container">
        <Reveal className="font-mono text-xs uppercase tracking-wide text-dim mb-4">Experiments</Reveal>
        <Reveal>
          <h2 className="font-display font-bold text-[clamp(30px,4.6vw,54px)] leading-[1.15] tracking-[-0.04em] text-gradient-accent text-shimmer">
            Things I make when nobody asks.
          </h2>
        </Reveal>
        <Reveal delay={40}>
          <p className="mt-4 max-w-xl text-dim text-base md:text-lg leading-relaxed">
            Sometimes it's a film. Sometimes a strange website. Sometimes a character, an animation, or an idea I have
            no clue what to do with yet. This is where I try things before they become real work.
          </p>
        </Reveal>

        <div className="mt-14 grid grid-cols-2 md:grid-cols-3 gap-3">
          {EXPERIMENTS.map((e, i) => (
            <Reveal key={e.title} delay={i * 60} className="relative aspect-square rounded-xl overflow-hidden bg-neutral-900 group">
              <AutoVideo src={e.video} className="absolute inset-0 w-full h-full object-cover contrast-[1.05] brightness-[0.85] transition-transform duration-500 group-hover:scale-105" />
              <span className="absolute bottom-3 left-3 font-mono text-[11px] uppercase tracking-wide text-white/70">{e.title}</span>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-12">
          <Link
            to="/experiments"
            className="inline-flex items-center justify-center w-full sm:w-fit font-mono text-sm font-bold uppercase tracking-wide bg-[#D1FE17] text-black rounded-[8px] px-6 py-3 hover:scale-105 transition-transform"
          >
            All experiments →
          </Link>
        </Reveal>
      </div>
    </section>
  )
}

function EnglishAIVideoOffer() {
  const { openModal } = useContactModal()
  return (
    <section className="py-10 md:py-16">
      <div className="container">
        <Reveal className="block relative overflow-hidden rounded-[24px] shadow-[0_0_60px_-12px_rgba(209,254,23,0.45)]">
          <div
            className="relative px-6 py-16 md:py-24 text-center"
            style={{
              background:
                "linear-gradient(to bottom, rgba(209,254,23,0.5), transparent 20%), linear-gradient(to top, rgba(209,254,23,0.5), transparent 20%), linear-gradient(to right, rgba(209,254,23,0.4), transparent 16%), linear-gradient(to left, rgba(209,254,23,0.4), transparent 16%), #060b00",
            }}
          >
            <div
              aria-hidden="true"
              className="absolute inset-0 opacity-[0.22]"
              style={{
                backgroundImage:
                  "url(\"data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI5NjAiIGhlaWdodD0iMzIwIiB2aWV3Qm94PSIwIDAgOTYwIDMyMCI+CiAgPGcgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIxIiB2ZWN0b3ItZWZmZWN0PSJub24tc2NhbGluZy1zdHJva2UiPgogIDxsaW5lIHgxPSIwIiB5MT0iMCIgeDI9IjQ4MC4wIiB5Mj0iMTYwLjAiLz4KICA8bGluZSB4MT0iNjAiIHkxPSIwIiB4Mj0iNDgwLjAiIHkyPSIxNjAuMCIvPgogIDxsaW5lIHgxPSIxMjAiIHkxPSIwIiB4Mj0iNDgwLjAiIHkyPSIxNjAuMCIvPgogIDxsaW5lIHgxPSIxODAiIHkxPSIwIiB4Mj0iNDgwLjAiIHkyPSIxNjAuMCIvPgogIDxsaW5lIHgxPSIyNDAiIHkxPSIwIiB4Mj0iNDgwLjAiIHkyPSIxNjAuMCIvPgogIDxsaW5lIHgxPSIzMDAiIHkxPSIwIiB4Mj0iNDgwLjAiIHkyPSIxNjAuMCIvPgogIDxsaW5lIHgxPSIzNjAiIHkxPSIwIiB4Mj0iNDgwLjAiIHkyPSIxNjAuMCIvPgogIDxsaW5lIHgxPSI0MjAiIHkxPSIwIiB4Mj0iNDgwLjAiIHkyPSIxNjAuMCIvPgogIDxsaW5lIHgxPSI0ODAiIHkxPSIwIiB4Mj0iNDgwLjAiIHkyPSIxNjAuMCIvPgogIDxsaW5lIHgxPSI1NDAiIHkxPSIwIiB4Mj0iNDgwLjAiIHkyPSIxNjAuMCIvPgogIDxsaW5lIHgxPSI2MDAiIHkxPSIwIiB4Mj0iNDgwLjAiIHkyPSIxNjAuMCIvPgogIDxsaW5lIHgxPSI2NjAiIHkxPSIwIiB4Mj0iNDgwLjAiIHkyPSIxNjAuMCIvPgogIDxsaW5lIHgxPSI3MjAiIHkxPSIwIiB4Mj0iNDgwLjAiIHkyPSIxNjAuMCIvPgogIDxsaW5lIHgxPSI3ODAiIHkxPSIwIiB4Mj0iNDgwLjAiIHkyPSIxNjAuMCIvPgogIDxsaW5lIHgxPSI4NDAiIHkxPSIwIiB4Mj0iNDgwLjAiIHkyPSIxNjAuMCIvPgogIDxsaW5lIHgxPSI5MDAiIHkxPSIwIiB4Mj0iNDgwLjAiIHkyPSIxNjAuMCIvPgogIDxsaW5lIHgxPSI5NjAiIHkxPSIwIiB4Mj0iNDgwLjAiIHkyPSIxNjAuMCIvPgogIDxsaW5lIHgxPSIwIiB5MT0iMzIwIiB4Mj0iNDgwLjAiIHkyPSIxNjAuMCIvPgogIDxsaW5lIHgxPSI2MCIgeTE9IjMyMCIgeDI9IjQ4MC4wIiB5Mj0iMTYwLjAiLz4KICA8bGluZSB4MT0iMTIwIiB5MT0iMzIwIiB4Mj0iNDgwLjAiIHkyPSIxNjAuMCIvPgogIDxsaW5lIHgxPSIxODAiIHkxPSIzMjAiIHgyPSI0ODAuMCIgeTI9IjE2MC4wIi8+CiAgPGxpbmUgeDE9IjI0MCIgeTE9IjMyMCIgeDI9IjQ4MC4wIiB5Mj0iMTYwLjAiLz4KICA8bGluZSB4MT0iMzAwIiB5MT0iMzIwIiB4Mj0iNDgwLjAiIHkyPSIxNjAuMCIvPgogIDxsaW5lIHgxPSIzNjAiIHkxPSIzMjAiIHgyPSI0ODAuMCIgeTI9IjE2MC4wIi8+CiAgPGxpbmUgeDE9IjQyMCIgeTE9IjMyMCIgeDI9IjQ4MC4wIiB5Mj0iMTYwLjAiLz4KICA8bGluZSB4MT0iNDgwIiB5MT0iMzIwIiB4Mj0iNDgwLjAiIHkyPSIxNjAuMCIvPgogIDxsaW5lIHgxPSI1NDAiIHkxPSIzMjAiIHgyPSI0ODAuMCIgeTI9IjE2MC4wIi8+CiAgPGxpbmUgeDE9IjYwMCIgeTE9IjMyMCIgeDI9IjQ4MC4wIiB5Mj0iMTYwLjAiLz4KICA8bGluZSB4MT0iNjYwIiB5MT0iMzIwIiB4Mj0iNDgwLjAiIHkyPSIxNjAuMCIvPgogIDxsaW5lIHgxPSI3MjAiIHkxPSIzMjAiIHgyPSI0ODAuMCIgeTI9IjE2MC4wIi8+CiAgPGxpbmUgeDE9Ijc4MCIgeTE9IjMyMCIgeDI9IjQ4MC4wIiB5Mj0iMTYwLjAiLz4KICA8bGluZSB4MT0iODQwIiB5MT0iMzIwIiB4Mj0iNDgwLjAiIHkyPSIxNjAuMCIvPgogIDxsaW5lIHgxPSI5MDAiIHkxPSIzMjAiIHgyPSI0ODAuMCIgeTI9IjE2MC4wIi8+CiAgPGxpbmUgeDE9Ijk2MCIgeTE9IjMyMCIgeDI9IjQ4MC4wIiB5Mj0iMTYwLjAiLz4KICA8bGluZSB4MT0iMCIgeTE9IjAiIHgyPSI0ODAuMCIgeTI9IjE2MC4wIi8+CiAgPGxpbmUgeDE9IjAiIHkxPSI0MCIgeDI9IjQ4MC4wIiB5Mj0iMTYwLjAiLz4KICA8bGluZSB4MT0iMCIgeTE9IjgwIiB4Mj0iNDgwLjAiIHkyPSIxNjAuMCIvPgogIDxsaW5lIHgxPSIwIiB5MT0iMTIwIiB4Mj0iNDgwLjAiIHkyPSIxNjAuMCIvPgogIDxsaW5lIHgxPSIwIiB5MT0iMTYwIiB4Mj0iNDgwLjAiIHkyPSIxNjAuMCIvPgogIDxsaW5lIHgxPSIwIiB5MT0iMjAwIiB4Mj0iNDgwLjAiIHkyPSIxNjAuMCIvPgogIDxsaW5lIHgxPSIwIiB5MT0iMjQwIiB4Mj0iNDgwLjAiIHkyPSIxNjAuMCIvPgogIDxsaW5lIHgxPSIwIiB5MT0iMjgwIiB4Mj0iNDgwLjAiIHkyPSIxNjAuMCIvPgogIDxsaW5lIHgxPSIwIiB5MT0iMzIwIiB4Mj0iNDgwLjAiIHkyPSIxNjAuMCIvPgogIDxsaW5lIHgxPSI5NjAiIHkxPSIwIiB4Mj0iNDgwLjAiIHkyPSIxNjAuMCIvPgogIDxsaW5lIHgxPSI5NjAiIHkxPSI0MCIgeDI9IjQ4MC4wIiB5Mj0iMTYwLjAiLz4KICA8bGluZSB4MT0iOTYwIiB5MT0iODAiIHgyPSI0ODAuMCIgeTI9IjE2MC4wIi8+CiAgPGxpbmUgeDE9Ijk2MCIgeTE9IjEyMCIgeDI9IjQ4MC4wIiB5Mj0iMTYwLjAiLz4KICA8bGluZSB4MT0iOTYwIiB5MT0iMTYwIiB4Mj0iNDgwLjAiIHkyPSIxNjAuMCIvPgogIDxsaW5lIHgxPSI5NjAiIHkxPSIyMDAiIHgyPSI0ODAuMCIgeTI9IjE2MC4wIi8+CiAgPGxpbmUgeDE9Ijk2MCIgeTE9IjI0MCIgeDI9IjQ4MC4wIiB5Mj0iMTYwLjAiLz4KICA8bGluZSB4MT0iOTYwIiB5MT0iMjgwIiB4Mj0iNDgwLjAiIHkyPSIxNjAuMCIvPgogIDxsaW5lIHgxPSI5NjAiIHkxPSIzMjAiIHgyPSI0ODAuMCIgeTI9IjE2MC4wIi8+CiAgPHBvbHlnb24gcG9pbnRzPSIzOC40LDEyLjggOTIxLjYsMTIuOCA5MjEuNiwzMDcuMiAzOC40LDMwNy4yIiBmaWxsPSJub25lIi8+CiAgPHBvbHlnb24gcG9pbnRzPSI4Ni40LDI4LjggODczLjYsMjguOCA4NzMuNiwyOTEuMiA4Ni40LDI5MS4yIiBmaWxsPSJub25lIi8+CiAgPHBvbHlnb24gcG9pbnRzPSIxNDQuMCw0OC4wIDgxNi4wLDQ4LjAgODE2LjAsMjcyLjAgMTQ0LjAsMjcyLjAiIGZpbGw9Im5vbmUiLz4KICA8cG9seWdvbiBwb2ludHM9IjIxMS4yLDcwLjQgNzQ4LjgsNzAuNCA3NDguOCwyNDkuNiAyMTEuMiwyNDkuNiIgZmlsbD0ibm9uZSIvPgogIDxwb2x5Z29uIHBvaW50cz0iMjg4LjAsOTYuMCA2NzIuMCw5Ni4wIDY3Mi4wLDIyNC4wIDI4OC4wLDIyNC4wIiBmaWxsPSJub25lIi8+CiAgPHBvbHlnb24gcG9pbnRzPSIzNzQuNCwxMjQuOCA1ODUuNiwxMjQuOCA1ODUuNiwxOTUuMiAzNzQuNCwxOTUuMiIgZmlsbD0ibm9uZSIvPgogIDwvZz4KPC9zdmc+Cg==\")",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }}
            />
            <div className="relative max-w-xl mx-auto">
              <span className="inline-block font-mono text-[10px] font-bold uppercase tracking-wide bg-white text-black rounded-md px-2.5 py-1 mb-4">
                Offer
              </span>
              <h2 className="font-display font-black text-[clamp(32px,5vw,50px)] leading-[1.15] tracking-[-0.04em] text-gradient-accent text-shimmer">
                A free AI video. <br className="sm:hidden" /> Simply because I can.
              </h2>
              <p className="mt-5 text-[#c5d9a2] text-base md:text-lg leading-relaxed">
                Anyone who books a service with me right now gets a free AI video for their business — up to 15 seconds, no extra charge.
              </p>
              <button
                onClick={() => openModal()}
                className="relative inline-flex items-center justify-center mt-8 rounded-[12px] bg-white px-6 pb-[13px] pt-[11px] text-base font-semibold tracking-[0.1px] text-[#1a1a1a] shadow-[0_9px_22px_0_rgba(0,0,0,0.15),inset_0_-3px_0_0_#c7c7c7] hover:scale-105 transition-transform"
              >
                Let&apos;s do it →
              </button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

const PILLARS = [
  {
    slug: "web-design",
    title: "Web Design",
    video: "/videos/raz-showreel-7.mp4",
    description: "I design and build websites for businesses and brands, from WordPress and e-commerce to interactive, AI-built websites.",
    items: ["Web Design", "Creative Development", "Interactive Websites", "E-commerce", "Landing Pages", "WordPress Development"],
    cta: "I need a website →",
  },
  {
    slug: "ai-content",
    title: "AI Content",
    video: "/videos/raz-showreel-2.mp4",
    description: "Product videos, commercials, visuals and content for social — using AI as the tool, while the idea, concept, direction and edit make the difference.",
    items: ["AI Commercials", "Product Films", "Campaign Visuals", "Social Content", "AI Photography", "Creative Direction"],
    cta: "See projects →",
  },
]

function EnglishWhatIDo() {
  const [activeHub, setActiveHub] = useState<string>("ai-content")
  const pillar = PILLARS.find((p) => p.slug === activeHub) ?? PILLARS[0]

  return (
    <section id="services" className="py-28 md:py-40 section-divider">
      <div className="container">
        <Reveal className="font-mono text-xs uppercase tracking-wide text-dim mb-4">What I Do</Reveal>
        <Reveal delay={60}>
          <h2 className="font-display font-bold text-[clamp(30px,4.6vw,54px)] leading-[1.15] tracking-[-0.04em] text-gradient-accent text-shimmer">
            Mainly two things.
          </h2>
        </Reveal>

        <Reveal delay={100} className="flex flex-wrap gap-3 mt-10">
          {PILLARS.map((p) => (
            <button
              key={p.slug}
              onClick={() => setActiveHub(p.slug)}
              className={cn(
                "font-mono text-sm md:text-base font-medium uppercase tracking-wide px-6 py-4 md:px-8 md:py-5 rounded-full border-2 transition-colors",
                activeHub === p.slug
                  ? "bg-[#D1FE17] border-[#D1FE17] text-black"
                  : "border-white/20 text-dim hover:border-[#D1FE17] hover:text-foreground"
              )}
            >
              {p.title}
            </button>
          ))}
        </Reveal>

        <div key={activeHub} className="grid md:grid-cols-2 gap-16 mt-12 animate-[fadeIn_0.4s_ease]">
          <Reveal>
            <div className="relative aspect-video rounded-sm overflow-hidden bg-neutral-900">
              <AutoVideo src={pillar.video} className="absolute inset-0 w-full h-full object-cover contrast-[1.05] brightness-[0.9]" />
            </div>
          </Reveal>
          <Reveal delay={60}>
            <p className="text-dim text-base md:text-lg leading-relaxed mb-8">{pillar.description}</p>
            <div className="grid grid-cols-2 gap-3">
              {pillar.items.map((item) => (
                <div key={item} className="flex items-center gap-2 rounded-xl surface-raised border border-[#D1FE17]/25 px-4 py-3 text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-current flex-none" />
                  {item}
                </div>
              ))}
            </div>
            <Link
              to="/en/services"
              className="inline-flex items-center justify-center w-full sm:w-fit mt-8 font-mono text-sm font-bold uppercase tracking-wide bg-[#D1FE17] text-black rounded-[8px] px-6 py-3 hover:scale-105 transition-transform"
            >
              {pillar.cta}
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

const AI_TEASER_TALENT_LIMIT = 3
const AI_TEASER_PRODUCT_LIMIT = 4

function EnglishAIExperienceTeaser() {
  const { talents, products, findCombination, loading } = useAIExperience()
  const [talentId, setTalentId] = useState<string | null>(null)
  const [productId, setProductId] = useState<string | null>(null)
  const talentRailRef = useRef<HTMLDivElement>(null)
  const productRailRef = useRef<HTMLDivElement>(null)
  const reduceMotion = useReducedMotion()

  const previewTalents = talents.slice(0, AI_TEASER_TALENT_LIMIT)
  const previewProducts = products.slice(0, AI_TEASER_PRODUCT_LIMIT)
  const combination = findCombination(talentId, productId)

  useEffect(() => {
    if (reduceMotion || loading || previewTalents.length === 0) return
    const cards = [
      ...(talentRailRef.current?.children ?? []),
      ...(productRailRef.current?.children ?? []),
    ]
    if (cards.length === 0) return
    gsap.fromTo(
      cards,
      { opacity: 0, y: 14 },
      { opacity: 1, y: 0, duration: 0.6, ease: "expo.out", stagger: 0.06 }
    )
  }, [loading, previewTalents.length, reduceMotion])

  if (!loading && previewTalents.length === 0) return null

  return (
    <section className="py-28 md:py-40 section-divider">
      <div className="container">
        <Reveal className="font-mono text-xs uppercase tracking-wide text-dim mb-4">( AI Creative Experience )</Reveal>
        <Reveal>
          <h2 className="font-display font-bold text-[clamp(30px,4.6vw,54px)] leading-[1.15] tracking-[-0.04em] text-gradient-accent text-shimmer">
            Two inputs. One campaign.
          </h2>
        </Reveal>
        <Reveal delay={40}>
          <p className="mt-4 max-w-xl text-dim text-base md:text-lg leading-relaxed">
            Pick a face. Pick a product. See what AI creative can do.
          </p>
        </Reveal>

        <Reveal delay={80} className="mt-10 grid md:grid-cols-2 gap-8 items-start">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-wide text-dim mb-3">Choose a talent</div>
            <div ref={talentRailRef} className="grid grid-cols-3 gap-3">
              {previewTalents.map((t) => (
                <button
                  key={t.id}
                  onClick={() => { setTalentId(t.id); trackEvent("talent_selected", { talent: t.slug, location: "homepage_teaser_en" }) }}
                  className={cn(
                    "aspect-[3/4] rounded-xl overflow-hidden border transition-colors",
                    talentId === t.id ? "border-[#D1FE17]" : "border-white/10 hover:border-[#D1FE17]/60"
                  )}
                >
                  {t.portrait_image && <img src={t.portrait_image} alt={t.full_name} className="w-full h-full object-cover" />}
                </button>
              ))}
            </div>
            <div className="font-mono text-[11px] uppercase tracking-wide text-dim mt-6 mb-3">Choose a product</div>
            <div ref={productRailRef} className="grid grid-cols-4 gap-3">
              {previewProducts.map((p) => (
                <button
                  key={p.id}
                  onClick={() => { setProductId(p.id); trackEvent("product_selected", { product: p.slug, location: "homepage_teaser_en" }) }}
                  className={cn(
                    "aspect-[3/4] rounded-xl overflow-hidden border transition-colors",
                    productId === p.id ? "border-[#D1FE17]" : "border-white/10 hover:border-[#D1FE17]/60"
                  )}
                >
                  {p.packshot_image && <img src={p.packshot_image} alt={p.product_name} className="w-full h-full object-cover" />}
                </button>
              ))}
            </div>
          </div>

          <PhoneVideoFrame
            video={combination?.video_url}
            poster={combination?.poster_image}
            title={combination?.title}
            fallback={
              <p className="text-dim text-sm">
                {talentId && productId ? "Ready for a custom campaign." : "Pick a talent and a product for a preview"}
              </p>
            }
          />
        </Reveal>

        <Reveal delay={100} className="mt-10">
          <a
            href="/services/ai-content#ai-experience"
            onClick={() => trackEvent("ai_campaign_cta_clicked", { location: "homepage_teaser_en" })}
            className="inline-flex items-center justify-center w-full sm:w-fit font-mono text-sm font-bold uppercase tracking-wide bg-[#D1FE17] text-black rounded-[8px] px-6 py-3 hover:scale-105 transition-transform"
          >
            Try the AI Experience →
          </a>
        </Reveal>
      </div>
    </section>
  )
}

function EnglishPositioning() {
  return (
    <section className="py-28 md:py-40 section-divider">
      <div className="container grid md:grid-cols-[1.2fr_1fr] gap-14 items-center">
        <div>
          <Reveal>
            <h2 className="font-display font-bold text-[clamp(30px,4.6vw,54px)] leading-[1.2] tracking-[-0.04em] max-w-3xl text-gradient-accent text-shimmer">
              Why both?
              <br />
              Because a good website and good creative need to speak the same language today.
            </h2>
          </Reveal>
          <Reveal delay={120}>
            <p className="mt-8 max-w-xl text-dim text-base md:text-lg leading-relaxed">
              You can produce a great film and send people to a website that looks like it belongs to a different
              business. And you can build an amazing website nobody visits. I work on both sides — how the brand
              catches the eye, and what people find after it does.
            </p>
          </Reveal>
        </div>
        <Reveal delay={180} className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-neutral-900">
          <AutoVideo src="/videos/raz-showreel-5.mp4" className="absolute inset-0 w-full h-full object-cover contrast-[1.05] brightness-[0.9]" />
        </Reveal>
      </div>
    </section>
  )
}

function EnglishTrustProof() {
  return (
    <section className="py-24 md:py-32 section-divider">
      <div className="container">
        <Reveal>
          <h2 className="font-display font-bold text-[clamp(28px,4vw,46px)] leading-[1.15] tracking-[-0.04em] text-gradient-accent text-shimmer">
            Real work.
            <br />
            Real experience.
          </h2>
        </Reveal>
        <Reveal delay={60} className="mt-6 max-w-2xl space-y-3">
          <p className="text-dim text-base md:text-lg leading-relaxed">200+ websites isn't a number I made up for the headline.</p>
          <p className="text-dim text-base md:text-lg leading-relaxed">I've been building websites for six years, and built more than 200 of them for businesses and companies along the way.</p>
          <p className="text-dim text-base md:text-lg leading-relaxed">Some simple. Some complex. Some ridiculously good-looking.</p>
          <p className="text-dim text-base md:text-lg leading-relaxed">But in the end, all of them had to actually work.</p>
        </Reveal>
        <Reveal delay={120} className="mt-10">
          <Link
            to="/en/work"
            className="inline-flex items-center justify-center w-full sm:w-fit font-mono text-sm font-bold uppercase tracking-wide bg-[#D1FE17] text-black rounded-[8px] px-6 py-3 hover:scale-105 transition-transform"
          >
            Selected work →
          </Link>
        </Reveal>
      </div>
    </section>
  )
}

function EnglishSelectedWork() {
  const { projects, loading } = useProjects()
  const [filter, setFilter] = useState<string>("הכל")

  const activeCategories = useMemo(() => {
    const used = new Set<string>()
    projects.forEach((p) => p.categories?.forEach((c) => used.add(c)))
    return PROJECT_CATEGORIES.filter((c) => used.has(c))
  }, [projects])

  const filtered = filter === "הכל" ? projects : projects.filter((p) => p.categories?.includes(filter))

  return (
    <section id="work" className="py-28 md:py-40 section-divider">
      <div className="container">
        <Reveal className="mb-4">
          <div className="font-mono text-xs uppercase tracking-wide text-dim">Selected Work</div>
        </Reveal>
        <Reveal>
          <h2 className="font-display font-bold text-[clamp(30px,4.6vw,54px)] leading-[1.15] tracking-[-0.04em] text-gradient-accent text-shimmer">
            See what I can do first.
          </h2>
        </Reveal>
        <Reveal delay={40}>
          <p className="mt-4 max-w-xl text-dim text-base md:text-lg leading-relaxed">
            Websites, films, campaigns, and a few ideas that went a little too far.
          </p>
        </Reveal>

        <Reveal delay={80} className="hidden sm:flex flex-wrap gap-2 mt-8">
          <button
            onClick={() => setFilter("הכל")}
            className={cn(
              "font-mono text-[10px] font-bold uppercase tracking-wide rounded-full px-4 py-2 border transition-colors",
              filter === "הכל" ? "border-[#D1FE17] bg-[#D1FE17] text-black" : "border-white/15 text-dim hover:border-[#D1FE17]"
            )}
          >
            All
          </button>
          {activeCategories.map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={cn(
                "font-mono text-[10px] font-bold uppercase tracking-wide rounded-full px-4 py-2 border transition-colors",
                filter === c ? "border-[#D1FE17] bg-[#D1FE17] text-black" : "border-white/15 text-dim hover:border-[#D1FE17]"
              )}
            >
              {translateCategory(c)}
            </button>
          ))}
        </Reveal>

        {loading && <div className="mt-16 font-mono text-xs text-dim uppercase">Loading…</div>}

        <div key={filter} className="mt-16 flex overflow-x-auto snap-x snap-mandatory gap-4 pb-2 -mx-4 px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:px-0 sm:pb-0 sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible animate-[fadeIn_0.3s_ease]">
          {filtered.map((p, i) => (
            <Reveal
              key={p.slug}
              delay={i * 80}
              className={cn(
                "flex-none w-[78vw] max-w-[320px] snap-center sm:w-auto sm:max-w-none",
                p.thumb_class === "wide" && "sm:col-span-2"
              )}
            >
              {p.project_type === "website" ? (
                <BrowserProjectCard project={p} href={`/en/work/${p.slug}`} />
              ) : (
                <Link
                  to={`/en/work/${p.slug}`}
                  className={cn(
                    "group block relative overflow-hidden rounded-2xl surface-raised border border-[#D1FE17]/70 hover:border-[#D1FE17] transition-colors duration-200",
                    p.thumb_class === "wide" ? "aspect-[21/9]" : p.thumb_class === "tall" ? "aspect-[3/4]" : "aspect-[4/3]"
                  )}
                >
                  {p.video && (
                    <AutoVideo
                      src={p.video}
                      className="absolute inset-0 w-full h-full object-cover contrast-[1.05] brightness-[0.85] transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />

                  <div className="absolute top-4 inset-x-4 flex items-start justify-between gap-4">
                    <span className="font-mono text-[11px] uppercase tracking-wide text-white/70">
                      {p.number} {p.concept && "· Concept"}
                    </span>
                    <span className="font-mono text-[11px] uppercase tracking-wide text-white/70 opacity-0 group-hover:opacity-100 transition-opacity">
                      View →
                    </span>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="font-display text-xl md:text-2xl font-bold text-white">{p.title}</div>
                    <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 font-mono text-[11px] text-white/60 uppercase">
                      <span>{getProjectTranslation(p.slug)?.category ?? translateCategory(p.category)}</span>
                      {translateLabels(p.disciplines).map((d) => (
                        <span key={d}>{d}</span>
                      ))}
                      <span>{p.year}</span>
                    </div>
                  </div>
                </Link>
              )}
            </Reveal>
          ))}
        </div>

        {!loading && filtered.length === 0 && (
          <p className="mt-16 text-dim text-sm">No work in this category yet.</p>
        )}

        <Reveal className="mt-12">
          <Link
            to="/en/work"
            className="inline-flex items-center justify-center w-full sm:w-fit font-mono text-sm font-bold uppercase tracking-wide bg-[#D1FE17] text-black rounded-[8px] px-6 py-3 hover:scale-105 transition-transform"
          >
            View all work →
          </Link>
        </Reveal>
      </div>
    </section>
  )
}

function EnglishFeaturedCaseStudy() {
  return (
    <section className="py-28 md:py-40 section-divider">
      <div className="container">
        <Reveal className="font-mono text-xs uppercase tracking-wide text-dim mb-6">
          Featured Case Study · Independent Concept Project
        </Reveal>
        <Reveal>
          <h2 className="font-display font-bold text-[clamp(32px,5vw,60px)] leading-[1.1] tracking-[-0.04em] max-w-3xl text-gradient-accent text-shimmer">
            I wanted to see how far one idea could go.
          </h2>
        </Reveal>
        <Reveal delay={80} className="mt-6 max-w-2xl space-y-3">
          <p className="text-dim text-base md:text-lg leading-relaxed">
            So I built a car brand that doesn't exist. The vehicle, the characters, the world, the film and the
            website were all built as part of the same concept, until it started to feel a little too real.
          </p>
          <p className="text-dim text-base md:text-lg leading-relaxed">
            It's an independent project, no client and no brief. Just a way to show what's possible when you
            connect creative, AI and development instead of treating them as three separate things.
          </p>
        </Reveal>

        <Reveal delay={150} className="mt-14 relative aspect-video rounded-2xl overflow-hidden bg-neutral-900">
          <AutoVideo src="/videos/raz-showreel.mp4" className="absolute inset-0 w-full h-full object-cover contrast-[1.05] brightness-[0.85]" />
          <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/70 to-transparent" />
          <div className="absolute bottom-6 left-6 font-display font-bold text-3xl md:text-5xl text-white">Automotive 2077</div>
        </Reveal>

        <div className="grid md:grid-cols-2 gap-x-16 gap-y-10 mt-16">
          <Reveal>
            <div className="font-display font-bold text-xl mb-2">Overview</div>
            <p className="text-lg">I wanted to see how far one idea could go, so I built a car brand that doesn't exist.</p>
          </Reveal>
          <Reveal delay={100}>
            <div className="font-display font-bold text-xl mb-2">The Challenge</div>
            <p className="text-lg">Making a vehicle, a world and a story feel consistent and real across a film, a website and a full visual identity.</p>
          </Reveal>
          <Reveal delay={200}>
            <div className="font-display font-bold text-xl mb-2">Concept</div>
            <p className="text-lg">A fictional automotive brand from 2077 — vehicle design, characters and a world built as one connected concept.</p>
          </Reveal>
          <Reveal delay={300}>
            <div className="font-display font-bold text-xl mb-2">Digital Experience</div>
            <p className="text-lg">A website built to match the film's tone exactly, so the brand feels the same wherever you meet it.</p>
          </Reveal>
        </div>

        <Reveal className="mt-14">
          <div className="font-display font-bold text-xl mb-4">Tools / Capabilities</div>
          <div className="flex flex-wrap gap-3">
            {["React", "AI Video", "AI Photography", "Creative Direction"].map((t) => (
              <span key={t} className="surface-raised rounded-full px-4 py-2 text-sm">{t}</span>
            ))}
          </div>
          <Link
            to="/en/work"
            className="inline-flex items-center justify-center w-full sm:w-fit mt-10 font-mono text-sm font-bold uppercase tracking-wide bg-[#D1FE17] text-black rounded-[8px] px-6 py-3 hover:scale-105 transition-transform"
          >
            See the project →
          </Link>
        </Reveal>
      </div>
    </section>
  )
}

const STEPS = [
  { title: "We talk", text: "You tell me what you need, what the goal is, and what already exists." },
  { title: "I come back with direction", text: "What's worth doing, how I'd approach it, and what it takes to make it happen." },
  { title: "We build", text: "Design, development, creative — or all of it together, depending on the project." },
  { title: "We launch", text: "Going over everything, fixing what needs fixing, and going live." },
]

function EnglishProcess() {
  return (
    <section className="py-28 md:py-40 section-divider">
      <div className="container">
        <Reveal>
          <h2 className="font-display font-bold text-[clamp(30px,4.6vw,54px)] leading-[1.15] tracking-[-0.04em] text-gradient-accent text-shimmer">
            How it works
          </h2>
        </Reveal>
        <Reveal delay={40}>
          <p className="mt-4 text-dim text-base md:text-lg">Without overcomplicating it.</p>
        </Reveal>
        <div className="relative mt-16">
          <div
            aria-hidden="true"
            className="hidden md:block absolute top-8 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D1FE17]/40 to-transparent"
          />
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8 relative">
            {STEPS.map((s, i) => (
              <Reveal key={s.title} delay={i * 90} className="group cursor-default">
                <div className="relative z-10 inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-xl bg-[#D1FE17] text-black font-display font-black text-2xl md:text-3xl mb-5 transition-transform duration-300 ease-out group-hover:scale-110 group-hover:-rotate-3">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div className="font-display font-bold text-xl mb-2 transition-colors duration-200 group-hover:text-[#D1FE17]">{s.title}</div>
                <p className="text-dim text-sm leading-relaxed">{s.text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

const CAPABILITIES = ["Design", "Development", "WordPress", "React / Next.js", "Creative Coding", "AI Visual Production", "Automation"]
const TOOLS = ["Claude", "ChatGPT", "Figma", "WordPress", "React", "Next.js", "GSAP", "Higgsfield", "Kling", "Veo", "Elementor", "Lovable"]

function EnglishAbout() {
  return (
    <section id="about" className="py-28 md:py-40 section-divider">
      <div className="container">
        <Reveal className="mb-6">
          <div className="font-mono text-xs uppercase tracking-wide text-dim">About</div>
        </Reveal>
        <div className="grid md:grid-cols-[1fr_1.2fr] gap-14 items-start">
          <Reveal>
            <div className="relative aspect-[4/5] rounded-sm overflow-hidden bg-neutral-900">
              <img src="/images/raz-portrait.jpeg" alt="Raz Avramov" className="absolute inset-0 w-full h-full object-cover grayscale" />
            </div>
          </Reveal>
          <div>
            <Reveal>
              <h2 className="font-display font-bold text-[clamp(30px,4.6vw,54px)] leading-[1.15] tracking-[-0.04em] mb-6">
                <span className="text-foreground">I&apos;m </span>
                <span className="text-gradient-accent text-shimmer">Raz.</span>
              </h2>
            </Reveal>
            <Reveal delay={100}>
              <p className="text-dim text-base md:text-lg leading-relaxed mb-4">
                I&apos;ve been building websites for six years and built more than 200 of them. In recent years I've
                also gone deep into AI — but I'm less interested in being an "AI person" and more in what you can do
                with it once you already know how to design, develop and think creatively.
              </p>
              <p className="text-dim text-base md:text-lg leading-relaxed mb-10">
                So today I mainly do two things: build websites and create AI content. And sometimes I connect them.
              </p>
            </Reveal>
            <Reveal delay={140} className="mb-10">
              <Link
                to="/en/about"
                className="inline-flex items-center justify-center w-full sm:w-fit font-mono text-sm font-bold uppercase tracking-wide bg-[#D1FE17] text-black rounded-[8px] px-6 py-3 hover:scale-105 transition-transform"
              >
                More about me →
              </Link>
            </Reveal>
            <Reveal delay={180}>
              <div className="font-mono text-xs uppercase tracking-wide text-dim mb-4">Capabilities</div>
              <div className="flex flex-wrap gap-2 mb-10">
                {CAPABILITIES.map((c) => (
                  <span key={c} className="surface-raised rounded-full px-4 py-1.5 text-sm">{c}</span>
                ))}
              </div>
            </Reveal>
            <Reveal delay={240}>
              <div className="flex flex-wrap gap-x-5 gap-y-3 font-mono text-[11px] uppercase tracking-wide text-dim">
                {TOOLS.map((t) => <span key={t}>{t}</span>)}
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}

const MODERNIZATION_ITEMS = ["Website Redesign", "WordPress", "Performance", "Platform Migration", "Ongoing Care"]

function EnglishModernization() {
  const { openModal } = useContactModal()
  return (
    <section className="relative py-28 md:py-40 section-divider overflow-hidden">
      <AutoVideo src="/videos/raz-showreel-4.mp4" className="absolute inset-0 w-full h-full object-cover opacity-20 contrast-[1.05] brightness-[0.7]" />
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-transparent" />
      <div className="container relative">
        <Reveal>
          <h2 className="font-display font-bold text-[clamp(28px,4.2vw,46px)] leading-[1.25] tracking-[-0.04em] max-w-2xl text-gradient-accent text-shimmer">
            Already have a website?
            <br />
            You don&apos;t have to throw it all out and start over.
          </h2>
        </Reveal>
        <Reveal delay={100}>
          <p className="mt-6 max-w-xl text-dim text-base md:text-lg leading-relaxed">
            If your website is outdated, slow, messy, or just doesn&apos;t look like the business you have today, we
            can work with what&apos;s there. I do redesigns, upgrades, performance improvements, platform migrations,
            and full rebuilds when you really need one.
          </p>
        </Reveal>
        <Reveal delay={180} className="flex flex-wrap gap-3 mt-8">
          {MODERNIZATION_ITEMS.map((i) => (
            <span key={i} className="surface-raised rounded-full px-4 py-1.5 text-sm">{i}</span>
          ))}
        </Reveal>
        <Reveal delay={240}>
          <button
            onClick={() => openModal()}
            className="inline-flex items-center justify-center w-full sm:w-fit mt-10 font-mono text-sm font-bold uppercase tracking-wide bg-[#D1FE17] text-black rounded-[8px] px-5 py-3 hover:scale-105 transition-transform"
          >
            Send me your website →
          </button>
        </Reveal>
      </div>
    </section>
  )
}

const EN_FAQ_GROUPS = [
  {
    title: "Websites & Development",
    items: [
      {
        q: "How long does it take to build a website?",
        a: "Depends on scope — a landing page can be ready within a few days, a full multi-page site usually takes a few weeks. I give a clear timeline for every project after a brief call.",
      },
      {
        q: "WordPress or custom development — which is better?",
        a: "There's no single answer. WordPress fits when you need independent content-management flexibility. Custom development (React / Next.js) fits when you need performance, interactive experiences, or something that doesn't exist as a template.",
      },
      {
        q: "Do you use AI to build websites?",
        a: "Yes, as part of the workflow — not as a replacement for it. AI accelerates development and code, but design decisions and final quality are always under human control.",
      },
    ],
  },
  {
    title: "Visuals & AI Content",
    items: [
      {
        q: "How does an AI video actually replace a shoot day?",
        a: "Instead of coordinating a location, crew and equipment for a full day, the work happens with dedicated AI tools — building a concept, creating consistent assets, and producing the scenes around them.",
      },
      {
        q: "Doesn't it look artificial?",
        a: "It depends entirely on the work invested. A proper process (consistency, lighting, film grain, editing) is the difference between an AI experiment and real production. That's exactly the job.",
      },
      {
        q: "Can this be used for a real business ad?",
        a: "Yes — ads, product films, social content and full campaigns. I'm always clear about which projects are commissioned work and which are self-initiated concept pieces.",
      },
    ],
  },
]

function EnglishFaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-white/10 py-6">
      <button onClick={() => setOpen((v) => !v)} aria-expanded={open} className="w-full flex items-center justify-between text-left gap-6 group">
        <span className="font-display text-lg md:text-xl font-medium group-hover:text-[#D1FE17] transition-colors">{q}</span>
        <span className={cn("font-mono text-xl transition-transform flex-none", open && "rotate-45")}>+</span>
      </button>
      <div className={cn("grid transition-all duration-300", open ? "grid-rows-[1fr] mt-4" : "grid-rows-[0fr]")}>
        <div className="overflow-hidden">
          <p className="text-dim text-base leading-relaxed max-w-2xl">{a}</p>
        </div>
      </div>
    </div>
  )
}

function EnglishHomeFaq() {
  return (
    <section className="py-28 md:py-40 section-divider">
      <div className="container">
        <Reveal className="mb-4">
          <div className="font-mono text-xs uppercase tracking-wide text-dim">FAQ</div>
        </Reveal>
        <Reveal>
          <h2 className="font-display font-bold text-[clamp(30px,4.6vw,54px)] leading-[1.15] tracking-[-0.04em] text-gradient-accent text-shimmer">
            Questions people ask
            <br />
            before they write to me.
          </h2>
        </Reveal>

        <div className="mt-16 flex flex-col gap-16 max-w-3xl">
          {EN_FAQ_GROUPS.map((group) => (
            <div key={group.title}>
              <div className="font-mono text-xs uppercase tracking-wide text-dim mb-2">{group.title}</div>
              <div>
                {group.items.map((item) => (
                  <EnglishFaqItem key={item.q} q={item.q} a={item.a} />
                ))}
              </div>
            </div>
          ))}
        </div>

        <Reveal className="mt-10">
          <Link
            to="/en/faq"
            className="inline-flex items-center justify-center w-full sm:w-fit font-mono text-sm font-bold uppercase tracking-wide bg-[#D1FE17] text-black rounded-[8px] px-6 py-3 hover:scale-105 transition-transform"
          >
            All questions & answers →
          </Link>
        </Reveal>
      </div>
    </section>
  )
}

function EnglishFinalCTA() {
  return (
    <section id="contact" className="relative overflow-hidden min-h-[90dvh] flex flex-col justify-center py-28 section-divider">
      <div className="absolute inset-0" aria-hidden="true">
        <AutoVideo src="/videos/raz-showreel.mp4" className="w-full h-full object-cover contrast-[1.05] brightness-[0.6]" />
        <div className="absolute inset-0 bg-black/70" />
      </div>
      <div className="relative container text-center">
        <Reveal>
          <h2 className="font-display font-bold text-[clamp(34px,6.6vw,80px)] leading-[1.15] tracking-[-0.04em] text-gradient-accent text-shimmer">
            Have something in mind?
            <br />
            Send it my way.
          </h2>
        </Reveal>
        <Reveal delay={90}>
          <p className="mt-6 max-w-lg mx-auto text-dim text-base md:text-lg leading-relaxed">
            No need to prepare a 20-page brief. Tell me briefly what you want to do, what you already have, and
            whether there's a deadline. From there we'll figure out if and how we move forward.
          </p>
        </Reveal>
        <Reveal delay={150}>
          <Link
            to="/en/contact"
            className="inline-flex items-center justify-center w-full sm:w-fit mt-10 font-mono text-sm font-bold uppercase tracking-wide bg-[#D1FE17] text-black rounded-[8px] px-7 py-4 hover:scale-105 transition-transform"
          >
            Send me a message →
          </Link>
        </Reveal>
        <Reveal delay={220} className="mt-10 flex items-center justify-center gap-6 font-mono text-xs uppercase tracking-wide text-dim">
          <a href="mailto:hello@madebyraz.co.il" className="hover:text-[#D1FE17] transition-colors">Email</a>
          <a href="https://wa.me/972506944443" target="_blank" rel="noreferrer" className="hover:text-[#D1FE17] transition-colors">WhatsApp</a>
        </Reveal>
        <Reveal delay={280} className="mt-4 font-mono text-[11px] text-dim uppercase tracking-wide">
          Based in Israel. Working worldwide.
        </Reveal>
        <Reveal delay={320} className="mt-8">
          <Link to="/" className="font-mono text-[11px] uppercase tracking-wide underline underline-offset-4 text-dim hover:text-[#D1FE17] transition-colors">
            עברית ←
          </Link>
        </Reveal>
      </div>
    </section>
  )
}

export function English() {
  useDocumentMeta(
    "RAZ — Websites, Films & Visuals",
    "RAZ is a creative developer building digital experiences, websites and AI-powered visuals for brands that want to stand out."
  )
  useHreflang("/", "/en")

  useEffect(() => {
    document.documentElement.lang = "en"
    document.documentElement.dir = "ltr"
    return () => {
      document.documentElement.lang = "he"
      document.documentElement.dir = "rtl"
    }
  }, [])

  return (
    <div dir="ltr" className="text-left">
      <EnglishHero />
      <EnglishExperiments />
      <EnglishAIVideoOffer />
      <EnglishWhatIDo />
      <EnglishAIExperienceTeaser />
      <EnglishPositioning />
      <EnglishTrustProof />
      <EnglishSelectedWork />
      <EnglishFeaturedCaseStudy />
      <EnglishProcess />
      <EnglishAbout />
      <EnglishModernization />
      <EnglishHomeFaq />
      <EnglishFinalCTA />
    </div>
  )
}
