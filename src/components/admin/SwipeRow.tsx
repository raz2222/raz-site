import { useRef, useState } from "react"
import { Archive, Trash2, Undo2 } from "lucide-react"

/** A row you can swipe aside to reveal what to do with it.
 *
 * Deliberately two steps: the swipe reveals, and a second tap acts. Raz asked
 * for exactly that · a list you scroll with your thumb must not be able to
 * delete a lead because a finger moved sideways. Nothing here removes a row
 * either way; both actions set a date, and both can be undone.
 *
 * The site is RTL, so "aside" is to the right and the buttons sit on the left.
 * A drag that is more vertical than horizontal is a scroll and is left alone,
 * which is the difference between this feeling native and feeling broken. */
const REVEAL_PX = 132
const ENGAGE_PX = 12

export function SwipeRow({
  children,
  onArchive,
  onDelete,
  onRestore,
  archived,
}: {
  children: React.ReactNode
  onArchive?: () => void
  onDelete?: () => void
  /** Present only in the archive, where the useful action is putting it back. */
  onRestore?: () => void
  archived?: boolean
}) {
  const [offset, setOffset] = useState(0)
  const [open, setOpen] = useState(false)
  const start = useRef<{ x: number; y: number; decided: "none" | "swipe" | "scroll" } | null>(null)

  function onTouchStart(e: React.TouchEvent) {
    const touch = e.touches[0]
    start.current = { x: touch.clientX, y: touch.clientY, decided: "none" }
  }

  function onTouchMove(e: React.TouchEvent) {
    if (!start.current) return
    const touch = e.touches[0]
    const dx = touch.clientX - start.current.x
    const dy = touch.clientY - start.current.y

    if (start.current.decided === "none") {
      if (Math.abs(dx) < ENGAGE_PX && Math.abs(dy) < ENGAGE_PX) return
      // Vertical wins ties: scrolling a list is far more common than swiping a
      // row, and a list that fights the scroll is worse than one with no swipe.
      start.current.decided = Math.abs(dx) > Math.abs(dy) ? "swipe" : "scroll"
    }
    if (start.current.decided !== "swipe") return

    const base = open ? REVEAL_PX : 0
    setOffset(Math.max(0, Math.min(REVEAL_PX, base + dx)))
  }

  function onTouchEnd() {
    if (start.current?.decided === "swipe") {
      const opened = offset > REVEAL_PX / 2
      setOpen(opened)
      setOffset(opened ? REVEAL_PX : 0)
    }
    start.current = null
  }

  function close() {
    setOpen(false)
    setOffset(0)
  }

  return (
    <div className="relative overflow-hidden rounded-lg">
      <div className="absolute inset-y-0 left-0 flex items-stretch gap-2 pl-0">
        {archived
          ? onRestore && (
              <SwipeAction label="שחזור" onClick={() => { close(); onRestore() }} tone="neutral">
                <Undo2 size={18} />
              </SwipeAction>
            )
          : onArchive && (
              <SwipeAction label="ארכיון" onClick={() => { close(); onArchive() }} tone="neutral">
                <Archive size={18} />
              </SwipeAction>
            )}
        {onDelete && (
          <SwipeAction label="לפח" onClick={() => { close(); onDelete() }} tone="danger">
            <Trash2 size={18} />
          </SwipeAction>
        )}
      </div>

      <div
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{ transform: `translateX(${offset}px)` }}
        className={start.current?.decided === "swipe" ? "relative bg-background" : "relative bg-background transition-transform duration-200"}
      >
        {children}
      </div>
    </div>
  )
}

function SwipeAction({
  label,
  onClick,
  tone,
  children,
}: {
  label: string
  onClick: () => void
  tone: "neutral" | "danger"
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={
        "w-16 flex flex-col items-center justify-center gap-1 rounded-lg border transition-colors " +
        (tone === "danger"
          ? "border-red-400/40 text-red-400 hover:bg-red-400/10"
          : "border-white/20 text-dim hover:text-foreground hover:bg-white/5")
      }
    >
      {children}
      <span className="font-mono text-[9px] uppercase tracking-wide">{label}</span>
    </button>
  )
}
