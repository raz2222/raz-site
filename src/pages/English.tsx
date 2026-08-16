import { useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import gsap from "gsap"
import { useProjects } from "@/hooks/useProjects"
import { useDocumentMeta } from "@/hooks/useDocumentMeta"
import { useHreflang } from "@/hooks/useHreflang"
import { Reveal } from "@/components/Reveal"
import { AutoVideo } from "@/components/AutoVideo"
import { cn } from "@/lib/utils"

const CLIPS = [
  "/videos/raz-showreel.mp4",
  "/videos/raz-showreel-5.mp4",
  "/videos/raz-showreel-2.mp4",
  "/videos/raz-showreel-7.mp4",
  "/videos/raz-showreel-4.mp4",
]

function EnglishHero() {
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
      loadInto(hidden, CLIPS[nextIndex], () => { hiddenReady = true })
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
        <video ref={videoARef} muted playsInline className="absolute inset-0 w-full h-full object-cover opacity-0 contrast-[1.05] brightness-[0.85]" />
        <video ref={videoBRef} muted playsInline className="absolute inset-0 w-full h-full object-cover opacity-0 contrast-[1.05] brightness-[0.85]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/40" />
      </div>

      <div className="flex-1 flex flex-col justify-end px-5 md:px-12 pb-6">
        <div ref={headlineRef} className="max-w-4xl">
          <h1 className="font-display font-black text-[clamp(38px,7vw,88px)] leading-[1.02] tracking-tight text-foreground">
            WEBSITES, FILMS
            <br />
            &amp; VISUALS.
          </h1>
        </div>
        <p ref={subRef} className="mt-6 max-w-xl text-dim text-base md:text-lg leading-relaxed">
          Design, development &amp; AI-powered production.
        </p>
        <Link
          to="/en/contact"
          className="mt-8 inline-block w-fit font-mono text-sm uppercase tracking-wide bg-[#D1FE17] text-black rounded-full px-7 py-3.5 hover:scale-105 transition-transform"
        >
          Let&apos;s talk ←
        </Link>
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

function EnglishPositioning() {
  return (
    <section className="py-28 md:py-40">
      <div className="container grid md:grid-cols-[1.2fr_1fr] gap-14 items-center">
        <div>
          <Reveal>
            <h2 className="font-display font-medium text-[clamp(28px,4.4vw,52px)] leading-[1.1] tracking-tight max-w-3xl">
              Being good isn't enough
              <br />
              if you look like everyone else.
            </h2>
          </Reveal>
          <Reveal delay={120}>
            <p className="mt-8 max-w-xl text-dim text-base md:text-lg leading-relaxed">
              Businesses can be excellent and still look average online. I connect design,
              development and AI to turn ideas into digital experiences people actually remember.
            </p>
          </Reveal>
        </div>
        <Reveal delay={180} className="relative aspect-[4/5] rounded-sm overflow-hidden bg-neutral-900">
          <AutoVideo src="/videos/raz-showreel-5.mp4" className="absolute inset-0 w-full h-full object-cover contrast-[1.05] brightness-[0.9]" />
        </Reveal>
      </div>
    </section>
  )
}

function EnglishSelectedWork() {
  const { projects, loading } = useProjects()
  return (
    <section id="work" className="py-28 md:py-40">
      <div className="container">
        <Reveal className="font-mono text-xs uppercase tracking-wide text-dim mb-4">Selected Work</Reveal>
        <Reveal>
          <h2 className="font-display font-medium text-[clamp(28px,4.4vw,52px)] leading-[1.1] tracking-tight">
            A few things worth your time.
          </h2>
        </Reveal>

        {loading && <div className="mt-16 font-mono text-xs text-dim uppercase">Loading…</div>}

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-px bg-white/10 border-t border-white/10">
          {projects.map((p, i) => (
            <Reveal
              key={p.slug}
              delay={i * 80}
              className={cn("bg-background p-8 md:p-10", p.thumb_class === "wide" && "md:col-span-2")}
            >
              <div className="flex justify-between items-start gap-6 mb-6">
                <div>
                  <div className="font-mono text-[11px] uppercase tracking-wide text-dim mb-2">
                    {p.number} {p.concept && "· Concept"}
                  </div>
                  <div className="font-display text-2xl md:text-3xl font-medium">{p.title}</div>
                </div>
                <div className="text-right font-mono text-[11px] text-dim uppercase max-w-[220px]">{p.category}</div>
              </div>
              <Link
                to={`/work/${p.slug}`}
                className={cn(
                  "block relative overflow-hidden rounded-sm bg-neutral-900 border border-transparent hover:border-[#D1FE17] transition-colors duration-200",
                  p.thumb_class === "wide" ? "aspect-[21/9]" : p.thumb_class === "tall" ? "aspect-[3/4]" : "aspect-[4/3]"
                )}
              >
                {p.video && <AutoVideo src={p.video} className="absolute inset-0 w-full h-full object-cover contrast-[1.05] brightness-[0.85]" />}
                <span className="absolute bottom-4 left-4 font-mono text-[11px] uppercase tracking-wide text-white/80">View Project →</span>
              </Link>
              <div className="mt-4 flex flex-wrap gap-x-3 gap-y-1 font-mono text-[11px] text-dim uppercase">
                {p.disciplines.map((d) => <span key={d}>{d}</span>)}
                <span>{p.year}</span>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-12">
          <Link to="/en/work" className="inline-block font-mono text-xs uppercase tracking-wide underline underline-offset-4">
            View all work →
          </Link>
        </Reveal>
      </div>
    </section>
  )
}

const PILLARS = [
  {
    n: "01",
    title: "Digital Experiences",
    tagline: "Websites that don't feel like templates.",
    video: "/videos/raz-showreel-7.mp4",
    items: ["Web Design", "Creative Development", "Interactive Websites", "E-commerce", "Landing Pages", "WordPress Development", "Custom Development", "AI-powered functionality"],
    cta: "Explore Web Projects →",
  },
  {
    n: "02",
    title: "AI Visuals & Content",
    tagline: "Visual ideas without traditional production limits.",
    video: "/videos/raz-showreel-2.mp4",
    items: ["AI Commercials", "Product Films", "Campaign Visuals", "Social Content", "AI Photography", "Creative Direction", "Concept Development"],
    cta: "Explore Visual Projects →",
  },
]

function EnglishWhatIDo() {
  return (
    <section id="services" className="py-28 md:py-40">
      <div className="container">
        <Reveal className="font-mono text-xs uppercase tracking-wide text-dim mb-4">What I Do</Reveal>
        <Reveal delay={60}>
          <h2 className="font-display font-medium text-[clamp(28px,4.4vw,52px)] leading-[1.1] tracking-tight">
            Two crafts. One eye.
          </h2>
        </Reveal>
        <div className="grid md:grid-cols-2 gap-16 mt-16">
          {PILLARS.map((p, i) => (
            <Reveal key={p.n} delay={i * 120}>
              <div className="relative aspect-video rounded-sm overflow-hidden bg-neutral-900 mb-6">
                <AutoVideo src={p.video} className="absolute inset-0 w-full h-full object-cover contrast-[1.05] brightness-[0.9]" />
              </div>
              <div className="font-mono text-xs text-dim mb-3">{p.n}</div>
              <h3 className="font-display font-medium text-2xl md:text-3xl mb-3">{p.title}</h3>
              <p className="text-dim mb-8">{p.tagline}</p>
              <div className="flex flex-col">
                {p.items.map((item) => (
                  <div key={item} className="flex items-center gap-3 py-4 border-b border-white/10 text-[15px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-foreground flex-none" />
                    {item}
                  </div>
                ))}
              </div>
              <Link to="/en/services" className="inline-block mt-8 font-mono text-xs uppercase tracking-wide underline underline-offset-4">
                {p.cta}
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

const STEPS = [
  { n: "01", title: "Discover", text: "Understanding the business, the goal and the audience." },
  { n: "02", title: "Direction", text: "Defining the concept and the visual language." },
  { n: "03", title: "Build", text: "Design + Development + AI production." },
  { n: "04", title: "Launch", text: "Testing, polish and going live." },
]

function EnglishProcess() {
  return (
    <section className="py-28 md:py-40">
      <div className="container">
        <Reveal>
          <h2 className="font-display font-medium text-[clamp(28px,4.4vw,52px)] leading-[1.1] tracking-tight">
            From idea to launch.
          </h2>
        </Reveal>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8 mt-16">
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 90}>
              <div className="font-mono text-xs text-dim mb-4">{s.n}</div>
              <div className="font-display font-medium text-xl mb-2">{s.title}</div>
              <p className="text-dim text-sm leading-relaxed">{s.text}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

const CAPABILITIES = ["Design", "Development", "WordPress", "React / Next.js", "Creative Coding", "AI Visual Production", "Automation"]
const TOOLS = ["Claude", "ChatGPT", "Figma", "WordPress", "React", "Next.js", "GSAP", "Higgsfield", "Kling", "Veo"]

function EnglishAbout() {
  return (
    <section id="about" className="py-28 md:py-40">
      <div className="container">
        <Reveal className="font-mono text-xs uppercase tracking-wide text-dim mb-6">About</Reveal>
        <div className="grid md:grid-cols-[1fr_1.2fr] gap-14 items-start">
          <Reveal>
            <div className="relative aspect-[4/5] rounded-sm overflow-hidden bg-neutral-900">
              <img src="/images/raz-portrait.jpeg" alt="Raz Avramov" className="absolute inset-0 w-full h-full object-cover grayscale" />
            </div>
          </Reveal>
          <div>
            <Reveal>
              <h2 className="font-display font-medium text-[clamp(28px,4.4vw,52px)] leading-[1.1] tracking-tight mb-6">
                I'm Raz.
              </h2>
            </Reveal>
            <Reveal delay={100}>
              <p className="text-dim text-base md:text-lg leading-relaxed mb-4">
                I'm a creative developer working at the intersection of design, technology and AI.
              </p>
              <p className="text-dim text-base md:text-lg leading-relaxed mb-10">
                I design and build digital experiences, websites and visual content for brands
                that want to look different, communicate better and make an impact.
              </p>
            </Reveal>
            <Reveal delay={180}>
              <div className="font-mono text-xs uppercase tracking-wide text-dim mb-4">Capabilities</div>
              <div className="flex flex-wrap gap-2 mb-10">
                {CAPABILITIES.map((c) => (
                  <span key={c} className="border border-white/30 rounded-full px-4 py-1.5 text-sm">{c}</span>
                ))}
              </div>
            </Reveal>
            <Reveal delay={240}>
              <div className="font-mono text-[11px] uppercase tracking-wide text-dim">{TOOLS.join(" · ")}</div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}

const MODERNIZATION_ITEMS = ["Website Redesign", "WordPress Rebuild", "Performance", "Migration", "Modernization", "Ongoing Care"]

function EnglishModernization() {
  return (
    <section className="relative py-28 md:py-40 border-t border-white/10 overflow-hidden">
      <AutoVideo src="/videos/raz-showreel-4.mp4" className="absolute inset-0 w-full h-full object-cover opacity-20 contrast-[1.05] brightness-[0.7]" />
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-transparent" />
      <div className="container relative">
        <Reveal>
          <h2 className="font-display font-medium text-[clamp(26px,4vw,44px)] leading-[1.15] tracking-tight max-w-2xl">
            Already have a website?
            <br />
            Let's make it worth visiting again.
          </h2>
        </Reveal>
        <Reveal delay={100}>
          <p className="mt-6 max-w-xl text-dim text-base md:text-lg leading-relaxed">
            I redesign, rebuild and modernize existing websites without forcing businesses to
            start from zero.
          </p>
        </Reveal>
        <Reveal delay={180} className="flex flex-wrap gap-3 mt-8">
          {MODERNIZATION_ITEMS.map((i) => (
            <span key={i} className="border border-white/30 rounded-full px-4 py-1.5 text-sm">{i}</span>
          ))}
        </Reveal>
        <Reveal delay={240}>
          <Link
            to="/en/contact"
            className="inline-block mt-10 font-mono text-xs uppercase tracking-wide bg-[#D1FE17] text-black rounded-full px-6 py-3 hover:scale-105 transition-transform"
          >
            Modernize My Website →
          </Link>
        </Reveal>
      </div>
    </section>
  )
}

function EnglishFinalCTA() {
  return (
    <section id="contact" className="min-h-[70dvh] flex flex-col justify-center py-28">
      <div className="container text-center">
        <Reveal>
          <h2 className="font-display font-bold text-[clamp(34px,7vw,84px)] leading-[1.05] tracking-tight">
            Have something in mind?
            <br />
            Let's make it real.
          </h2>
        </Reveal>
        <Reveal delay={150}>
          <Link
            to="/en/contact"
            className="inline-block mt-10 font-mono text-sm uppercase tracking-wide bg-[#D1FE17] text-black rounded-full px-8 py-4 hover:scale-105 transition-transform"
          >
            Start a Project →
          </Link>
        </Reveal>
        <Reveal delay={220} className="mt-10 flex items-center justify-center gap-6 font-mono text-xs uppercase tracking-wide text-dim">
          <a href="mailto:razavramov2@gmail.com" className="hover:text-foreground transition-colors">Email</a>
          <a href="https://instagram.com/raz2222" target="_blank" rel="noreferrer" className="hover:text-foreground transition-colors">Instagram</a>
          <a href="https://wa.me/972506944443" target="_blank" rel="noreferrer" className="hover:text-foreground transition-colors">WhatsApp</a>
        </Reveal>
        <Reveal delay={280} className="mt-4 font-mono text-[11px] text-dim uppercase tracking-wide">
          Based in Israel. Working worldwide.
        </Reveal>
        <Reveal delay={320} className="mt-8">
          <Link to="/" className="font-mono text-[11px] uppercase tracking-wide underline underline-offset-4 text-dim">
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
      <EnglishWhatIDo />
      <EnglishPositioning />
      <EnglishSelectedWork />
      <EnglishProcess />
      <EnglishAbout />
      <EnglishModernization />
      <EnglishFinalCTA />
    </div>
  )
}
