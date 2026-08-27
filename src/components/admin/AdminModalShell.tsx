import { X } from "lucide-react"
import { cn } from "@/lib/utils"

/** Shared chrome for the full-screen CRUD edit overlay used across every
 * admin page. Fixes two mobile issues in the pattern this replaces:
 * viewport-fixed py-16 padding (ate too much of a short phone screen) and a
 * ~32px Close button (below the ~44px touch-target guideline). */
export function AdminModalShell({
  title,
  onClose,
  maxWidth = "max-w-xl",
  children,
}: {
  title: string
  onClose: () => void
  maxWidth?: string
  children: React.ReactNode
}) {
  return (
    <div className="fixed inset-0 z-[60] bg-background/95 overflow-y-auto py-8 md:py-16 px-4 md:px-6">
      <div className={cn("mx-auto", maxWidth)}>
        <div className="flex justify-between items-center mb-8">
          <div className="font-display font-bold text-xl">{title}</div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-10 h-10 -mr-2 flex items-center justify-center rounded-lg hover:bg-white/5 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
