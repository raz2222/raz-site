import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

const LINKS = [
  { href: "#work", label: "Work" },
  { href: "#services", label: "Services" },
  { href: "#about", label: "About" },
  { href: "#contact", label: "Contact" },
]

export function Nav() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : ""
    return () => {
      document.body.style.overflow = ""
    }
  }, [open])

  return (
    <>
      <nav
        className={cn(
          "fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 md:px-12 py-6",
          open ? "text-background" : "text-foreground mix-blend-difference"
        )}
      >
        <a href="#top" className="font-display font-bold text-xl tracking-tight">
          RAZ
        </a>
        <div className="hidden md:flex items-center gap-8 font-mono text-xs uppercase tracking-wide">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="hover:opacity-60 transition-opacity">
              {l.label}
            </a>
          ))}
        </div>
        <div className="hidden md:block">
          <a
            href="#contact"
            className="font-mono text-xs uppercase tracking-wide border border-white/20 rounded-full px-4 py-2 hover:bg-foreground hover:text-background transition-colors"
          >
            Start a Project →
          </a>
        </div>
        <button
          className="md:hidden font-mono text-xs uppercase tracking-wide flex items-center gap-2"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? (
            <>
              <span>Close</span>
              <span className="text-lg leading-none">×</span>
            </>
          ) : (
            "Menu"
          )}
        </button>
      </nav>

      <div
        className={cn(
          "fixed inset-0 z-40 bg-foreground text-background flex flex-col justify-center gap-2 px-8 transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] md:hidden",
          open ? "translate-y-0" : "-translate-y-full pointer-events-none"
        )}
      >
        <button
          onClick={() => setOpen(false)}
          aria-label="Close menu"
          className="absolute top-6 right-5 font-mono text-xs uppercase tracking-wide flex items-center gap-2"
        >
          <span>Close</span>
          <span className="text-lg leading-none">×</span>
        </button>
        {LINKS.map((l) => (
          <a
            key={l.href}
            href={l.href}
            onClick={() => setOpen(false)}
            className="font-display font-bold text-4xl"
          >
            {l.label}
          </a>
        ))}
      </div>
    </>
  )
}
