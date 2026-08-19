import { useEffect, useRef, useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { Globe } from "lucide-react"
import { cn } from "@/lib/utils"

const LINKS_HE = [
  { href: "/work", label: "עבודות" },
  { href: "/services", label: "שירותים" },
  { href: "/about", label: "עליי" },
  { href: "/guides", label: "מדריכים" },
  { href: "/faq", label: "שאלות ותשובות" },
]

const LINKS_EN = [
  { href: "/en/work", label: "Work" },
  { href: "/en/services", label: "Services" },
  { href: "/en/about", label: "About" },
  { href: "/en/faq", label: "FAQ" },
]

export function Nav() {
  const [open, setOpen] = useState(false)
  const firstLinkRef = useRef<HTMLAnchorElement>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)
  const isEnglish = useLocation().pathname.startsWith("/en")
  const links = isEnglish ? LINKS_EN : LINKS_HE

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : ""
    const main = document.getElementById("main")
    if (main) {
      if (open) main.setAttribute("inert", "")
      else main.removeAttribute("inert")
    }
    if (open) firstLinkRef.current?.focus()
    return () => {
      document.body.style.overflow = ""
      main?.removeAttribute("inert")
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false)
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [open])

  return (
    <>
      <nav
        dir={isEnglish ? "ltr" : "rtl"}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 md:px-12 py-4",
          open
            ? "text-background"
            : "text-foreground bg-background/40 backdrop-blur-xl border-b border-white/5"
        )}
      >
        <Link
          to={isEnglish ? "/en" : "/"}
          className={cn("font-display font-bold text-xl tracking-tight", !isEnglish && "order-last md:order-none")}
        >
          RAZ
        </Link>
        <div className="hidden md:flex items-center gap-8 font-mono text-xs uppercase tracking-wide">
          {links.map((l) => (
            <Link key={l.href} to={l.href} className="hover:opacity-60 transition-opacity">
              {l.label}
            </Link>
          ))}
        </div>
        <div className="hidden md:flex items-center gap-4">
          <Link
            to={isEnglish ? "/" : "/en"}
            className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-wide text-dim hover:text-[#D1FE17] transition-colors"
          >
            <Globe className="w-3.5 h-3.5" strokeWidth={1.75} />
            {isEnglish ? "עברית" : "EN"}
          </Link>
          <Link
            to={isEnglish ? "/en/contact" : "/contact"}
            className="font-mono text-xs uppercase tracking-wide bg-accent-gradient text-black rounded-full px-4 py-2 hover:scale-105 transition-transform"
          >
            {isEnglish ? "Start a Project →" : "בואו נתחיל ←"}
          </Link>
        </div>
        <button
          ref={toggleRef}
          onClick={() => setOpen((v) => !v)}
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

      <div
        id="mobile-menu"
        dir={isEnglish ? "ltr" : "rtl"}
        aria-hidden={!open}
        className={cn(
          "fixed inset-0 z-40 bg-foreground text-background flex flex-col justify-center gap-2 px-8 transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] md:hidden",
          open ? "translate-y-0" : "-translate-y-full pointer-events-none"
        )}
      >
        {links.map((l, i) => (
          <Link
            key={l.href}
            ref={i === 0 ? firstLinkRef : undefined}
            to={l.href}
            tabIndex={open ? 0 : -1}
            onClick={() => setOpen(false)}
            className="font-display font-bold text-4xl"
          >
            {l.label}
          </Link>
        ))}
        <Link
          to="/contact"
          tabIndex={open ? 0 : -1}
          onClick={() => setOpen(false)}
          className="font-display font-bold text-4xl"
        >
          {isEnglish ? "Contact" : "צור קשר"}
        </Link>
        <Link
          to={isEnglish ? "/" : "/en"}
          tabIndex={open ? 0 : -1}
          onClick={() => setOpen(false)}
          className="flex items-center gap-2 font-mono text-sm uppercase tracking-wide mt-4 text-background/70"
        >
          <Globe className="w-4 h-4" strokeWidth={1.75} />
          {isEnglish ? "עברית" : "English"}
        </Link>
      </div>
    </>
  )
}
