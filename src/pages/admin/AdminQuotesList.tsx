import { useEffect, useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { supabase, QUOTE_STATUS_LABELS, type QuoteRow, type QuoteStatus } from "@/lib/supabase"
import { formatCurrency } from "@/lib/quotePricing"
import { AdminGate } from "@/components/AdminGate"
import { AdminPage, AdminAction } from "@/components/admin/AdminPage"
import { cn } from "@/lib/utils"

const FILTERS: (QuoteStatus | "all")[] = [
  "all", "draft", "ready", "sent", "viewed", "approved", "signed", "deposit_paid", "in_progress", "completed", "declined", "expired",
]

// A signed quote is a closed deal, and the agreement is the next thing that has
// to happen. The route that builds one from a quote already existed, but only
// inside the quote builder's send step · by the time the client signs, Raz is
// looking at this list or at the notification, and from there the contract was
// a screen hunt. It is one tap from both now.
const CLOSED: QuoteStatus[] = ["approved", "signed", "deposit_paid", "in_progress"]

function AdminQuotesListInner() {
  const navigate = useNavigate()
  const [quotes, setQuotes] = useState<QuoteRow[]>([])
  const [contractByQuote, setContractByQuote] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<QuoteStatus | "all">("all")

  useEffect(() => {
    Promise.all([
      supabase.from("quotes").select("*").order("created_at", { ascending: false }),
      supabase.from("contracts").select("id, quote_id").not("quote_id", "is", null),
    ]).then(([quoteRes, contractRes]) => {
      setQuotes(quoteRes.data ?? [])
      setContractByQuote(
        Object.fromEntries((contractRes.data ?? []).map((c) => [c.quote_id as string, c.id as string]))
      )
      setLoading(false)
    })
  }, [])

  const filtered = useMemo(() => {
    if (filter === "all") return quotes
    return quotes.filter((q) => q.status === filter)
  }, [quotes, filter])


  return (
    <AdminPage
      title="הצעות מחיר"
      description="כל ההצעות שנוצרו, לפי סטטוס."
      loading={loading}
      action={<AdminAction onClick={() => navigate("/admin/quotes/new")}>+ הצעה</AdminAction>}
    >

      <div className="flex flex-wrap gap-1.5 mb-6">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "font-mono text-[10px] uppercase tracking-wide rounded-full px-2.5 py-1 border transition-colors",
              filter === f ? "border-lime bg-lime text-black" : "border-white/15 text-dim"
            )}
          >
            {f === "all" ? "הכל" : QUOTE_STATUS_LABELS[f]}
          </button>
        ))}
      </div>

      {filtered.length === 0 && <p className="text-dim text-sm">אין הצעות תואמות.</p>}

      <div className="grid gap-2">
        {filtered.map((q) => {
          const contractId = contractByQuote[q.id]
          return (
            <div
              key={q.id}
              className="border border-white/10 rounded-lg px-5 py-4 hover:border-lime/40 transition-colors flex items-center justify-between gap-4 flex-wrap"
            >
              <button onClick={() => navigate(`/admin/quotes/${q.id}`)} className="text-right min-w-0 flex-1">
                <div className="font-medium text-sm">
                  {q.title} {q.quote_number && <span className="text-dim text-xs">· {q.quote_number}</span>}
                </div>
                <div className="text-dim text-xs mt-1">{q.client_name}</div>
              </button>
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm">{formatCurrency(q.final_total ?? q.calculated_total ?? q.total, q.currency)}</span>
                <span className="font-mono text-[11px] uppercase tracking-wide border border-white/20 rounded-full px-3 py-1">
                  {QUOTE_STATUS_LABELS[q.status] ?? q.status}
                </span>
                {contractId ? (
                  <Link
                    to={`/admin/contracts/${contractId}`}
                    className="font-mono text-[11px] uppercase tracking-wide border border-white/20 rounded-full px-3 py-1 hover:border-lime transition-colors flex-none"
                  >
                    החוזה ←
                  </Link>
                ) : CLOSED.includes(q.status) ? (
                  <Link
                    to={`/admin/contracts/new?quoteId=${q.id}`}
                    className="font-mono text-[11px] uppercase tracking-wide bg-lime text-black rounded-full px-3 py-1 hover:scale-105 transition-transform flex-none"
                  >
                    חוזה ←
                  </Link>
                ) : null}
              </div>
            </div>
          )
        })}
      </div>
    </AdminPage>
  )
}

export function AdminQuotesList() {
  return (
    <AdminGate>
      <AdminQuotesListInner />
    </AdminGate>
  )
}
