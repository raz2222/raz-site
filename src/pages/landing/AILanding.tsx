import { useEffect, useId, useMemo, useRef, useState } from "react"
import type { ProjectRow } from "@/lib/supabase"
import { PROJECT_CATEGORIES } from "@/lib/supabase"
import { useProjects } from "@/hooks/useProjects"
import { useDocumentMeta } from "@/hooks/useDocumentMeta"
import { useReducedMotion } from "@/hooks/useReducedMotion"
import { Reveal } from "@/components/Reveal"
import { AutoVideo } from "@/components/AutoVideo"
import { WhatsAppButton } from "@/components/WhatsAppButton"
import { SectionHeading } from "@/components/SectionHeading"
import { cn } from "@/lib/utils"

const SITE = "https://madebyraz.co.il"
const WHATSAPP_NUMBER = "972506944443"
const WHATSAPP_MESSAGE = "היי, אני מתעניין בהפקת תוכן קריאייטיבי ב-AI למותג שלי."

const FORMATS: { title: string; body: string; tags: string[]; href: string }[] = [
  {
    title: "AI Commercials",
    body: "פרסומות וסרטוני מותג שמחברים רעיון, Storytelling, Motion וסאונד לתוצר אחד שלם.",
    tags: ["Brand Films", "Product Ads", "Campaigns"],
    href: `${SITE}/contact`,
  },
  {
    title: "Product Content",
    body: "לוקחים מוצר אמיתי ובונים סביבו סצנות, לוקיישנים ועולמות שקשה, יקר או בלתי אפשרי לצלם בדרך המסורתית.",
    tags: ["Product Videos", "Launches", "Social Assets"],
    href: `${SITE}/services/ai-content/product-videos`,
  },
  {
    title: "AI Photography",
    body: "צילומי מוצר וקמפיין ללא המגבלות של סטודיו פיזי אחד.",
    tags: ["Product", "Fashion", "Lifestyle", "Key Visuals"],
    href: `${SITE}/services/ai-content/ai-photography`,
  },
  {
    title: "Social Content",
    body: "Reels, TikTok, Stories וקריאייטיבים שנבנו במיוחד לצריכה מהירה בסושיאל.",
    tags: ["Reels", "TikTok", "Stories", "Paid Social"],
    href: `${SITE}/services/ai-content/social-content`,
  },
  {
    title: "AI UGC",
    body: "תוכן שמרגיש טבעי לפיד — Talking Head, הדגמות מוצר, Hooks, Testimonials וקריאייטיבים לפרפורמנס.",
    tags: ["UGC", "Hooks", "Product Demos", "Variations"],
    href: `${SITE}/contact`,
  },
  {
    title: "Creative Campaigns",
    body: "מהרעיון הראשוני ועד סט שלם של נכסים לקמפיין אחד עם שפה ויזואלית עקבית.",
    tags: ["Concept", "Direction", "Production", "Delivery"],
    href: `${SITE}/services/ai-content/campaign-visuals`,
  },
]

const PRODUCT_WORLDS = [
  { label: "Commercial", video: "/videos/raz-showreel-2.mp4" },
  { label: "Product Film", video: "/videos/raz-showreel-5.mp4" },
  { label: "Photography", video: "/videos/raz-showreel.mp4" },
  { label: "UGC", video: "/videos/raz-showreel-4.mp4" },
  { label: "Reels", video: "/videos/raz-showreel-7.mp4" },
  { label: "Stories", video: "/videos/second-skin.mp4" },
  { label: "Paid Ads", video: "/videos/no-address.mp4" },
  { label: "Key Visuals", video: "/videos/raz-showreel-2.mp4" },
]

const PAIN_ITEMS = [
  "לוקיישנים שקשה, יקר או בלתי אפשרי להגיע אליהם",
  "סטים ותפאורה שדורשים זמן ותקציב הפקה מלא",
  "אפקטים ופוסט־פרודקשן מורכבים שדורשים חברה נפרדת",
  "וריאציות נוספות שמשמעותן עוד יום צילום",
  "רעיון גדול מהתקציב שיש בפועל לפרויקט",
]

const SOLUTION_ITEMS = [
  "מיקום המוצר כמעט בכל עולם ויזואלי שרוצים",
  "בדיקת כמה כיווני קריאייטיב באותו תהליך",
  "וריאציות מהירות לקמפיינים ולפורמטים שונים",
  "הפקה שנשארת בתוך התקציב בלי לוותר על הרעיון",
  "הפיכת רעיון שנשאר על ה-Moodboard לתוכן אמיתי",
]

const WORKFLOW = [
  { n: "01", title: "Brief", text: "מבינים את המותג, המוצר, הקהל והמטרה." },
  { n: "02", title: "Concept", text: "מפתחים קונספט, Hooks, Storyboard ושפה ויזואלית." },
  { n: "03", title: "AI Production", text: "יוצרים את הסצנות, הדמויות, המוצרים והעולם הוויזואלי." },
  { n: "04", title: "Motion", text: "הופכים את הפריימים לשוטים ומייצרים תנועה שמתאימה לסיפור." },
  { n: "05", title: "Post Production", text: "עריכה, Sound Design, Voice, Lip Sync, Upscale, Color ו-Finishing." },
  { n: "06", title: "Delivery", text: "מקבלים תוצרים מוכנים לפרסום בפורמטים שהקמפיין צריך." },
]

const INDUSTRIES = [
  { name: "E-commerce", items: ["Product Videos", "Product Photography", "UGC", "Paid Ads", "Social Variations"] },
  { name: "Fashion", items: ["Lookbook Films", "Campaign Visuals", "Editorial Shots", "Social Reels", "Key Visuals"] },
  { name: "Beauty", items: ["Product Films", "Texture & Macro Shots", "UGC Demos", "Social Reels", "Campaign Visuals"] },
  { name: "Automotive", items: ["Launch Films", "Feature Videos", "Impossible Locations", "Social Reels", "Product Shots"] },
  { name: "Real Estate", items: ["Property Films", "Lifestyle Campaigns", "Architectural Visuals", "Social Ads", "Concept Environments"] },
  { name: "Hospitality", items: ["Brand Films", "Destination Visuals", "Social Reels", "Campaign Assets", "Key Visuals"] },
  { name: "Food & Beverage", items: ["Product Films", "Food Visuals", "Social Reels", "UGC", "Campaign Assets"] },
  { name: "Tech", items: ["Product Films", "Feature Explainers", "Social Reels", "Campaign Visuals", "Key Visuals"] },
]

const DELIVERABLES = ["9:16 Reels / TikTok", "1:1 Social", "4:5 Feed", "16:9 Campaign", "Still Images", "Product Shots", "UGC Variations", "Ad Variations"]

const FAQS = [
  {
    q: "האם כל הסרטון נוצר באמצעות AI?",
    a: "לא בהכרח. כל פרויקט נבנה לפי מה שהתוצאה דורשת ויכול לשלב AI, חומרי מותג קיימים, עריכה, Motion, Voice, Sound Design וכלי Post Production נוספים.",
  },
  {
    q: "אפשר להשתמש במוצר האמיתי שלנו?",
    a: "כן. ניתן לעבוד עם תמונות וחומרי מוצר קיימים ולבנות סביבם סצנות ותוכן חדש, בהתאם לסוג המוצר והפרויקט.",
  },
  {
    q: "אפשר ליצור מספר גרסאות לאותה פרסומת?",
    a: "כן. אחד היתרונות המשמעותיים בתהליך הוא האפשרות לפתח וריאציות של קונספטים, Hooks, פורמטים ושוטים.",
  },
  {
    q: "אתם עושים גם UGC?",
    a: "כן. ניתן ליצור תוכן UGC, Talking Head, הדגמות מוצר ותוכן Native שמתאים לפלטפורמות חברתיות.",
  },
  {
    q: "אפשר ליצור רק תמונות בלי סרטון?",
    a: "כן. השירות כולל גם AI Photography, צילומי מוצר, Key Visuals ונכסים לקמפיינים.",
  },
  {
    q: "באילו פורמטים מקבלים את התוצרים?",
    a: "הפורמטים נקבעים לפי הפרויקט ויכולים לכלול 9:16, 4:5, 1:1 ו-16:9 עבור Social, Ads, Websites וקמפיינים.",
  },
]

const pillBase = "font-mono text-xs uppercase tracking-wide rounded-full px-4 py-2 border transition-colors"
const pillActive = "border-[#D1FE17] bg-[#D1FE17] text-black"
const pillInactive = "border-white/15 text-dim hover:border-[#D1FE17]"

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <div className="font-mono text-xs uppercase tracking-[0.15em] text-dim mb-4">{children}</div>
}

function PrimaryCta({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="inline-block font-mono text-sm uppercase tracking-wide bg-[#D1FE17] text-black rounded-full px-7 py-3.5 hover:scale-105 transition-transform"
    >
      {children}
    </a>
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
      className={`inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wide border border-white/20 rounded-full px-5 py-3.5 hover:border-[#D1FE17] hover:text-[#D1FE17] transition-colors ${className}`}
    >
      <WhatsAppIcon className="w-4 h-4" />
      וואטסאפ
    </a>
  )
}

function RazSignature() {
  return (
    <div className="flex items-center justify-center gap-3">
      <div className="w-12 h-12 rounded-full overflow-hidden bg-neutral-900 flex-none">
        <img src="/images/raz-portrait.jpeg" alt="רז אברמוב" className="w-full h-full object-cover grayscale" />
      </div>
      <div className="text-right">
        <div className="font-display font-medium text-sm">רז אברמוב</div>
        <div className="font-mono text-[10px] uppercase tracking-wide text-dim">מייסד הסטודיו</div>
      </div>
    </div>
  )
}

function MobileCta() {
  return (
    <div
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 grid grid-cols-2 border-t border-white/10 bg-background/95 backdrop-blur-xl"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <a
        href={`${SITE}/contact`}
        className="flex items-center justify-center py-3.5 font-mono text-xs uppercase tracking-wide border-l border-white/10 bg-[#D1FE17] text-black"
      >
        יצירת קשר
      </a>
      <a
        href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`}
        target="_blank"
        rel="noreferrer"
        className="flex items-center justify-center gap-2 py-3.5 font-mono text-xs uppercase tracking-wide"
      >
        <WhatsAppIcon className="w-4 h-4" />
        WhatsApp
      </a>
    </div>
  )
}

function PainRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex-none w-5 h-5 rounded-full border border-white/20 flex items-center justify-center text-dim text-[11px] leading-none">
        ✕
      </span>
      <p className="text-base md:text-lg text-foreground/65 leading-relaxed">{children}</p>
    </div>
  )
}

function SolutionRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex-none w-5 h-5 rounded-full bg-[#D1FE17] flex items-center justify-center text-black text-[11px] leading-none">
        ✓
      </span>
      <p className="text-base md:text-lg text-foreground/95 leading-relaxed">{children}</p>
    </div>
  )
}

function PhoneShowcase() {
  const reduced = useReducedMotion()
  const [index, setIndex] = useState(0)
  const clips = PRODUCT_WORLDS.slice(0, 5)

  useEffect(() => {
    if (reduced) return
    const id = window.setInterval(() => setIndex((i) => (i + 1) % clips.length), 4200)
    return () => clearInterval(id)
  }, [reduced, clips.length])

  const clip = clips[index]

  return (
    <div className="mx-auto w-full max-w-[300px]">
      <div className="relative rounded-[2.2rem] border border-white/15 bg-neutral-950 p-2.5 shadow-2xl shadow-black/40">
        <div className="absolute left-1/2 top-2.5 -translate-x-1/2 w-16 h-4 rounded-full bg-black/80 z-10" />
        <div key={clip.label} className="relative aspect-[9/16] rounded-[1.6rem] overflow-hidden bg-neutral-900 animate-[fadeIn_0.5s_ease]">
          <AutoVideo src={clip.video} className="absolute inset-0 w-full h-full object-cover contrast-[1.05] brightness-[0.9]" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/10" />
          <div className="absolute bottom-4 right-4 left-4 flex items-center justify-between gap-2">
            <span className="font-mono text-[10px] uppercase tracking-wide text-white bg-black/40 backdrop-blur px-2.5 py-1 rounded-full">
              {clip.label}
            </span>
            <span className="w-7 h-7 rounded-full bg-[#D1FE17] flex items-center justify-center flex-none">
              <span className="w-0 h-0 border-y-[5px] border-y-transparent border-r-0 border-l-[7px] border-l-black mr-[-1px]" />
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

function ShowreelHero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-16 md:pt-40 md:pb-24">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#141412] via-[#0b0b0b] to-black" />
      <div className="container grid lg:grid-cols-[1.05fr_0.95fr] gap-12 lg:gap-16 items-center">
        <div>
          <div className="font-mono text-xs uppercase tracking-wide text-dim mb-4 flex items-center gap-2">
            <a href={SITE} className="hover:text-[#D1FE17] transition-colors">בית</a>
            <span>/</span>
            <span className="text-foreground/70">יצירת תוכן ב-AI</span>
          </div>
          <Eyebrow>AI CREATIVE STUDIO</Eyebrow>
          <Reveal>
            <h1 className="font-display font-black text-[clamp(34px,6vw,72px)] leading-[1.05] tracking-tight">
              תוכן שאי אפשר פשוט לגלול מעליו.
            </h1>
          </Reveal>
          <Reveal delay={120}>
            <p className="mt-6 max-w-xl text-dim text-lg md:text-xl leading-relaxed">
              פרסומות, סרטוני מוצר, צילומים, UGC ותוכן לסושיאל — משלבים קריאייטיב, בינה מלאכותית ופוסט-פרודקשן כדי להפוך רעיונות לתוכן שמותגים יכולים באמת להשתמש בו.
            </p>
          </Reveal>
          <Reveal delay={200} className="mt-10 flex flex-wrap items-center gap-4">
            <PrimaryCta href={`${SITE}/contact`}>בואו ניצור משהו ←</PrimaryCta>
            <WhatsAppCta />
            <a href="#work" className="font-mono text-xs uppercase tracking-wide text-dim hover:text-[#D1FE17] transition-colors">
              צפו בעבודות ↓
            </a>
          </Reveal>
          <Reveal delay={240} className="mt-4 flex items-center gap-2 font-mono text-[11px] uppercase tracking-wide text-dim">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D1FE17] flex-none" />
            מענה תוך 24 שעות
          </Reveal>
        </div>
        <Reveal delay={160}>
          <PhoneShowcase />
        </Reveal>
      </div>
    </section>
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
        <Eyebrow>ONE PRODUCT. ENDLESS POSSIBILITIES.</Eyebrow>
        <SectionHeading>מוצר אחד. עולם שלם של תוכן.</SectionHeading>
        <Reveal delay={80}>
          <p className="mt-6 max-w-xl text-dim text-base md:text-lg leading-relaxed">
            תמונה אחת של המוצר יכולה להיות נקודת ההתחלה.
            <br />
            משם אפשר לבנות סביבו קמפיין, סרטוני מוצר, צילומים, Reels, UGC וקריאייטיבים לפרסום — תוך שמירה על אותה שפה מותגית.
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
                  "font-mono text-xs uppercase tracking-wide rounded-full md:rounded-lg px-4 py-2.5 border text-center md:text-right transition-colors",
                  i === active ? pillActive : pillInactive
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

function WhyAiProduction() {
  return (
    <section className="py-28 md:py-40 border-t border-white/10">
      <div className="container">
        <Eyebrow>BEYOND TRADITIONAL PRODUCTION</Eyebrow>
        <SectionHeading className="max-w-2xl">הרעיון לא צריך להיעצר במה שאפשר לצלם.</SectionHeading>

        <div className="mt-14 grid md:grid-cols-2 gap-12 md:gap-16">
          <div>
            <div className="font-mono text-xs uppercase tracking-wide text-dim/70 mb-5">הבעיה</div>
            <div className="flex flex-col gap-4">
              {PAIN_ITEMS.map((item, i) => (
                <Reveal key={item} delay={i * 60}>
                  <PainRow>{item}</PainRow>
                </Reveal>
              ))}
            </div>
          </div>
          <div>
            <div className="font-mono text-xs uppercase tracking-wide text-[#D1FE17] mb-5">הפתרון</div>
            <div className="flex flex-col gap-4">
              {SOLUTION_ITEMS.map((item, i) => (
                <Reveal key={item} delay={PAIN_ITEMS.length * 60 + i * 60}>
                  <SolutionRow>{item}</SolutionRow>
                </Reveal>
              ))}
            </div>
          </div>
        </div>

        <Reveal
          delay={(PAIN_ITEMS.length + SOLUTION_ITEMS.length) * 60 + 100}
          className="mt-20 md:mt-28 border-y border-white/10 py-14 md:py-20"
        >
          <p className="font-display font-black uppercase text-[clamp(28px,6vw,84px)] leading-[1.05] tracking-tight text-center">
            Create what traditional
            <br />
            production can&apos;t.
          </p>
        </Reveal>
      </div>
    </section>
  )
}

function Industries() {
  const [active, setActive] = useState(0)
  const industry = INDUSTRIES[active]

  return (
    <section className="py-28 md:py-40 border-t border-white/10">
      <div className="container">
        <Eyebrow>BUILT FOR BRANDS</Eyebrow>
        <SectionHeading>התוכן משתנה. המטרה לא.</SectionHeading>
        <Reveal delay={80}>
          <p className="mt-6 max-w-xl text-dim text-base md:text-lg leading-relaxed">
            לכל תחום יש מוצר אחר, קהל אחר ושפה אחרת. הקריאייטיב צריך להיבנות בהתאם.
          </p>
        </Reveal>

        <Reveal delay={120} className="flex flex-wrap gap-x-1 gap-y-2 mt-10 border-b border-white/10">
          {INDUSTRIES.map((ind, i) => (
            <button
              key={ind.name}
              onClick={() => setActive(i)}
              className={cn(
                "font-mono text-xs uppercase tracking-wide px-4 py-3 border-b-2 -mb-px transition-colors",
                i === active ? "border-[#D1FE17] text-foreground" : "border-transparent text-dim hover:text-[#D1FE17]"
              )}
            >
              {ind.name}
            </button>
          ))}
        </Reveal>

        <div key={active} className="mt-10 flex flex-wrap gap-3 animate-[fadeIn_0.4s_ease]">
          {industry.items.map((item) => (
            <span key={item} className="border border-white/15 rounded-full px-4 py-2 text-sm text-dim hover:border-[#D1FE17] hover:text-foreground transition-colors">
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}

function CaseStudies({ projects, loading }: { projects: ProjectRow[]; loading: boolean }) {
  return (
    <section className="py-28 md:py-40 border-t border-white/10">
      <div className="container">
        <Eyebrow>CASE STUDIES</Eyebrow>
        <SectionHeading>לא רק פריים יפה. מערכת שלמה סביב הרעיון.</SectionHeading>

        {loading && <div className="mt-16 font-mono text-xs text-dim uppercase">טוען…</div>}

        {!loading && projects.length === 0 && (
          <p className="mt-16 text-dim text-base max-w-md leading-relaxed">
            קייס סטאדיז מלאים בדרך. בינתיים אפשר לצפות בכל העבודות בעמוד הפרויקטים.
          </p>
        )}

        {projects.length > 0 && (
          <div className="mt-16 grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {projects.map((p, i) => (
              <Reveal key={p.slug} delay={i * 80}>
                <a href={`${SITE}/work/${p.slug}`} className="group block relative aspect-[4/5] rounded-lg overflow-hidden bg-neutral-900 border border-transparent hover:border-[#D1FE17] transition-colors">
                  {p.video && (
                    <AutoVideo src={p.video} className="absolute inset-0 w-full h-full object-cover contrast-[1.05] brightness-[0.85] transition-transform duration-500 group-hover:scale-105" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
                  {p.concept && (
                    <span className="absolute top-4 right-4 font-mono text-[10px] uppercase tracking-wide border border-white/30 rounded-full px-2.5 py-1 text-white/80 bg-black/30 backdrop-blur">
                      Spec Work
                    </span>
                  )}
                  <div className="absolute bottom-4 right-4 left-4">
                    <h3 className="font-display font-medium text-lg text-white">{p.title}</h3>
                    <div className="font-mono text-[11px] uppercase tracking-wide text-white/60 mt-1">{p.category}</div>
                  </div>
                </a>
              </Reveal>
            ))}
          </div>
        )}

        {projects.length > 0 && (
          <Reveal delay={200} className="mt-10">
            <a href={`${SITE}/work`} className="inline-block font-mono text-xs uppercase tracking-wide underline underline-offset-4 hover:text-[#D1FE17] transition-colors">
              כל העבודות ←
            </a>
          </Reveal>
        )}
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

export function AILanding() {
  useDocumentMeta(
    "יצירת תוכן AI לעסקים — RAZ",
    "פרסומות, סרטוני מוצר, צילומי AI, UGC ותוכן לסושיאל ברמה מסחרית — קונספט, הפקת AI ופוסט-פרודקשן מקצועי למותגים שרוצים תוכן שאפשר לפרסם."
  )

  const { projects, loading } = useProjects()
  const aiProjects = useMemo(() => projects.filter((p) => p.project_type === "ai"), [projects])
  const caseStudyProjects = useMemo(() => aiProjects.filter((p) => p.featured).slice(0, 3), [aiProjects])
  const featuredCaseStudies = caseStudyProjects.length > 0 ? caseStudyProjects : aiProjects.slice(0, 3)

  const [workFilter, setWorkFilter] = useState("הכל")
  const activeCategories = useMemo(() => {
    const used = new Set<string>()
    aiProjects.forEach((p) => p.categories?.forEach((c) => used.add(c)))
    return PROJECT_CATEGORIES.filter((c) => used.has(c))
  }, [aiProjects])
  const filteredWork = workFilter === "הכל" ? aiProjects : aiProjects.filter((p) => p.categories?.includes(workFilter))

  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: "AI Creative Production",
    name: "יצירת תוכן AI לעסקים",
    description: "פרסומות, סרטוני מוצר, צילומי AI, UGC ותוכן לסושיאל — קונספט, הפקת AI ופוסט-פרודקשן מקצועי למותגים.",
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

      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 md:px-12 py-4 bg-background/40 backdrop-blur-xl border-b border-white/5">
        <a href="/" className="font-display font-bold text-xl tracking-tight">RAZ</a>
        <PrimaryCta href={`${SITE}/contact`}>בואו נתחיל ←</PrimaryCta>
      </nav>

      <ShowreelHero />

      <section id="work" className="py-28 md:py-40 border-t border-white/10">
        <div className="container">
          <Eyebrow>SELECTED WORK</Eyebrow>
          <SectionHeading>פחות לדבר. יותר להראות.</SectionHeading>
          <Reveal delay={80}>
            <p className="mt-6 max-w-xl text-dim text-base md:text-lg leading-relaxed">
              פרסומות, סרטוני מוצר, עולמות ויזואליים ותוכן שנבנה כדי לגרום לאנשים לעצור.
            </p>
          </Reveal>

          {activeCategories.length > 0 && (
            <Reveal delay={120} className="flex flex-wrap gap-2 mt-10">
              <button onClick={() => setWorkFilter("הכל")} className={cn(pillBase, workFilter === "הכל" ? pillActive : pillInactive)}>
                הכל
              </button>
              {activeCategories.map((c) => (
                <button key={c} onClick={() => setWorkFilter(c)} className={cn(pillBase, workFilter === c ? pillActive : pillInactive)}>
                  {c}
                </button>
              ))}
            </Reveal>
          )}

          {loading && <div className="mt-16 font-mono text-xs text-dim uppercase">טוען…</div>}

          {filteredWork.length > 0 && (
            <div key={workFilter} className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-px bg-white/10 border-t border-white/10 animate-[fadeIn_0.3s_ease]">
              {filteredWork.map((p, i) => (
                <Reveal
                  key={p.slug}
                  delay={Math.min(i * 60, 240)}
                  className={cn("bg-background p-8 md:p-10", p.thumb_class === "wide" && "md:col-span-2")}
                >
                  <div className="flex justify-between items-start gap-6 mb-6">
                    <div>
                      <div className="font-mono text-[11px] uppercase tracking-wide text-dim mb-2">
                        {p.number} {p.concept && "· קונספט"}
                      </div>
                      <div className="font-display text-2xl md:text-3xl font-medium">{p.title}</div>
                    </div>
                    <div className="text-right font-mono text-[11px] text-dim uppercase max-w-[220px]">{p.category}</div>
                  </div>
                  <a
                    href={`${SITE}/work/${p.slug}`}
                    className={cn(
                      "block relative overflow-hidden rounded-sm bg-neutral-900 border border-transparent hover:border-[#D1FE17] transition-colors duration-200",
                      p.thumb_class === "wide" ? "aspect-[21/9]" : p.thumb_class === "tall" ? "aspect-[3/4]" : "aspect-[4/3]"
                    )}
                  >
                    {p.video && <AutoVideo src={p.video} className="absolute inset-0 w-full h-full object-cover contrast-[1.05] brightness-[0.85]" />}
                    <span className="absolute bottom-4 right-4 font-mono text-[11px] uppercase tracking-wide text-white/80">צפייה ←</span>
                  </a>
                </Reveal>
              ))}
            </div>
          )}

          {!loading && aiProjects.length === 0 && (
            <p className="mt-16 text-dim text-sm max-w-md leading-relaxed">עבודות AI חדשות עולות בקרוב. בינתיים אפשר לצפות בכל הפרויקטים.</p>
          )}
          {!loading && aiProjects.length > 0 && filteredWork.length === 0 && (
            <p className="mt-16 text-dim text-sm">אין עדיין עבודות בקטגוריה הזו.</p>
          )}

          {aiProjects.length > 0 && (
            <Reveal className="mt-12">
              <a href={`${SITE}/work`} className="inline-block font-mono text-xs uppercase tracking-wide underline underline-offset-4 hover:text-[#D1FE17] transition-colors">
                כל העבודות ←
              </a>
            </Reveal>
          )}
        </div>
      </section>

      <section className="py-28 md:py-40 border-t border-white/10">
        <div className="container">
          <Eyebrow>WHAT CAN WE CREATE?</Eyebrow>
          <SectionHeading>מה אתם רוצים ליצור?</SectionHeading>
          <Reveal delay={80}>
            <p className="mt-6 max-w-xl text-dim text-base md:text-lg leading-relaxed">
              מקמפיין שלם ועד סרטון אחד לפיד — מתחילים במה שהמותג צריך ומרכיבים סביבו את הקריאייטיב הנכון.
            </p>
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-14">
            {FORMATS.map((f, i) => (
              <Reveal key={f.title} delay={Math.min(i * 50, 250)}>
                <a href={f.href} className="group block border border-white/15 rounded-lg p-6 h-full hover:border-[#D1FE17] transition-colors">
                  <div className="font-mono text-xs text-dim mb-3">{String(i + 1).padStart(2, "0")}</div>
                  <h3 className="font-display font-medium text-xl mb-3 group-hover:text-[#D1FE17] transition-colors">{f.title}</h3>
                  <p className="text-dim text-sm leading-relaxed mb-5">{f.body}</p>
                  <div className="flex flex-wrap gap-x-2 gap-y-1 font-mono text-[10px] uppercase tracking-wide text-dim/70">
                    {f.tags.map((t, ti) => (
                      <span key={t}>
                        {t}
                        {ti < f.tags.length - 1 && " ·"}
                      </span>
                    ))}
                  </div>
                </a>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <ProductUniverse />
      <WhyAiProduction />

      <section className="py-28 md:py-40 border-t border-white/10">
        <div className="container">
          <Eyebrow>FROM BRIEF TO DELIVERY</Eyebrow>
          <SectionHeading>לא Prompt. תהליך הפקה.</SectionHeading>
          <Reveal delay={80}>
            <p className="mt-6 max-w-xl text-dim text-base md:text-lg leading-relaxed">
              AI הוא חלק מהכלים. העבודה האמיתית נמצאת במה שקורה לפני ואחרי.
            </p>
          </Reveal>

          <div className="mt-16 flex flex-col gap-8">
            {WORKFLOW.map((s, i) => (
              <Reveal key={s.n} delay={i * 60} className="grid md:grid-cols-[100px_1fr] gap-4 md:gap-10 border-t border-white/10 pt-8">
                <div className="font-mono text-xs text-dim">{s.n}</div>
                <div>
                  <h3 className="font-display font-medium text-lg mb-1">{s.title}</h3>
                  <p className="text-dim text-sm leading-relaxed max-w-xl">{s.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <Industries />
      <CaseStudies projects={featuredCaseStudies} loading={loading} />

      <section className="py-28 md:py-40 border-t border-white/10">
        <div className="container grid md:grid-cols-[1fr_1.2fr] gap-10 md:gap-14 items-start">
          <div>
            <Eyebrow>BUILT TO SHIP</Eyebrow>
            <SectionHeading>תוכן שמגיע מוכן לעבוד.</SectionHeading>
            <Reveal delay={80}>
              <p className="mt-6 text-dim text-base md:text-lg leading-relaxed max-w-md">
                לא מסיימים בפריים יפה. התוצרים מותאמים לערוצים, לפורמטים ולשימושים שהמותג באמת צריך.
              </p>
            </Reveal>
          </div>
          <Reveal delay={120} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {DELIVERABLES.map((d) => (
              <div key={d} className="border border-white/15 rounded-lg px-4 py-5 text-center font-mono text-[11px] uppercase tracking-wide hover:border-[#D1FE17] transition-colors">
                {d}
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="py-28 md:py-40 border-t border-white/10">
        <div className="container">
          <SectionHeading>שאלות נפוצות</SectionHeading>
          <div className="mt-12 max-w-2xl">
            {FAQS.map((f) => (
              <FaqItem key={f.q} q={f.q} a={f.a} />
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="py-28 md:py-36 border-t border-white/10 text-center">
        <div className="container">
          <Eyebrow>HAVE AN IDEA?</Eyebrow>
          <SectionHeading
            className="max-w-2xl"
            headingClassName="font-display font-bold text-[clamp(26px,5.6vw,64px)] leading-[1.25] tracking-tight"
          >
            בואו נעשה משהו שאי אפשר להתעלם ממנו.
          </SectionHeading>
          <Reveal delay={100}>
            <p className="mt-6 max-w-xl mx-auto text-dim text-base md:text-lg leading-relaxed">
              יש מוצר, מותג או אפילו רק רעיון? ספרו לי מה אתם רוצים ליצור ונבין יחד איך להפוך אותו לקריאייטיב.
            </p>
          </Reveal>
          <Reveal delay={150}>
            <div className="mt-8">
              <RazSignature />
            </div>
          </Reveal>
          <Reveal delay={200} className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <PrimaryCta href={`${SITE}/contact`}>בואו נדבר ←</PrimaryCta>
            <WhatsAppCta />
            <a href="#work" className="font-mono text-xs uppercase tracking-wide text-dim hover:text-[#D1FE17] transition-colors">
              צפו בעבודות ↓
            </a>
          </Reveal>
          <Reveal delay={240} className="mt-5 flex items-center justify-center gap-2 font-mono text-[11px] uppercase tracking-wide text-dim">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D1FE17] flex-none" />
            מענה תוך 24 שעות
          </Reveal>
        </div>
      </section>

      <footer className="border-t border-white/10 py-10 text-center font-mono text-[11px] text-dim uppercase tracking-wide">
        © RAZ / Raz Avramov
      </footer>
      <div className="h-16 md:hidden" aria-hidden="true" />
      <WhatsAppButton />
      <MobileCta />
    </div>
  )
}
