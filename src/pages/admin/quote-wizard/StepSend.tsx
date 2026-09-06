import { useState } from "react"
import { Link } from "react-router-dom"
import { QUOTE_STATUS_LABELS } from "@/lib/supabase"
import type { QuoteBuilder } from "@/hooks/useQuoteBuilder"
import { formatCurrency } from "@/lib/quotePricing"
import { AdminAction, AdminButton } from "@/components/admin/AdminPage"

/** Anchors cannot be AdminButton, so they borrow its shape. Five panels, one
 * outline, one lime: the only lime button on this step is the one that actually
 * sends the quote. */
const OUTLINE_LINK =
  "w-fit font-mono text-[10px] uppercase tracking-wide border border-white/25 rounded-full px-5 py-2.5 hover:border-lime transition-colors"

function SendPanel({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border border-white/10 rounded-lg p-4 grid gap-3">
      <div className="font-mono text-xs uppercase tracking-wide text-dim">{label}</div>
      {children}
    </div>
  )
}

function buildWhatsAppText(title: string, link: string, total: string) {
  return `היי! הכנתי לך הצעת מחיר: ${title}.\nסה"כ: ${total}\nאפשר לצפות ולאשר כאן: ${link}`
}

export function StepSend({ qb }: { qb: QuoteBuilder }) {
  const { quote, clients, calc, sendQuoteEmail, sending, sendResult, markAsSent, createDriveFolder, creatingFolder } = qb
  const [copied, setCopied] = useState(false)

  if (!quote.id) {
    return (
      <div className="border border-dashed border-white/15 rounded-lg p-10 text-center text-dim text-sm max-w-xl">
        ההצעה עוד לא נשמרה. חכו רגע: היא נשמרת אוטומטית ברגע שנבחר לקוח ונוספו שירותים, ואז אפשר יהיה לשלוח אותה.
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

      <SendPanel label="קישור להצעה">
        <div className="flex items-center gap-3 flex-wrap">
          <code className="text-xs text-dim break-all flex-1 min-w-[200px]">{proposalLink}</code>
          <div className="flex-none">
            <AdminButton onClick={copyProposalLink}>{copied ? "הועתק ✓" : "העתקה"}</AdminButton>
          </div>
        </div>
      </SendPanel>

      <SendPanel label="מייל">
        <p className="text-dim text-xs">שולח מייל אמיתי ללקוח (Resend) עם קישור לצפייה ואישור. מסמן את ההצעה כ"נשלח" אוטומטית עם קבלת אישור מהשליחה.</p>
        <div className="w-fit">
          <AdminAction onClick={sendQuoteEmail} disabled={sending}>
            {sending ? "שולח…" : sendResult === "sent" ? "נשלח ✓" : sendResult === "error" ? "שגיאה, נסו שוב" : "שליחה ללקוח במייל"}
          </AdminAction>
        </div>
      </SendPanel>

      <SendPanel label="תיקיית קבצים">
        <p className="text-dim text-xs">תיקיית Drive לחומרים של הפרויקט. הקישור מופיע ללקוח בתוך ההצעה.</p>
        {quote.drive_folder_url ? (
          <a
            href={quote.drive_folder_url}
            target="_blank"
            rel="noreferrer"
            className={OUTLINE_LINK}
          >
            פתיחת התיקייה ←
          </a>
        ) : (
          <div className="w-fit">
            <AdminButton onClick={createDriveFolder} disabled={creatingFolder}>
              {creatingFolder ? "יוצר תיקייה…" : "+ צור תיקיית Drive"}
            </AdminButton>
          </div>
        )}
      </SendPanel>

      <SendPanel label="חוזה עבודה">
        <p className="text-dim text-xs">
          בונה חוזה מההצעה הזו · הלקוח, התוצרים, התמורה ותנאי התשלום נכנסים אליו לבד, ונשאר לבחור תבנית ולשלוח לחתימה.
        </p>
        <Link
          to={`/admin/contracts/new?quoteId=${quote.id}`}
          className={OUTLINE_LINK}
        >
          יצירת חוזה מההצעה ←
        </Link>
      </SendPanel>

      <SendPanel label="וואטסאפ">
        <p className="text-dim text-xs">
          פותח שיחת וואטסאפ עם טקסט מוכן לשליחה ידנית, אין API עסקי, אז השליחה עצמה נשארת אצלכם.
          {!client?.phone && " יש להוסיף מספר טלפון ללקוח כדי להשתמש בזה."}
        </p>
        {whatsappHref ? (
          <a
            href={whatsappHref}
            target="_blank"
            rel="noreferrer"
            className={OUTLINE_LINK}
          >
            פתיחת וואטסאפ ←
          </a>
        ) : (
          <span className="text-dim text-xs">אין מספר טלפון ללקוח זה.</span>
        )}
        {whatsappHref && quote.status !== "sent" && (
          <button
            onClick={markAsSent}
            className="w-fit font-mono text-[10px] uppercase tracking-wide text-dim underline underline-offset-4 hover:text-lime"
          >
            סימון כ"נשלח" (אחרי שליחה ידנית בוואטסאפ)
          </button>
        )}
      </SendPanel>
    </div>
  )
}
