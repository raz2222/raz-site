import type { QuoteBuilder } from "@/hooks/useQuoteBuilder"
import { QuoteDocument } from "@/components/quote/QuoteDocument"

export function StepPreview({ qb }: { qb: QuoteBuilder }) {
  const { quote, items, calc } = qb
  const displayTotal = quote.final_total ?? calc?.calculatedTotal ?? 0

  return (
    <div className="max-w-2xl">
      <div className="border border-lime/30 bg-lime/5 rounded-lg px-4 py-3 mb-8 text-xs font-mono uppercase tracking-wide text-dim">
        תצוגה מקדימה, כך הלקוח יראה את ההצעה
      </div>
      <QuoteDocument
        title={quote.title || "הצעת מחיר"}
        createdAt={quote.created_at ?? new Date().toISOString()}
        validityDays={quote.validity_days ?? null}
        currency={quote.currency ?? "ILS"}
        items={items.map((it) => ({
          key: it.id ?? it.localId,
          name: it.name,
          description: it.description,
          quantity: it.quantity,
          unit_price: it.unit_price,
          included: it.included,
          recurring: it.recurring,
        }))}
        displayTotal={displayTotal}
        presentationMode={quote.presentation_mode ?? "package"}
        notes={quote.notes}
        paymentTerms={quote.payment_terms}
        driveFolderUrl={quote.drive_folder_url}
        signature={null}
      />
    </div>
  )
}
