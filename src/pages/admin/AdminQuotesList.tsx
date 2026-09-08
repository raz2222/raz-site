import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase, QUOTE_STATUS_LABELS, type QuoteRow, type QuoteStatus } from "@/lib/supabase"
import { formatCurrency } from "@/lib/quotePricing"
import { AdminGate } from "@/components/AdminGate"
import { AdminPage, AdminAction } from "@/components/admin/AdminPage"
import { cn } from "@/lib/utils"
import { SwipeRow } from "@/components/admin/SwipeRow"
import { PutAwayActions } from "@/components/admin/PutAwayActions"
import { adminNotify } from "@/components/admin/AdminToaster"

const FILTERS: (QuoteStatus | "all")[] = [
  "all", "draft", "ready", "sent", "viewed", "approved", "signed", "deposit_paid", "in_progress", "completed", "declined", "expired",
]


function AdminQuotesListInner() {
  const navigate = useNavigate()
  const [quotes, setQuotes] = useState<QuoteRow[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<QuoteStatus | "all">("all")
  const [showArchive, setShowArchive] = useState(false)

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
    const inView = quotes.filter((q) => !q.deleted_at && Boolean(q.archived_at) === showArchive)
    if (filter === "all") return inView
    return inView.filter((q) => q.status === filter)
  }, [quotes, filter, showArchive])

  const archivedCount = useMemo(
    () => quotes.filter((q) => !q.deleted_at && q.archived_at).length,
    [quotes]
  )

  /** Neither action issues a DELETE · both write a date, and the archive hands
   * the quote back. A binned quote also stops being readable by the client, so
   * a link already sent goes quiet rather than showing a price you withdrew. */
  async function putAway(quote: QuoteRow, action: "archive" | "delete" | "restore") {
    const patch =
      action === "archive"
        ? { archived_at: new Date().toISOString(), deleted_at: null }
        : action === "delete"
          ? { deleted_at: new Date().toISOString() }
          : { archived_at: null, deleted_at: null }

    const { error } = await supabase.from("quotes").update(patch).eq("id", quote.id)
    if (error) {
      adminNotify(error.message)
      return
    }
    setQuotes((rows) => rows.map((r) => (r.id === quote.id ? { ...r, ...patch } : r)))
  }


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

      {(archivedCount > 0 || showArchive) && (
        <button
          onClick={() => setShowArchive(!showArchive)}
          className="w-fit mb-4 font-mono text-[10px] uppercase tracking-wide text-dim hover:text-lime transition-colors py-2"
        >
          {showArchive ? "→ חזרה להצעות" : `ארכיון (${archivedCount}) ←`}
        </button>
      )}

      {filtered.length === 0 && (
        <p className="text-dim text-sm">{showArchive ? "הארכיון ריק." : "אין הצעות תואמות."}</p>
      )}

      <div className="grid gap-2">
        {filtered.map((q) => {
          return (
            <SwipeRow
              key={q.id}
              archived={Boolean(q.archived_at)}
              onArchive={() => putAway(q, "archive")}
              onRestore={() => putAway(q, "restore")}
              onDelete={() => putAway(q, "delete")}
            >
            <div
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
                <PutAwayActions
                  archived={Boolean(q.archived_at)}
                  label={`ההצעה "${q.title}"`}
                  onArchive={() => putAway(q, "archive")}
                  onRestore={() => putAway(q, "restore")}
                  onDelete={() => putAway(q, "delete")}
                />
              </div>
            </div>
            </SwipeRow>
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
