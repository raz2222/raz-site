import { useEffect, useRef, useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"
import { Wordmark } from "@/components/icons/Wordmark"
import { useContactModal } from "@/hooks/useContactModal"
import { useFocusTrap } from "@/hooks/useFocusTrap"
import { AnnouncementBar } from "@/components/AnnouncementBar"

type DropdownItem = { label: string; href: string }

const AI_ITEMS: DropdownItem[] = [
  { label: "סרטוני AI", href: "/services/ai-content/product-videos" },
  { label: "פרסומות AI", href: "/services/ai-content/creative-direction" },
  { label: "תמונות / קמפיינים", href: "/services/ai-content/ai-photography" },
  { label: "UGC / Product Content", href: "/services/ai-content/social-content" },
]

const WEB_ITEMS: DropdownItem[] = [
  { label: "אתרי WordPress", href: "/services/web-design/wordpress-development" },
  { label: "אתרי AI", href: "/services/web-design/custom-development" },
  { label: "חנויות אונליין", href: "/services/web-design/ecommerce" },
  { label: "אתרים אינטראקטיביים", href: "/services/web-design/interactive-websites" },
]

const LINKS_EN = [
  { href: "/en/services", label: "AI Creative" },
  { href: "/en/services", label: "Web Design" },
  { href: "/en/work", label: "Work" },
  { href: "/en/about", label: "About" },
]

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 10 6" fill="none" className={className} aria-hidden="true">
      <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function NavDropdown({
  label,
  items,
  viewAllHref,
  viewAllLabel,
  isEnglish,
}: {
  label: string
  items: DropdownItem[]
  viewAllHref: string
  viewAllLabel: string
  isEnglish: boolean
}) {
  const [open, setOpen] = useState(false)
  const closeTimer = useRef<number | null>(null)
  const ref = useRef<HTMLDivElement>(null)

  function openNow() {
    if (closeTimer.current) window.clearTimeout(closeTimer.current)
    setOpen(true)
  }
  function closeSoon() {
    closeTimer.current = window.setTimeout(() => setOpen(false), 140)
  }

  useEffect(() => {
    if (!open) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false)
    }
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("keydown", onKeyDown)
    document.addEventListener("mousedown", onClickOutside)
    return () => {
      document.removeEventListener("keydown", onKeyDown)
      document.removeEventListener("mousedown", onClickOutside)
    }
  }, [open])

  return (
    <div ref={ref} className="relative" onMouseEnter={openNow} onMouseLeave={closeSoon}>
      <button
        onFocus={openNow}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-1.5 hover:opacity-60 transition-opacity"
      >
        {label}
        <ChevronIcon className={cn("w-2.5 h-2.5 transition-transform duration-200", open && "rotate-180")} />
      </button>
      <div
        role="menu"
        className={cn(
          "absolute top-full pt-4 transition-all duration-200",
          isEnglish ? "left-0" : "right-0",
          open ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-1 pointer-events-none"
        )}
      >
        <div className="min-w-[240px] bg-black border border-white/10 rounded-xl p-2 shadow-2xl shadow-black/60">
          {items.map((it) => (
            <Link
              key={it.href}
              to={it.href}
              role="menuitem"
              onClick={() => setOpen(false)}
              className="block px-4 py-2.5 rounded-lg text-sm text-white/75 hover:bg-white/5 hover:text-[#D1FE17] transition-colors"
            >
              {it.label}
            </Link>
          ))}
          <div className="my-1.5 h-px bg-white/10" />
          <Link
            to={viewAllHref}
            role="menuitem"
            onClick={() => setOpen(false)}
            className="block px-4 py-2.5 rounded-lg font-mono text-xs uppercase tracking-wide text-[#D1FE17] hover:bg-white/5 transition-colors"
          >
            {viewAllLabel}
          </Link>
        </div>
      </div>
    </div>
  )
}

function MobileAccordion({
  label,
  items,
  viewAllHref,
  viewAllLabel,
  open,
  onToggle,
  onNavigate,
}: {
  label: string
  items: DropdownItem[]
  viewAllHref: string
  viewAllLabel: string
  open: boolean
  onToggle: () => void
  onNavigate: () => void
}) {
  return (
    <div>
      <button
        onClick={onToggle}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-4 font-display font-bold text-4xl text-right"
      >
        {label}
        <ChevronIcon className={cn("w-4 h-4 flex-none transition-transform duration-200", open && "rotate-180")} />
      </button>
      <div className={cn("grid transition-all duration-300", open ? "grid-rows-[1fr] mt-3" : "grid-rows-[0fr]")}>
        <div className="overflow-hidden flex flex-col gap-1">
          {items.map((it) => (
            <Link
              key={it.href}
              to={it.href}
              onClick={onNavigate}
              className="font-mono text-sm uppercase tracking-wide text-white/65 py-2"
            >
              {it.label}
            </Link>
          ))}
          <Link to={viewAllHref} onClick={onNavigate} className="font-mono text-sm uppercase tracking-wide text-[#D1FE17] py-2">
            {viewAllLabel}
          </Link>
        </div>
      </div>
    </div>
  )
}

export function Nav() {
  const [open, setOpen] = useState(false)
  const [mobileAiOpen, setMobileAiOpen] = useState(false)
  const [mobileWebOpen, setMobileWebOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const isEnglish = useLocation().pathname.startsWith("/en")
  const { openModal } = useContactModal()

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : ""
    return () => {
      document.body.style.overflow = ""
    }
  }, [open])

  useFocusTrap(panelRef, open)

  useEffect(() => {
    if (!open) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false)
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [open])

  function closeMobile() {
    setOpen(false)
    setMobileAiOpen(false)
    setMobileWebOpen(false)
  }

  // Focusing the first menu item synchronously inside this click handler (rather than in a
  // useEffect keyed on `open`) keeps the browser's real :focus-visible heuristic intact: a
  // mouse/touch tap here correctly suppresses the focus ring, while a keyboard-activated
  // (Enter/Space) toggle still shows it — no global focus-visible override needed.
  function toggleMobile() {
    const next = !open
    setOpen(next)
    if (next) panelRef.current?.focus()
    else closeMobile()
  }

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50">
        <AnnouncementBar isEnglish={isEnglish} onCtaClick={openModal} />
        <nav
          dir={isEnglish ? "ltr" : "rtl"}
          className={cn(
            "flex items-center justify-between px-5 md:px-12 py-4",
            open ? "text-white" : "text-foreground bg-background/40 backdrop-blur-xl border-b border-white/5"
          )}
        >
          <Link
            to={isEnglish ? "/en" : "/"}
            aria-label="MADE BY RAZ"
            className={cn("flex items-center", !isEnglish && "order-last md:order-none")}
          >
            <Wordmark className="h-6 w-auto" />
          </Link>
          <div className="hidden md:flex items-center gap-8 font-mono text-xs uppercase tracking-wide">
            {isEnglish ? (
              LINKS_EN.map((l) => (
                <Link key={l.label} to={l.href} className="hover:opacity-60 transition-opacity">
                  {l.label}
                </Link>
              ))
            ) : (
              <>
                <NavDropdown label="יצירת תוכן AI" items={AI_ITEMS} viewAllHref="/services/ai-content" viewAllLabel="כל שירותי ה-AI →" isEnglish={false} />
                <NavDropdown label="בניית אתרים" items={WEB_ITEMS} viewAllHref="/services/web-design" viewAllLabel="כל שירותי בניית האתרים →" isEnglish={false} />
                <Link to="/work" className="hover:opacity-60 transition-opacity">עבודות</Link>
                <Link to="/about" className="hover:opacity-60 transition-opacity">אודות</Link>
              </>
            )}
          </div>
          <div className="hidden md:flex items-center gap-4">
            <Link
              to={isEnglish ? "/" : "/en"}
              className="font-mono text-xs uppercase tracking-wide text-dim hover:text-[#D1FE17] transition-colors"
            >
              {isEnglish ? "עברית" : "EN"}
            </Link>
            {isEnglish ? (
              <Link
                to="/en/contact"
                className="font-mono text-[10px] font-bold uppercase tracking-wide bg-[#D1FE17] text-black rounded-full px-4 py-2 hover:scale-105 transition-transform"
              >
                Contact →
              </Link>
            ) : (
              <button
                onClick={() => openModal()}
                className="font-mono text-[10px] font-bold uppercase tracking-wide bg-[#D1FE17] text-black rounded-full px-4 py-2 hover:scale-105 transition-transform"
              >
                צור קשר ←
              </button>
            )}
          </div>
          <button
            onClick={toggleMobile}
            aria-label={open ? (isEnglish ? "Close menu" : "סגור תפריט") : isEnglish ? "Open menu" : "פתח תפריט"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            className="md:hidden w-9 h-9 flex items-center justify-center"
          >
            <span className="relative w-5 h-4 flex flex-col justify-between">
              <span className={cn("block h-[1.5px] w-full bg-current transition-transform duration-300", open && "translate-y-[7px] rotate-45")} />
              <span className={cn("block h-[1.5px] w-full bg-current transition-opacity duration-200", open && "opacity-0")} />
              <span className={cn("block h-[1.5px] w-full bg-current transition-transform duration-300", open && "-translate-y-[7px] -rotate-45")} />
            </span>
          </button>
        </nav>
      </div>

      <div
        id="mobile-menu"
        ref={panelRef}
        tabIndex={-1}
        dir={isEnglish ? "ltr" : "rtl"}
        aria-hidden={!open}
        className={cn(
          "fixed inset-0 z-40 bg-black text-white flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] md:hidden outline-none",
          open ? "translate-y-0" : "-translate-y-full pointer-events-none"
        )}
      >
        <div className="flex-1 overflow-y-auto flex flex-col justify-center gap-3 px-8 py-8 pt-24">
          {isEnglish ? (
            LINKS_EN.map((l) => (
              <Link
                key={l.label}
                to={l.href}
                tabIndex={open ? 0 : -1}
                onClick={closeMobile}
                className="font-display font-bold text-4xl"
              >
                {l.label}
              </Link>
            ))
          ) : (
            <>
              <MobileAccordion
                label="יצירת תוכן AI"
                items={AI_ITEMS}
                viewAllHref="/services/ai-content"
                viewAllLabel="כל שירותי ה-AI →"
                open={mobileAiOpen}
                onToggle={() => setMobileAiOpen((v) => !v)}
                onNavigate={closeMobile}
              />
              <MobileAccordion
                label="בניית אתרים"
                items={WEB_ITEMS}
                viewAllHref="/services/web-design"
                viewAllLabel="כל שירותי בניית האתרים →"
                open={mobileWebOpen}
                onToggle={() => setMobileWebOpen((v) => !v)}
                onNavigate={closeMobile}
              />
              <Link to="/work" tabIndex={open ? 0 : -1} onClick={closeMobile} className="font-display font-bold text-4xl">
                עבודות
              </Link>
              <Link to="/about" tabIndex={open ? 0 : -1} onClick={closeMobile} className="font-display font-bold text-4xl">
                אודות
              </Link>
            </>
          )}

          {isEnglish ? (
            <Link to="/en/contact" tabIndex={open ? 0 : -1} onClick={closeMobile} className="font-display font-bold text-4xl">
              Contact
            </Link>
          ) : (
            <button
              tabIndex={open ? 0 : -1}
              onClick={() => {
                closeMobile()
                openModal()
              }}
              className="font-display font-bold text-4xl text-right"
            >
              צור קשר
            </button>
          )}
          <Link
            to={isEnglish ? "/" : "/en"}
            tabIndex={open ? 0 : -1}
            onClick={closeMobile}
            className="font-mono text-sm uppercase tracking-wide mt-4 text-white/60"
          >
            {isEnglish ? "עברית" : "English"}
          </Link>
        </div>
      </div>
    </>
  )
}
