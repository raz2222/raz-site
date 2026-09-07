import type { QuoteBuilder } from "@/hooks/useQuoteBuilder"
import { QuoteDocument } from "@/components/quote/QuoteDocument"
import { QuoteAgreement } from "@/components/quote/QuoteAgreement"

export function StepPreview({ qb }: { qb: QuoteBuilder }) {
  const { quote, items, calc, clients, templates, agreement, agreementFrozen, suggestedTemplate, applyContractTemplate, provider } = qb
  const displayTotal = quote.final_total ?? calc?.calculatedTotal ?? 0
  const client = clients.find((c) => c.id === quote.client_id)

  return (
    <div className="max-w-2xl">
      <div className="border border-lime/30 bg-lime/5 rounded-lg px-4 py-3 mb-8 text-xs font-mono uppercase tracking-wide text-dim">
        תצוגה מקדימה, כך הלקוח יראה את ההצעה
      </div>

      {/* The agreement travels with the quote, so which one it is belongs on the
          screen that shows what the client will read. It is picked from what is
          being sold, and this is here for the deal that needs the other one. */}
      {templates.length > 0 && (
      <div className="border border-white/10 rounded-lg px-5 py-4 mb-8 grid gap-2">
        <label htmlFor="quote-template" className="font-mono text-[10px] uppercase tracking-wide text-dim">
          הסכם ההתקשרות שמצורף
        </label>
        <select
          id="quote-template"
          value={agreement.template_id ?? ""}
          onChange={(e) => applyContractTemplate(e.target.value)}
          disabled={agreementFrozen}
          className="bg-background border border-white/30 rounded px-3 py-2 text-sm disabled:opacity-60"
        >
          {templates.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
              {suggestedTemplate?.id === t.id ? " · לפי מה שנמכר" : ""}
            </option>
          ))}
        </select>
        <p className="text-dim text-[11px] leading-relaxed">
          {agreementFrozen
            ? "ההצעה כבר יצאה, אז נוסח ההסכם קפוא עליה · עריכת התבנית לא תשנה מה שהלקוח קיבל."
            : "הנוסח נטען מהתבנית ומתעדכן לפי הלקוח והסכום. הוא ננעל ברגע שההצעה נשלחת. לעריכת הנוסח עצמו · חוזים · תבניות."}
        </p>
      </div>
      )}

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

      <QuoteAgreement
        sections={agreement.sections}
        provider={agreementFrozen ? quote.provider : provider}
        party={{
          client_name: quote.client_name ?? client?.name ?? "",
          client_company: client?.company ?? null,
          client_email: quote.client_email ?? client?.email ?? null,
          client_phone: client?.phone ?? null,
        }}
      />
    </div>
  )
}
