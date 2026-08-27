import { useState } from "react"
import { QUOTE_STATUS_LABELS } from "@/lib/supabase"
import type { QuoteBuilder } from "@/hooks/useQuoteBuilder"
import { formatCurrency } from "@/lib/quotePricing"

function buildWhatsAppText(title: string, link: string, total: string) {
  return `היי! הכנתי לך הצעת מחיר: ${title}.\nסה"כ: ${total}\nאפשר לצפות ולאשר כאן: ${link}`
}

export function StepSend({ qb }: { qb: QuoteBuilder }) {
  const { quote, clients, calc, sendQuoteEmail, sending, sendResult, markAsSent } = qb
  const [copied, setCopied] = useState(false)

  if (!quote.id) {
    return (
      <div className="border border-dashed border-white/15 rounded-lg p-10 text-center text-dim text-sm max-w-xl">
        ההצעה עוד לא נשמרה. חכו רגע — היא נשמרת אוטומטית ברגע שנבחר לקוח ונוספו שירותים, ואז אפשר יהיה לשלוח אותה.
      </div>
    )
  }

  const client = clients.find((c) => c.id === quote.client_id)
  const proposalLink = `${window.location.origin}/portal/quote/${quote.id}`
  const displayTotal = formatCurrency(quote.final_total ?? calc?.calculatedTotal ?? 0, quote.currency)
  const whatsappHref = client?.phone
    ? `https://wa.me/${client.phone.replace(/\D/g, "")}?text=${encodeURIComponent(buildWhatsAppText(quote.title || "הצעת מחיר", proposalLink, displayTotal))}`
    : null

  function copyProposalLink() {
    navigator.clipboard.writeText(proposalLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="max-w-xl grid gap-6">
      <div className="text-sm">
        סטטוס נוכחי: <span className="font-mono uppercase">{QUOTE_STATUS_LABELS[quote.status ?? "draft"]}</span>
        {quote.sent_at && <span className="text-dim text-xs"> · נשלח ב-{new Date(quote.sent_at).toLocaleString("he-IL")}</span>}
      </div>

      <div className="border border-white/10 rounded-lg p-4 grid gap-3">
        <div className="font-mono text-xs uppercase tracking-wide text-dim">קישור להצעה</div>
        <div className="flex items-center gap-3 flex-wrap">
          <code className="text-xs text-dim break-all flex-1 min-w-[200px]">{proposalLink}</code>
          <button
            onClick={copyProposalLink}
            className="font-mono text-xs uppercase tracking-wide border border-white/30 rounded-full px-4 py-2 hover:border-[#D1FE17] transition-colors flex-none"
          >
            {copied ? "הועתק ✓" : "העתקה"}
          </button>
        </div>
      </div>

      <div className="border border-white/10 rounded-lg p-4 grid gap-3">
        <div className="font-mono text-xs uppercase tracking-wide text-dim">מייל</div>
        <p className="text-dim text-xs">שולח מייל אמיתי ללקוח (Resend) עם קישור לצפייה ואישור. מסמן את ההצעה כ"נשלח" אוטומטית עם קבלת אישור מהשליחה.</p>
        <button
          onClick={sendQuoteEmail}
          disabled={sending}
          className="w-fit font-mono text-[10px] font-bold uppercase tracking-wide bg-[#D1FE17] text-black rounded-[8px] px-4 py-2.5 hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
        >
          {sending ? "שולח…" : sendResult === "sent" ? "נשלח ✓" : sendResult === "error" ? "שגיאה — נסו שוב" : "שליחה ללקוח במייל"}
        </button>
      </div>

      <div className="border border-white/10 rounded-lg p-4 grid gap-3">
        <div className="font-mono text-xs uppercase tracking-wide text-dim">וואטסאפ</div>
        <p className="text-dim text-xs">
          פותח שיחת וואטסאפ עם טקסט מוכן לשליחה ידנית — אין API עסקי, אז השליחה עצמה נשארת אצלכם.
          {!client?.phone && " יש להוסיף מספר טלפון ללקוח כדי להשתמש בזה."}
        </p>
        {whatsappHref ? (
          <a
            href={whatsappHref}
            target="_blank"
            rel="noreferrer"
            className="w-fit font-mono text-xs uppercase tracking-wide border border-white/30 rounded-full px-4 py-2 hover:border-[#D1FE17] transition-colors"
          >
            פתיחת וואטסאפ ←
          </a>
        ) : (
          <span className="text-dim text-xs">אין מספר טלפון ללקוח זה.</span>
        )}
        {whatsappHref && quote.status !== "sent" && (
          <button
            onClick={markAsSent}
            className="w-fit font-mono text-[10px] uppercase tracking-wide text-dim underline underline-offset-4 hover:text-[#D1FE17]"
          >
            סימון כ"נשלח" (אחרי שליחה ידנית בוואטסאפ)
          </button>
        )}
      </div>
    </div>
  )
}
