import { useState } from "react"
import { Calculator, ChevronDown, ChevronUp, Copy, Trash2 } from "lucide-react"
import type {
  HiggsfieldCreditType,
  QuoteComplexity,
  QuoteDiscountType,
  QuotePresentationMode,
  QuoteUrgency,
} from "@/lib/supabase"
import type { QuoteBuilder } from "@/hooks/useQuoteBuilder"
import { formatCurrency, itemBaseTotal, itemFinalTotal, itemIsMultiplierExempt, PAYMENT_TERM_PRESETS } from "@/lib/quotePricing"
import { RowActions } from "@/components/admin/RowActions"
import { cn } from "@/lib/utils"

/** Internal-only helper: estimate an item's cost from Higgsfield credit
 * usage, using the credit types/rate configured in quote settings. Never
 * rendered in QuoteDocument/QuoteView — the client never sees this. */
function CreditCalculator({
  creditTypes,
  ilsPerCredit,
  currency,
  onApply,
  onClose,
}: {
  creditTypes: HiggsfieldCreditType[]
  ilsPerCredit: number
  currency?: string
  onApply: (ils: number) => void
  onClose: () => void
}) {
  const [typeId, setTypeId] = useState(creditTypes[0]?.id ?? "")
  const [quantity, setQuantity] = useState(1)
  const [duration, setDuration] = useState(5)

  const selectedType = creditTypes.find((t) => t.id === typeId)
  const credits = selectedType ? selectedType.creditsPerUnit * quantity * (selectedType.unit === "per_second" ? duration : 1) : 0
  const estimatedIls = credits * ilsPerCredit

  return (
    <div className="border border-white/15 rounded-lg p-3 mt-2 grid gap-2">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-wide text-dim">מחשבון קרדיטים (פנימי, לא מוצג ללקוח)</span>
        <button onClick={onClose} className="font-mono text-[10px] uppercase text-dim hover:text-lime">סגירה</button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 items-end">
        <div className="col-span-2 sm:col-span-1">
          <label className="text-dim text-[10px] font-mono uppercase block mb-1">סוג יצירה</label>
          <select
            value={typeId}
            onChange={(e) => setTypeId(e.target.value)}
            className="w-full bg-background border border-white/20 rounded px-2 py-1.5 text-sm"
          >
            {creditTypes.map((t) => (
              <option key={t.id} value={t.id}>{t.label || "ללא שם"}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-dim text-[10px] font-mono uppercase block mb-1">כמות</label>
          <input
            type="number"
            min={0}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="w-full bg-transparent border border-white/20 rounded px-2 py-1.5 text-sm"
          />
        </div>
        {selectedType?.unit === "per_second" && (
          <div>
            <label className="text-dim text-[10px] font-mono uppercase block mb-1">משך (שניות)</label>
            <input
              type="number"
              min={0}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full bg-transparent border border-white/20 rounded px-2 py-1.5 text-sm"
            />
          </div>
        )}
        <div>
          <label className="text-dim text-[10px] font-mono uppercase block mb-1">הערכה</label>
          <div className="text-sm font-mono">
            {credits.toLocaleString("he-IL")} קרדיטים · {formatCurrency(estimatedIls, currency)}
          </div>
        </div>
      </div>
      <button
        onClick={() => onApply(Math.round(estimatedIls))}
        disabled={!selectedType}
        className="w-fit font-mono text-[10px] uppercase tracking-wide bg-lime text-black rounded-[8px] px-3 py-2 hover:scale-105 transition-transform disabled:opacity-40"
      >
        השתמש בעלות זו
      </button>
    </div>
  )
}

export function StepCustomize({ qb }: { qb: QuoteBuilder }) {
  const {
    quote, setQuote, items, priceBook, calc, recommendedTotal, settings,
    updateItem, removeItem, duplicateItem, moveItem,
    belowMinimumItems, marginWarning, hourlyWarning,
  } = qb
  const [showProfitability, setShowProfitability] = useState(true)
  const [creditCalcFor, setCreditCalcFor] = useState<string | null>(null)

  if (!settings) return null

  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-6 items-start">
      <div className="grid gap-2">
        {items.length === 0 && (
          <div className="border border-dashed border-white/15 rounded-lg p-10 text-center text-dim text-sm">
            לא נוספו שירותים. חזרו לשלב הקודם כדי להוסיף.
          </div>
        )}
        {items.map((it) => {
          const pb = priceBook.find((p) => p.id === it.price_book_item_id)
          const exempt = itemIsMultiplierExempt(it)
          const base = itemBaseTotal(it)
          const final = calc ? itemFinalTotal(it, calc.complexityMultiplier, calc.urgencyMultiplier) : base
          const belowMin = pb?.minimum_price != null && it.unit_price < pb.minimum_price && !it.included
          return (
            <div key={it.localId} className={cn("border rounded-lg p-4", belowMin ? "border-red-500/50" : "border-white/10")}>
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  {it.is_custom ? (
                    <input
                      value={it.name}
                      onChange={(e) => updateItem(it.localId, { name: e.target.value })}
                      placeholder="שם הפריט"
                      className="w-full bg-transparent border-b border-white/20 focus:border-lime outline-none text-sm font-medium py-1"
                    />
                  ) : (
                    <div className="text-sm font-medium">{it.name}</div>
                  )}
                  {it.description && <div className="text-dim text-xs mt-1">{it.description}</div>}
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    {it.recurring && <span className="font-mono text-[10px] uppercase text-dim border border-white/15 rounded-full px-2 py-0.5">חודשי</span>}
                    {it.included && <span className="font-mono text-[10px] uppercase text-lime border border-lime/40 rounded-full px-2 py-0.5">כלול</span>}
                    {!exempt && calc && (calc.complexityMultiplier !== 1 || calc.urgencyMultiplier !== 1) && !it.included && (
                      <span className="font-mono text-[10px] uppercase text-dim border border-white/15 rounded-full px-2 py-0.5">
                        × {(calc.complexityMultiplier * calc.urgencyMultiplier).toFixed(2)}
                      </span>
                    )}
                    {belowMin && <span className="font-mono text-[10px] uppercase text-red-400 border border-red-500/40 rounded-full px-2 py-0.5">מתחת למחיר מינימום</span>}
                  </div>
                </div>
                <RowActions
                  className="flex-col"
                  actions={[
                    { icon: ChevronUp, label: "הזזה למעלה", onClick: () => moveItem(it.localId, -1) },
                    { icon: ChevronDown, label: "הזזה למטה", onClick: () => moveItem(it.localId, 1) },
                  ]}
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-3 items-end">
                <div>
                  <label className="text-dim text-[10px] font-mono uppercase block mb-1">כמות</label>
                  <input
                    type="number"
                    min={0}
                    value={it.quantity}
                    onChange={(e) => updateItem(it.localId, { quantity: Number(e.target.value) })}
                    className="w-full bg-transparent border border-white/20 rounded px-2 py-1.5 text-sm"
                  />
                </div>
                <div>
                  <label className="text-dim text-[10px] font-mono uppercase block mb-1">מחיר יחידה</label>
                  <input
                    type="number"
                    value={it.unit_price}
                    onChange={(e) => updateItem(it.localId, { unit_price: Number(e.target.value) })}
                    className="w-full bg-transparent border border-white/20 rounded px-2 py-1.5 text-sm"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="text-dim text-[10px] font-mono uppercase block mb-1">הנחה</label>
                  <div className="flex gap-1">
                    <select
                      value={it.discount_type ?? ""}
                      onChange={(e) => updateItem(it.localId, { discount_type: (e.target.value || null) as QuoteDiscountType | null })}
                      className="bg-background border border-white/20 rounded px-1 py-1.5 text-xs w-14"
                    >
                      <option value="">—</option>
                      <option value="percent">%</option>
                      <option value="fixed">₪</option>
                    </select>
                    <input
                      type="number"
                      value={it.discount_value ?? ""}
                      onChange={(e) => updateItem(it.localId, { discount_value: e.target.value === "" ? null : Number(e.target.value) })}
                      className="w-full bg-transparent border border-white/20 rounded px-2 py-1.5 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-dim text-[10px] font-mono uppercase block mb-1">עלות פנימית</label>
                  <div className="flex gap-1">
                    <input
                      type="number"
                      value={it.cost ?? ""}
                      onChange={(e) => updateItem(it.localId, { cost: e.target.value === "" ? null : Number(e.target.value) })}
                      className="w-full bg-transparent border border-white/20 rounded px-2 py-1.5 text-sm"
                    />
                    {settings.higgsfield_credit_types.length > 0 && (
                      <button
                        onClick={() => setCreditCalcFor((cur) => (cur === it.localId ? null : it.localId))}
                        title="מחשבון קרדיטים"
                        className={cn(
                          "flex-none w-9 flex items-center justify-center rounded border transition-colors",
                          creditCalcFor === it.localId ? "border-lime text-lime" : "border-white/20 text-dim hover:text-lime"
                        )}
                      >
                        <Calculator size={15} />
                      </button>
                    )}
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <label className="text-dim text-[10px] font-mono uppercase block mb-1">סה״כ</label>
                  <div className="font-mono text-sm font-bold">{formatCurrency(final, quote.currency)}</div>
                </div>
              </div>

              {creditCalcFor === it.localId && (
                <CreditCalculator
                  creditTypes={settings.higgsfield_credit_types}
                  ilsPerCredit={settings.higgsfield_ils_per_credit}
                  currency={quote.currency}
                  onApply={(ils) => {
                    updateItem(it.localId, { cost: ils })
                    setCreditCalcFor(null)
                  }}
                  onClose={() => setCreditCalcFor(null)}
                />
              )}

              <div className="flex items-center gap-4 mt-3 flex-wrap">
                <label className="flex items-center gap-1.5 text-xs text-dim">
                  <input type="checkbox" checked={it.included} onChange={(e) => updateItem(it.localId, { included: e.target.checked })} />
                  כלול (ללא חיוב נפרד)
                </label>
                <label className="flex items-center gap-1.5 text-xs text-dim">
                  <input type="checkbox" checked={it.recurring} onChange={(e) => updateItem(it.localId, { recurring: e.target.checked })} />
                  חוזר (חודשי)
                </label>
                <label className="flex items-center gap-1.5 text-xs text-dim">
                  <input type="checkbox" checked={it.multiplier_exempt} onChange={(e) => updateItem(it.localId, { multiplier_exempt: e.target.checked })} />
                  לא כולל מכפילים
                </label>
                <RowActions
                  className="mr-auto"
                  actions={[
                    { icon: Copy, label: "שכפול", onClick: () => duplicateItem(it.localId) },
                    { icon: Trash2, label: "הסרה", onClick: () => removeItem(it.localId), variant: "danger" },
                  ]}
                />
              </div>
            </div>
          )
        })}
      </div>

      <div className="lg:sticky lg:top-24 grid gap-4">
        <div className="border border-white/10 rounded-lg p-4 grid gap-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-dim text-[10px] font-mono uppercase block mb-1">מורכבות</label>
              <select
                value={quote.complexity ?? "standard"}
                onChange={(e) => setQuote({ ...quote, complexity: e.target.value as QuoteComplexity })}
                className="w-full bg-background border border-white/20 rounded px-2 py-1.5 text-xs"
              >
                <option value="standard">רגיל ×{settings.complexity_multipliers.standard}</option>
                <option value="advanced">מתקדם ×{settings.complexity_multipliers.advanced}</option>
                <option value="complex">מורכב ×{settings.complexity_multipliers.complex}</option>
              </select>
            </div>
            <div>
              <label className="text-dim text-[10px] font-mono uppercase block mb-1">דחיפות</label>
              <select
                value={quote.urgency ?? "normal"}
                onChange={(e) => setQuote({ ...quote, urgency: e.target.value as QuoteUrgency })}
                className="w-full bg-background border border-white/20 rounded px-2 py-1.5 text-xs"
              >
                <option value="normal">רגיל ×{settings.urgency_multipliers.normal}</option>
                <option value="priority">בעדיפות ×{settings.urgency_multipliers.priority}</option>
                <option value="rush">דחוף ×{settings.urgency_multipliers.rush}</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-dim text-[10px] font-mono uppercase block mb-1">הנחה כללית</label>
            <div className="flex gap-2">
              <select
                value={quote.discount_type ?? ""}
                onChange={(e) => setQuote({ ...quote, discount_type: (e.target.value || null) as QuoteDiscountType | null })}
                className="bg-background border border-white/20 rounded px-2 py-1.5 text-xs w-20"
              >
                <option value="">ללא</option>
                <option value="percent">%</option>
                <option value="fixed">₪</option>
              </select>
              <input
                type="number"
                value={quote.discount_value ?? ""}
                onChange={(e) => setQuote({ ...quote, discount_value: e.target.value === "" ? null : Number(e.target.value) })}
                className="flex-1 bg-transparent border border-white/20 rounded px-2 py-1.5 text-sm"
              />
            </div>
          </div>

          {belowMinimumItems.length > 0 && (
            <div className="border border-red-500/40 bg-red-500/10 rounded p-3 text-xs text-red-300">
              ⚠ {belowMinimumItems.length} פריטים מתחת למחיר המינימום שהוגדר עבורם.
            </div>
          )}

          <div className="border-t border-white/10 pt-3 grid gap-1.5 text-sm">
            <div className="flex justify-between"><span className="text-dim">סכום ביניים</span><span className="font-mono">{formatCurrency(calc?.subtotal ?? 0, quote.currency)}</span></div>
            <div className="flex justify-between font-bold text-base"><span>מחושב</span><span className="font-mono">{formatCurrency(calc?.calculatedTotal ?? 0, quote.currency)}</span></div>
            <div className="flex justify-between text-dim text-xs"><span>מומלץ</span><span className="font-mono">{formatCurrency(recommendedTotal, quote.currency)}</span></div>
            {calc && calc.recurringMonthlyTotal > 0 && (
              <div className="flex justify-between text-dim text-xs"><span>חודשי חוזר</span><span className="font-mono">{formatCurrency(calc.recurringMonthlyTotal, quote.currency)} / חודש</span></div>
            )}
          </div>

          <div>
            <label className="text-dim text-[10px] font-mono uppercase block mb-1">מחיר סופי (ניתן לשינוי ידני)</label>
            <input
              type="number"
              value={quote.final_total ?? ""}
              placeholder={String(Math.round(calc?.calculatedTotal ?? 0))}
              onChange={(e) => setQuote({ ...quote, final_total: e.target.value === "" ? null : Number(e.target.value) })}
              className="w-full bg-transparent border border-white/30 rounded px-3 py-2 text-lg font-bold"
            />
          </div>
        </div>

        <div className="border border-white/10 rounded-lg">
          <button
            onClick={() => setShowProfitability((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-3 font-mono text-xs uppercase tracking-wide text-dim"
          >
            רווחיות פנימית (לא מוצג ללקוח)
            <span>{showProfitability ? "−" : "+"}</span>
          </button>
          {showProfitability && calc && (
            <div className="px-4 pb-4 grid gap-1.5 text-sm">
              <div className="flex justify-between"><span className="text-dim">עלות משוערת</span><span className="font-mono">{formatCurrency(calc.totalCost, quote.currency)}</span></div>
              <div className="flex justify-between"><span className="text-dim">שעות משוערות</span><span className="font-mono">{calc.totalHours}</span></div>
              <div className="flex justify-between"><span className="text-dim">רווח גולמי</span><span className="font-mono">{formatCurrency(calc.grossProfit, quote.currency)}</span></div>
              <div className={cn("flex justify-between", marginWarning && "text-red-400")}>
                <span className={marginWarning ? "" : "text-dim"}>רווחיות</span><span className="font-mono">{calc.marginPercent.toFixed(1)}%</span>
              </div>
              <div className={cn("flex justify-between", hourlyWarning && "text-red-400")}>
                <span className={hourlyWarning ? "" : "text-dim"}>תעריף שעתי אפקטיבי</span>
                <span className="font-mono">{calc.effectiveHourlyRate != null ? formatCurrency(calc.effectiveHourlyRate, quote.currency) : "—"}</span>
              </div>
              {(marginWarning || hourlyWarning) && (
                <div className="mt-1 text-[11px] text-red-400">⚠ מתחת ליעד שהוגדר בהגדרות</div>
              )}
            </div>
          )}
        </div>

        <div className="border border-white/10 rounded-lg p-4 grid gap-3">
          <div>
            <label className="text-dim text-[10px] font-mono uppercase block mb-1">תנאי תשלום</label>
            <select
              value={quote.payment_terms ?? ""}
              onChange={(e) => setQuote({ ...quote, payment_terms: e.target.value })}
              className="w-full bg-background border border-white/20 rounded px-2 py-1.5 text-xs"
            >
              {PAYMENT_TERM_PRESETS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-dim text-[10px] font-mono uppercase block mb-1">אופן הצגה ללקוח</label>
            <select
              value={quote.presentation_mode ?? "package"}
              onChange={(e) => setQuote({ ...quote, presentation_mode: e.target.value as QuotePresentationMode })}
              className="w-full bg-background border border-white/20 rounded px-2 py-1.5 text-xs"
            >
              <option value="package">חבילה (מקובץ)</option>
              <option value="detailed">מפורט (כל סעיף)</option>
              <option value="simple">פשוט (מחיר אחד)</option>
            </select>
          </div>
          <div>
            <label className="text-dim text-[10px] font-mono uppercase block mb-1">תוקף (ימים)</label>
            <input
              type="number"
              value={quote.validity_days ?? 14}
              onChange={(e) => setQuote({ ...quote, validity_days: Number(e.target.value) })}
              className="w-full bg-transparent border border-white/20 rounded px-2 py-1.5 text-sm"
            />
          </div>
        </div>

        <div className="border border-white/10 rounded-lg p-4">
          <label className="text-dim text-[10px] font-mono uppercase block mb-1">הערות פנימיות (לא מוצג ללקוח לעולם)</label>
          <textarea
            value={quote.internal_notes ?? ""}
            onChange={(e) => setQuote({ ...quote, internal_notes: e.target.value })}
            rows={4}
            placeholder="לדוגמה: הלקוח אמר תקציב בסביבות 15K, אפשר לסגור ב-13.5K"
            className="w-full bg-transparent border border-white/20 rounded px-3 py-2 text-sm"
          />
        </div>

        <div className="border border-white/10 rounded-lg p-4">
          <label className="text-dim text-[10px] font-mono uppercase block mb-1">הערות ללקוח</label>
          <textarea
            value={quote.notes ?? ""}
            onChange={(e) => setQuote({ ...quote, notes: e.target.value })}
            rows={3}
            className="w-full bg-transparent border border-white/20 rounded px-3 py-2 text-sm"
          />
        </div>
      </div>
    </div>
  )
}
