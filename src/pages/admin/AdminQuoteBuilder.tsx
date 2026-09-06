import { useState } from "react"
import { AdminGate } from "@/components/AdminGate"
import { AdminNav } from "@/components/AdminNav"
import { QUOTE_STATUS_LABELS, type QuoteStatus } from "@/lib/supabase"
import { useQuoteBuilder, STATUS_ORDER } from "@/hooks/useQuoteBuilder"
import { StepClient } from "@/pages/admin/quote-wizard/StepClient"
import { StepServices } from "@/pages/admin/quote-wizard/StepServices"
import { StepCustomize } from "@/pages/admin/quote-wizard/StepCustomize"
import { StepPreview } from "@/pages/admin/quote-wizard/StepPreview"
import { StepSend } from "@/pages/admin/quote-wizard/StepSend"
import { cn } from "@/lib/utils"

const STEPS = [
  { label: "לקוח", Component: StepClient },
  { label: "שירותים", Component: StepServices },
  { label: "התאמות", Component: StepCustomize },
  { label: "תצוגה מקדימה", Component: StepPreview },
  { label: "שליחה", Component: StepSend },
] as const

function AdminQuoteBuilderInner() {
  const qb = useQuoteBuilder()
  // Existing quotes (edited via their real id in the URL) open on Preview —
  // the wizard's step-by-step flow is for building a new quote, not
  // re-walking an old one. `isNew` is known synchronously from the route
  // param, unlike `quote.id` which is only set after the load effect runs.
  const [step, setStep] = useState(() => (qb.isNew ? 0 : 3))

  if (qb.loading || !qb.settings) return <div className="pt-40 pb-40 container font-mono text-xs text-dim uppercase">טוען…</div>

  const { quote, setQuote, saveState, deleteQuote } = qb
  const StepComponent = STEPS[step].Component
  const canLeaveClientStep = !!quote.client_id

  return (
    <div className="min-h-[100dvh] pt-28 pb-28 md:pb-20 px-6 md:px-12">
      <AdminNav />

      <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
        <div className="flex-1 min-w-[240px]">
          <div className="flex items-center gap-3 flex-wrap">
            <input
              value={quote.title ?? ""}
              onChange={(e) => setQuote({ ...quote, title: e.target.value })}
              placeholder="כותרת ההצעה"
              className="font-display font-bold text-xl bg-transparent border-b border-white/20 focus:border-lime outline-none px-1 py-1"
            />
            {quote.quote_number && <span className="font-mono text-xs text-dim">{quote.quote_number}</span>}
          </div>
          <div className="text-dim text-xs mt-2 font-mono">
            {saveState === "saving" && "שומר…"}
            {saveState === "saved" && "נשמר ✓"}
            {saveState === "idle" && quote.id && "נשמר"}
            {!quote.id && "טרם נשמר, בחרו לקוח כדי ליצור את ההצעה"}
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={quote.status ?? "draft"}
            onChange={(e) => setQuote({ ...quote, status: e.target.value as QuoteStatus })}
            className="bg-background border border-white/30 rounded px-3 py-2 text-xs font-mono uppercase"
          >
            {STATUS_ORDER.map((s) => (
              <option key={s} value={s}>{QUOTE_STATUS_LABELS[s]}</option>
            ))}
          </select>
          {quote.id && (
            <button onClick={deleteQuote} className="font-mono text-xs uppercase tracking-wide text-red-400 px-2 py-2">
              מחיקה
            </button>
          )}
        </div>
      </div>

      {/* A stepper, not tabs. Tabs say "five places you may go"; a quote is one
          job done in an order, and the shape should say which part of it you
          are on and how much is left. A step already passed stays clickable;
          one ahead of the client stays shut, because nothing downstream works
          without a client. */}
      <ol className="flex items-center gap-1 md:gap-2 mb-8 overflow-x-auto pb-1">
        {STEPS.map((s, i) => {
          const done = i < step
          const current = i === step
          const disabled = i > 0 && !canLeaveClientStep
          return (
            <li key={s.label} className="flex items-center gap-1 md:gap-2 flex-none">
              {i > 0 && (
                <span
                  aria-hidden="true"
                  className={cn("h-px w-4 md:w-8 flex-none transition-colors", done || current ? "bg-lime" : "bg-white/15")}
                />
              )}
              <button
                onClick={() => !disabled && setStep(i)}
                disabled={disabled}
                aria-current={current ? "step" : undefined}
                className={cn(
                  "flex items-center gap-2 rounded-full py-1.5 transition-colors",
                  current ? "pl-3 pr-2" : "px-1 md:pl-3 md:pr-2",
                  current && "bg-lime text-black",
                  !current && done && "text-foreground hover:bg-white/5",
                  !current && !done && "text-dim",
                  disabled && "opacity-30 cursor-not-allowed"
                )}
              >
                <span
                  className={cn(
                    "grid place-items-center w-6 h-6 rounded-full font-mono text-[11px] flex-none border",
                    current ? "border-black/30 bg-black/10" : done ? "border-lime text-lime" : "border-white/25"
                  )}
                >
                  {done ? "✓" : i + 1}
                </span>
                <span
                  className={cn(
                    "font-mono text-[10px] md:text-xs uppercase tracking-wide whitespace-nowrap",
                    // Five labels do not fit on a phone: the last one fell off
                    // the screen entirely. Only the step you are on is named
                    // there; the rest are numbers, which is all they need to be.
                    !current && "hidden md:inline"
                  )}
                >
                  {s.label}
                </span>
              </button>
            </li>
          )
        })}
      </ol>

      <StepComponent qb={qb} />

      <div className="flex items-center justify-between mt-10 pt-6 border-t border-white/10">
        <button
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="font-mono text-xs uppercase tracking-wide border border-white/30 rounded-full px-5 py-2.5 hover:border-lime transition-colors disabled:opacity-30 disabled:hover:border-white/30"
        >
          → הקודם
        </button>
        {step < STEPS.length - 1 && (
          <button
            onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
            disabled={step === 0 && !canLeaveClientStep}
            className="font-mono text-xs uppercase tracking-wide bg-lime text-black rounded-full px-5 py-2.5 hover:scale-105 transition-transform disabled:opacity-30 disabled:hover:scale-100"
          >
            {STEPS[step + 1].label} ←
          </button>
        )}
      </div>
    </div>
  )
}

export function AdminQuoteBuilder() {
  return (
    <AdminGate>
      <AdminQuoteBuilderInner />
    </AdminGate>
  )
}
