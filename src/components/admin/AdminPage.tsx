import { Link } from "react-router-dom"
import { ChevronRight, Search } from "lucide-react"
import { AdminNav } from "@/components/AdminNav"
import { cn } from "@/lib/utils"

/** One page shell for every admin screen.
 *
 * Seventeen screens each rolled their own: the same padding string repeated
 * seventeen times, ten different markups for the same h1, and no shared idea of
 * where the primary action sits. Anything laid out here is laid out once. */
export function AdminPage({
  title,
  description,
  action,
  backTo,
  backLabel,
  search,
  width = "list",
  loading,
  children,
}: {
  title: string
  description?: string
  /** The one thing this screen is for. Rendered top-left, lime, alone. */
  action?: React.ReactNode
  backTo?: string
  backLabel?: string
  search?: { value: string; onChange: (v: string) => void; placeholder: string }
  /** Lists read better narrow; tables and dashboards need the room. */
  width?: "list" | "wide"
  loading?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="min-h-[100dvh] pt-28 pb-28 md:pb-20 px-5 md:px-12">
      <AdminNav />
      <div className={cn("mx-auto", width === "list" ? "max-w-2xl" : "max-w-5xl")}>
        {backTo && (
          <Link
            to={backTo}
            className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wide text-dim hover:text-lime transition-colors mb-3"
          >
            <ChevronRight size={13} /> {backLabel ?? "חזרה"}
          </Link>
        )}

        <div className="flex justify-between items-start gap-4 mb-6 flex-wrap">
          <div className="min-w-0">
            <h1 className="font-display font-bold">{title}</h1>
            {description && <p className="text-dim text-sm mt-1 max-w-md">{description}</p>}
          </div>
          {action && <div className="flex-none">{action}</div>}
        </div>

        {search && (
          <div className="relative mb-5">
            <Search size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-dim pointer-events-none" />
            <input
              value={search.value}
              onChange={(e) => search.onChange(e.target.value)}
              placeholder={search.placeholder}
              className="w-full bg-transparent border border-white/30 rounded px-4 py-3 pr-11 text-sm"
            />
          </div>
        )}

        {loading ? <p className="text-dim text-sm py-10">טוען…</p> : children}
      </div>
    </div>
  )
}

/** The screen's main action. Exactly one per screen, so the eye knows where to
 * go; everything else is an AdminButton in outline. */
export function AdminAction({ onClick, children, disabled }: { onClick: () => void; children: React.ReactNode; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="font-mono text-[10px] font-bold uppercase tracking-wide bg-lime text-black rounded-full px-5 py-2.5 hover:scale-105 transition-transform disabled:opacity-40 disabled:hover:scale-100"
    >
      {children}
    </button>
  )
}

export function AdminButton({
  onClick,
  children,
  disabled,
  tone = "outline",
}: {
  onClick: () => void
  children: React.ReactNode
  disabled?: boolean
  tone?: "outline" | "danger"
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "font-mono text-[10px] uppercase tracking-wide border rounded-full px-5 py-2.5 transition-colors disabled:opacity-40",
        tone === "danger" ? "border-red-400/40 text-red-400 hover:border-red-400" : "border-white/25 hover:border-lime"
      )}
    >
      {children}
    </button>
  )
}

/** Empty is a state, not an absence: say what is missing and offer the thing
 * that fixes it, rather than leaving a bare sentence on a black page. */
export function EmptyState({ text, action }: { text: string; action?: React.ReactNode }) {
  return (
    <div className="border border-dashed border-white/15 rounded-lg px-6 py-12 text-center">
      <p className="text-dim text-sm max-w-sm mx-auto leading-relaxed">{text}</p>
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  )
}

/** The tab bar, which three screens had each written out.
 *
 * One shape: a scrollable row of monospace labels on the same underline the nav
 * uses, so moving between the dashboard and this screen does not feel like
 * moving between two products. */
export function AdminTabs<T extends string>({
  tabs,
  value,
  onChange,
  badge,
}: {
  tabs: readonly T[]
  value: T
  onChange: (tab: T) => void
  /** A count beside one tab, for the things waiting on it. */
  badge?: (tab: T) => number | undefined
}) {
  return (
    <div className="flex gap-2 mb-8 border-b border-white/10 overflow-x-auto">
      {tabs.map((tab) => {
        const count = badge?.(tab) ?? 0
        return (
          <button
            key={tab}
            onClick={() => onChange(tab)}
            className={cn(
              "font-mono text-xs uppercase tracking-wide px-4 py-3 border-b-2 -mb-px transition-colors whitespace-nowrap flex-none",
              value === tab ? "border-foreground text-foreground" : "border-transparent text-dim hover:text-foreground"
            )}
          >
            {tab}
            {count > 0 && (
              <span className="admin-badge-ring relative mr-1.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-lime text-black font-mono text-[10px] font-bold leading-none align-middle">
                <span className="relative z-10">{count}</span>
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

export type NoticeTone = "warn" | "good" | "quiet"

const NOTICE_TONES: Record<NoticeTone, string> = {
  warn: "border-amber-400/40 bg-amber-400/5",
  good: "border-lime/30",
  quiet: "border-white/10",
}

/** Something the screen needs to say before anything is done · a budget spent,
 * a connection missing, a token expired. Same card the dashboard and the
 * business screen use for the payment details that are not filled in. */
export function NoticeCard({
  tone = "quiet",
  children,
  className,
}: {
  tone?: NoticeTone
  children: React.ReactNode
  className?: string
}) {
  return <div className={cn("border rounded-lg px-5 py-4", NOTICE_TONES[tone], className)}>{children}</div>
}

export type RowPillTone = "neutral" | "good" | "quiet"

const PILL_TONES: Record<RowPillTone, string> = {
  neutral: "border-white/25 text-foreground",
  good: "border-lime text-lime",
  quiet: "border-white/15 text-dim",
}

/** One row, one shape, everywhere. Five different paddings did the same job
 * before this. The 56px floor is a thumb, not a pointer. */
export function AdminRow({
  title,
  meta,
  pill,
  pillTone = "neutral",
  onClick,
  to,
  actions,
}: {
  title: React.ReactNode
  meta?: React.ReactNode
  pill?: string
  pillTone?: RowPillTone
  onClick?: () => void
  to?: string
  actions?: React.ReactNode
}) {
  const body = (
    <>
      <div className="min-w-0">
        <div className="text-sm font-medium truncate">{title}</div>
        {meta && <div className="text-dim text-xs mt-0.5 truncate">{meta}</div>}
      </div>
      {pill && (
        <span
          className={cn(
            "font-mono text-[10px] uppercase tracking-wide border rounded-full px-2.5 py-1 flex-none",
            PILL_TONES[pillTone]
          )}
        >
          {pill}
        </span>
      )}
    </>
  )

  const shell = "flex-1 min-w-0 text-right flex items-center justify-between gap-3 border border-white/10 rounded-lg px-4 py-3.5 min-h-[56px] hover:border-lime/40 transition-colors"

  return (
    <div className="flex items-stretch gap-2">
      {to ? (
        <Link to={to} className={shell}>{body}</Link>
      ) : onClick ? (
        <button onClick={onClick} className={shell}>{body}</button>
      ) : (
        <div className={cn(shell, "hover:border-white/10")}>{body}</div>
      )}
      {actions}
    </div>
  )
}
