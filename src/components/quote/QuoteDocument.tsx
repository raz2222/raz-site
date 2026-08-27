import { formatCurrency, buildPaymentSchedule } from "@/lib/quotePricing"
import type { QuoteLineItem, QuotePresentationMode } from "@/lib/supabase"

export type QuoteDocumentItem = {
  key: string
  name: string
  description?: string | null
  quantity: number
  unit_price: number
  included: boolean
  recurring: boolean
}

export type QuoteDocumentProps = {
  title: string
  createdAt: string
  validityDays: number | null
  currency: string
  items: QuoteDocumentItem[]
  legacyLineItems?: QuoteLineItem[]
  displayTotal: number
  presentationMode: QuotePresentationMode
  notes?: string | null
  paymentTerms?: string | null
  driveFolderUrl?: string | null
  signature?: { fullName: string; signedAt: string } | null
}

/** Shared rendering for a quote's content — used by the client-facing QuoteView
 * (a persisted, real quote) and the admin wizard's live preview step (in-progress,
 * possibly unsaved state). Item keys use `key` rather than a DB id because preview
 * items may not have one yet. */
export function QuoteDocument({
  title,
  createdAt,
  validityDays,
  currency,
  items,
  legacyLineItems = [],
  displayTotal,
  presentationMode,
  notes,
  paymentTerms,
  driveFolderUrl,
  signature,
}: QuoteDocumentProps) {
  const usingLegacyLineItems = items.length === 0 && legacyLineItems.length > 0
  const schedule = paymentTerms ? buildPaymentSchedule(displayTotal, paymentTerms) : []
  const recurringItems = items.filter((it) => it.recurring && !it.included)

  return (
    <div>
      <h1 className="font-display font-medium text-2xl md:text-3xl mb-2">{title}</h1>
      <p className="text-dim text-xs mb-10 font-mono uppercase">
        {new Date(createdAt).toLocaleDateString("he-IL")}
        {validityDays ? ` · בתוקף ${validityDays} ימים` : ""}
      </p>

      {usingLegacyLineItems ? (
        <div className="border border-white/10 rounded-lg divide-y divide-white/10 mb-8">
          {legacyLineItems.map((item, i) => (
            <div key={i} className="flex justify-between items-start gap-4 px-5 py-4">
              <div>
                <div className="font-medium text-sm">{item.label}</div>
                {item.description && <div className="text-dim text-xs mt-1">{item.description}</div>}
              </div>
              <div className="font-mono text-sm whitespace-nowrap">{formatCurrency(item.price, currency)}</div>
            </div>
          ))}
          <div className="flex justify-between items-center px-5 py-4 font-medium">
            <div>סה"כ</div>
            <div className="font-mono">{formatCurrency(displayTotal, currency)}</div>
          </div>
        </div>
      ) : presentationMode === "detailed" ? (
        <div className="border border-white/10 rounded-lg divide-y divide-white/10 mb-8">
          {items.map((item) => (
            <div key={item.key} className="flex justify-between items-start gap-4 px-5 py-4">
              <div>
                <div className="font-medium text-sm">
                  {item.name} {item.quantity > 1 && <span className="text-dim text-xs">× {item.quantity}</span>}
                </div>
                {item.description && <div className="text-dim text-xs mt-1">{item.description}</div>}
                {item.recurring && <div className="text-dim text-[11px] mt-1 font-mono uppercase">חודשי</div>}
              </div>
              <div className="font-mono text-sm whitespace-nowrap">
                {item.included ? "כלול" : formatCurrency(item.unit_price * item.quantity, currency)}
              </div>
            </div>
          ))}
          <div className="flex justify-between items-center px-5 py-4 font-medium">
            <div>סה"כ</div>
            <div className="font-mono">{formatCurrency(displayTotal, currency)}</div>
          </div>
        </div>
      ) : presentationMode === "package" ? (
        <div className="border border-white/10 rounded-lg p-6 mb-8">
          <div className="flex justify-between items-baseline mb-5">
            <div className="font-display font-medium text-lg">{title}</div>
            <div className="font-mono text-xl font-bold">{formatCurrency(displayTotal, currency)}</div>
          </div>
          <div className="grid gap-2.5">
            {items.map((item) => (
              <div key={item.key} className="flex items-start gap-3 text-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D1FE17] flex-none mt-2" />
                <span>{item.name}{item.quantity > 1 ? ` × ${item.quantity}` : ""}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="border border-white/10 rounded-lg p-8 mb-8 text-center">
          {notes && <p className="text-dim text-sm leading-relaxed mb-6 whitespace-pre-wrap">{notes}</p>}
          <div className="font-mono text-3xl font-bold">{formatCurrency(displayTotal, currency)}</div>
          <div className="text-dim text-xs mt-2 font-mono uppercase">מחיר סופי לפרויקט</div>
        </div>
      )}

      {recurringItems.length > 0 && (
        <div className="mb-8 text-sm text-dim">
          כולל שירות חודשי חוזר: {recurringItems.map((it) => it.name).join(", ")}
        </div>
      )}

      {schedule.length > 0 && (
        <div className="border border-white/10 rounded-lg divide-y divide-white/10 mb-8">
          <div className="px-5 py-3 font-mono text-xs uppercase tracking-wide text-dim">תנאי תשלום — {paymentTerms}</div>
          {schedule.map((s, i) => (
            <div key={i} className="flex justify-between items-center px-5 py-3 text-sm">
              <span>{s.label}</span>
              <span className="font-mono">{formatCurrency(s.amount, currency)}</span>
            </div>
          ))}
        </div>
      )}

      {presentationMode !== "simple" && notes && (
        <p className="text-sm text-dim leading-relaxed mb-8 whitespace-pre-wrap">{notes}</p>
      )}

      {driveFolderUrl && (
        <a
          href={driveFolderUrl}
          target="_blank"
          rel="noreferrer"
          className="block border border-white/15 rounded-lg p-5 mb-8 hover:border-[#D1FE17] transition-colors"
        >
          <div className="font-mono text-xs uppercase tracking-wide text-dim mb-1">תיקיית קבצים ומדיה</div>
          <div className="font-medium">📁 פתיחת תיקיית הפרויקט ←</div>
        </a>
      )}

      {signature && (
        <div className="border border-[#D1FE17]/40 bg-[#D1FE17]/5 rounded-lg p-5">
          <p className="text-sm">
            ✓ נחתם על ידי <span className="font-medium">{signature.fullName}</span> בתאריך{" "}
            {new Date(signature.signedAt).toLocaleString("he-IL")}
          </p>
        </div>
      )}
    </div>
  )
}
