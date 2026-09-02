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

      <div className="flex items-center gap-1 border-b border-white/10 mb-8 overflow-x-auto">
        {STEPS.map((s, i) => {
          const disabled = i > 0 && !canLeaveClientStep
          return (
            <button
              key={s.label}
              onClick={() => !disabled && setStep(i)}
              disabled={disabled}
              className={cn(
                "font-mono text-[10px] md:text-xs uppercase tracking-wide px-3 md:px-4 py-3 border-b-2 -mb-px whitespace-nowrap transition-colors",
                step === i ? "border-lime text-foreground" : "border-transparent text-dim",
                !disabled && step !== i && "hover:text-lime",
                disabled && "opacity-30 cursor-not-allowed"
              )}
            >
              {i + 1}. {s.label}
            </button>
          )
        })}
      </div>

      <StepComponent qb={qb} />

      <div className="flex items-center justify-between mt-10 pt-6 border-t border-white/10">
        <button
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="font-mono text-xs uppercase tracking-wide border border-white/30 rounded-full px-5 py-2.5 hover:border-lime transition-colors disabled:opacity-30 disabled:hover:border-white/30"
        >
          → הקודם
        </button>
        <button
          onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
          disabled={step === STEPS.length - 1 || (step === 0 && !canLeaveClientStep)}
          className="font-mono text-xs uppercase tracking-wide bg-lime text-black rounded-full px-5 py-2.5 hover:scale-105 transition-transform disabled:opacity-30 disabled:hover:scale-100"
        >
          הבא ←
        </button>
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
