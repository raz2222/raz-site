import { cn } from "@/lib/utils"

/** The admin's creation screens are step-by-step, not tabbed.
 *
 * Tabs say "here are five places you may go". Building a quote or a contract is
 * one job done in an order, and the shape should say which part you are on and
 * how much is left. Raz asked for this on the quote builder and then on the
 * contract editor, so it lives here once rather than in both.
 *
 * A step already passed stays clickable; one that is not reachable yet is shut,
 * because nothing downstream of choosing a client works without one. */
export function AdminSteps({
  steps,
  current,
  onSelect,
  reachable,
}: {
  steps: readonly string[]
  current: number
  onSelect: (index: number) => void
  /** Which steps can be jumped to. Defaults to all of them. */
  reachable?: (index: number) => boolean
}) {
  return (
    <ol className="flex items-center gap-1 md:gap-2 mb-8 overflow-x-auto pb-1">
      {steps.map((label, i) => {
        const done = i < current
        const active = i === current
        const disabled = reachable ? !reachable(i) : false
        return (
          <li key={label} className="flex items-center gap-1 md:gap-2 flex-none">
            {i > 0 && (
              <span
                aria-hidden="true"
                className={cn(
                  "h-px w-4 md:w-8 flex-none transition-colors",
                  done || active ? "bg-lime" : "bg-white/15"
                )}
              />
            )}
            <button
              onClick={() => !disabled && onSelect(i)}
              disabled={disabled}
              aria-current={active ? "step" : undefined}
              className={cn(
                "flex items-center gap-2 rounded-full py-1.5 transition-colors",
                active ? "pl-3 pr-2" : "px-1 md:pl-3 md:pr-2",
                active && "bg-lime text-black",
                !active && done && "text-foreground hover:bg-white/5",
                !active && !done && "text-dim",
                disabled && "opacity-30 cursor-not-allowed"
              )}
            >
              <span
                className={cn(
                  "grid place-items-center w-6 h-6 rounded-full font-mono text-[11px] flex-none border",
                  active ? "border-black/30 bg-black/10" : done ? "border-lime text-lime" : "border-white/25"
                )}
              >
                {done ? "✓" : i + 1}
              </span>
              <span
                className={cn(
                  "font-mono text-[10px] md:text-xs uppercase tracking-wide whitespace-nowrap",
                  // Five labels do not fit on a phone: the last one fell off the
                  // screen entirely. Only the step you are on is named there.
                  !active && "hidden md:inline"
                )}
              >
                {label}
              </span>
            </button>
          </li>
        )
      })}
    </ol>
  )
}

/** The pair of buttons under a stepped screen. The forward one names where it
 * goes, and disappears on the last step rather than sitting there dead. */
export function AdminStepNav({
  steps,
  current,
  onSelect,
  canAdvance = true,
}: {
  steps: readonly string[]
  current: number
  onSelect: (index: number) => void
  canAdvance?: boolean
}) {
  return (
    <div className="flex items-center justify-between mt-10 pt-6 border-t border-white/10">
      <button
        onClick={() => onSelect(Math.max(0, current - 1))}
        disabled={current === 0}
        className="font-mono text-xs uppercase tracking-wide border border-white/30 rounded-full px-5 py-2.5 hover:border-lime transition-colors disabled:opacity-30 disabled:hover:border-white/30"
      >
        → הקודם
      </button>
      {current < steps.length - 1 && (
        <button
          onClick={() => onSelect(Math.min(steps.length - 1, current + 1))}
          disabled={!canAdvance}
          className="font-mono text-xs uppercase tracking-wide bg-lime text-black rounded-full px-5 py-2.5 hover:scale-105 transition-transform disabled:opacity-30 disabled:hover:scale-100"
        >
          {steps[current + 1]} ←
        </button>
      )}
    </div>
  )
}
