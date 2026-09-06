import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { supabase, QUOTE_STATUS_LABELS, CONTRACT_STATUS_LABELS, type ContractRow, type QuoteRow } from "@/lib/supabase"
import { useAuth } from "@/hooks/useAuth"
import { useDocumentMeta } from "@/hooks/useDocumentMeta"
import { PortalLogin } from "@/pages/portal/PortalLogin"

export function Portal() {
  useDocumentMeta("פורטל לקוחות · RAZ")
  const { user, loading } = useAuth()
  const [quotes, setQuotes] = useState<QuoteRow[]>([])
  const [contracts, setContracts] = useState<ContractRow[]>([])
  const [loadingQuotes, setLoadingQuotes] = useState(true)

  useEffect(() => {
    if (!user) return
    Promise.all([
      supabase.from("quotes").select("*").order("created_at", { ascending: false }),
      supabase.from("contracts").select("*").order("created_at", { ascending: false }),
    ]).then(([q, c]) => {
      setQuotes(q.data ?? [])
      setContracts(c.data ?? [])
      setLoadingQuotes(false)
    })
  }, [user])

  if (loading) return null
  if (!user) return <PortalLogin />

  return (
    <div className="min-h-[100dvh] pt-28 pb-20 px-6 md:px-12">
      <div className="flex items-center justify-between mb-10">
        <div>
          <div className="font-display font-bold text-2xl">פורטל לקוחות</div>
          <div className="text-dim text-xs mt-1">{user.email}</div>
        </div>
        <button
          onClick={() => supabase.auth.signOut()}
          className="font-mono text-xs uppercase tracking-wide text-dim hover:text-[#D1FE17] transition-colors"
        >
          יציאה
        </button>
      </div>

      {loadingQuotes && <p className="text-dim text-sm">טוען…</p>}
      {!loadingQuotes && quotes.length === 0 && contracts.length === 0 && (
        <p className="text-dim text-sm">אין מסמכים זמינים כרגע. אם ציפיתם לראות כאן הצעה או חוזה, צרו קשר.</p>
      )}

      <div className="grid gap-10 max-w-2xl">
        {contracts.length > 0 && (
          <section>
            <h2 className="font-mono text-xs uppercase tracking-wide text-dim mb-3">חוזים</h2>
            <div className="grid gap-3">
              {contracts.map((c) => (
                <Link
                  key={c.id}
                  to={`/portal/contract/${c.id}`}
                  className="flex items-center justify-between gap-4 border border-white/10 rounded-lg px-5 py-4 hover:border-[#D1FE17] transition-colors"
                >
                  <div>
                    <div className="font-medium">{c.title}</div>
                    <div className="text-dim text-xs mt-1">
                      {new Date(c.created_at).toLocaleDateString("he-IL")}
                      {c.contract_number ? ` · ${c.contract_number}` : ""}
                    </div>
                  </div>
                  <span
                    className={
                      c.status === "signed"
                        ? "font-mono text-[11px] uppercase tracking-wide border border-[#D1FE17] text-[#D1FE17] rounded-full px-3 py-1 flex-none"
                        : "font-mono text-[11px] uppercase tracking-wide border border-white/20 rounded-full px-3 py-1 flex-none"
                    }
                  >
                    {c.status === "signed" ? CONTRACT_STATUS_LABELS.signed : "ממתין לחתימה"}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {quotes.length > 0 && (
          <section>
            <h2 className="font-mono text-xs uppercase tracking-wide text-dim mb-3">הצעות מחיר</h2>
            <div className="grid gap-3">
              {quotes.map((q) => (
                <Link
                  key={q.id}
                  to={`/portal/quote/${q.id}`}
                  className="flex items-center justify-between border border-white/10 rounded-lg px-5 py-4 hover:border-[#D1FE17] transition-colors"
                >
                  <div>
                    <div className="font-medium">{q.title}</div>
                    <div className="text-dim text-xs mt-1">{new Date(q.created_at).toLocaleDateString("he-IL")}</div>
                  </div>
                  <span className="font-mono text-[11px] uppercase tracking-wide border border-white/20 rounded-full px-3 py-1">
                    {QUOTE_STATUS_LABELS[q.status]}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
