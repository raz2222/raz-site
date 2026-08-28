import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export type RowAction = {
  icon: LucideIcon
  label: string
  onClick: (e: React.MouseEvent) => void
  variant?: "default" | "danger"
}

/** Icon-button row actions (edit/delete/duplicate/remove) with real ~40px tap
 * targets — replaces the bare-text "עריכה"/"מחיקה" links used everywhere,
 * which were too small to reliably tap on a phone. */
export function RowActions({ actions, className }: { actions: RowAction[]; className?: string }) {
  return (
    <div className={cn("flex items-center gap-1 flex-none", className)}>
      {actions.map((a) => {
        const Icon = a.icon
        return (
          <button
            key={a.label}
            onClick={a.onClick}
            aria-label={a.label}
            title={a.label}
            className={cn(
              "min-w-[40px] min-h-[40px] flex items-center justify-center rounded-lg transition-colors",
              a.variant === "danger" ? "text-red-400 hover:bg-red-500/10" : "text-dim hover:text-lime hover:bg-white/5"
            )}
          >
            <Icon size={18} />
          </button>
        )
      })}
    </div>
  )
}
