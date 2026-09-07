import { formatCurrency } from "@/lib/quotePricing"
import { clientDisplayName, formatContractDate, type ProviderDetails } from "@/lib/contracts"
import type { ContractRow, ContractSignatureRow } from "@/lib/supabase"

export type ContractDocumentProps = {
  contract: Pick<
    ContractRow,
    | "contract_number"
    | "title"
    | "client_name"
    | "client_company"
    | "client_id_number"
    | "client_address"
    | "client_email"
    | "client_phone"
    | "scope"
    | "deliverables"
    | "timeline"
    | "start_date"
    | "currency"
    | "total"
    | "vat_included"
    | "payment_terms"
    | "payment_schedule"
    | "sections"
    | "notes"
    | "created_at"
  >
  provider: ProviderDetails
  signature?: Pick<ContractSignatureRow, "full_name" | "id_number" | "signature_image" | "signed_at"> | null
}

function PartyBlock({ role, lines }: { role: string; lines: (string | null | undefined)[] }) {
  const visible = lines.map((l) => l?.trim()).filter(Boolean) as string[]
  return (
    <div className="border border-white/10 rounded-lg p-4 print:border-black/20">
      <div className="font-mono text-[10px] uppercase tracking-wide text-dim mb-2 print:text-black/60">{role}</div>
      {visible.map((line, i) => (
        <div key={i} className={i === 0 ? "font-medium text-sm" : "text-dim text-xs mt-1 print:text-black/70"}>
          {line}
        </div>
      ))}
    </div>
  )
}

/** The agreement itself, rendered identically wherever it appears: the admin's
 * preview, the client's signing page, and the printed or saved-to-PDF copy. */
export function ContractDocument({ contract, provider, signature }: ContractDocumentProps) {
  const deliverables = contract.deliverables ?? []
  const schedule = contract.payment_schedule ?? []

  return (
    <article className="contract-document print:text-black">
      <header className="mb-8">
        <div className="font-mono text-[10px] uppercase tracking-wide text-dim print:text-black/60">
          הסכם התקשרות
          {contract.contract_number ? ` · ${contract.contract_number}` : ""}
        </div>
        <h1 className="font-display font-medium text-2xl md:text-3xl mt-2">{contract.title}</h1>
        <div className="text-dim text-xs mt-2 font-mono print:text-black/60">
          נערך ונחתם בתאריך {formatContractDate(contract.created_at)}
        </div>
      </header>

      <section className="grid md:grid-cols-2 gap-4 mb-10">
        <PartyBlock
          role="נותן השירות"
          lines={[
            provider.provider_business_name,
            provider.provider_name,
            provider.provider_id_number ? `ח.פ / ע.מ ${provider.provider_id_number}` : null,
            provider.provider_address,
            provider.provider_email,
            provider.provider_phone,
          ]}
        />
        <PartyBlock
          role="הלקוח"
          lines={[
            clientDisplayName(contract),
            contract.client_address,
            contract.client_email,
            contract.client_phone,
          ]}
        />
      </section>

      {(contract.scope || deliverables.length > 0 || contract.timeline || contract.start_date) && (
        <section className="mb-10">
          <h2 className="font-display font-medium text-lg mb-4">נספח א · היקף העבודה</h2>
          {contract.scope && (
            <p className="text-sm leading-relaxed whitespace-pre-wrap mb-5">{contract.scope}</p>
          )}
          {deliverables.length > 0 && (
            <ul className="grid gap-2 mb-5">
              {deliverables.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D1FE17] flex-none mt-2 print:bg-black" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )}
          {(contract.timeline || contract.start_date) && (
            <div className="text-sm text-dim print:text-black/70">
              {contract.start_date && <div>מועד תחילת העבודה: {formatContractDate(contract.start_date)}</div>}
              {contract.timeline && <div>לוח זמנים משוער: {contract.timeline}</div>}
            </div>
          )}
        </section>
      )}

      <section className="mb-10">
        <h2 className="font-display font-medium text-lg mb-4">נספח ב · תמורה ותנאי תשלום</h2>
        <div className="border border-white/10 rounded-lg divide-y divide-white/10 print:border-black/20 print:divide-black/20">
          <div className="flex justify-between items-center px-5 py-4">
            <span className="font-medium text-sm">סה"כ תמורה</span>
            <span className="font-mono">{formatCurrency(contract.total, contract.currency)}</span>
          </div>
          <div className="px-5 py-3 text-xs text-dim print:text-black/70">
            {/* A price Raz quotes is the price · there is nothing added to it at the end.
                Saying why (he is an עוסק פטור) is his business and not the client's, so
                the document states the outcome and stops there. Contracts signed before
                that was true keep their own sentence, because the row snapshots the flag. */}
            {contract.vat_included ? "המחיר הנקוב הוא המחיר הסופי לתשלום." : "המחיר אינו כולל מע\"מ. המע\"מ יתווסף כדין."}
            {contract.payment_terms ? ` תנאי תשלום: ${contract.payment_terms}.` : ""}
          </div>
          {schedule.map((entry, i) => (
            <div key={i} className="flex justify-between items-center px-5 py-3 text-sm">
              <span>{entry.label}</span>
              <span className="font-mono">{formatCurrency(entry.amount, contract.currency)}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6">
        {(contract.sections ?? []).map((section, i) => (
          <div key={i}>
            <h2 className="font-display font-medium text-base mb-2">{section.heading}</h2>
            <p className="text-sm leading-relaxed whitespace-pre-wrap text-dim print:text-black/80">{section.body}</p>
          </div>
        ))}
      </section>

      {contract.notes && (
        <section className="mt-10">
          <h2 className="font-display font-medium text-base mb-2">הערות נוספות</h2>
          <p className="text-sm leading-relaxed whitespace-pre-wrap text-dim print:text-black/80">{contract.notes}</p>
        </section>
      )}

      <section className="mt-12 grid md:grid-cols-2 gap-4">
        <div className="border border-white/10 rounded-lg p-5 print:border-black/20">
          <div className="font-mono text-[10px] uppercase tracking-wide text-dim mb-3 print:text-black/60">נותן השירות</div>
          <div className="font-medium text-sm">{provider.provider_name}</div>
          <div className="text-dim text-xs mt-1 print:text-black/70">{provider.provider_business_name}</div>
        </div>

        <div
          className={
            signature
              ? "border border-[#D1FE17]/40 bg-[#D1FE17]/5 rounded-lg p-5 print:border-black/20 print:bg-transparent"
              : "border border-dashed border-white/15 rounded-lg p-5 print:border-black/20"
          }
        >
          <div className="font-mono text-[10px] uppercase tracking-wide text-dim mb-3 print:text-black/60">הלקוח</div>
          {signature ? (
            <>
              {signature.signature_image && (
                <img
                  src={signature.signature_image}
                  alt={`חתימת ${signature.full_name}`}
                  className="h-16 mb-3 bg-white rounded"
                />
              )}
              <div className="font-medium text-sm">{signature.full_name}</div>
              {signature.id_number && (
                <div className="text-dim text-xs mt-1 print:text-black/70">ת.ז / ח.פ {signature.id_number}</div>
              )}
              <div className="text-dim text-xs mt-1 print:text-black/70">
                נחתם דיגיטלית ב-{new Date(signature.signed_at).toLocaleString("he-IL")}
              </div>
            </>
          ) : (
            <div className="text-dim text-xs print:text-black/70">טרם נחתם</div>
          )}
        </div>
      </section>
    </article>
  )
}
