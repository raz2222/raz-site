import { Link } from "react-router-dom"
import { Wordmark } from "@/components/icons/Wordmark"
import { useContactModal } from "@/hooks/useContactModal"

export function ShowcaseNav() {
  const { openModal } = useContactModal()

  return (
    <nav
      dir="ltr"
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 md:px-12 py-4 text-foreground bg-background/40 backdrop-blur-xl border-b border-white/5"
    >
      <Link to="/" aria-label="RAZ" className="flex items-center">
        <Wordmark className="h-6 w-auto" />
      </Link>
      <div className="flex items-center gap-6 md:gap-8 font-mono text-xs uppercase tracking-wide">
        <Link to="/work" className="hover:opacity-60 transition-opacity">
          Work
        </Link>
        <a href="#about" className="hidden sm:inline hover:opacity-60 transition-opacity">
          About
        </a>
        <button
          onClick={() => openModal({ source: "showcase" })}
          className="font-bold bg-[#D1FE17] text-black rounded-[8px] px-4 py-2 hover:scale-105 transition-transform"
        >
          Contact
        </button>
      </div>
    </nav>
  )
}
