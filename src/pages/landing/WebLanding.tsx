import { useEffect, useId, useMemo, useRef, useState } from "react"
import type { ProjectRow } from "@/lib/supabase"
import { supabase } from "@/lib/supabase"
import { useProjects } from "@/hooks/useProjects"
import { useDocumentMeta } from "@/hooks/useDocumentMeta"
import { useReducedMotion } from "@/hooks/useReducedMotion"
import { trackEvent } from "@/lib/analytics"
import { Reveal } from "@/components/Reveal"
import { SectionHeading } from "@/components/SectionHeading"
import { AutoVideo } from "@/components/AutoVideo"
import { WhatsAppButton } from "@/components/WhatsAppButton"
import { ConsentCheckbox } from "@/components/ConsentCheckbox"
import { AnnouncementBar } from "@/components/AnnouncementBar"
import { Eyebrow as BrandEyebrow } from "@/components/Eyebrow"
import { cn } from "@/lib/utils"
import { Wordmark } from "@/components/icons/Wordmark"

const WHATSAPP_NUMBER = "972506944443"
const WHATSAPP_MESSAGE = "היי, אני מתעניין בבניית אתר לעסק שלי."

const FORMATS = [
  {
    title: "אתר לעסק או למותג",
    body: "אתר שמסביר מהר מי אתם, נראה כמו העסק שאתם רוצים להיות ומוביל אנשים למקומות הנכונים.",
    tags: ["אתרי תדמית", "אתרי חברות", "אתרי מותג"],
  },
  {
    title: "חנות אונליין",
    body: "חנות שנראית טוב אבל לא שוכחת את החלק החשוב: לעזור לאנשים למצוא מוצר, להבין אותו ולהגיע לקופה בלי להסתבך.",
    tags: ["WooCommerce", "עמודי מוצר", "סליקה", "משלוחים"],
  },
  {
    title: "דף נחיתה",
    body: "עמוד ממוקד לקמפיין, מוצר או שירות עם מסר אחד ופעולה אחת שאנחנו רוצים שהמבקר יעשה.",
    tags: ["קמפיינים", "לידים", "השקות", "מוצרים"],
  },
  {
    title: "אתר אינטראקטיבי",
    body: "כשאתר רגיל פשוט לא מספיק. תנועה, אנימציות ואינטראקציות שמוסיפות לחוויה בלי להפוך אותה לקרקס.",
    tags: ["אנימציות", "גלילה", "אינטראקציות", "חוויות דיגיטליות"],
  },
]

const WORDPRESS_PANEL = {
  key: "wp" as const,
  label: "WordPress",
  headline: "מתאים כשצריך אתר שקל לנהל, לעדכן ולהרחיב לאורך זמן.",
  body: "מצוין לאתרי חברות, תוכן, WooCommerce, אזורים דינמיים ואינטגרציות.",
  bestFor: ["אתרי תדמית", "WooCommerce", "אתרי תוכן", "מערכות עם CMS", "אתרים דינמיים", "פרויקטים עם אינטגרציות"],
}

const AI_PANEL = {
  key: "ai" as const,
  label: "פיתוח בעזרת AI",
  headline: "מתאים כשצריך יותר חופש בעיצוב, בתנועה, באינטראקציות או בהתנהגות של האתר.",
  body: "AI עוזר לי לבנות ולבדוק מהר יותר. הוא לא מחליט איך האתר צריך להיראות או לעבוד.",
  bestFor: ["Creative Websites", "Interactive Experiences", "Landing Pages", "Product Launches", "Custom Interfaces", "Web Apps"],
}

const PROOF_LINES = [
  "הוא צריך להיטען מהר.",
  "להיראות טוב גם בטלפון.",
  "להסביר תוך כמה שניות מה אתם מציעים.",
  "להוביל את המבקר לפעולה.",
  "להיות בנוי נכון ל-Google.",
  "ולא לדרוש שיחת טלפון למפתח בכל פעם שרוצים לשנות משפט.",
]

const PROCESS = [
  { n: "01", title: "מדברים", text: "אתם מספרים לי על העסק, האתר שאתם צריכים ומה אתם רוצים שהוא יעשה." },
  { n: "02", title: "מחליטים מה בונים", text: "סוגרים מבנה, עמודים, כיוון עיצובי וטכנולוגיה." },
  { n: "03", title: "מעצבים ובונים", text: "אני לוקח את האתר מהעיצוב לפיתוח ומחבר את מה שצריך בדרך." },
  { n: "04", title: "עולים לאוויר", text: "בודקים מובייל, ביצועים, טפסים וכל מה שצריך, מחברים את הדומיין ומשיקים." },
]

const DELIVERABLES = [
  { title: "עיצוב מותאם אישית", body: "לא Theme שמקבל לוגו וצבע חדש." },
  { title: "התאמה מלאה למובייל", body: "לא גרסת Desktop שפשוט התכווצה." },
  { title: "מערכת ניהול", body: "כדי שתוכלו לשנות את התוכן שאתם באמת צריכים לשנות." },
  { title: "ביצועים", body: "כי אתר יפה שלוקח נצח להיטען מפספס את הנקודה." },
  { title: "בסיס נכון ל-SEO", body: "מבנה, כותרות, Metadata, Indexability ותשתית טכנית מסודרת." },
  { title: "טפסים ומדידה", body: "חיבור של פניות, Analytics ומערכות רלוונטיות לפי הפרויקט." },
  { title: "אינטגרציות", body: "CRM, סליקה, APIs, אוטומציות ושירותים חיצוניים כשצריך." },
]

const FAQS = [
  {
    q: "כמה זמן לוקח לבנות אתר?",
    a: "תלוי במה בונים. אתר תדמית, חנות ואתר אינטראקטיבי הם פרויקטים שונים לגמרי. אחרי שאני מבין את מספר העמודים, התוכן, הפונקציות והמורכבות, אפשר לתת לוח זמנים אמיתי ולא לנחש.",
  },
  {
    q: "כמה עולה לבנות אתר?",
    a: "המחיר תלוי בהיקף ובמורכבות הפרויקט. שלחו לי בקצרה מה אתם צריכים, ואם יש התאמה אחזור אליכם עם שאלות ומשם אפשר להגיע ל-Scope וטווח מחיר מסודר.",
  },
  {
    q: "WordPress או אתר שנבנה עם AI?",
    a: "תלוי באתר. אם צריך CMS חזק, WooCommerce וניהול שוטף, WordPress יכול להיות בחירה מצוינת. אם הפרויקט דורש חוויה יותר Custom או אינטראקטיבית, פיתוח מודרני בעזרת AI יכול להתאים יותר. אני מעדיף לבחור את הכלי לפי הפרויקט ולא את הפרויקט לפי הכלי.",
  },
  {
    q: "אוכל לערוך את האתר בעצמי?",
    a: "אם האתר כולל מערכת ניהול, כן. אני מגדיר מראש אילו אזורים צריך להיות אפשר לערוך ובונה אותם בהתאם.",
  },
  {
    q: "אתם עושים גם עיצוב?",
    a: "כן. אני עושה גם את העיצוב וגם את הפיתוח, כך שלא צריך להגיע אליי עם קובץ Figma מוכן.",
  },
  {
    q: "אתם בונים חנויות?",
    a: "כן. אני בונה חנויות WooCommerce כולל עמודי מוצר, סליקה, משלוחים ואינטגרציות בהתאם לפרויקט.",
  },
  {
    q: "מה לגבי SEO?",
    a: "האתר יכול להיבנות עם בסיס טכני נכון ל-SEO, כולל מבנה HTML, כותרות, Metadata, Indexability וביצועים. קידום אורגני שוטף, מחקר מילות מפתח וכתיבת תוכן הם שירות נפרד אם הפרויקט דורש אותם.",
  },
  {
    q: "מה קורה אחרי שהאתר עולה?",
    a: "אפשר לסיים בהשקה ואפשר להמשיך איתי לתחזוקה, שיפורים ופיתוח נוסף. זה נקבע לפי מה שהאתר צריך.",
  },
]

const BUILD_TYPES = ["אתר חדש", "חנות", "דף נחיתה", "שדרוג אתר קיים", "משהו אחר"]

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
      className="inline-flex items-center justify-center w-full sm:w-fit font-mono text-sm uppercase tracking-wide bg-[#D1FE17] text-black rounded-[8px] px-7 py-3.5 hover:scale-105 transition-transform"
    >
      {children}
    </button>
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
      className={`inline-flex items-center justify-center w-full sm:w-fit gap-2 font-mono text-xs uppercase tracking-wide border border-white/20 rounded-full px-5 py-3.5 hover:border-[#D1FE17] hover:text-[#D1FE17] transition-colors ${className}`}
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
        className="flex items-center justify-center py-3.5 font-mono text-xs uppercase tracking-wide border-l border-white/10 bg-[#D1FE17] text-black"
      >
        יש לי אתר לבנות
      </button>
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

function Hero({ projects, loading, onOpenForm }: { projects: ProjectRow[]; loading: boolean; onOpenForm: () => void }) {
  return (
    <section className="relative overflow-hidden pt-32 pb-16 md:pt-40 md:pb-24">
      <div className="container grid lg:grid-cols-[1.05fr_0.95fr] gap-12 lg:gap-16 items-center">
        <div>
          <Eyebrow>עיצוב ופיתוח אתרים</Eyebrow>
          <Reveal>
            <h1 className="font-display font-black text-[clamp(34px,6vw,72px)] leading-[1.05] tracking-tight text-gradient-accent text-shimmer">
              אתרים שנראים מעולה ועובדים כמו שצריך.
            </h1>
          </Reveal>
          <Reveal delay={120}>
            <p className="mt-6 max-w-xl text-dim text-lg md:text-xl leading-relaxed">
              אני מעצב ומפתח אתרים לעסקים ומותגים, מ-WordPress ואיקומרס ועד אתרים אינטראקטיביים ופיתוח בעזרת AI.
            </p>
            <p className="mt-3 max-w-xl text-dim text-base leading-relaxed">
              יותר מ-200 אתרים כבר מאחוריי. עכשיו בואו נדבר על שלכם.
            </p>
          </Reveal>
          <Reveal delay={200} className="mt-10 flex flex-col sm:flex-row items-center gap-4">
            <PrimaryCta onClick={onOpenForm}>יש לי אתר לבנות ←</PrimaryCta>
            <WhatsAppCta />
          </Reveal>
          <Reveal delay={230} className="mt-6 font-mono text-[11px] uppercase tracking-wide text-dim">
            200+ אתרים · 6 שנות ניסיון · עיצוב + פיתוח
          </Reveal>
          <ResponseTimeNote className="mt-3" />
        </div>
        <Reveal delay={160}>
          <WebsiteShowcase projects={projects} loading={loading} />
        </Reveal>
      </div>
    </section>
  )
}

function SelectedWebsites({ projects, loading, onSelect }: { projects: ProjectRow[]; loading: boolean; onSelect: (p: ProjectRow) => void }) {
  return (
    <section id="work" className="py-28 md:py-40 section-divider">
      <div className="container">
        <Eyebrow>אתרים נבחרים</Eyebrow>
        <SectionHeading>קודם תראו את העבודה.</SectionHeading>

        {loading && <div className="mt-16 font-mono text-xs text-dim uppercase">טוען…</div>}
        {!loading && projects.length === 0 && (
          <p className="mt-16 text-dim text-base max-w-md leading-relaxed">אתרים חדשים עולים בקרוב.</p>
        )}

        {projects.length > 0 && (
          <div className="mt-16 grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {projects.slice(0, 8).map((p, i) => (
              <Reveal key={p.slug} delay={i * 70}>
                <button
                  onClick={() => onSelect(p)}
                  className="group block w-full text-right relative aspect-[4/5] rounded-lg overflow-hidden bg-neutral-900 border border-transparent hover:border-[#D1FE17] transition-colors"
                >
                  {p.video && (
                    <AutoVideo src={p.video} className="absolute inset-0 w-full h-full object-cover contrast-[1.05] brightness-[0.85] transition-transform duration-500 group-hover:scale-105" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
                  <div className="absolute bottom-4 right-4 left-4">
                    <h3 className="font-display font-medium text-lg text-white">{p.title}</h3>
                    <div className="font-mono text-[11px] uppercase tracking-wide text-white/60 mt-1">
                      {[...p.disciplines].join(" / ") || p.category}
                    </div>
                    <div className="mt-2 font-mono text-[11px] uppercase tracking-wide text-[#D1FE17] opacity-0 group-hover:opacity-100 transition-opacity">
                      לצפייה ←
                    </div>
                  </div>
                </button>
              </Reveal>
            ))}
          </div>
        )}

        <Reveal delay={100} className="mt-6 font-mono text-[11px] text-dim/70">
          כל הפרויקטים נפתחים בתוך העמוד. לא שולחים אתכם לעמוד אחר באתר.
        </Reveal>
      </div>
    </section>
  )
}

function ProjectLightbox({ project, onClose }: { project: ProjectRow | null; onClose: () => void }) {
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

  if (!project) return null

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 md:p-10" onClick={onClose}>
      <div className="relative w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          aria-label="סגירה"
          className="absolute -top-10 md:-top-12 left-0 font-mono text-xs uppercase tracking-wide text-white/70 hover:text-[#D1FE17] transition-colors"
        >
          סגירה ✕
        </button>
        <div className="relative aspect-video rounded-lg overflow-hidden bg-neutral-900">
          {project.video && <AutoVideo src={project.video} className="absolute inset-0 w-full h-full object-cover" />}
        </div>
        <div className="mt-4 text-white">
          <h3 className="font-display font-bold text-2xl">{project.title}</h3>
          <div className="font-mono text-[11px] uppercase tracking-wide text-white/60 mt-1">
            {[...project.disciplines].join(" / ") || project.category}
          </div>
          {project.live_url && (
            <a href={project.live_url} target="_blank" rel="noreferrer" className="inline-block mt-3 font-mono text-[11px] uppercase tracking-wide underline underline-offset-4 text-[#D1FE17]">
              לאתר החי ←
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

function WhatToBuild({ onOpenForm }: { onOpenForm: () => void }) {
  return (
    <section className="py-28 md:py-40 section-divider">
      <div className="container">
        <Eyebrow>מה אתם צריכים?</Eyebrow>
        <SectionHeading>מה אתם צריכים לבנות?</SectionHeading>
        <Reveal delay={80}>
          <p className="mt-6 max-w-xl text-dim text-base md:text-lg leading-relaxed">
            לא כל אתר צריך את אותו פתרון.
          </p>
        </Reveal>

        <div className="grid sm:grid-cols-2 gap-4 mt-14">
          {FORMATS.map((f, i) => (
            <Reveal key={f.title} delay={i * 60}>
              <div className="surface-raised rounded-xl p-6 h-full">
                <div className="font-mono text-xs text-dim mb-3">{String(i + 1).padStart(2, "0")}</div>
                <h3 className="font-display font-medium text-xl mb-3">{f.title}</h3>
                <p className="text-dim text-sm leading-relaxed mb-5">{f.body}</p>
                <div className="flex flex-wrap gap-x-2 gap-y-1 font-mono text-[10px] uppercase tracking-wide text-dim/70">
                  {f.tags.map((t, ti) => (
                    <span key={t}>
                      {t}
                      {ti < f.tags.length - 1 && " ·"}
                    </span>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={200} className="mt-12">
          <PrimaryCta onClick={onOpenForm}>ספרו לי מה אתם רוצים לבנות ←</PrimaryCta>
        </Reveal>
      </div>
    </section>
  )
}

function TwoWaysToBuild() {
  const [hovered, setHovered] = useState<"wp" | "ai" | null>(null)

  return (
    <section className="py-28 md:py-40 section-divider">
      <div className="container">
        <Eyebrow>לא צריך להחליט עכשיו</Eyebrow>
        <SectionHeading>WordPress או פיתוח עם AI?</SectionHeading>
        <Reveal delay={80}>
          <p className="mt-6 max-w-xl text-dim text-base md:text-lg leading-relaxed">
            אין פלטפורמה אחת שמתאימה לכל אתר, ואני לא דוחף כל פרויקט לאותה מערכת.
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
                  "relative bg-background p-8 md:p-10 flex flex-col justify-end min-h-[380px] md:min-h-[440px] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] md:flex-1",
                  grown && "md:flex-[1.25]",
                  dimmed ? "opacity-55" : "opacity-100"
                )}
              >
                <div className="font-mono text-xs uppercase tracking-wide text-dim mb-6">{panel.label}</div>
                <h3 className="font-display font-medium text-xl md:text-2xl mb-4 max-w-sm">{panel.headline}</h3>
                <p className="text-dim text-sm md:text-base leading-relaxed mb-6 max-w-md">{panel.body}</p>
                <div className="flex flex-wrap gap-2">
                  {panel.bestFor.map((b) => (
                    <span key={b} className="surface-raised rounded-full px-3 py-1 text-xs text-dim">
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
            את הטכנולוגיה בוחרים אחרי שמבינים את הפרויקט. לא לפני.
          </p>
        </Reveal>
      </div>
    </section>
  )
}

function ProofSection() {
  return (
    <section className="py-28 md:py-40 section-divider">
      <div className="container">
        <Eyebrow>אחרי יותר מ-200 אתרים</Eyebrow>
        <SectionHeading className="max-w-2xl">200+ אתרים לימדו אותי משהו פשוט.</SectionHeading>
        <Reveal delay={80}>
          <p className="mt-6 max-w-xl text-dim text-base md:text-lg leading-relaxed">
            אתר יפה שלא עושה את העבודה הוא עדיין אתר לא טוב.
          </p>
        </Reveal>

        <div className="mt-14 flex flex-col gap-3">
          {PROOF_LINES.map((item, i) => (
            <Reveal key={item} delay={i * 60}>
              <p className="text-lg md:text-xl text-foreground/90 leading-relaxed">{item}</p>
            </Reveal>
          ))}
        </div>

        <Reveal delay={PROOF_LINES.length * 60 + 80} className="mt-10 border-t border-white/10 pt-10">
          <p className="font-display font-bold text-2xl md:text-3xl leading-tight">
            אלה לא תוספות. מבחינתי זה חלק מהאתר.
          </p>
        </Reveal>
      </div>
    </section>
  )
}

function Rebuild({ onOpenForm }: { onOpenForm: () => void }) {
  return (
    <section className="py-28 md:py-40 section-divider">
      <div className="container">
        <Eyebrow>כבר יש לכם אתר?</Eyebrow>
        <SectionHeading className="max-w-2xl">כבר יש לכם אתר? לא חייבים להתחיל מחדש.</SectionHeading>
        <Reveal delay={80}>
          <p className="mt-6 max-w-xl text-dim text-base md:text-lg leading-relaxed">
            אם האתר שלכם מיושן, איטי, מבולגן או פשוט כבר לא מתאים לעסק שיש לכם היום, אפשר להתחיל ממה שקיים.
          </p>
        </Reveal>

        <div className="mt-10 flex flex-col gap-3 max-w-xl">
          {["לפעמים צריך עיצוב מחדש.", "לפעמים צריך לבנות אותו מחדש על בסיס טוב יותר.", "ולפעמים כמה שינויים נכונים עושים את כל ההבדל."].map((line, i) => (
            <Reveal key={line} delay={i * 60}>
              <p className="text-dim text-base md:text-lg leading-relaxed">{line}</p>
            </Reveal>
          ))}
        </div>

        <Reveal delay={260} className="mt-10">
          <PrimaryCta onClick={onOpenForm}>שלחו לי את האתר הקיים ←</PrimaryCta>
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
      className="relative aspect-[4/3] surface-raised rounded-xl overflow-hidden flex items-center justify-center hover:bg-white/[0.1] transition-colors"
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
    <div className="group relative aspect-[4/3] surface-raised rounded-xl overflow-hidden hover:bg-white/[0.1] transition-colors">
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
    <section className="py-28 md:py-40 section-divider">
      <div className="container">
        <Eyebrow>עשוי לחוויה</Eyebrow>
        <SectionHeading className="max-w-2xl">קצת תנועה לא הרגה אף אתר.</SectionHeading>
        <Reveal delay={80}>
          <p className="mt-6 max-w-xl text-dim text-base md:text-lg leading-relaxed">
            אתר לא חייב להרגיש כמו מסמך עם תמונות. אני משתמש באנימציות ואינטראקציות כדי להדגיש תוכן, להסביר דברים ולהוסיף אופי — לא כדי לגרום למשתמש לחפש איפה לעזאזל נמצא הכפתור.
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

function ProcessSection() {
  return (
    <section className="py-28 md:py-40 section-divider">
      <div className="container">
        <Eyebrow>מבריף להשקה</Eyebrow>
        <SectionHeading>איך זה עובד?</SectionHeading>
        <Reveal delay={80}>
          <p className="mt-6 max-w-xl text-dim text-base md:text-lg leading-relaxed">די פשוט.</p>
        </Reveal>

        <div className="mt-16 flex flex-col gap-8">
          {PROCESS.map((s, i) => (
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
  )
}

function DeliverablesSection() {
  return (
    <section className="py-28 md:py-40 section-divider">
      <div className="container">
        <Eyebrow>מה מקבלים</Eyebrow>
        <SectionHeading className="max-w-2xl">מה מקבלים?</SectionHeading>
        <Reveal delay={80}>
          <p className="mt-6 max-w-xl text-dim text-base md:text-lg leading-relaxed">
            זה משתנה מפרויקט לפרויקט, אבל אתר יכול לכלול:
          </p>
        </Reveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-14">
          {DELIVERABLES.map((item, i) => (
            <Reveal key={item.title} delay={Math.min(i * 40, 250)} className="surface-raised rounded-xl p-6 hover:bg-white/[0.08] transition-colors">
              <h3 className="font-display font-medium text-base mb-3">{item.title}</h3>
              <p className="text-dim text-sm leading-relaxed">{item.body}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

function AboutRaz() {
  return (
    <section className="py-28 md:py-40 section-divider">
      <div className="container grid md:grid-cols-[220px_1fr] gap-10 md:gap-14 items-center">
        <Reveal>
          <div className="w-28 h-28 md:w-full md:h-auto md:aspect-square rounded-full overflow-hidden bg-neutral-900 mx-auto">
            <img src="/images/raz-portrait.jpeg" alt="רז אברמוב" className="w-full h-full object-cover grayscale" />
          </div>
        </Reveal>
        <div>
          <Eyebrow>מי בונה את האתר?</Eyebrow>
          <Reveal>
            <h2 className="font-display font-bold text-[clamp(26px,4vw,44px)] leading-[1.15] tracking-tight">
              <span className="text-foreground">אני </span>
              <span className="text-gradient-accent text-shimmer">רז.</span>
            </h2>
          </Reveal>
          <Reveal delay={80} className="mt-5 max-w-xl space-y-3 text-dim text-base md:text-lg leading-relaxed">
            <p>אני מפתח אתרים כבר שש שנים ובניתי לאורך הדרך יותר מ-200 אתרים לעסקים וחברות.</p>
            <p>אני מגיע מפיתוח, אבל אני לא רוצה לבנות אתר שרק &quot;עובד&quot;.</p>
            <p>אני רוצה שהוא ייראה טוב, יהיה נעים להשתמש בו ויהיה מספיק פשוט כדי שהעסק יוכל לחיות איתו גם אחרי ההשקה.</p>
            <p>את העיצוב, הפיתוח והחשיבה הטכנית אני מחבר לתהליך אחד. בלי להעביר את הפרויקט בין חמישה אנשים בדרך.</p>
          </Reveal>
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

function WebLeadForm({ open, onClose }: { open: boolean; onClose: () => void }) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const [buildType, setBuildType] = useState("")
  const [name, setName] = useState("")
  const [company, setCompany] = useState("")
  const [contact, setContact] = useState("")
  const [whatToBuild, setWhatToBuild] = useState("")
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
    const { error: dbError } = await supabase.from("leads").insert({
      name,
      email: contact,
      company: company || null,
      project_type: buildType || "משהו אחר",
      message: whatToBuild || null,
    })
    setSubmitting(false)
    if (dbError) {
      setError("משהו השתבש, נסו שוב או שלחו וואטסאפ.")
      return
    }
    fetch("/api/notify-lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email: contact, company, projectType: buildType, message: whatToBuild }),
    }).catch(() => {})
    trackEvent("lead_submit", { project_type: buildType || "משהו אחר", source: "web_landing" })
    setSubmitted(true)
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-end md:items-center justify-center bg-black/80 backdrop-blur-md p-0 md:p-4" onClick={onClose}>
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="w-full md:max-w-lg max-h-[92dvh] overflow-y-auto bg-background border border-white/10 rounded-t-2xl md:rounded-2xl p-6 md:p-8"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display font-bold text-2xl">יש לכם אתר לבנות?</h2>
          <button onClick={onClose} aria-label="סגירה" className="font-mono text-lg text-dim hover:text-[#D1FE17] transition-colors">✕</button>
        </div>

        {submitted ? (
          <div className="py-8 text-center">
            <p className="font-display text-xl mb-2">קיבלתי, תודה!</p>
            <p className="text-dim text-sm">אני חוזר אליכם תוך 24 שעות.</p>
          </div>
        ) : (
          <div className="space-y-5">
            <div>
              <div className={labelClass}>מה צריך לבנות?</div>
              <div className="flex flex-wrap gap-2">
                {BUILD_TYPES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setBuildType(t)}
                    className={cn(
                      "font-mono text-xs uppercase tracking-wide rounded-full px-4 py-2.5 border transition-colors",
                      buildType === t ? "border-[#D1FE17] bg-[#D1FE17] text-black" : "border-white/15 text-dim hover:border-[#D1FE17]"
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className={labelClass} htmlFor="wf-name">שם / חברה</label>
              <input id="wf-name" className={inputClass} value={name} onChange={(e) => setName(e.target.value)} placeholder="שם מלא" />
              {fieldErrors.name && <p className="text-red-400 text-xs mt-1">{fieldErrors.name}</p>}
              <input className={cn(inputClass, "mt-2")} value={company} onChange={(e) => setCompany(e.target.value)} placeholder="שם חברה (לא חובה)" />
            </div>

            <div>
              <label className={labelClass} htmlFor="wf-contact">טלפון או אימייל</label>
              <input id="wf-contact" className={inputClass} value={contact} onChange={(e) => setContact(e.target.value)} placeholder="050-0000000 / name@email.com" />
              {fieldErrors.contact && <p className="text-red-400 text-xs mt-1">{fieldErrors.contact}</p>}
            </div>

            <div>
              <label className={labelClass} htmlFor="wf-message">מה צריך לבנות?</label>
              <textarea id="wf-message" className={cn(inputClass, "min-h-[90px] resize-none")} value={whatToBuild} onChange={(e) => setWhatToBuild(e.target.value)} placeholder="ספרו לי בקצרה על העסק והאתר" />
            </div>

            <ConsentCheckbox id="wf-consent" checked={consent} onChange={setConsent} error={fieldErrors.consent} dark>
              קראתי ואני מאשר/ת את <a href="/privacy" target="_blank" className="underline hover:text-[#D1FE17]">מדיניות הפרטיות</a>
            </ConsentCheckbox>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full font-mono text-sm uppercase tracking-wide bg-[#D1FE17] text-black rounded-[8px] px-6 py-4 hover:scale-[1.02] transition-transform disabled:opacity-60"
            >
              {submitting ? "שולח…" : "שליחה ←"}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export function WebLanding() {
  const [formOpen, setFormOpen] = useState(false)
  const [activeProject, setActiveProject] = useState<ProjectRow | null>(null)

  useDocumentMeta(
    "בניית אתרים ועיצוב אתרים לעסקים — RAZ",
    "אני מעצב ומפתח אתרים לעסקים ומותגים, מ-WordPress ואיקומרס ועד אתרים אינטראקטיביים ופיתוח בעזרת AI. יותר מ-200 אתרים כבר מאחוריי."
  )

  const { projects, loading } = useProjects()
  const websiteProjects = useMemo(() => projects.filter((p) => p.project_type === "website"), [projects])

  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: "Web Design & Development",
    name: "בניית אתרים ועיצוב אתרים לעסקים",
    description: "עיצוב ופיתוח אתרים — WordPress, WooCommerce, אתרים אינטראקטיביים ואתרים שנבנים עם AI.",
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

      <div className="fixed top-0 left-0 right-0 z-50">
        <AnnouncementBar isEnglish={false} onCtaClick={() => setFormOpen(true)} />
        <nav className="flex items-center justify-between px-5 md:px-12 py-4 bg-background/40 backdrop-blur-xl border-b border-white/5">
          <a href="/" aria-label="MADE BY RAZ" className="flex items-center"><Wordmark className="h-6 w-auto" /></a>
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`}
            target="_blank"
            rel="noreferrer"
            className="hidden md:inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wide text-dim hover:text-[#D1FE17] transition-colors"
          >
            <WhatsAppIcon className="w-4 h-4" />
            וואטסאפ
          </a>
        </nav>
      </div>

      <Hero projects={websiteProjects} loading={loading} onOpenForm={() => setFormOpen(true)} />
      <SelectedWebsites projects={websiteProjects} loading={loading} onSelect={setActiveProject} />
      <WhatToBuild onOpenForm={() => setFormOpen(true)} />
      <TwoWaysToBuild />
      <ProofSection />
      <Rebuild onOpenForm={() => setFormOpen(true)} />
      <InteractiveExperience />
      <ProcessSection />
      <DeliverablesSection />
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
          <Eyebrow>יש לכם אתר לבנות?</Eyebrow>
          <SectionHeading
            className="max-w-2xl"
            headingClassName="font-display font-bold text-[clamp(26px,5.6vw,64px)] leading-[1.25] tracking-tight"
          >
            יש לכם אתר לבנות? שלחו לי כמה מילים עליו.
          </SectionHeading>
          <Reveal delay={100}>
            <p className="mt-6 max-w-xl mx-auto text-dim text-base md:text-lg leading-relaxed">
              לא צריך להכין אפיון של 40 עמודים. ספרו לי מה העסק עושה, איזה אתר אתם צריכים ואם יש לכם אתר קיים או דוגמאות שאתם אוהבים. משם כבר נבין מה נכון לבנות.
            </p>
          </Reveal>
          <Reveal delay={200} className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <PrimaryCta onClick={() => setFormOpen(true)}>יש לי פרויקט ←</PrimaryCta>
            <WhatsAppCta />
          </Reveal>
          <Reveal delay={230} className="mt-6 font-mono text-[11px] uppercase tracking-wide text-dim">
            200+ אתרים · 6 שנות ניסיון
          </Reveal>
          <ResponseTimeNote className="mt-3 justify-center" />
        </div>
      </section>

      <footer className="section-divider py-10 text-center font-mono text-[11px] text-dim uppercase tracking-wide">
        © RAZ / Raz Avramov
      </footer>
      <div className="h-16 md:hidden" aria-hidden="true" />
      <WhatsAppButton />
      <MobileCta onOpenForm={() => setFormOpen(true)} />
      <WebLeadForm open={formOpen} onClose={() => setFormOpen(false)} />
      <ProjectLightbox project={activeProject} onClose={() => setActiveProject(null)} />
    </div>
  )
}
