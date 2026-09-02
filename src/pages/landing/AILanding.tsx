import { useEffect, useId, useRef, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useDocumentMeta } from "@/hooks/useDocumentMeta"
import { useReducedMotion } from "@/hooks/useReducedMotion"
import { trackEvent } from "@/lib/analytics"
import { Reveal } from "@/components/Reveal"
import { AutoVideo } from "@/components/AutoVideo"
import { WhatsAppButton } from "@/components/WhatsAppButton"
import { SectionHeading } from "@/components/SectionHeading"
import { ConsentCheckbox } from "@/components/ConsentCheckbox"
import { AnnouncementBar } from "@/components/AnnouncementBar"
import { Eyebrow as BrandEyebrow } from "@/components/Eyebrow"
import { AIExperienceTeaser } from "@/components/AIExperienceTeaser"
import { AIVideoOffer } from "@/components/AIVideoOffer"
import { PhoneVideoFrame } from "@/components/ai-experience/PhoneVideoFrame"
import { cn } from "@/lib/utils"
import { Wordmark } from "@/components/icons/Wordmark"
import { Footer } from "@/components/Footer"
import { LegalLink } from "@/components/LegalLink"
import { useCarouselProgress, CarouselProgressBar } from "@/components/CarouselProgress"

const WHATSAPP_NUMBER = "972506944443"
const WHATSAPP_MESSAGE = "היי, אני מתעניין בהפקת תוכן קריאייטיבי ב-AI למותג שלי."
const PRODUCT_WHATSAPP_MESSAGE = "היי, יש לי מוצר שאני רוצה לראות בקמפיין AI כזה. אני שולח לך אותו."

// The clip that opens the page, first thing a visitor from the ad sees.
// It holds the campaign cut so the landing reads as a continuation of the ad
// rather than as a different site; swap this path when the ad file changes.
const HERO_CAMPAIGN_VIDEO = "/videos/raz-showreel-7.mp4"

const CASE_STUDIES = [
  { slug: "automotive-2077", title: "Automotive 2077", category: "סרט AI / רכב / עולם ויזואלי", video: "/videos/raz-showreel.mp4" },
  { slug: "fashion-campaign", title: "Fashion Campaign", category: "קמפיין אופנה / סרט / צילומים", video: "/videos/raz-showreel-5.mp4" },
  { slug: "aura-jewelry", title: "Aura", category: "קמפיין ויזואלי", video: "/videos/aura-jewelry.mp4" },
  { slug: "second-skin", title: "Second Skin", category: "קמפיין טיפוח / מוצר / ביוטי", video: "/videos/second-skin.mp4" },
  { slug: "no-address", title: "No Address", category: "סרט סטריטוור / קמפיין", video: "/videos/no-address.mp4" },
]

const PRODUCT_WORLDS = [
  { label: "סרטון מוצר", video: "/videos/raz-showreel-2.mp4" },
  { label: "צילום", video: "/videos/raz-showreel.mp4" },
  { label: "UGC", video: "/videos/raz-showreel-4.mp4" },
  { label: "Reels", video: "/videos/raz-showreel-7.mp4" },
  { label: "מודעות", video: "/videos/second-skin.mp4" },
  { label: "ויז׳ואלים", video: "/videos/no-address.mp4" },
]

const AI_REASONS = [
  "מוצר באמצע מדבר.",
  "רכב בעיר שעוד לא קיימת.",
  "קמפיין אופנה בלי להטיס צוות לצד השני של העולם.",
  "עשר גרסאות לאותו רעיון בלי לקבוע עוד יום צילום.",
]

const WORKFLOW = [
  { n: "01", title: "מתחילים מהבריף", text: "אני מבין את המוצר, הקהל, המטרה ומה אתם רוצים שהתוכן יעשה." },
  { n: "02", title: "סוגרים כיוון", text: "קונספט, רפרנסים, שפה ויזואלית והשוטים שצריך ליצור." },
  { n: "03", title: "מפיקים", text: "AI, תנועה, עריכה, סאונד וכל מה שהתוצר צריך כדי להרגיש גמור." },
  { n: "04", title: "מקבלים קבצים מוכנים לפרסום", text: "הסרטונים והוויז׳ואלים מגיעים בפורמטים שמתאימים למקומות שבהם אתם באמת הולכים להשתמש בהם." },
]

const FAQS = [
  {
    q: "חייבים להגיע עם רעיון מוכן?",
    a: "לא. אפשר להגיע עם בריף מסודר, מוצר קיים או אפילו כיוון כללי. אם צריך, נבנה את הקונספט כחלק מהפרויקט.",
  },
  {
    q: "אפשר לעבוד עם המוצר האמיתי שלנו?",
    a: "כן. אפשר להתחיל מתמונות וחומרים קיימים של המוצר ולבנות סביבם סצנות, סרטונים וקריאייטיב חדש.",
  },
  {
    q: "הכל חייב להיות AI?",
    a: "לא. אני משתמש במה שהתוצאה צריכה. זה יכול לכלול AI, חומרי מותג קיימים, עריכה, תנועה, Voice, Sound Design ופוסט פרודקשן.",
  },
  {
    q: "אפשר לעשות כמה גרסאות לאותה מודעה?",
    a: "כן. אפשר ליצור וריאציות של Hooks, שוטים, פורמטים וכיווני קריאייטיב בהתאם לפרויקט.",
  },
  {
    q: "אפשר להזמין רק תמונות?",
    a: "כן. אפשר ליצור גם צילומי מוצר, ויז׳ואלים לקמפיינים ותמונות לסושיאל בלי להפיק סרטון.",
  },
  {
    q: "באילו פורמטים מקבלים את החומרים?",
    a: "לפי המקום שבו הם הולכים להתפרסם. אפשר לקבל 9:16, 4:5, 1:1, 16:9, תמונות וגרסאות נוספות לפי הצורך.",
  },
]

const CREATE_TYPES = ["סרטון", "תמונות", "קמפיין", "UGC", "עוד לא בטוח"]

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <BrandEyebrow>{children}</BrandEyebrow>
    </div>
  )
}

function PrimaryCta({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center justify-center w-full sm:w-fit font-mono text-sm font-bold uppercase tracking-wide bg-[#D1FE17] text-black rounded-[8px] px-7 py-3.5 hover:scale-105 transition-transform"
    >
      {children}
    </button>
  )
}

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92Z" />
    </svg>
  )
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm5.78 14.15c-.24.68-1.4 1.3-1.94 1.38-.5.08-1.12.11-1.81-.11-.42-.13-.95-.31-1.64-.6-2.88-1.24-4.76-4.15-4.9-4.34-.14-.19-1.17-1.56-1.17-2.98 0-1.42.74-2.11 1-2.4.26-.29.57-.36.76-.36.19 0 .38 0 .55.01.18.01.41-.07.64.49.24.58.81 1.99.88 2.13.07.15.12.32.02.51-.1.19-.15.31-.29.48-.15.17-.31.38-.44.51-.15.15-.3.31-.13.6.17.29.76 1.25 1.63 2.02 1.12 1 2.06 1.31 2.35 1.46.29.15.46.13.63-.08.17-.21.72-.84.91-1.13.19-.29.38-.24.64-.14.26.1 1.64.77 1.92.91.28.14.47.21.54.33.07.12.07.68-.17 1.36Z" />
    </svg>
  )
}

function WhatsAppCta({ className = "" }: { className?: string }) {
  return (
    <a
      href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`}
      target="_blank"
      rel="noreferrer"
      className={`inline-flex items-center justify-center w-full sm:w-fit gap-2 font-mono text-[10px] font-bold uppercase tracking-wide border border-white/20 rounded-full px-5 py-3.5 hover:border-[#D1FE17] hover:text-[#D1FE17] transition-colors ${className}`}
    >
      <WhatsAppIcon className="w-4 h-4" />
      וואטסאפ
    </a>
  )
}

function ResponseTimeNote({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 font-mono text-[11px] uppercase tracking-wide text-dim ${className}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-[#D1FE17] flex-none" />
      מענה תוך 24 שעות
    </div>
  )
}

function MobileCta({ onOpenForm }: { onOpenForm: () => void }) {
  return (
    <div
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 grid grid-cols-2 border-t border-white/10 bg-background/95 backdrop-blur-xl"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <button
        onClick={onOpenForm}
        className="flex items-center justify-center py-3.5 font-mono text-[10px] font-bold uppercase tracking-wide border-l border-white/10 bg-[#D1FE17] text-black"
      >
        בואו נדבר
      </button>
      <a
        href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`}
        target="_blank"
        rel="noreferrer"
        className="flex items-center justify-center gap-2 py-3.5 font-mono text-[10px] font-bold uppercase tracking-wide"
      >
        <WhatsAppIcon className="w-4 h-4" />
        WhatsApp
      </a>
    </div>
  )
}

function HeroCampaignVideo() {
  return <PhoneVideoFrame video={HERO_CAMPAIGN_VIDEO} />
}

function CampaignProductCta({ onOpenForm }: { onOpenForm: () => void }) {
  return (
    <div className="rounded-[16px] border border-[#D1FE17]/25 bg-[#D1FE17]/[0.06] p-6 md:p-8">
      <p className="font-display font-bold text-xl md:text-2xl leading-snug">
        רוצים לראות את המוצר שלכם בקמפיין כזה?
      </p>
      <p className="mt-2 text-dim text-sm md:text-base leading-relaxed">
        שלחו לי אותו בוואטסאפ, תמונה אחת של המוצר מספיקה כדי להתחיל.
      </p>
      <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
        <a
          href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(PRODUCT_WHATSAPP_MESSAGE)}`}
          target="_blank"
          rel="noreferrer"
          onClick={() => trackEvent("whatsapp_click", { location: "ai_experience_cta" })}
          className="inline-flex items-center justify-center w-full sm:w-fit gap-2 font-mono text-sm font-bold uppercase tracking-wide bg-[#D1FE17] text-black rounded-[8px] px-7 py-3.5 hover:scale-105 transition-transform"
        >
          <WhatsAppIcon className="w-4 h-4" />
          שלחו לי אותו בוואטסאפ
        </a>
        <button
          type="button"
          onClick={() => { trackEvent("ai_campaign_cta_clicked", { location: "ai_experience_cta" }); onOpenForm() }}
          className="inline-flex items-center justify-center w-full sm:w-fit font-mono text-[10px] font-bold uppercase tracking-wide border border-white/20 rounded-full px-5 py-3.5 hover:border-[#D1FE17] hover:text-[#D1FE17] transition-colors"
        >
          רוצים קמפיין כזה למוצר שלכם?
        </button>
      </div>
    </div>
  )
}

function ShowreelHero({ onOpenForm }: { onOpenForm: () => void }) {
  return (
    <section className="relative overflow-hidden pt-32 pb-16 md:pt-40 md:pb-24">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#141412] via-[#0b0b0b] to-black" />
      <div className="container grid lg:grid-cols-[1.05fr_0.95fr] gap-12 lg:gap-16 items-center">
        <div>
          <Eyebrow>סטודיו קריאייטיב AI</Eyebrow>
          <Reveal>
            <h1 className="font-display font-black text-[clamp(34px,6vw,72px)] leading-[1.05] tracking-tight text-gradient-accent text-shimmer">
              סרטוני AI וקריאייטיב שאי אפשר פשוט לגלול מעליהם.
            </h1>
          </Reveal>
          <Reveal delay={120}>
            <p className="mt-6 max-w-xl text-dim text-lg md:text-xl leading-relaxed">
              אני יוצר פרסומות, סרטוני מוצר, ויז׳ואלים ותוכן לסושיאל בעזרת AI, קריאייטיב ופוסט פרודקשן.
            </p>
            <p className="mt-3 max-w-xl text-dim text-base leading-relaxed">
              יש לכם מוצר או רעיון? תשלחו לי אותו ונראה מה אפשר לעשות איתו.
            </p>
          </Reveal>
          <Reveal delay={200} className="mt-10 flex flex-col sm:flex-row items-center gap-4">
            <PrimaryCta onClick={onOpenForm}>בואו נדבר ←</PrimaryCta>
            <WhatsAppCta />
          </Reveal>
          <ResponseTimeNote className="mt-6" />
        </div>
        <Reveal delay={160}>
          <HeroCampaignVideo />
        </Reveal>
      </div>
    </section>
  )
}

function CaseStudies({ onSelect }: { onSelect: (p: (typeof CASE_STUDIES)[number]) => void }) {
  const { ref: carouselRef, thumb } = useCarouselProgress<HTMLDivElement>()
  return (
    <section id="work" className="py-28 md:py-40 section-divider">
      <div className="container">
        <Eyebrow>עבודות נבחרות</Eyebrow>
        <SectionHeading>פחות להסביר. יותר להראות.</SectionHeading>

        <div
          ref={carouselRef}
          className="mt-16 flex gap-4 overflow-x-auto snap-x snap-mandatory -mx-6 px-6 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:px-0 sm:pb-0 sm:overflow-visible sm:grid sm:grid-cols-2 md:grid-cols-3"
        >
          {CASE_STUDIES.map((p, i) => (
            <Reveal key={p.slug} delay={i * 80} className="flex-none w-[72vw] max-w-[300px] snap-center sm:w-auto sm:max-w-none">
              <button
                onClick={() => onSelect(p)}
                className="group block w-full text-right relative aspect-[4/5] rounded-lg overflow-hidden bg-neutral-900 border border-transparent hover:border-[#D1FE17] transition-colors"
              >
                <AutoVideo src={p.video} className="absolute inset-0 w-full h-full object-cover contrast-[1.05] brightness-[0.85] transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
                <div className="absolute bottom-4 right-4 left-4">
                  <h3 className="font-display font-medium text-lg text-white">{p.title}</h3>
                  <div className="font-mono text-[11px] uppercase tracking-wide text-white/60 mt-1">{p.category}</div>
                  <div className="mt-2 font-mono text-[11px] uppercase tracking-wide text-[#D1FE17] opacity-0 group-hover:opacity-100 transition-opacity">
                    צפייה בפרויקט ←
                  </div>
                </div>
              </button>
            </Reveal>
          ))}
        </div>
        <CarouselProgressBar thumb={thumb} className="mt-3 mx-6 sm:hidden" />
      </div>
    </section>
  )
}

function LightboxSoundOnIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M4 9v6h4l5 5V4L8 9H4Z" fill="black" />
      <path d="M16.5 8.5a5 5 0 0 1 0 7" stroke="black" strokeWidth="2" strokeLinecap="round" />
      <path d="M19 6a9 9 0 0 1 0 12" stroke="black" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function LightboxSoundOffIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M4 9v6h4l5 5V4L8 9H4Z" fill="black" />
      <path d="M16 9l5 6M21 9l-5 6" stroke="black" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function LightboxPlayIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
      <path d="M6 4.5v15l14-7.5-14-7.5Z" fill="black" />
    </svg>
  )
}

function LightboxPauseIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
      <path d="M6 4h4v16H6V4Zm8 0h4v16h-4V4Z" fill="black" />
    </svg>
  )
}

function ProjectLightbox({ project, onClose }: { project: (typeof CASE_STUDIES)[number] | null; onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [muted, setMuted] = useState(true)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (!project) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", onKeyDown)
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKeyDown)
      document.body.style.overflow = ""
    }
  }, [project, onClose])

  useEffect(() => {
    setMuted(true)
    setPaused(false)
    videoRef.current?.play().catch(() => {})
  }, [project])

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    if (paused) v.pause()
    else v.play().catch(() => {})
  }, [paused])

  if (!project) return null

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 md:p-10" onClick={onClose}>
      <div className="relative w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          aria-label="סגירה"
          className="absolute -top-10 md:-top-12 left-0 font-mono text-[10px] font-bold uppercase tracking-wide text-white/70 hover:text-[#D1FE17] transition-colors"
        >
          סגירה ✕
        </button>
        <div className="relative aspect-video rounded-lg overflow-hidden bg-neutral-900">
          <video
            ref={videoRef}
            src={project.video}
            muted={muted}
            loop
            playsInline
            autoPlay
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute bottom-4 left-4 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMuted((v) => !v)}
              aria-label={muted ? "הפעל סאונד" : "השתק סאונד"}
              aria-pressed={!muted}
              className="w-9 h-9 rounded-full bg-[#D1FE17] flex items-center justify-center flex-none"
            >
              {muted ? <LightboxSoundOffIcon /> : <LightboxSoundOnIcon />}
            </button>
            <button
              type="button"
              onClick={() => setPaused((v) => !v)}
              aria-label={paused ? "הפעל וידאו" : "עצור וידאו"}
              aria-pressed={paused}
              className="w-9 h-9 rounded-full bg-[#D1FE17] flex items-center justify-center flex-none"
            >
              {paused ? <LightboxPlayIcon /> : <LightboxPauseIcon />}
            </button>
          </div>
        </div>
        <div className="mt-4 text-white">
          <h3 className="font-display font-bold text-2xl">{project.title}</h3>
          <div className="font-mono text-[11px] uppercase tracking-wide text-white/60 mt-1">{project.category}</div>
        </div>
      </div>
    </div>
  )
}

function ProductUniverse() {
  const reduced = useReducedMotion()
  const [active, setActive] = useState(0)
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    if (reduced) return
    timerRef.current = window.setInterval(() => setActive((i) => (i + 1) % PRODUCT_WORLDS.length), 3400)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [reduced])

  function select(i: number) {
    setActive(i)
    if (timerRef.current) clearInterval(timerRef.current)
    if (!reduced) {
      timerRef.current = window.setInterval(() => setActive((v) => (v + 1) % PRODUCT_WORLDS.length), 3400)
    }
  }

  return (
    <section className="py-28 md:py-40 border-t border-white/10 overflow-hidden">
      <div className="container">
        <Eyebrow>מוצר אחד. תוכן בלי סוף.</Eyebrow>
        <SectionHeading>מוצר אחד. הרבה יותר מקריאייטיב אחד.</SectionHeading>
        <Reveal delay={80}>
          <p className="mt-6 max-w-xl text-dim text-base md:text-lg leading-relaxed">
            תמונה אחת טובה של המוצר יכולה להספיק כדי להתחיל.
            <br />
            ממנה אפשר לבנות סרטון מוצר, צילומים, Reels, UGC, מודעות וגרסאות שונות לאותו קמפיין, בלי להתחיל הפקה חדשה בכל פעם.
          </p>
        </Reveal>

        <Reveal delay={140} className="mt-16 grid md:grid-cols-[1fr_260px] gap-6 md:gap-8 items-center">
          <div key={active} className="relative aspect-[16/10] md:aspect-video rounded-lg overflow-hidden bg-neutral-900 animate-[fadeIn_0.6s_ease]">
            <AutoVideo src={PRODUCT_WORLDS[active].video} className="absolute inset-0 w-full h-full object-cover contrast-[1.05] brightness-[0.85]" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            <div className="absolute bottom-5 right-5 font-mono text-xs uppercase tracking-wide text-white bg-black/40 backdrop-blur px-3 py-1.5 rounded-full">
              {PRODUCT_WORLDS[active].label}
            </div>
          </div>
          <div className="flex flex-wrap md:flex-col gap-2">
            {PRODUCT_WORLDS.map((w, i) => (
              <button
                key={w.label}
                onMouseEnter={() => select(i)}
                onFocus={() => select(i)}
                onClick={() => select(i)}
                className={cn(
                  "font-mono text-[10px] font-bold uppercase tracking-wide rounded-full md:rounded-lg px-4 py-2.5 border text-center md:text-right transition-colors",
                  i === active ? "border-[#D1FE17] bg-[#D1FE17] text-black" : "border-white/15 text-dim hover:border-[#D1FE17]"
                )}
              >
                {w.label}
              </button>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}

function WhyAi() {
  return (
    <section className="py-28 md:py-40 section-divider">
      <div className="container grid md:grid-cols-[1.2fr_1fr] gap-10 md:gap-14 items-center">
        <div>
          <Eyebrow>למה AI?</Eyebrow>
          <SectionHeading className="max-w-2xl">כי לפעמים הרעיון הכי טוב הוא בדיוק זה שאי אפשר לצלם.</SectionHeading>

          <div className="mt-14 flex flex-col gap-3">
            {AI_REASONS.map((item, i) => (
              <Reveal key={item} delay={i * 70}>
                <p className="text-lg md:text-xl text-foreground/90 leading-relaxed">{item}</p>
              </Reveal>
            ))}
          </div>

          <Reveal delay={AI_REASONS.length * 70 + 60} className="mt-10 max-w-xl">
            <p className="text-dim text-base md:text-lg leading-relaxed">
              AI פותח אפשרויות שפעם דרשו הרבה יותר זמן, תקציב והפקה.
            </p>
          </Reveal>

          <Reveal delay={AI_REASONS.length * 70 + 120} className="mt-10 border-t border-white/10 pt-10 text-center">
            <p className="font-display font-bold text-2xl md:text-4xl leading-tight text-[#D1FE17]">
              אבל הכלי הוא לא העניין.
              <br />
              אם הרעיון לא טוב, AI לא יציל אותו.
            </p>
          </Reveal>
        </div>
        <Reveal delay={120} className="hidden md:block">
          <div className="relative aspect-[16/10] rounded-lg overflow-hidden bg-neutral-900">
            <AutoVideo src="/videos/raz-showreel.mp4" className="absolute inset-0 w-full h-full object-cover contrast-[1.05] brightness-[0.85]" />
          </div>
        </Reveal>
      </div>
    </section>
  )
}

function HowItWorks() {
  return (
    <section className="py-28 md:py-40 section-divider">
      <div className="container">
        <Eyebrow>מבריף להפקה</Eyebrow>
        <SectionHeading>איך זה עובד?</SectionHeading>
        <Reveal delay={80}>
          <p className="mt-6 max-w-xl text-dim text-base md:text-lg leading-relaxed">
            לא שולחים Prompt ומקווים לטוב.
          </p>
        </Reveal>

        <div className="relative mt-16">
          <div
            aria-hidden="true"
            className="hidden md:block absolute top-8 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D1FE17]/40 to-transparent"
          />
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8 relative">
            {WORKFLOW.map((s, i) => (
              <Reveal key={s.n} delay={i * 90} className="group cursor-default">
                <div className="relative z-10 inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-xl bg-[#D1FE17] text-black font-display font-black text-2xl md:text-3xl mb-5 transition-transform duration-300 ease-out group-hover:scale-110 group-hover:-rotate-3">
                  {s.n}
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

function AboutRaz() {
  return (
    <section className="py-28 md:py-40 section-divider">
      <div className="container">
        <Reveal className="mb-6">
          <Eyebrow>מי עומד מאחורי העבודה?</Eyebrow>
        </Reveal>
        <div className="grid md:grid-cols-[1fr_1.2fr] gap-14 items-start">
          <Reveal>
            <div className="relative aspect-[4/5] rounded-sm overflow-hidden bg-neutral-900">
              <img
                src="/images/raz-portrait.jpeg"
                alt="רז אברמוב"
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover grayscale"
              />
            </div>
          </Reveal>
          <div>
            <Reveal>
              <h2 className="font-display font-bold text-[clamp(30px,4.6vw,54px)] leading-[1.15] tracking-[-0.04em] mb-6">
                <span className="text-foreground">אני </span>
                <span className="text-gradient-accent text-shimmer">רז.</span>
              </h2>
            </Reveal>
            <Reveal delay={80} className="space-y-3 text-dim text-base md:text-lg leading-relaxed">
              <p>אני מגיע מעולם העיצוב והפיתוח, עם יותר מ-200 אתרים ושש שנות ניסיון בעבודה דיגיטלית.</p>
              <p>בשנים האחרונות נכנסתי עמוק ל-AI כי הוא פתח דרך חדשה לעשות דברים שפעם דרשו הפקות ענק.</p>
              <p>אבל אני לא מוכר Prompts ולא &quot;חבילת AI&quot;.</p>
              <p>אני משתמש בכלים האלה כדי ליצור עבודה שנראית מספיק טוב כדי שמותג באמת ירצה לפרסם אותה.</p>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  const id = useId()

  return (
    <div className="border-b border-white/10 py-6">
      <button onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-controls={id} className="w-full flex items-center justify-between text-right gap-6 group">
        <h3 className="font-display text-lg md:text-xl font-medium group-hover:text-[#D1FE17] transition-colors">{q}</h3>
        <span className={cn("font-mono text-xl transition-transform flex-none", open && "rotate-45")}>+</span>
      </button>
      <div id={id} role="region" aria-hidden={!open} className={cn("grid transition-all duration-300", open ? "grid-rows-[1fr] mt-4" : "grid-rows-[0fr]")}>
        <div className="overflow-hidden">
          <p className="text-dim text-base leading-relaxed max-w-2xl">{a}</p>
        </div>
      </div>
    </div>
  )
}

const inputClass =
  "w-full bg-transparent border border-white/30 rounded px-4 py-3 text-sm focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:border-white/50"
const labelClass = "block text-xs font-mono text-dim uppercase tracking-wide mb-2"

function AiLeadForm({ open, onClose }: { open: boolean; onClose: () => void }) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const [createTypes, setCreateTypes] = useState<string[]>([])
  const [name, setName] = useState("")
  const [company, setCompany] = useState("")
  const [contact, setContact] = useState("")
  const [whatToCreate, setWhatToCreate] = useState("")
  const [consent, setConsent] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; contact?: string; consent?: string }>({})

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", onKeyDown)
    document.body.style.overflow = "hidden"
    dialogRef.current?.focus()
    return () => {
      document.removeEventListener("keydown", onKeyDown)
      document.body.style.overflow = ""
    }
  }, [open, onClose])

  if (!open) return null

  async function handleSubmit() {
    const errors: typeof fieldErrors = {}
    if (!name.trim()) errors.name = "שדה חובה"
    if (!contact.trim()) errors.contact = "שדה חובה"
    if (!consent) errors.consent = "צריך לאשר את מדיניות הפרטיות כדי לשלוח את הטופס"
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return

    setSubmitting(true)
    setError(null)
    const projectType = createTypes.join(", ") || "עוד לא בטוח"
    const { error: dbError } = await supabase.from("leads").insert({
      name,
      email: contact,
      company: company || null,
      project_type: projectType,
      message: whatToCreate || null,
    })
    setSubmitting(false)
    if (dbError) {
      setError("משהו השתבש, נסו שוב או שלחו וואטסאפ.")
      return
    }
    fetch("/api/notify-lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email: contact, company, projectType, message: whatToCreate }),
    }).catch(() => {})
    trackEvent("lead_submit", { project_type: projectType, source: "ai_landing" })
    setSubmitted(true)
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-start md:items-center justify-center overflow-y-auto bg-black/92 backdrop-blur-md px-4 py-6 md:py-8" onClick={onClose}>
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-black rounded-[24px] p-5 md:p-10 outline-none"
      >
        <button onClick={onClose} aria-label="סגירה" className="absolute top-4 left-4 w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors text-2xl leading-none">×</button>

        <h2 className="font-display font-black text-[clamp(22px,4vw,34px)] leading-[1.15] tracking-[-0.04em] mb-4 md:mb-6 text-gradient-accent">בואו ניצור משהו</h2>

        {submitted ? (
          <div className="py-8 text-center">
            <p className="font-display text-xl mb-2">קיבלתי, תודה!</p>
            <p className="text-dim text-sm">אני חוזר אליכם תוך 24 שעות.</p>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="flex items-start gap-2 rounded-lg border border-[#D1FE17]/30 bg-[#D1FE17]/10 px-3 py-2.5">
              <span className="flex-none font-mono text-[10px] font-bold uppercase tracking-wide bg-[#D1FE17] text-black rounded-md px-2 py-0.5">מבצע</span>
              <p className="text-xs text-[#D1FE17]/90 leading-relaxed">כל מי שיזמין עכשיו מקבל סרטון AI חינם לעסק: עד 15 שניות, בלי תוספת מחיר.</p>
            </div>

            <div>
              <div className={labelClass}>מה רוצים ליצור? (אפשר לבחור כמה)</div>
              <div className="flex flex-wrap gap-2">
                {CREATE_TYPES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setCreateTypes((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]))}
                    className={cn(
                      "font-mono text-[10px] font-bold uppercase tracking-wide rounded-full px-4 py-2.5 border transition-colors",
                      createTypes.includes(t) ? "border-[#D1FE17] bg-[#D1FE17] text-black" : "border-white/15 text-dim hover:border-[#D1FE17]"
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className={labelClass} htmlFor="lf-name">שם / חברה</label>
              <input id="lf-name" className={inputClass} value={name} onChange={(e) => setName(e.target.value)} placeholder="שם מלא" />
              {fieldErrors.name && <p className="text-red-400 text-xs mt-1">{fieldErrors.name}</p>}
              <input className={cn(inputClass, "mt-2")} value={company} onChange={(e) => setCompany(e.target.value)} placeholder="שם חברה (לא חובה)" />
            </div>

            <div>
              <label className={labelClass} htmlFor="lf-contact">טלפון או אימייל</label>
              <input id="lf-contact" className={inputClass} value={contact} onChange={(e) => setContact(e.target.value)} placeholder="050-0000000 / name@email.com" />
              {fieldErrors.contact && <p className="text-red-400 text-xs mt-1">{fieldErrors.contact}</p>}
            </div>

            <div>
              <label className={labelClass} htmlFor="lf-message">מה רוצים ליצור?</label>
              <textarea id="lf-message" className={cn(inputClass, "min-h-[90px] resize-none")} value={whatToCreate} onChange={(e) => setWhatToCreate(e.target.value)} placeholder="ספרו לי בקצרה על המוצר או הרעיון" />
            </div>

            <ConsentCheckbox id="lf-consent" checked={consent} onChange={setConsent} error={fieldErrors.consent} dark>
              קראתי ואני מאשר/ת את <LegalLink to="/privacy" className="underline hover:text-[#D1FE17]">מדיניות הפרטיות</LegalLink>
            </ConsentCheckbox>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full font-mono text-sm font-bold uppercase tracking-wide bg-[#D1FE17] text-black rounded-[8px] px-6 py-4 hover:scale-[1.02] transition-transform disabled:opacity-60"
            >
              {submitting ? "שולח…" : "שליחה ←"}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export function AILanding() {
  const [formOpen, setFormOpen] = useState(false)
  const [activeProject, setActiveProject] = useState<(typeof CASE_STUDIES)[number] | null>(null)

  // Keep in sync with ai.html — that shell is what link-preview bots read.
  useDocumentMeta(
    "סרטוני AI וקריאייטיב למותגים · RAZ",
    "פרסומות, סרטוני מוצר, ויז׳ואלים ותוכן לסושיאל בעזרת AI, קריאייטיב ופוסט פרודקשן. שלחו לי את המוצר ונראה איך הוא נראה בקמפיין.",
    undefined,
    undefined,
    { noindex: true }
  )

  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: "AI Creative Production",
    name: "יצירת תוכן AI לעסקים",
    description: "פרסומות, סרטוני מוצר, ויז׳ואלים ותוכן לסושיאל בעזרת AI, קריאייטיב ופוסט פרודקשן.",
    provider: { "@type": "Person", name: "Raz Avramov" },
    areaServed: "IL",
    url: "https://ai.madebyraz.co.il",
  }

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  }

  return (
    <div className="min-h-screen">
      <script type="application/ld+json">{JSON.stringify(serviceJsonLd)}</script>
      <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>

      <div className="fixed top-0 left-0 right-0 z-50">
        <AnnouncementBar isEnglish={false} onCtaClick={() => setFormOpen(true)} />
        <nav className="flex items-center justify-between px-5 md:px-12 py-4 bg-background/40 backdrop-blur-xl border-b border-white/5">
          <a
            href={`tel:+${WHATSAPP_NUMBER}`}
            className="inline-flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-wide bg-[#D1FE17] text-black rounded-full px-4 py-2 hover:scale-105 transition-transform"
          >
            <PhoneIcon className="w-3.5 h-3.5" />
            דברו איתי
          </a>
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            aria-label="MADE BY RAZ"
            className="flex items-center"
          >
            <Wordmark className="h-6 w-auto" />
          </button>
        </nav>
      </div>

      <ShowreelHero onOpenForm={() => setFormOpen(true)} />
      <CaseStudies onSelect={setActiveProject} />
      <AIExperienceTeaser cta={<CampaignProductCta onOpenForm={() => setFormOpen(true)} />} />
      <AIVideoOffer onOpenForm={() => setFormOpen(true)} />
      <ProductUniverse />
      <WhyAi />
      <HowItWorks />
      <AboutRaz />

      <section className="py-28 md:py-40 section-divider">
        <div className="container">
          <SectionHeading>שאלות נפוצות</SectionHeading>
          <div className="mt-12 max-w-2xl">
            {FAQS.map((f) => (
              <FaqItem key={f.q} q={f.q} a={f.a} />
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="py-28 md:py-36 section-divider text-center">
        <div className="container">
          <Eyebrow>יש לכם מוצר או רעיון?</Eyebrow>
          <SectionHeading
            className="max-w-2xl"
            headingClassName="font-display font-bold text-[clamp(26px,5.6vw,64px)] leading-[1.25] tracking-tight"
          >
            יש לכם מוצר או רעיון? שלחו לי אותו.
          </SectionHeading>
          <Reveal delay={100}>
            <p className="mt-6 max-w-xl mx-auto text-dim text-base md:text-lg leading-relaxed">
              לא צריך להכין מצגת או בריף של 20 עמודים. שלחו לי את המוצר או כמה מילים על מה שאתם רוצים ליצור. אני אחזור אליכם עם שאלות ונראה אם יש כיוון טוב לפרויקט.
            </p>
          </Reveal>
          <Reveal delay={200} className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <PrimaryCta onClick={() => setFormOpen(true)}>בואו נדבר ←</PrimaryCta>
            <WhatsAppCta />
          </Reveal>
          <ResponseTimeNote className="mt-6 justify-center" />
        </div>
      </section>

      <Footer hideSitemap formVariant="simple" formServiceLabel="יצירת תוכן AI" formServiceTypeOptions={CREATE_TYPES} />
      <div className="h-16 md:hidden" aria-hidden="true" />
      <WhatsAppButton />
      <MobileCta onOpenForm={() => setFormOpen(true)} />
      <AiLeadForm open={formOpen} onClose={() => setFormOpen(false)} />
      <ProjectLightbox project={activeProject} onClose={() => setActiveProject(null)} />
    </div>
  )
}
