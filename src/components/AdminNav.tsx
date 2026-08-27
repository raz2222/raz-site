import { Link, useLocation } from "react-router-dom"
import { LayoutDashboard, Users, Layers, BookOpen, HelpCircle, FileText, LogOut, Calculator, Sparkles, Briefcase, Receipt } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/hooks/useAuth"
import { cn } from "@/lib/utils"

const LINKS = [
  { to: "/admin", label: "לוח בקרה", icon: LayoutDashboard },
  { to: "/admin/clients", label: "לקוחות", icon: Users },
  { to: "/admin/price-book", label: "מחירון", icon: Calculator },
  { to: "/admin/quotes", label: "הצעות מחיר", icon: Receipt },
  { to: "/admin/services", label: "שירותים", icon: Layers },
  { to: "/admin/projects", label: "עבודות", icon: Briefcase },
  { to: "/admin/ai-experience", label: "חוויית AI", icon: Sparkles },
  { to: "/admin/guides", label: "מדריכים", icon: BookOpen },
  { to: "/admin/faq", label: "FAQ", icon: HelpCircle },
  { to: "/admin/pages", label: "עמודים", icon: FileText },
]

export function AdminNav() {
  const { user } = useAuth()
  const { pathname } = useLocation()

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
            className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-wide text-dim hover:text-[#D1FE17] transition-colors p-2 -m-2"
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
                pathname === l.to ? "border-foreground text-foreground" : "border-transparent text-dim hover:text-[#D1FE17]"
              )}
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>

      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 grid grid-cols-10 border-t border-white/10 bg-background/95 backdrop-blur-xl"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {LINKS.map((l) => {
          const active = pathname === l.to
          const Icon = l.icon
          return (
            <Link
              key={l.to}
              to={l.to}
              className={cn(
                "flex flex-col items-center justify-center gap-1 py-2.5 transition-colors",
                active ? "text-[#D1FE17]" : "text-dim"
              )}
            >
              <Icon size={20} strokeWidth={active ? 2.4 : 2} />
              <span className="font-mono text-[9px] uppercase tracking-wide leading-none">{l.label}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
