import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase, QUOTE_STATUS_LABELS, type QuoteRow, type QuoteStatus } from "@/lib/supabase"
import { formatCurrency } from "@/lib/quotePricing"
import { AdminGate } from "@/components/AdminGate"
import { AdminPage, AdminAction } from "@/components/admin/AdminPage"
import { cn } from "@/lib/utils"

const FILTERS: (QuoteStatus | "all")[] = [
  "all", "draft", "ready", "sent", "viewed", "approved", "signed", "deposit_paid", "in_progress", "completed", "declined", "expired",
]

function AdminQuotesListInner() {
  const navigate = useNavigate()
  const [quotes, setQuotes] = useState<QuoteRow[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<QuoteStatus | "all">("all")

  useEffect(() => {
    supabase
      .from("quotes")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setQuotes(data ?? [])
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
        {filtered.map((q) => (
          <button
            key={q.id}
            onClick={() => navigate(`/admin/quotes/${q.id}`)}
            className="text-right border border-white/10 rounded-lg px-5 py-4 hover:border-lime/40 transition-colors flex items-center justify-between gap-4 flex-wrap"
          >
            <div>
              <div className="font-medium text-sm">
                {q.title} {q.quote_number && <span className="text-dim text-xs">· {q.quote_number}</span>}
              </div>
              <div className="text-dim text-xs mt-1">{q.client_name}</div>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm">{formatCurrency(q.final_total ?? q.calculated_total ?? q.total, q.currency)}</span>
              <span className="font-mono text-[11px] uppercase tracking-wide border border-white/20 rounded-full px-3 py-1">
                {QUOTE_STATUS_LABELS[q.status] ?? q.status}
              </span>
            </div>
          </button>
        ))}
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
