import { useEffect, useRef, useState } from "react"
import gsap from "gsap"
import { useAIExperience } from "@/hooks/useAIExperience"
import { useReducedMotion } from "@/hooks/useReducedMotion"
import { useContactModal } from "@/hooks/useContactModal"
import { trackEvent } from "@/lib/analytics"
import { PhoneVideoFrame } from "@/components/ai-experience/PhoneVideoFrame"
import { SHOWCASE_EASE_STRONG } from "@/lib/showcaseMotion"
import { cn } from "@/lib/utils"

const CLIPS = [
  "/videos/raz-showreel.mp4",
  "/videos/raz-showreel-5.mp4",
  "/videos/raz-showreel-2.mp4",
  "/videos/raz-showreel-7.mp4",
  "/videos/raz-showreel-4.mp4",
]

const TALENT_LIMIT = 3
const PRODUCT_LIMIT = 4

// EnglishHero and EnglishAIExperienceTeaser are two stacked, separately
// headlined sections on the main site. For the showcase these are one
// continuous flow instead: the headline opens straight into the talent/
// product picker, so trying the AI demo reads as the natural next beat of
// the hero rather than a second pitch further down the page.
export function ShowcaseHero() {
  const { openModal } = useContactModal()
  const { talents, products, findCombination, loading } = useAIExperience()
  const [talentId, setTalentId] = useState<string | null>(null)
  const [productId, setProductId] = useState<string | null>(null)
  const talentRailRef = useRef<HTMLDivElement>(null)
  const productRailRef = useRef<HTMLDivElement>(null)
  const pickerReduceMotion = useReducedMotion()

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

  const previewTalents = talents.slice(0, TALENT_LIMIT)
  const previewProducts = products.slice(0, PRODUCT_LIMIT)
  const combination = findCombination(talentId, productId)

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    setReduceMotion(reduce)
    if (reduce) {
      gsap.set([headlineRef.current, subRef.current, scrollRef.current], { clipPath: "inset(0 0% 0 0)", opacity: 1, y: 0 })
    } else {
      // Timed tight on purpose: the subheading below is this page's LCP
      // candidate (per a Lighthouse audit — the whole hero previously kept
      // it invisible for 1.2s+, which is exactly what LCP penalizes), so
      // the wipe is shorter and the fade-up starts sooner than a purely
      // decorative timeline would.
      gsap
        .timeline()
        .fromTo(headlineRef.current, { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", duration: 0.7, ease: SHOWCASE_EASE_STRONG })
        .fromTo(subRef.current, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.45 }, "-=0.4")
        .fromTo(scrollRef.current, { opacity: 0 }, { opacity: 1, duration: 0.5 }, "-=0.3")
    }

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

  useEffect(() => {
    if (pickerReduceMotion || loading || previewTalents.length === 0) return
    const cards = [...(talentRailRef.current?.children ?? []), ...(productRailRef.current?.children ?? [])]
    if (cards.length === 0) return
    gsap.fromTo(cards, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.6, ease: SHOWCASE_EASE_STRONG, stagger: 0.06, delay: 0.3 })
  }, [loading, previewTalents.length, pickerReduceMotion])

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
    <section id="top" className="relative overflow-hidden">
      <div className="relative min-h-[100dvh] flex flex-col justify-between">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-[#141412] via-[#0b0b0b] to-black" />
          <video ref={videoARef} muted playsInline className="absolute inset-0 w-full h-full object-cover opacity-0 contrast-[1.05] brightness-[0.85]" />
          <video ref={videoBRef} muted playsInline className="absolute inset-0 w-full h-full object-cover opacity-0 contrast-[1.05] brightness-[0.85]" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/40" />
        </div>

        <div className="flex-1 flex flex-col justify-end px-5 md:px-12 pb-10 pt-28 md:pt-36">
          <div ref={headlineRef} className="max-w-4xl">
            <h1 className="font-display font-black text-[clamp(34px,6.4vw,80px)] leading-[1.1] tracking-[-0.04em] text-foreground">
              <span className="text-gradient-accent text-shimmer">Websites &amp; creative</span>
              <br />
              <span className="text-gradient-neutral">that can&apos;t be ignored.</span>
            </h1>
          </div>
          <p ref={subRef} className="mt-6 max-w-xl text-dim text-base md:text-lg leading-relaxed">
            I build websites and create AI-powered videos and creative for brands that want to look a lot better online.
          </p>
          <div className="mt-8">
            <button
              onClick={() => openModal()}
              className="inline-block w-full sm:w-fit text-center font-mono text-sm font-bold uppercase tracking-wide bg-[#D1FE17] text-black rounded-[8px] px-6 py-3.5 hover:scale-105 transition-transform"
            >
              Let&apos;s talk →
            </button>
          </div>
          <div className="mt-5 font-mono text-[11px] uppercase tracking-widest text-dim">200+ websites · 6 years experience · design / development / AI</div>
        </div>

        <div className="px-5 md:px-12 pb-8 flex items-end justify-between">
          <div ref={scrollRef} className="font-mono text-xs uppercase tracking-widest text-dim flex items-center gap-4">
            Try the AI picker ↓
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
      </div>

      {!loading && previewTalents.length > 0 && (
        <div className="relative bg-background pt-16 pb-28 md:pt-20 md:pb-40">
          <div className="container">
            <div className="font-mono text-xs uppercase tracking-wide text-dim mb-6">( Pick a talent + a product )</div>
            <div className="grid md:grid-cols-2 gap-8 md:gap-10 items-start">
              <div>
                <div className="font-mono text-sm md:text-base font-bold uppercase tracking-wide text-foreground mb-2 md:mb-3">Choose a talent</div>
                <div ref={talentRailRef} className="grid grid-cols-3 gap-2 md:gap-3">
                  {previewTalents.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => { setTalentId(t.id); trackEvent("talent_selected", { talent: t.slug, location: "showcase_hero" }) }}
                      className={cn(
                        "aspect-[3/4] md:aspect-square rounded-xl overflow-hidden border transition-colors",
                        talentId === t.id ? "border-[#D1FE17]" : "border-white/10 hover:border-[#D1FE17]/60"
                      )}
                    >
                      {t.portrait_image && <img src={t.portrait_image} alt={t.full_name} loading="lazy" className="w-full h-full object-cover" />}
                    </button>
                  ))}
                </div>
                <div className="font-mono text-sm md:text-base font-bold uppercase tracking-wide text-foreground mt-4 md:mt-6 mb-2 md:mb-3">
                  Choose a product
                </div>
                <div ref={productRailRef} className="grid grid-cols-4 gap-2 md:gap-3">
                  {previewProducts.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => { setProductId(p.id); trackEvent("product_selected", { product: p.slug, location: "showcase_hero" }) }}
                      className={cn(
                        "aspect-[3/4] md:aspect-square rounded-xl overflow-hidden border transition-colors",
                        productId === p.id ? "border-[#D1FE17]" : "border-white/10 hover:border-[#D1FE17]/60"
                      )}
                    >
                      {p.packshot_image && <img src={p.packshot_image} alt={p.product_name} loading="lazy" className="w-full h-full object-cover" />}
                    </button>
                  ))}
                </div>

                {talentId && productId && (
                  <button
                    type="button"
                    onClick={() => {
                      trackEvent("ai_campaign_cta_clicked", { location: "showcase_hero" })
                      openModal({ source: "showcase_ai_demo", intent: "create_campaign", combination: combination?.title ?? null })
                    }}
                    className="mt-6 inline-flex items-center justify-center w-full sm:w-fit font-mono text-sm font-bold uppercase tracking-wide bg-[#D1FE17] text-black rounded-[8px] px-6 py-3 hover:scale-105 transition-transform"
                  >
                    Let&apos;s build one for you →
                  </button>
                )}
              </div>

              <div key={combination?.id ?? `${talentId}-${productId}`} className="animate-[fadeIn_0.5s_ease]">
                <PhoneVideoFrame
                  className="max-w-none w-full md:max-w-[300px]"
                  video={combination?.video_url}
                  poster={combination?.poster_image}
                  title={combination?.title}
                  fallback={
                    <p className="text-dim text-sm">
                      {talentId && productId ? "Ready for a custom campaign." : "Pick a talent and a product for a preview"}
                    </p>
                  }
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
