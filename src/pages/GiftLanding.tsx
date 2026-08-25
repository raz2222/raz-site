import { useEffect, useRef, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useDocumentMeta } from "@/hooks/useDocumentMeta"
import { useReducedMotion } from "@/hooks/useReducedMotion"
import { trackEvent } from "@/lib/analytics"
import { captureUtmParams } from "@/lib/utm"
import { Reveal } from "@/components/Reveal"
import { SectionHeading } from "@/components/SectionHeading"
import { AutoVideo } from "@/components/AutoVideo"
import { ConsentCheckbox } from "@/components/ConsentCheckbox"
import { CookieConsent } from "@/components/CookieConsent"
import { WhatsAppButton } from "@/components/WhatsAppButton"
import { Eyebrow as BrandEyebrow } from "@/components/Eyebrow"
import { LegalLink } from "@/components/LegalLink"
import { Wordmark } from "@/components/icons/Wordmark"
import { useCarouselProgress, CarouselProgressBar } from "@/components/CarouselProgress"
import { useWhatsAppMessage } from "@/hooks/useWhatsAppMessage"
import { AIExperienceTeaser } from "@/components/AIExperienceTeaser"
import { cn } from "@/lib/utils"

const WHATSAPP_NUMBER = "972506944443"
const WHATSAPP_MESSAGE = "היי, ראיתי את ההטבה של סרטון ה-AI במתנה ורציתי לשמוע פרטים."

type ServiceKey = "web" | "ai" | "both"

const INTEREST_OPTIONS: { key: ServiceKey; label: string }[] = [
  { key: "web", label: "בניית אתר" },
  { key: "ai", label: "AI Creative" },
  { key: "both", label: "שניהם" },
]

const PROOF_ITEMS: { n: string; title: string; tag: string; video: string }[] = [
  { n: "01", title: "פרסומת AI", tag: "AI Commercial", video: "/videos/no-address.mp4" },
  { n: "02", title: "סרטון מוצר", tag: "Product Film", video: "/videos/second-skin.mp4" },
  { n: "03", title: "קונספט קריאייטיבי", tag: "Creative Concept", video: "/videos/raz-showreel-5.mp4" },
]

const CHOICE_CARDS: { n: string; key: ServiceKey; title: string; subtitle: string; cta: string }[] = [
  {
    n: "01",
    key: "web",
    title: "WEB",
    subtitle: "בניית אתר חדש / שדרוג / eCommerce / אתר AI",
    cta: "אני צריך אתר ←",
  },
  {
    n: "02",
    key: "ai",
    title: "AI CREATIVE",
    subtitle: "פרסומות / סרטוני מוצר / קמפיינים / קונספטים קריאייטיביים",
    cta: "אני צריך קריאייטיב ←",
  },
]

function inViewportId(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  el.scrollIntoView({ behavior: "smooth", block: "start" })
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm5.78 14.15c-.24.68-1.4 1.3-1.94 1.38-.5.08-1.12.11-1.81-.11-.42-.13-.95-.31-1.64-.6-2.88-1.24-4.76-4.15-4.9-4.34-.14-.19-1.17-1.56-1.17-2.98 0-1.42.74-2.11 1-2.4.26-.29.57-.36.76-.36.19 0 .38 0 .55.01.18.01.41-.07.64.49.24.58.81 1.99.88 2.13.07.15.12.32.02.51-.1.19-.15.31-.29.48-.15.17-.31.38-.44.51-.15.15-.3.31-.13.6.17.29.76 1.25 1.63 2.02 1.12 1 2.06 1.31 2.35 1.46.29.15.46.13.63-.08.17-.21.72-.84.91-1.13.19-.29.38-.24.64-.14.26.1 1.64.77 1.92.91.28.14.47.21.54.33.07.12.07.68-.17 1.36Z" />
    </svg>
  )
}

function GiftHeader() {
  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <nav className="flex items-center justify-between px-5 md:px-12 py-4 bg-background/40 backdrop-blur-xl border-b border-white/5">
        <a
          href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`}
          target="_blank"
          rel="noreferrer"
          onClick={() => trackEvent("gift_whatsapp_clicked", { location: "header" })}
          className="inline-flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-wide bg-[#D1FE17] text-black rounded-full px-4 py-2 hover:scale-105 transition-transform"
        >
          <WhatsAppIcon className="w-3.5 h-3.5" />
          וואטסאפ
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
  )
}

function Hero({ onPrimaryCta }: { onPrimaryCta: () => void }) {
  return (
    <section className="relative overflow-hidden pt-28 pb-14 md:pt-40 md:pb-24">
      <div className="container grid lg:grid-cols-[1.05fr_0.95fr] gap-10 lg:gap-16 items-center">
        <div>
          <BrandEyebrow>MADE BY RAZ · סרטון AI במתנה בסגירת פרויקט</BrandEyebrow>
          <Reveal className="mt-4">
            <h1 className="font-display font-black text-[clamp(32px,7vw,64px)] leading-[1.1] tracking-tight text-gradient-accent text-shimmer">
              סוגרים פרויקט.
              <br />
              מקבלים סרטון AI במתנה.
            </h1>
          </Reveal>
          <Reveal delay={100}>
            <p className="mt-5 max-w-xl text-dim text-base md:text-lg leading-relaxed">
              בסגירת פרויקט בניית אתר או חבילת AI Creative, תקבלו סרטון AI עד 15 שניות שנוצר במיוחד למותג שלכם.
            </p>
          </Reveal>
          <Reveal delay={180} className="mt-8">
            <button
              onClick={onPrimaryCta}
              className="inline-flex items-center justify-center w-full sm:w-fit font-mono text-sm font-bold uppercase tracking-wide bg-[#D1FE17] text-black rounded-[8px] px-7 py-3.5 hover:scale-105 transition-transform"
            >
              אני רוצה את המתנה שלי →
            </button>
          </Reveal>
          <Reveal delay={220} className="mt-5 font-mono text-[11px] uppercase tracking-wide text-dim">
            200+ אתרים · AI Creative · מענה תוך 24 שעות
          </Reveal>
        </div>
        <Reveal delay={140}>
          <div className="relative aspect-[4/5] sm:aspect-video lg:aspect-[4/5] rounded-[20px] overflow-hidden bg-neutral-900 shadow-2xl shadow-black/40">
            <AutoVideo src="/videos/raz-showreel.mp4" className="absolute inset-0 w-full h-full object-cover contrast-[1.05] brightness-[0.92]" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
            <div className="absolute top-4 right-4 flex flex-col items-end gap-1.5">
              <span className="inline-block font-mono text-[10px] font-bold uppercase tracking-wide bg-[#D1FE17] text-black rounded-full px-2.5 py-1">
                מתנה 🎁
              </span>
              <div className="bg-black/70 backdrop-blur-sm rounded-lg px-3 py-1.5 text-center">
                <div className="font-display font-black text-3xl text-[#D1FE17] leading-none">15</div>
                <div className="font-mono text-[8px] uppercase tracking-wide text-white/80 mt-0.5">שניות במתנה</div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

function ProofSection() {
  const { ref: carouselRef, thumb } = useCarouselProgress<HTMLDivElement>()
  return (
    <section className="py-20 md:py-28 section-divider">
      <div className="container">
        <BrandEyebrow>Show, don't tell</BrandEyebrow>
        <div className="mt-4">
          <SectionHeading>דברים שאני יוצר.</SectionHeading>
        </div>

        <div
          ref={carouselRef}
          className="mt-12 flex gap-4 overflow-x-auto snap-x snap-mandatory -mx-6 px-6 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:px-0 sm:pb-0 sm:overflow-visible sm:grid sm:grid-cols-3"
        >
          {PROOF_ITEMS.map((item, i) => (
            <Reveal key={item.video} delay={i * 70} className="flex-none w-[78vw] max-w-[320px] snap-center sm:w-auto sm:max-w-none">
              <div className="relative aspect-[9/16] rounded-xl overflow-hidden bg-neutral-900">
                <AutoVideo src={item.video} className="absolute inset-0 w-full h-full object-cover contrast-[1.05] brightness-[0.9]" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/5 to-transparent" />
                <div className="absolute top-4 right-4 font-display font-black text-2xl text-[#D1FE17]">{item.n}</div>
                <div className="absolute bottom-4 right-4 left-4">
                  <h3 className="font-display font-medium text-lg text-white">{item.title}</h3>
                  <div className="font-mono text-[10px] uppercase tracking-wide text-white/60 mt-1">{item.tag}</div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
        <CarouselProgressBar thumb={thumb} className="mt-3 mx-6 sm:hidden" />

        <Reveal delay={120} className="mt-10 font-mono text-sm uppercase tracking-wide text-dim">
          רוצים משהו כזה למותג שלכם? ↓
        </Reveal>
      </div>
    </section>
  )
}

function ChooseSection({
  selected,
  onSelect,
}: {
  selected: ServiceKey | null
  onSelect: (key: ServiceKey) => void
}) {
  return (
    <section className="py-20 md:py-28 section-divider">
      <div className="container">
        <BrandEyebrow>Choose your project</BrandEyebrow>
        <div className="mt-4">
          <SectionHeading>מה אתם צריכים?</SectionHeading>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mt-12">
          {CHOICE_CARDS.map((card, i) => (
            <Reveal key={card.key} delay={i * 70}>
              <button
                onClick={() => onSelect(card.key)}
                className={cn(
                  "group block w-full text-right surface-raised rounded-xl p-6 h-full transition-colors border",
                  selected === card.key ? "border-[#D1FE17]" : "border-transparent hover:border-white/15"
                )}
              >
                <div className="font-display font-black text-4xl md:text-5xl text-[#D1FE17] mb-3">{card.n}</div>
                <h3 className="font-display font-bold text-2xl mb-2">{card.title}</h3>
                <p className="text-dim text-sm leading-relaxed mb-4">{card.subtitle}</p>
                <span className="inline-block font-mono text-[10px] font-bold uppercase tracking-wide bg-[#D1FE17]/10 text-[#D1FE17] rounded-full px-3 py-1 mb-5">
                  + סרטון AI במתנה 🎁
                </span>
                <div className="font-mono text-sm font-bold uppercase tracking-wide text-white group-hover:text-[#D1FE17] transition-colors">
                  {card.cta}
                </div>
              </button>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

function LeadForm({ preselected, onSelectedApplied }: { preselected: ServiceKey | null; onSelectedApplied: () => void }) {
  const [interest, setInterest] = useState<ServiceKey | null>(null)
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [businessLink, setBusinessLink] = useState("")
  const [consent, setConsent] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; phone?: string; interest?: string; consent?: string }>({})
  const [justConfirmed, setJustConfirmed] = useState(false)
  const startedRef = useRef(false)
  const reduced = useReducedMotion()

  useEffect(() => {
    if (!preselected) return
    setInterest(preselected)
    setJustConfirmed(true)
    const t = window.setTimeout(() => setJustConfirmed(false), 1600)
    onSelectedApplied()
    return () => window.clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preselected])

  function markStarted() {
    if (startedRef.current) return
    startedRef.current = true
    trackEvent("gift_form_started")
  }

  async function handleSubmit() {
    const errors: typeof fieldErrors = {}
    if (!name.trim()) errors.name = "שדה חובה"
    if (!phone.trim()) errors.phone = "שדה חובה"
    if (!interest) errors.interest = "בחרו מה מעניין אתכם"
    if (!consent) errors.consent = "צריך לאשר את מדיניות הפרטיות כדי לשלוח את הטופס"
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return

    setSubmitting(true)
    setError(null)

    const interestLabel = INTEREST_OPTIONS.find((o) => o.key === interest)?.label ?? interest
    const utm = captureUtmParams()

    const { error: dbError } = await supabase.from("leads").insert({
      name,
      email: phone,
      phone,
      company: businessLink || null,
      project_type: interestLabel,
      message: null,
      metadata: { source: "gift_landing", selected_service: interest, ...utm },
    })

    setSubmitting(false)
    if (dbError) {
      setError("משהו השתבש, נסו שוב או שלחו וואטסאפ.")
      return
    }

    fetch("/api/notify-lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email: phone, phone, company: businessLink, projectType: interestLabel, message: "מקור: דף נחיתה — מתנה AI" }),
    }).catch(() => {})

    trackEvent("gift_lead_submitted", { interest: interestLabel })
    setSubmitted(true)
  }

  const inputClass =
    "w-full bg-transparent border border-white/30 rounded px-4 py-3 text-sm focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:border-white/50"
  const labelClass = "block text-xs font-mono text-dim uppercase tracking-wide mb-2"

  return (
    <section id="lead-form" className="py-20 md:py-28 section-divider scroll-mt-20">
      <div className="container max-w-xl">
        <BrandEyebrow>Let's talk</BrandEyebrow>
        <div className="mt-4">
          <SectionHeading headingClassName="font-display font-bold text-[clamp(26px,5.6vw,44px)] leading-[1.2] tracking-tight">
            בואו נעשה משהו שאי אפשר להתעלם ממנו.
          </SectionHeading>
        </div>
        <Reveal delay={80}>
          <p className="mt-4 text-dim text-base leading-relaxed">כמה פרטים קצרים ואחזור אליכם עם הכיוון המתאים.</p>
        </Reveal>

        {submitted ? (
          <Reveal className="mt-10 py-10 text-center border border-[#D1FE17]/30 rounded-2xl bg-[#D1FE17]/[0.06]">
            <p className="font-display font-black text-3xl mb-3 text-gradient-accent">קיבלתי 🙌</p>
            <p className="text-dim text-sm md:text-base leading-relaxed max-w-sm mx-auto">
              אעבור על הפרטים ואחזור אליכם תוך 24 שעות.
            </p>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`}
              target="_blank"
              rel="noreferrer"
              onClick={() => trackEvent("gift_whatsapp_clicked", { location: "success_state" })}
              className="inline-flex items-center gap-2 mt-6 font-mono text-xs font-bold uppercase tracking-wide border border-white/20 rounded-full px-5 py-3 hover:border-[#D1FE17] hover:text-[#D1FE17] transition-colors"
            >
              <WhatsAppIcon className="w-4 h-4" />
              דברו איתי עכשיו ב-WhatsApp →
            </a>
          </Reveal>
        ) : (
          <Reveal delay={140} className="mt-10 space-y-5">
            <div>
              <div className={labelClass}>מה מעניין אתכם? *</div>
              <div className="flex flex-wrap gap-2">
                {INTEREST_OPTIONS.map((o) => (
                  <button
                    key={o.key}
                    type="button"
                    onClick={() => {
                      markStarted()
                      setInterest(o.key)
                    }}
                    className={cn(
                      "font-mono text-xs font-bold uppercase tracking-wide rounded-full px-4 py-2.5 border transition-colors",
                      interest === o.key ? "border-[#D1FE17] bg-[#D1FE17] text-black" : "border-white/15 text-dim hover:border-[#D1FE17]",
                      !reduced && justConfirmed && interest === o.key && "ring-2 ring-[#D1FE17] ring-offset-2 ring-offset-background animate-pulse"
                    )}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
              {justConfirmed && (
                <p className="mt-2 text-xs text-[#D1FE17]">✓ נבחר מהכרטיס למעלה, אפשר לשנות אם צריך</p>
              )}
              {fieldErrors.interest && <p className="text-red-400 text-xs mt-1.5">{fieldErrors.interest}</p>}
            </div>

            <div>
              <label className={labelClass} htmlFor="gift-name">שם *</label>
              <input
                id="gift-name"
                className={inputClass}
                value={name}
                onFocus={markStarted}
                onChange={(e) => setName(e.target.value)}
                placeholder="שם מלא"
              />
              {fieldErrors.name && <p className="text-red-400 text-xs mt-1.5">{fieldErrors.name}</p>}
            </div>

            <div>
              <label className={labelClass} htmlFor="gift-phone">טלפון / וואטסאפ *</label>
              <input
                id="gift-phone"
                className={inputClass}
                value={phone}
                onFocus={markStarted}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="050-0000000"
                dir="ltr"
              />
              {fieldErrors.phone && <p className="text-red-400 text-xs mt-1.5">{fieldErrors.phone}</p>}
            </div>

            <div>
              <label className={labelClass} htmlFor="gift-business">שם העסק / אתר / אינסטגרם (לא חובה)</label>
              <input
                id="gift-business"
                className={inputClass}
                value={businessLink}
                onChange={(e) => setBusinessLink(e.target.value)}
                placeholder="שם העסק, לינק לאתר או לאינסטגרם"
              />
            </div>

            <ConsentCheckbox id="gift-consent" checked={consent} onChange={setConsent} error={fieldErrors.consent} dark>
              קראתי ואני מאשר/ת את <LegalLink to="/privacy" className="underline hover:text-[#D1FE17] transition-colors">מדיניות הפרטיות</LegalLink>
            </ConsentCheckbox>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full font-mono text-sm font-bold uppercase tracking-wide bg-[#D1FE17] text-black rounded-[8px] px-6 py-4 hover:scale-[1.02] transition-transform disabled:opacity-60"
            >
              {submitting ? "שולח…" : "אני רוצה את הסרטון שלי ←"}
            </button>
            <p className="font-mono text-[11px] uppercase tracking-wide text-dim text-center">
              אחזור אליכם תוך 24 שעות · ללא התחייבות
            </p>
          </Reveal>
        )}

        <p className="mt-8 text-xs text-dim/70 leading-relaxed">
          ההטבה כוללת סרטון AI אחד באורך של עד 15 שניות בסגירת פרויקט בניית אתר או חבילת AI Creative עם Made by RAZ.
        </p>
      </div>
    </section>
  )
}

function MobileCta({ onPrimaryCta }: { onPrimaryCta: () => void }) {
  return (
    <div
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 grid grid-cols-2 border-t border-white/10 bg-background/95 backdrop-blur-xl"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <button
        onClick={onPrimaryCta}
        className="flex items-center justify-center py-3.5 font-mono text-[10px] font-bold uppercase tracking-wide border-l border-white/10 bg-[#D1FE17] text-black"
      >
        אני רוצה את המתנה שלי
      </button>
      <a
        href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`}
        target="_blank"
        rel="noreferrer"
        onClick={() => trackEvent("gift_whatsapp_clicked", { location: "mobile_sticky_bar" })}
        className="flex items-center justify-center gap-2 py-3.5 font-mono text-[10px] font-bold uppercase tracking-wide"
      >
        <WhatsAppIcon className="w-4 h-4" />
        WhatsApp
      </a>
    </div>
  )
}

function GiftFooter() {
  return (
    <footer className="border-t border-white/10 py-10">
      <div className="container flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-right">
        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-5">
          <Wordmark className="h-5 w-auto" />
          <span className="font-mono text-[11px] uppercase tracking-wide text-dim">200+ אתרים · 6 שנות ניסיון · WEB + AI</span>
        </div>
        <div className="flex items-center gap-5 font-mono text-[11px] uppercase tracking-wide text-dim">
          <LegalLink to="/privacy" className="hover:text-[#D1FE17] transition-colors">פרטיות</LegalLink>
          <LegalLink to="/terms" className="hover:text-[#D1FE17] transition-colors">תנאי שימוש</LegalLink>
          <span>© {new Date().getFullYear()} RAZ</span>
        </div>
      </div>
    </footer>
  )
}

export function GiftLanding() {
  const [selected, setSelected] = useState<ServiceKey | null>(null)
  const [pendingScroll, setPendingScroll] = useState(false)

  useDocumentMeta(
    "סרטון AI במתנה בסגירת פרויקט · Made by RAZ",
    "סוגרים פרויקט בניית אתר או חבילת AI Creative ומקבלים סרטון AI עד 15 שניות שנוצר במיוחד למותג שלכם.",
    undefined,
    undefined,
    { noindex: true }
  )

  useWhatsAppMessage(WHATSAPP_MESSAGE)

  useEffect(() => {
    trackEvent("gift_landing_view")
  }, [])

  function scrollToForm(location: string) {
    trackEvent("gift_primary_cta_click", { location })
    inViewportId("lead-form")
  }

  function handleSelectCard(key: ServiceKey) {
    trackEvent(key === "web" ? "gift_web_selected" : "gift_ai_selected", { location: "choose_section" })
    setSelected(key)
    setPendingScroll(true)
    inViewportId("lead-form")
  }

  return (
    <div className="min-h-screen">
      <GiftHeader />
      <Hero onPrimaryCta={() => scrollToForm("hero")} />
      <ProofSection />
      <AIExperienceTeaser onExploreClick={() => scrollToForm("ai_experience_teaser")} />
      <ChooseSection selected={selected} onSelect={handleSelectCard} />
      <LeadForm preselected={pendingScroll ? selected : null} onSelectedApplied={() => setPendingScroll(false)} />
      <GiftFooter />
      <div className="h-16 md:hidden" aria-hidden="true" />
      <WhatsAppButton />
      <MobileCta onPrimaryCta={() => scrollToForm("mobile_sticky_bar")} />
      <CookieConsent />
    </div>
  )
}
