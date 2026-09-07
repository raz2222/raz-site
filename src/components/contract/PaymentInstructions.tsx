import { useState } from "react"
import { formatCurrency } from "@/lib/quotePricing"
import { internationalPhone } from "@/lib/contracts"
import type { PaymentDetailsRow } from "@/lib/supabase"

export type PaymentInstructionsProps = {
  details: Partial<PaymentDetailsRow>
  amount: number
  amountLabel: string
  currency: string
  contractTitle: string
  contractNumber?: string | null
}

function CopyRow({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3">
      <div className="min-w-0">
        <div className="text-dim text-[10px] font-mono uppercase tracking-wide">{label}</div>
        {/* Wraps rather than truncating. The longest value here is the reference
         * the client has to write on the transfer, and an ellipsis hid the
         * contract number · the one part of it that identifies the payment.
         * `truncate` also sets white-space: nowrap, which made this row's
         * min-content 321px and pushed the whole panel off a 375px screen. */}
        <div className="text-sm font-medium break-words">{value}</div>
      </div>
      <button
        onClick={() => {
          navigator.clipboard.writeText(value)
          setCopied(true)
          setTimeout(() => setCopied(false), 1500)
        }}
        className="flex-none font-mono text-[10px] uppercase tracking-wide border border-white/25 rounded-full px-3 py-2.5 hover:border-[#D1FE17] transition-colors"
      >
        {copied ? "הועתק ✓" : "העתקה"}
      </button>
    </div>
  )
}

/** Shown the moment a contract is signed. Signing and then hunting for where to
 * send the money is where a deal goes quiet, so the answer sits on the same
 * page, with the amount already worked out. */
export function PaymentInstructions({
  details,
  amount,
  amountLabel,
  currency,
  contractTitle,
  contractNumber,
}: PaymentInstructionsProps) {
  const bankRows = [
    { label: "בנק", value: details.bank_name },
    { label: "סניף", value: details.bank_branch },
    { label: "מספר חשבון", value: details.bank_account_number },
    { label: "על שם", value: details.bank_account_holder },
  ].filter((row) => (row.value ?? "").trim()) as { label: string; value: string }[]

  const bitPhone = internationalPhone(details.bit_phone)
  const whatsappPhone = internationalPhone(details.whatsapp_phone || details.contact_phone)
  const reference = contractNumber ? `${contractTitle} · ${contractNumber}` : contractTitle
  const hasAnyMethod = bankRows.length > 0 || !!details.bit_link || !!bitPhone || !!details.paybox_link

  const whatsappHref = whatsappPhone
    ? `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(`היי, חתמתי על החוזה (${reference}) ורציתי לתאם את התשלום.`)}`
    : null

  return (
    <section className="border border-[#D1FE17]/40 rounded-lg p-5 md:p-6">
      <h2 className="font-display font-medium text-lg mb-1">התשלום הבא</h2>
      <p className="text-dim text-xs mb-5">
        {amountLabel} · לפי תנאי התשלום בחוזה. אחרי התשלום תקבלו חשבונית, ומתחילים.
      </p>

      <div className="flex items-baseline gap-3 mb-6">
        <span className="font-mono text-3xl font-bold text-[#D1FE17]">{formatCurrency(amount, currency)}</span>
        <span className="text-dim text-xs">{amountLabel}</span>
      </div>

      {!hasAnyMethod ? (
        <p className="text-dim text-sm">
          פרטי התשלום יישלחו אליכם בנפרד. אפשר גם פשוט להשיב למייל שקיבלתם.
        </p>
      ) : (
        // A grid item defaults to min-width:auto, so it refuses to shrink below
        // its content and takes the whole panel off the screen with it. Every
        // item in this grid is min-w-0 for that reason.
        <div className="grid gap-4 min-w-0">
          {bankRows.length > 0 && (
            <div className="min-w-0">
              <div className="font-mono text-[10px] uppercase tracking-wide text-dim mb-2">העברה בנקאית</div>
              <div className="border border-white/10 rounded-lg divide-y divide-white/10">
                {bankRows.map((row) => (
                  <CopyRow key={row.label} label={row.label} value={row.value} />
                ))}
                <CopyRow label="לציון בהעברה" value={reference} />
              </div>
            </div>
          )}

          {(details.bit_link || bitPhone || details.paybox_link) && (
            <div className="min-w-0">
              <div className="font-mono text-[10px] uppercase tracking-wide text-dim mb-2">ביט או פייבוקס</div>
              <div className="flex flex-wrap gap-2">
                {details.bit_link && (
                  <a
                    href={details.bit_link}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-[10px] font-bold uppercase tracking-wide bg-[#D1FE17] text-black rounded-full px-5 py-2.5 hover:scale-105 transition-transform"
                  >
                    תשלום בביט ←
                  </a>
                )}
                {details.paybox_link && (
                  <a
                    href={details.paybox_link}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-[10px] uppercase tracking-wide border border-white/25 rounded-full px-5 py-2.5 hover:border-[#D1FE17] transition-colors"
                  >
                    תשלום בפייבוקס ←
                  </a>
                )}
              </div>
              {bitPhone && (
                <div className="border border-white/10 rounded-lg mt-3">
                  <CopyRow label="מספר לביט" value={details.bit_phone ?? ""} />
                </div>
              )}
            </div>
          )}

          {whatsappHref && (
            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="font-mono text-[10px] uppercase tracking-wide underline underline-offset-4 text-dim hover:text-[#D1FE17] transition-colors w-fit py-2"
            >
              יש שאלה על התשלום? כתבו לי בוואטסאפ ←
            </a>
          )}

          {details.note && <p className="text-dim text-xs leading-relaxed whitespace-pre-wrap">{details.note}</p>}
        </div>
      )}
    </section>
  )
}
