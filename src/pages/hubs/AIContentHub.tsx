import { useEffect, useId, useMemo, useRef, useState } from "react"
import { Link } from "react-router-dom"
import type { ProjectRow } from "@/lib/supabase"
import { PROJECT_CATEGORIES } from "@/lib/supabase"
import { useProjects } from "@/hooks/useProjects"
import { useDocumentMeta } from "@/hooks/useDocumentMeta"
import { useWhatsAppMessage } from "@/hooks/useWhatsAppMessage"
import { useReducedMotion } from "@/hooks/useReducedMotion"
import { Reveal } from "@/components/Reveal"
import { AutoVideo } from "@/components/AutoVideo"
import { cn } from "@/lib/utils"

const SHOWREEL = [
  "/videos/raz-showreel-2.mp4",
  "/videos/raz-showreel-5.mp4",
  "/videos/raz-showreel-7.mp4",
  "/videos/raz-showreel-4.mp4",
  "/videos/raz-showreel.mp4",
]

const FORMATS: { title: string; body: string; tags: string[]; href: string }[] = [
  {
    title: "AI Commercials",
    body: "פרסומות וסרטוני מותג שמחברים רעיון, Storytelling, Motion וסאונד לתוצר אחד שלם.",
    tags: ["Brand Films", "Product Ads", "Campaigns"],
    href: "/contact",
  },
  {
    title: "Product Content",
    body: "לוקחים מוצר אמיתי ובונים סביבו סצנות, לוקיישנים ועולמות שקשה, יקר או בלתי אפשרי לצלם בדרך המסורתית.",
    tags: ["Product Videos", "Launches", "Social Assets"],
    href: "/services/ai-content/product-videos",
  },
  {
    title: "AI Photography",
    body: "צילומי מוצר וקמפיין ללא המגבלות של סטודיו פיזי אחד.",
    tags: ["Product", "Fashion", "Lifestyle", "Key Visuals"],
    href: "/services/ai-content/ai-photography",
  },
  {
    title: "Social Content",
    body: "Reels, TikTok, Stories וקריאייטיבים שנבנו במיוחד לצריכה מהירה בסושיאל.",
    tags: ["Reels", "TikTok", "Stories", "Paid Social"],
    href: "/services/ai-content/social-content",
  },
  {
    title: "AI UGC",
    body: "תוכן שמרגיש טבעי לפיד — Talking Head, הדגמות מוצר, Hooks, Testimonials וקריאייטיבים לפרפורמנס.",
    tags: ["UGC", "Hooks", "Product Demos", "Variations"],
    href: "/contact",
  },
  {
    title: "Creative Campaigns",
    body: "מהרעיון הראשוני ועד סט שלם של נכסים לקמפיין אחד עם שפה ויזואלית עקבית.",
    tags: ["Concept", "Direction", "Production", "Delivery"],
    href: "/services/ai-content/campaign-visuals",
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

const WHY_LINES = [
  "הפקה מסורתית עדיין מצוינת כשצריך אותה.",
  "אבל יש רעיונות שדורשים לוקיישנים, סטים, אפקטים, וריאציות או תקציבים שהופכים אותם ללא פרקטיים.",
  "AI פותח אפשרות אחרת.",
  "למקם מוצר כמעט בכל עולם.",
  "לבדוק כמה כיוונים יצירתיים.",
  "לייצר וריאציות לקמפיינים שונים.",
  "ולקחת רעיון שהיה נשאר על ה-Moodboard ולהפוך אותו לתוכן שאפשר לראות, לערוך ולפרסם.",
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

function PrimaryCta({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="inline-block font-mono text-sm uppercase tracking-wide bg-[#D1FE17] text-black rounded-full px-7 py-3.5 hover:scale-105 transition-transform"
    >
      {children}
    </Link>
  )
}

function ShowreelHero() {
  const reduced = useReducedMotion()
  const videoARef = useRef<HTMLVideoElement>(null)
  const videoBRef = useRef<HTMLVideoElement>(null)
  const stateRef = useRef<{ showing: HTMLVideoElement | null; hidden: HTMLVideoElement | null }>({
    showing: null,
    hidden: null,
  })

  useEffect(() => {
    if (reduced) return
    const videoA = videoARef.current
    const videoB = videoBRef.current
    if (!videoA || !videoB) return

    let index = 0
    stateRef.current.showing = videoA
    stateRef.current.hidden = videoB
    let hiddenReady = false
    let cancelled = false

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

    function preloadNext() {
      hiddenReady = false
      const nextIndex = (index + 1) % SHOWREEL.length
      const hidden = stateRef.current.hidden!
      loadInto(hidden, SHOWREEL[nextIndex], () => {
        hiddenReady = true
      })
    }

    function crossfade() {
      const swap = () => {
        if (cancelled) return
        const showing = stateRef.current.showing!
        const hidden = stateRef.current.hidden!
        index = (index + 1) % SHOWREEL.length
        hidden.currentTime = 0
        hidden.play().catch(() => {})
        hidden.style.opacity = "1"
        showing.style.opacity = "0"
        stateRef.current.showing = hidden
        stateRef.current.hidden = showing
        preloadNext()
      }
      if (hiddenReady) swap()
      else {
        const wait = setInterval(() => {
          if (hiddenReady || cancelled) {
            clearInterval(wait)
            swap()
          }
        }, 80)
      }
    }

    loadInto(stateRef.current.showing, SHOWREEL[index], () => {
      stateRef.current.showing?.play().catch(() => {})
      if (stateRef.current.showing) stateRef.current.showing.style.opacity = "1"
      preloadNext()
    })

    const id = window.setInterval(crossfade, 4200)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [reduced])

  return (
    <section className="relative min-h-[100dvh] overflow-hidden flex flex-col justify-center pt-24">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-[#141412] via-[#0b0b0b] to-black" />
        {!reduced && (
          <>
            <video
              ref={videoARef}
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-[1200ms] ease-linear contrast-[1.05] brightness-[0.85]"
            />
            <video
              ref={videoBRef}
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-[1200ms] ease-linear contrast-[1.05] brightness-[0.85]"
            />
          </>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/40" />
      </div>
      <div className="container">
        <Eyebrow>AI CREATIVE STUDIO</Eyebrow>
        <Reveal>
          <h1 className="font-display font-black text-[clamp(36px,7vw,88px)] leading-[1.02] tracking-tight max-w-4xl">
            תוכן שאי אפשר פשוט לגלול מעליו.
          </h1>
        </Reveal>
        <Reveal delay={120}>
          <p className="mt-6 max-w-2xl text-dim text-lg md:text-xl leading-relaxed">
            פרסומות, סרטוני מוצר, צילומים, UGC ותוכן לסושיאל — משלבים קריאייטיב, בינה מלאכותית ופוסט-פרודקשן כדי להפוך רעיונות לתוכן שמותגים יכולים באמת להשתמש בו.
          </p>
        </Reveal>
        <Reveal delay={200} className="mt-10 flex flex-wrap items-center gap-6">
          <PrimaryCta to="/contact">בואו ניצור משהו ←</PrimaryCta>
          <a href="#work" className="font-mono text-xs uppercase tracking-wide text-dim hover:text-[#D1FE17] transition-colors">
            צפו בעבודות ↓
          </a>
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
        <Reveal>
          <h2 className="font-display font-medium text-[clamp(26px,4vw,46px)] leading-[1.15] tracking-tight">
            מוצר אחד. עולם שלם של תוכן.
          </h2>
        </Reveal>
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
        <Reveal>
          <h2 className="font-display font-medium text-[clamp(26px,4vw,46px)] leading-[1.15] tracking-tight max-w-2xl">
            הרעיון לא צריך להיעצר במה שאפשר לצלם.
          </h2>
        </Reveal>

        <div className="mt-12 flex flex-col gap-3 max-w-2xl">
          {WHY_LINES.map((line, i) => (
            <Reveal key={line} delay={i * 70}>
              <p className="text-lg md:text-2xl font-display font-light leading-snug text-foreground/90">{line}</p>
            </Reveal>
          ))}
        </div>

        <Reveal delay={WHY_LINES.length * 70 + 100} className="mt-20 md:mt-28 border-y border-white/10 py-14 md:py-20">
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
        <Reveal>
          <h2 className="font-display font-medium text-[clamp(26px,4vw,46px)] leading-[1.15] tracking-tight">
            התוכן משתנה. המטרה לא.
          </h2>
        </Reveal>
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
        <Reveal>
          <h2 className="font-display font-medium text-[clamp(26px,4vw,46px)] leading-[1.15] tracking-tight">
            לא רק פריים יפה. מערכת שלמה סביב הרעיון.
          </h2>
        </Reveal>

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
                <Link to={`/work/${p.slug}`} className="group block relative aspect-[4/5] rounded-lg overflow-hidden bg-neutral-900 border border-transparent hover:border-[#D1FE17] transition-colors">
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
                </Link>
              </Reveal>
            ))}
          </div>
        )}

        {projects.length > 0 && (
          <Reveal delay={200} className="mt-10">
            <Link to="/work" className="inline-block font-mono text-xs uppercase tracking-wide underline underline-offset-4 hover:text-[#D1FE17] transition-colors">
              כל העבודות ←
            </Link>
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

export function AIContentHub() {
  useDocumentMeta(
    "יצירת תוכן AI לעסקים — RAZ",
    "פרסומות, סרטוני מוצר, צילומי AI, UGC ותוכן לסושיאל ברמה מסחרית — קונספט, הפקת AI ופוסט-פרודקשן מקצועי למותגים שרוצים תוכן שאפשר לפרסם."
  )
  useWhatsAppMessage("היי, אני מתעניין בהפקת תוכן קריאייטיבי ב-AI למותג שלי.")

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

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "שירותים", item: "https://madebyraz.co.il/services" },
      { "@type": "ListItem", position: 2, name: "יצירת תוכן ב-AI", item: "https://madebyraz.co.il/services/ai-content" },
    ],
  }

  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: "AI Creative Production",
    name: "יצירת תוכן AI לעסקים",
    description: "פרסומות, סרטוני מוצר, צילומי AI, UGC ותוכן לסושיאל — קונספט, הפקת AI ופוסט-פרודקשן מקצועי למותגים.",
    provider: { "@type": "Person", name: "Raz Avramov" },
    areaServed: "IL",
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
    <>
      <script type="application/ld+json">{JSON.stringify(breadcrumbJsonLd)}</script>
      <script type="application/ld+json">{JSON.stringify(serviceJsonLd)}</script>
      <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>

      <ShowreelHero />

      <section id="work" className="py-28 md:py-40 border-t border-white/10">
        <div className="container">
          <Eyebrow>SELECTED WORK</Eyebrow>
          <Reveal>
            <h2 className="font-display font-medium text-[clamp(26px,4vw,46px)] leading-[1.15] tracking-tight">
              פחות לדבר. יותר להראות.
            </h2>
          </Reveal>
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
                  <Link
                    to={`/work/${p.slug}`}
                    className={cn(
                      "block relative overflow-hidden rounded-sm bg-neutral-900 border border-transparent hover:border-[#D1FE17] transition-colors duration-200",
                      p.thumb_class === "wide" ? "aspect-[21/9]" : p.thumb_class === "tall" ? "aspect-[3/4]" : "aspect-[4/3]"
                    )}
                  >
                    {p.video && <AutoVideo src={p.video} className="absolute inset-0 w-full h-full object-cover contrast-[1.05] brightness-[0.85]" />}
                    <span className="absolute bottom-4 right-4 font-mono text-[11px] uppercase tracking-wide text-white/80">צפייה ←</span>
                  </Link>
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
              <Link to="/work" className="inline-block font-mono text-xs uppercase tracking-wide underline underline-offset-4 hover:text-[#D1FE17] transition-colors">
                כל העבודות ←
              </Link>
            </Reveal>
          )}
        </div>
      </section>

      <section className="py-28 md:py-40 border-t border-white/10">
        <div className="container">
          <Eyebrow>WHAT CAN WE CREATE?</Eyebrow>
          <Reveal>
            <h2 className="font-display font-medium text-[clamp(26px,4vw,46px)] leading-[1.15] tracking-tight">
              מה אתם רוצים ליצור?
            </h2>
          </Reveal>
          <Reveal delay={80}>
            <p className="mt-6 max-w-xl text-dim text-base md:text-lg leading-relaxed">
              מקמפיין שלם ועד סרטון אחד לפיד — מתחילים במה שהמותג צריך ומרכיבים סביבו את הקריאייטיב הנכון.
            </p>
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-14">
            {FORMATS.map((f, i) => (
              <Reveal key={f.title} delay={Math.min(i * 50, 250)}>
                <Link to={f.href} className="group block border border-white/15 rounded-lg p-6 h-full hover:border-[#D1FE17] transition-colors">
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
                </Link>
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
          <Reveal>
            <h2 className="font-display font-medium text-[clamp(26px,4vw,46px)] leading-[1.15] tracking-tight">
              לא Prompt. תהליך הפקה.
            </h2>
          </Reveal>
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
            <Reveal>
              <h2 className="font-display font-medium text-[clamp(26px,4vw,46px)] leading-[1.15] tracking-tight">
                תוכן שמגיע מוכן לעבוד.
              </h2>
            </Reveal>
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
          <Reveal>
            <h2 className="font-display font-medium text-[clamp(26px,4vw,46px)] leading-[1.15] tracking-tight">
              שאלות נפוצות
            </h2>
          </Reveal>
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
          <Reveal>
            <h2 className="font-display font-bold text-[clamp(30px,5.6vw,64px)] leading-[1.15] tracking-tight max-w-2xl mx-auto">
              בואו נעשה משהו שאי אפשר להתעלם ממנו.
            </h2>
          </Reveal>
          <Reveal delay={100}>
            <p className="mt-6 max-w-xl mx-auto text-dim text-base md:text-lg leading-relaxed">
              יש מוצר, מותג או אפילו רק רעיון? ספרו לי מה אתם רוצים ליצור ונבין יחד איך להפוך אותו לקריאייטיב.
            </p>
          </Reveal>
          <Reveal delay={180} className="mt-10 flex flex-wrap items-center justify-center gap-6">
            <PrimaryCta to="/contact">בואו נדבר ←</PrimaryCta>
            <a href="#work" className="font-mono text-xs uppercase tracking-wide text-dim hover:text-[#D1FE17] transition-colors">
              צפו בעבודות ↓
            </a>
          </Reveal>
        </div>
      </section>
    </>
  )
}
