import { useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"
import { cn } from "@/lib/utils"

const LINKS = [
  { href: "/work", label: "עבודות" },
  { href: "/services", label: "שירותים" },
  { href: "/about", label: "עליי" },
  { href: "/guides", label: "מדריכים" },
  { href: "/faq", label: "שאלות ותשובות" },
]

export function Nav() {
  const [open, setOpen] = useState(false)
  const firstLinkRef = useRef<HTMLAnchorElement>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : ""
    const main = document.getElementById("main")
    if (main) {
      if (open) main.setAttribute("inert", "")
      else main.removeAttribute("inert")
    }
    if (open) firstLinkRef.current?.focus()
    else toggleRef.current?.focus()
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
        className={cn(
          "fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 md:px-12 py-6",
          open ? "text-background" : "text-foreground mix-blend-difference"
        )}
      >
        <Link to="/" className="font-display font-bold text-xl tracking-tight">
          RAZ
        </Link>
        <div className="hidden md:flex items-center gap-8 font-mono text-xs uppercase tracking-wide">
          {LINKS.map((l) => (
            <Link key={l.href} to={l.href} className="hover:opacity-60 transition-opacity">
              {l.label}
            </Link>
          ))}
        </div>
        <div className="hidden md:block">
          <Link
            to="/contact"
            className="font-mono text-xs uppercase tracking-wide border border-white/30 rounded-full px-4 py-2 hover:bg-foreground hover:text-background transition-colors"
          >
            בואו נתחיל ←
          </Link>
        </div>
        <button
          ref={toggleRef}
          className="md:hidden font-mono text-xs uppercase tracking-wide flex items-center gap-2"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "סגור תפריט" : "פתח תפריט"}
          aria-expanded={open}
          aria-controls="mobile-menu"
        >
          {open ? (
            <>
              <span>סגור</span>
              <span className="text-lg leading-none">×</span>
            </>
          ) : (
            "תפריט"
          )}
        </button>
      </nav>

      <div
        id="mobile-menu"
        aria-hidden={!open}
        className={cn(
          "fixed inset-0 z-40 bg-foreground text-background flex flex-col justify-center gap-2 px-8 transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] md:hidden",
          open ? "translate-y-0" : "-translate-y-full pointer-events-none"
        )}
      >
        <button
          onClick={() => setOpen(false)}
          aria-label="סגור תפריט"
          tabIndex={open ? 0 : -1}
          className="absolute top-6 left-5 font-mono text-xs uppercase tracking-wide flex items-center gap-2"
        >
          <span>סגור</span>
          <span className="text-lg leading-none">×</span>
        </button>
        {LINKS.map((l, i) => (
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
          צור קשר
        </Link>
      </div>
    </>
  )
}
