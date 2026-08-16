import { Link, useLocation } from "react-router-dom"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/hooks/useAuth"
import { cn } from "@/lib/utils"

const LINKS = [
  { to: "/admin", label: "לוח בקרה" },
  { to: "/admin/clients", label: "לקוחות" },
  { to: "/admin/services", label: "שירותים" },
  { to: "/admin/guides", label: "מדריכים" },
  { to: "/admin/faq", label: "FAQ" },
  { to: "/admin/pages", label: "עמודים" },
]

export function AdminNav() {
  const { user } = useAuth()
  const { pathname } = useLocation()

  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="font-display font-bold text-2xl">RAZ Admin</div>
          <div className="text-dim text-xs mt-1">{user?.email}</div>
        </div>
        <button
          onClick={() => supabase.auth.signOut()}
          className="font-mono text-xs uppercase tracking-wide text-dim hover:text-[#D1FE17] transition-colors"
        >
          Sign out
        </button>
      </div>
      <div className="flex gap-2 border-b border-white/10 flex-wrap">
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
  )
}
