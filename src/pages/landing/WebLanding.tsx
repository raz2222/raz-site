import { useEffect, useId, useMemo, useRef, useState } from "react"
import type { ProjectRow } from "@/lib/supabase"
import { PROJECT_CATEGORIES } from "@/lib/supabase"
import { useProjects } from "@/hooks/useProjects"
import { useDocumentMeta } from "@/hooks/useDocumentMeta"
import { useReducedMotion } from "@/hooks/useReducedMotion"
import { Reveal } from "@/components/Reveal"
import { SectionHeading } from "@/components/SectionHeading"
import { AutoVideo } from "@/components/AutoVideo"
import { WhatsAppButton } from "@/components/WhatsAppButton"
import { cn } from "@/lib/utils"

const SITE = "https://madebyraz.co.il"
const WHATSAPP_NUMBER = "972506944443"
const WHATSAPP_MESSAGE = "היי, אני מתעניין בבניית אתר לעסק שלי."

const SERVICES: { title: string; body: string; href: string }[] = [
  { title: "Web Design", body: "עיצוב ממשקים שמחברים בין הזהות של המותג לבין חוויית שימוש ברורה.", href: `${SITE}/services/web-design/site-design` },
  { title: "WordPress Development", body: "פיתוח WordPress גמיש, דינמי ונוח לניהול.", href: `${SITE}/services/web-design/wordpress-development` },
  { title: "AI Web Development", body: "פיתוח אתרים וחוויות Custom באמצעות כלי AI ותהליכי פיתוח מודרניים.", href: `${SITE}/services/web-design/custom-development` },
  { title: "Interactive Websites", body: "אנימציות, Scroll Experiences ואינטראקציות שהופכות אתר לחוויה.", href: `${SITE}/services/web-design/interactive-websites` },
  { title: "E-commerce", body: "חנויות ומערכות מכירה שמחברות בין מוצר, UX ותהליך רכישה ברור.", href: `${SITE}/services/web-design/ecommerce` },
  { title: "Landing Pages", body: "עמודים ממוקדים לקמפיינים, מוצרים ושירותים עם מטרה אחת ברורה.", href: `${SITE}/services/web-design/landing-pages` },
  { title: "Maintenance", body: "תחזוקה, שיפורים, ביצועים, תיקונים ופיתוח מתמשך.", href: `${SITE}/contact` },
  { title: "Integrations & Automations", body: "חיבור האתר ל-CRM, טפסים, APIs, מערכות תשלום, אוטומציות ושירותים חיצוניים.", href: `${SITE}/contact` },
]

const WORDPRESS_PANEL = {
  key: "wp" as const,
  label: "WordPress",
  headline: "גמישות. ניהול. מערכת שעובדת לאורך זמן.",
  body: "WordPress מתאים לפרויקטים שדורשים מערכת ניהול תוכן חזקה, אינטגרציות, WooCommerce, אזורים דינמיים ויכולת לנהל ולהרחיב את האתר לאורך זמן.",
  bestFor: ["אתרי תדמית", "WooCommerce", "אתרי תוכן", "מערכות עם CMS", "אתרים דינמיים", "פרויקטים עם אינטגרציות"],
}

const AI_PANEL = {
  key: "ai" as const,
  label: "AI-Built Websites",
  headline: "פחות תבניות. יותר חופש.",
  body: "פיתוח בעזרת AI מאפשר לבנות חוויות Custom שלא חייבות להיכנס למבנה של Theme או Builder — עם יותר חופש באנימציה, אינטראקציה, ממשקים והתנהגות ייחודית.",
  bestFor: ["Creative Websites", "Interactive Experiences", "Landing Pages", "Product Launches", "Custom Interfaces", "Web Apps"],
}

const PAIN_ITEMS = [
  "מבקרים לא מבינים תוך שניות מי אתם ומה אתם מציעים",
  "אין קריאה לפעולה ברורה — לא ברור מה לעשות עכשיו",
  "העיצוב יפה אבל האתר איטי או לא נוח במובייל",
  "אין מבנה שמאפשר ל-Google להבין ולדרג את התוכן",
  "אין דרך פשוטה לעדכן תוכן בלי לפנות למפתח",
]

const SOLUTION_ITEMS = [
  "מסר שמובן תוך שניות ומוביל ישר לפעולה",
  "מהירות טעינה וחוויית מובייל שלא מאבדת מבקרים",
  "מבנה תוכן ו-SEO טכני נכון מהיסוד",
  "טפסים, Analytics ו-Integrations שמחוברים נכון",
  "מערכת ניהול שמאפשרת לעדכן תוכן באופן עצמאי",
]

const PROCESS = [
  { n: "01", title: "Discovery", text: "מבינים את העסק, הקהל, המטרות והדרישות." },
  { n: "02", title: "Structure", text: "בונים Sitemap, היררכיית תוכן ו-User Flow." },
  { n: "03", title: "Design", text: "מפתחים את השפה הוויזואלית ואת חוויית המשתמש." },
  { n: "04", title: "Development", text: "בוחרים את ה-Stack המתאים ובונים את האתר." },
  { n: "05", title: "Content & Integrations", text: "מכניסים תוכן ומחברים טפסים, מערכות, Analytics ואוטומציות." },
  { n: "06", title: "QA", text: "בודקים Mobile, Desktop, Browsers, Performance וטפסים." },
  { n: "07", title: "Launch", text: "מעלים את האתר, מחברים Domain, Analytics ו-SEO essentials." },
  { n: "08", title: "Grow", text: "האתר יכול להמשיך להשתפר ולהתפתח גם אחרי העלייה לאוויר." },
]

const UNDER_THE_HOOD = [
  { title: "Responsive Development", body: 'מותאם למסכים שונים ולא רק "מוקטן למובייל".' },
  { title: "Performance", body: "מבנה ופיתוח שמטרתם לשמור על חוויית שימוש מהירה." },
  { title: "SEO Foundations", body: "Semantic structure, metadata, headings, indexability ו-technical foundations." },
  { title: "CMS", body: "מערכת ניהול שמתאימה לתוכן שהעסק באמת צריך לערוך." },
  { title: "Analytics", body: "אפשרות לחיבור Analytics, Tag Manager ומדידה בהתאם לפרויקט." },
  { title: "Forms & Leads", body: "טפסים ותהליכי פנייה שמתחברים למערכות הרלוונטיות." },
  { title: "Integrations", body: "APIs, CRM, payments ושירותים חיצוניים." },
  { title: "Security & Maintenance", body: "עדכונים, גיבויים ותחזוקה בהתאם לטכנולוגיה ולחבילת השירות." },
]

const WORDPRESS_CAPS = ["Custom Design", "Elementor", "ACF", "Custom Post Types", "WooCommerce", "Dynamic Content", "REST APIs", "Third-party Integrations", "SEO", "Performance", "Maintenance"]

const ECOMMERCE_ITEMS = ["Product Architecture", "WooCommerce", "Product Pages", "Cart & Checkout", "Payment Integrations", "Shipping", "Dynamic Content", "Tracking", "Mobile UX"]

const FAQS = [
  {
    q: "כמה זמן לוקח לבנות אתר?",
    a: "זה תלוי בהיקף, בכמות העמודים, בתוכן, באינטגרציות ובמורכבות הפיתוח. לאחר אפיון הפרויקט ניתן להגדיר Scope ולוח זמנים מסודר.",
  },
  {
    q: "אתם בונים ב-WordPress או ב-AI?",
    a: "שניהם. הטכנולוגיה נבחרת לפי הצרכים של הפרויקט. WordPress מתאים מאוד לאתרים שדורשים CMS, WooCommerce וניהול שוטף, בעוד שפיתוח Custom בעזרת AI יכול להתאים לחוויות אינטראקטיביות וממשקים ייחודיים.",
  },
  {
    q: "האם אוכל לערוך את האתר בעצמי?",
    a: "בפרויקטים הכוללים CMS, האתר נבנה כך שניתן יהיה לנהל את אזורי התוכן שהוגדרו מראש.",
  },
  {
    q: "אתם גם מעצבים את האתר?",
    a: "כן. השירות יכול לכלול אפיון, UX/UI, עיצוב ופיתוח ולא רק את שלב הקוד.",
  },
  {
    q: "אתם עושים חנויות?",
    a: "כן. ניתן לבנות חנויות WooCommerce ולחבר תשלומים, משלוחים, מוצרים ואינטגרציות בהתאם לצורכי העסק.",
  },
  {
    q: "מה קורה אחרי שהאתר עולה?",
    a: "ניתן להמשיך לתחזוקה, שיפורים ופיתוח מתמשך בהתאם לצורך ולחבילת השירות.",
  },
  {
    q: "אתם מטפלים גם ב-SEO?",
    a: "האתרים נבנים עם תשתית SEO טכנית ותוכנית בסיסית נכונה. שירות SEO מתמשך, מחקר מילות מפתח או יצירת תוכן רחבה הם Scope נפרד אם נדרש.",
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

function WebsiteShowcase({ projects, loading }: { projects: ProjectRow[]; loading: boolean }) {
  const reduced = useReducedMotion()
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (reduced || projects.length < 2) return
    const id = window.setInterval(() => setIndex((i) => (i + 1) % projects.length), 4500)
    return () => clearInterval(id)
  }, [reduced, projects.length])

  const project = projects[index] ?? null

  return (
    <div className="w-full rounded-lg border border-white/15 overflow-hidden bg-neutral-950 shadow-2xl shadow-black/40">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-white/[0.03]">
        <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
        <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
        <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
        <span className="mr-2 font-mono text-[10px] text-dim truncate" dir="ltr">
          {project?.live_url ? project.live_url.replace(/^https?:\/\//, "") : "madebyraz.co.il"}
        </span>
      </div>
      <div key={project?.slug ?? "empty"} className="relative aspect-[16/10] bg-neutral-900 animate-[fadeIn_0.5s_ease]">
        {project?.video ? (
          <AutoVideo src={project.video} className="absolute inset-0 w-full h-full object-cover contrast-[1.05] brightness-[0.9]" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-neutral-800 to-neutral-950 flex items-center justify-center">
            {!loading && <span className="font-mono text-xs text-dim uppercase">אתרים חדשים בדרך</span>}
          </div>
        )}
      </div>
      {project && (
        <div className="px-4 py-3 border-t border-white/10 font-mono text-[11px] uppercase tracking-wide text-dim flex items-center justify-between gap-3">
          <span className="truncate">{project.title}</span>
          <span className="text-white/40 flex-none">{project.category}</span>
        </div>
      )}
    </div>
  )
}

function Hero({ projects, loading }: { projects: ProjectRow[]; loading: boolean }) {
  return (
    <section className="relative overflow-hidden pt-32 pb-16 md:pt-40 md:pb-24">
      <div className="container grid lg:grid-cols-[1.05fr_0.95fr] gap-12 lg:gap-16 items-center">
        <div>
          <Eyebrow>WEB DESIGN &amp; DEVELOPMENT</Eyebrow>
          <Reveal>
            <h1 className="font-display font-black text-[clamp(34px,6vw,72px)] leading-[1.05] tracking-tight">
              אתרים שלא רק נראים טוב. הם עובדים.
            </h1>
          </Reveal>
          <Reveal delay={120}>
            <p className="mt-6 max-w-xl text-dim text-lg md:text-xl leading-relaxed">
              אפיון, עיצוב ופיתוח אתרים שמחברים בין מותג, חוויית משתמש וטכנולוגיה — מ-WordPress ו-WooCommerce ועד אתרים אינטראקטיביים שנבנים עם AI.
            </p>
          </Reveal>
          <Reveal delay={200} className="mt-10 flex flex-wrap items-center gap-4">
            <PrimaryCta href={`${SITE}/contact`}>בואו נבנה משהו ←</PrimaryCta>
            <WhatsAppCta />
            <a href="#work" className="font-mono text-xs uppercase tracking-wide text-dim hover:text-[#D1FE17] transition-colors">
              צפו באתרים ↓
            </a>
          </Reveal>
          <Reveal delay={240} className="mt-4 flex items-center gap-2 font-mono text-[11px] uppercase tracking-wide text-dim">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D1FE17] flex-none" />
            מענה תוך 24 שעות
          </Reveal>
        </div>
        <Reveal delay={160}>
          <WebsiteShowcase projects={projects} loading={loading} />
        </Reveal>
      </div>
    </section>
  )
}

function TwoWaysToBuild() {
  const [hovered, setHovered] = useState<"wp" | "ai" | null>(null)

  return (
    <section className="py-28 md:py-40 border-t border-white/10">
      <div className="container">
        <Eyebrow>THE RIGHT STACK FOR THE JOB</Eyebrow>
        <SectionHeading>WordPress או AI?</SectionHeading>
        <Reveal delay={80}>
          <p className="mt-6 max-w-xl text-dim text-base md:text-lg leading-relaxed">
            אין פלטפורמה אחת שנכונה לכל פרויקט.
            <br />
            בוחרים את הטכנולוגיה לפי מה שהאתר צריך לעשות — לא לפי מה שנוח למפתח.
          </p>
        </Reveal>

        <Reveal delay={140} className="mt-16 flex flex-col md:flex-row gap-px bg-white/10 border border-white/10 rounded-lg overflow-hidden">
          {[WORDPRESS_PANEL, AI_PANEL].map((panel) => {
            const dimmed = hovered !== null && hovered !== panel.key
            const grown = hovered === panel.key
            return (
              <div
                key={panel.key}
                onMouseEnter={() => setHovered(panel.key)}
                onMouseLeave={() => setHovered(null)}
                className={cn(
                  "relative bg-background p-8 md:p-10 flex flex-col justify-end min-h-[380px] md:min-h-[480px] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] md:flex-1",
                  grown && "md:flex-[1.25]",
                  dimmed ? "opacity-55" : "opacity-100"
                )}
              >
                <div className="font-mono text-xs uppercase tracking-wide text-dim mb-6">{panel.label}</div>
                <h3 className="font-display font-medium text-2xl md:text-3xl mb-4 max-w-sm">{panel.headline}</h3>
                <p className="text-dim text-sm md:text-base leading-relaxed mb-6 max-w-md">{panel.body}</p>
                <div className="flex flex-wrap gap-2">
                  {panel.bestFor.map((b) => (
                    <span key={b} className="border border-white/15 rounded-full px-3 py-1 text-xs text-dim">
                      {b}
                    </span>
                  ))}
                </div>
              </div>
            )
          })}
        </Reveal>

        <Reveal delay={200} className="mt-10 max-w-md mx-auto text-center">
          <p className="text-dim text-sm md:text-base leading-relaxed">
            לא צריך לבחור טכנולוגיה לפני שמבינים את הפרויקט.
            <br />
            אני עושה את זה בשבילכם.
          </p>
        </Reveal>
      </div>
    </section>
  )
}

function SpotlightTile() {
  const ref = useRef<HTMLDivElement>(null)

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    el.style.setProperty("--x", `${e.clientX - rect.left}px`)
    el.style.setProperty("--y", `${e.clientY - rect.top}px`)
  }

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      className="relative aspect-[4/3] rounded-lg border border-white/15 overflow-hidden flex items-center justify-center hover:border-[#D1FE17] transition-colors"
      style={{ background: "radial-gradient(220px circle at var(--x, 50%) var(--y, 50%), rgba(209,254,23,0.18), transparent 70%)" }}
    >
      <span className="font-mono text-xs uppercase tracking-wide text-dim">Mouse Interaction</span>
    </div>
  )
}

function TiltTile() {
  const [style, setStyle] = useState<React.CSSProperties>({ transform: "perspective(600px) rotateX(0) rotateY(0)" })

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width - 0.5
    const py = (e.clientY - rect.top) / rect.height - 0.5
    setStyle({ transform: `perspective(600px) rotateX(${py * -10}deg) rotateY(${px * 10}deg)` })
  }

  function reset() {
    setStyle({ transform: "perspective(600px) rotateX(0) rotateY(0)" })
  }

  return (
    <div
      onMouseMove={onMove}
      onMouseLeave={reset}
      className="aspect-[4/3] rounded-lg border border-white/15 overflow-hidden hover:border-[#D1FE17] transition-colors flex items-center justify-center"
    >
      <div style={style} className="transition-transform duration-150 ease-out font-mono text-xs uppercase tracking-wide text-dim">
        Hover / Depth
      </div>
    </div>
  )
}

function TypographyTile() {
  const word = "MOTION"
  return (
    <div className="group aspect-[4/3] rounded-lg border border-white/15 overflow-hidden hover:border-[#D1FE17] transition-colors flex items-center justify-center">
      <div className="flex gap-[2px]">
        {word.split("").map((ch, i) => (
          <span
            key={i}
            style={{ transitionDelay: `${i * 30}ms` }}
            className="font-display text-2xl md:text-3xl font-light group-hover:font-black group-hover:-translate-y-1.5 transition-all duration-300"
          >
            {ch}
          </span>
        ))}
      </div>
    </div>
  )
}

function RevealTile() {
  return (
    <div className="group relative aspect-[4/3] rounded-lg border border-white/15 overflow-hidden hover:border-[#D1FE17] transition-colors">
      <div className="absolute inset-0 flex items-center justify-center font-mono text-xs uppercase tracking-wide text-dim">
        Image Reveal
      </div>
      <div className="absolute inset-0 [clip-path:inset(0_100%_0_0)] group-hover:[clip-path:inset(0_0%_0_0)] transition-[clip-path] duration-500 ease-[cubic-bezier(0.76,0,0.24,1)]">
        <AutoVideo src="/videos/raz-showreel-7.mp4" className="absolute inset-0 w-full h-full object-cover contrast-[1.05] brightness-[0.85]" />
      </div>
    </div>
  )
}

function InteractiveExperience() {
  return (
    <section className="py-28 md:py-40 border-t border-white/10">
      <div className="container">
        <Eyebrow>BUILT TO BE EXPERIENCED</Eyebrow>
        <SectionHeading>אתר לא חייב להרגיש כמו עוד אתר.</SectionHeading>
        <Reveal delay={80}>
          <p className="mt-6 max-w-xl text-dim text-base md:text-lg leading-relaxed">
            Micro-interactions, Motion, Scroll Animations ופרטים קטנים יכולים להפוך גלילה רגילה לחוויה — כל עוד הם משרתים את התוכן ולא מפריעים לו.
          </p>
        </Reveal>

        <Reveal delay={140} className="grid grid-cols-2 gap-4 mt-14">
          <SpotlightTile />
          <TiltTile />
          <TypographyTile />
          <RevealTile />
        </Reveal>
      </div>
    </section>
  )
}

function CaseStudies({ projects, loading }: { projects: ProjectRow[]; loading: boolean }) {
  return (
    <section className="py-28 md:py-40 border-t border-white/10">
      <div className="container">
        <Eyebrow>CASE STUDIES</Eyebrow>
        <SectionHeading>העיצוב הוא רק חלק מהסיפור.</SectionHeading>

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

export function WebLanding() {
  useDocumentMeta(
    "בניית אתרים ועיצוב אתרים לעסקים — RAZ",
    "אפיון, עיצוב ופיתוח אתרים — WordPress, WooCommerce ואתרים אינטראקטיביים שנבנים עם AI. אתר מהיר, ברור ומותאם ל-SEO, בנוי סביב הצורך האמיתי של העסק."
  )

  const { projects, loading } = useProjects()
  const websiteProjects = useMemo(() => projects.filter((p) => p.project_type === "website"), [projects])
  const caseStudyProjects = useMemo(() => websiteProjects.filter((p) => p.featured).slice(0, 3), [websiteProjects])
  const featuredCaseStudies = caseStudyProjects.length > 0 ? caseStudyProjects : websiteProjects.slice(0, 3)

  const [workFilter, setWorkFilter] = useState("הכל")
  const activeCategories = useMemo(() => {
    const used = new Set<string>()
    websiteProjects.forEach((p) => p.categories?.forEach((c) => used.add(c)))
    return PROJECT_CATEGORIES.filter((c) => used.has(c))
  }, [websiteProjects])
  const filteredWork = workFilter === "הכל" ? websiteProjects : websiteProjects.filter((p) => p.categories?.includes(workFilter))

  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: "Web Design & Development",
    name: "בניית אתרים ועיצוב אתרים לעסקים",
    description: "אפיון, UX/UI, עיצוב ופיתוח אתרים — WordPress, WooCommerce, אתרים אינטראקטיביים ואתרים שנבנים עם AI.",
    provider: { "@type": "Person", name: "Raz Avramov" },
    areaServed: "IL",
    url: "https://web.madebyraz.co.il",
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

      <Hero projects={websiteProjects} loading={loading} />

      <section id="work" className="py-28 md:py-40 border-t border-white/10">
        <div className="container">
          <Eyebrow>SELECTED WEBSITES</Eyebrow>
          <SectionHeading>האתר הבא שלכם מתחיל כאן.</SectionHeading>

          {activeCategories.length > 0 && (
            <Reveal delay={100} className="flex flex-wrap gap-2 mt-10">
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
              {filteredWork.map((p, i) => {
                const tech = [...p.tech_stack, ...p.ai_tools]
                return (
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
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap gap-x-3 gap-y-1 font-mono text-[11px] text-dim uppercase">
                        {p.disciplines.map((d) => (
                          <span key={d}>{d}</span>
                        ))}
                        {tech.map((t) => (
                          <span key={t}>{t}</span>
                        ))}
                      </div>
                      {p.live_url && (
                        <a
                          href={p.live_url}
                          target="_blank"
                          rel="noreferrer"
                          className="font-mono text-[11px] uppercase tracking-wide underline underline-offset-4 text-dim hover:text-[#D1FE17] transition-colors flex-none"
                        >
                          לאתר החי ←
                        </a>
                      )}
                    </div>
                  </Reveal>
                )
              })}
            </div>
          )}

          {!loading && websiteProjects.length === 0 && (
            <p className="mt-16 text-dim text-sm max-w-md leading-relaxed">אתרים חדשים עולים בקרוב. בינתיים אפשר לצפות בכל הפרויקטים.</p>
          )}
          {!loading && websiteProjects.length > 0 && filteredWork.length === 0 && (
            <p className="mt-16 text-dim text-sm">אין עדיין אתרים בקטגוריה הזו.</p>
          )}

          {websiteProjects.length > 0 && (
            <Reveal className="mt-12">
              <a href={`${SITE}/work`} className="inline-block font-mono text-xs uppercase tracking-wide underline underline-offset-4 hover:text-[#D1FE17] transition-colors">
                כל העבודות ←
              </a>
            </Reveal>
          )}
        </div>
      </section>

      <TwoWaysToBuild />

      <section className="py-28 md:py-40 border-t border-white/10">
        <div className="container">
          <Eyebrow>WHAT I BUILD</Eyebrow>
          <SectionHeading>מהרעיון ועד האתר באוויר.</SectionHeading>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-14">
            {SERVICES.map((s, i) => (
              <Reveal key={s.title} delay={Math.min(i * 40, 250)}>
                <a href={s.href} className="group block border border-white/15 rounded-lg p-6 h-full hover:border-[#D1FE17] transition-colors">
                  <div className="font-mono text-xs text-dim mb-3">{String(i + 1).padStart(2, "0")}</div>
                  <h3 className="font-display font-medium text-lg mb-3 group-hover:text-[#D1FE17] transition-colors">{s.title}</h3>
                  <p className="text-dim text-sm leading-relaxed">{s.body}</p>
                </a>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-28 md:py-40 border-t border-white/10">
        <div className="container">
          <Eyebrow>A PRETTY WEBSITE ISN&apos;T ENOUGH</Eyebrow>
          <SectionHeading className="max-w-2xl">אתר יפה שלא עושה את העבודה הוא פשוט תמונה יקרה.</SectionHeading>

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

          <Reveal delay={200} className="mt-20 md:mt-28 border-y border-white/10 py-14 md:py-20 text-center">
            <p className="font-display font-black uppercase text-[clamp(22px,4.6vw,56px)] leading-[1.3] tracking-tight text-dim/60">
              Design gets attention.
            </p>
            <p className="mt-3 font-display font-black uppercase text-[clamp(22px,4.6vw,56px)] leading-[1.3] tracking-tight">
              <span className="inline-block bg-[#D1FE17] text-black px-3 md:px-4 py-1">Experience gets action.</span>
            </p>
          </Reveal>
        </div>
      </section>

      <InteractiveExperience />

      <section className="py-28 md:py-40 border-t border-white/10">
        <div className="container">
          <Eyebrow>FROM IDEA TO LAUNCH</Eyebrow>
          <SectionHeading>תהליך ברור. בלי לנחש מה קורה עכשיו.</SectionHeading>

          <div className="mt-16 flex flex-col gap-8">
            {PROCESS.map((s, i) => (
              <Reveal key={s.n} delay={i * 50} className="grid md:grid-cols-[100px_1fr] gap-4 md:gap-10 border-t border-white/10 pt-8">
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

      <section className="py-28 md:py-40 border-t border-white/10">
        <div className="container">
          <Eyebrow>MORE THAN DESIGN</Eyebrow>
          <SectionHeading className="max-w-2xl">הדברים שלא תמיד רואים הם אלה שעושים את ההבדל.</SectionHeading>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-14">
            {UNDER_THE_HOOD.map((item, i) => (
              <Reveal key={item.title} delay={Math.min(i * 40, 250)} className="border border-white/15 rounded-lg p-6 hover:border-[#D1FE17] transition-colors">
                <h3 className="font-display font-medium text-base mb-3">{item.title}</h3>
                <p className="text-dim text-sm leading-relaxed">{item.body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-28 md:py-40 border-t border-white/10">
        <div className="container grid md:grid-cols-[1fr_1.1fr] gap-10 md:gap-14 items-start">
          <div>
            <Eyebrow>WORDPRESS DEVELOPMENT</Eyebrow>
            <SectionHeading headingClassName="font-display font-medium text-[clamp(20px,3.6vw,40px)] leading-[1.25] tracking-tight">
              WordPress בלי להיראות כמו תבנית WordPress.
            </SectionHeading>
            <Reveal delay={80}>
              <p className="mt-6 text-dim text-base leading-relaxed max-w-md">
                WordPress עדיין יכול להיות בסיס מצוין לאתר מודרני כאשר משתמשים בו נכון. אני בונה מערכות שמאפשרות ללקוח לנהל את התוכן בלי לוותר על עיצוב Custom, אזורים דינמיים, אינטגרציות ויכולת להרחיב את האתר בהמשך.
              </p>
            </Reveal>
            <Reveal delay={140}>
              <a href={`${SITE}/services/web-design/wordpress-development`} className="inline-block mt-6 font-mono text-xs uppercase tracking-wide underline underline-offset-4 hover:text-[#D1FE17] transition-colors">
                לפרטים המלאים על פיתוח WordPress ←
              </a>
            </Reveal>
          </div>
          <Reveal delay={120} className="flex flex-wrap gap-2 content-start">
            {WORDPRESS_CAPS.map((c) => (
              <span key={c} className="border border-white/15 rounded-full px-4 py-2 text-sm text-dim hover:border-[#D1FE17] hover:text-foreground transition-colors">
                {c}
              </span>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="py-28 md:py-40 border-t border-white/10">
        <div className="container">
          <Eyebrow>AI-POWERED DEVELOPMENT</Eyebrow>
          <SectionHeading
            className="max-w-2xl"
            headingClassName="font-display font-medium text-[clamp(20px,3.6vw,40px)] leading-[1.25] tracking-tight"
          >
            AI לא בונה את האתר במקומי. הוא מאפשר לי לבנות אחרת.
          </SectionHeading>
          <Reveal delay={80}>
            <p className="mt-6 text-dim text-base leading-relaxed max-w-xl">
              כלי AI מודרניים מאפשרים לקצר חלק מתהליכי הפיתוח, לבדוק רעיונות מהר יותר וליצור חוויות Custom שבעבר היו דורשות הרבה יותר זמן פיתוח. אבל AI הוא לא אסטרטגיה, UX או טעם. צריך לדעת מה לבנות, איך המשתמש אמור להתנהג ואיפה הטכנולוגיה באמת מוסיפה ערך.
            </p>
          </Reveal>
          <Reveal delay={140}>
            <a href={`${SITE}/services/web-design/custom-development`} className="inline-block mt-6 font-mono text-xs uppercase tracking-wide underline underline-offset-4 hover:text-[#D1FE17] transition-colors">
              לפרטים המלאים על פיתוח עם AI ←
            </a>
          </Reveal>

          <Reveal delay={200} className="mt-20 md:mt-28 border-y border-white/10 py-14 md:py-20">
            <p className="font-display font-black uppercase text-[clamp(22px,4.6vw,56px)] leading-[1.2] tracking-tight text-center">
              AI is the tool.
              <br />
              Direction is the skill.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="py-28 md:py-40 border-t border-white/10">
        <div className="container grid md:grid-cols-[1fr_1.1fr] gap-10 md:gap-14 items-start">
          <div>
            <Eyebrow>E-COMMERCE</Eyebrow>
            <SectionHeading headingClassName="font-display font-medium text-[clamp(20px,3.6vw,40px)] leading-[1.25] tracking-tight">
              לא רק להציג מוצרים. למכור אותם.
            </SectionHeading>
            <Reveal delay={80}>
              <p className="mt-6 text-dim text-base leading-relaxed max-w-md">
                חנות טובה צריכה להפוך את הדרך מהמוצר לקופה לפשוטה ככל האפשר.
              </p>
            </Reveal>
            <Reveal delay={140}>
              <a href={`${SITE}/services/web-design/ecommerce`} className="inline-block mt-6 font-mono text-xs uppercase tracking-wide underline underline-offset-4 hover:text-[#D1FE17] transition-colors">
                לפרטים המלאים על חנויות E-commerce ←
              </a>
            </Reveal>
          </div>
          <Reveal delay={120} className="flex flex-wrap gap-2 content-start">
            {ECOMMERCE_ITEMS.map((c) => (
              <span key={c} className="border border-white/15 rounded-full px-4 py-2 text-sm text-dim hover:border-[#D1FE17] hover:text-foreground transition-colors">
                {c}
              </span>
            ))}
          </Reveal>
        </div>
      </section>

      <CaseStudies projects={featuredCaseStudies} loading={loading} />

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
          <Eyebrow>HAVE A PROJECT?</Eyebrow>
          <SectionHeading
            className="max-w-2xl"
            headingClassName="font-display font-bold text-[clamp(26px,5.6vw,64px)] leading-[1.25] tracking-tight"
          >
            יש לכם רעיון. בואו ניתן לו כתובת.
          </SectionHeading>
          <Reveal delay={100}>
            <p className="mt-6 max-w-xl mx-auto text-dim text-base md:text-lg leading-relaxed">
              אתר חדש, חנות, Landing Page או משהו שקשה להכניס להגדרה? ספרו לי מה אתם רוצים לבנות ונמצא את הדרך הנכונה לעשות את זה.
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
              צפו בפרויקטים ↓
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
