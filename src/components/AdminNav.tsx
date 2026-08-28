import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { LayoutDashboard, Users, Layers, BookOpen, HelpCircle, FileText, LogOut, Calculator, Sparkles, Briefcase, Receipt, MoreHorizontal, X } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/hooks/useAuth"
import { cn } from "@/lib/utils"

// Order matters: the first 4 are the mobile bottom bar's primary tabs (the
// workflow actually used from a phone) — the rest live behind "More" there.
// Desktop's tab row shows every entry regardless of order.
const LINKS = [
  { to: "/admin", label: "לוח בקרה", icon: LayoutDashboard },
  { to: "/admin/clients", label: "לקוחות", icon: Users },
  { to: "/admin/quotes", label: "הצעות מחיר", icon: Receipt },
  { to: "/admin/price-book", label: "מחירון", icon: Calculator },
  { to: "/admin/services", label: "שירותים", icon: Layers },
  { to: "/admin/projects", label: "עבודות", icon: Briefcase },
  { to: "/admin/ai-experience", label: "חוויית AI", icon: Sparkles },
  { to: "/admin/guides", label: "מדריכים", icon: BookOpen },
  { to: "/admin/faq", label: "FAQ", icon: HelpCircle },
  { to: "/admin/pages", label: "עמודים", icon: FileText },
]

const PRIMARY_LINKS = LINKS.slice(0, 4)
const OVERFLOW_LINKS = LINKS.slice(4)

export function AdminNav() {
  const { user } = useAuth()
  const { pathname } = useLocation()
  const [moreOpen, setMoreOpen] = useState(false)
  const overflowActive = OVERFLOW_LINKS.some((l) => pathname === l.to)

  return (
    <>
      <div className="mb-8 md:mb-10">
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <div>
            <Link to="/admin" className="font-display font-bold text-xl md:text-2xl hover:opacity-70 transition-opacity">RAZ Admin</Link>
            <div className="text-dim text-[11px] md:text-xs mt-1 truncate max-w-[60vw]">{user?.email}</div>
          </div>
          <button
            onClick={() => supabase.auth.signOut()}
            aria-label="Sign out"
            className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-wide text-dim hover:text-lime transition-colors p-2 -m-2"
          >
            <LogOut size={16} className="md:hidden" />
            <span className="hidden md:inline">Sign out</span>
          </button>
        </div>
        <div className="hidden md:flex gap-2 border-b border-white/10 flex-wrap">
          {LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={cn(
                "font-mono text-xs uppercase tracking-wide px-4 py-3 border-b-2 -mb-px transition-colors",
                pathname === l.to ? "border-foreground text-foreground" : "border-transparent text-dim hover:text-lime"
              )}
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>

      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 grid grid-cols-5 border-t border-white/10 bg-background/95 backdrop-blur-xl"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {PRIMARY_LINKS.map((l) => {
          const active = pathname === l.to
          const Icon = l.icon
          return (
            <Link
              key={l.to}
              to={l.to}
              className="flex flex-col items-center justify-center gap-1 py-2.5"
            >
              <span className={cn("flex items-center justify-center w-9 h-9 rounded-full transition-colors", active ? "bg-lime text-black" : "text-dim")}>
                <Icon size={19} strokeWidth={active ? 2.4 : 2} />
              </span>
              <span className={cn("font-mono text-[9px] uppercase tracking-wide leading-none transition-colors", active ? "text-lime" : "text-dim")}>
                {l.label}
              </span>
            </Link>
          )
        })}
        <button
          onClick={() => setMoreOpen(true)}
          className="flex flex-col items-center justify-center gap-1 py-2.5"
        >
          <span className={cn("flex items-center justify-center w-9 h-9 rounded-full transition-colors", overflowActive ? "bg-lime text-black" : "text-dim")}>
            <MoreHorizontal size={19} strokeWidth={overflowActive ? 2.4 : 2} />
          </span>
          <span className={cn("font-mono text-[9px] uppercase tracking-wide leading-none transition-colors", overflowActive ? "text-lime" : "text-dim")}>
            עוד
          </span>
        </button>
      </nav>

      {moreOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <button
            aria-label="Close"
            onClick={() => setMoreOpen(false)}
            className="absolute inset-0 bg-black/40"
          />
          <div
            className="absolute inset-x-0 bottom-0 rounded-t-2xl border-t border-white/10 bg-background"
            style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
          >
            <div className="flex justify-between items-center px-4 pt-4">
              <span className="font-mono text-xs uppercase tracking-wide text-dim">עוד</span>
              <button onClick={() => setMoreOpen(false)} aria-label="Close" className="w-10 h-10 flex items-center justify-center">
                <X size={18} />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3 p-4">
              {OVERFLOW_LINKS.map((l) => {
                const active = pathname === l.to
                const Icon = l.icon
                return (
                  <Link
                    key={l.to}
                    to={l.to}
                    onClick={() => setMoreOpen(false)}
                    className={cn(
                      "flex flex-col items-center justify-center gap-2 rounded-lg border py-4 transition-colors",
                      active ? "border-lime/40 bg-lime/10 text-lime" : "border-white/10 text-dim"
                    )}
                  >
                    <Icon size={22} strokeWidth={active ? 2.4 : 2} />
                    <span className="font-mono text-[10px] uppercase tracking-wide leading-none text-center">{l.label}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
