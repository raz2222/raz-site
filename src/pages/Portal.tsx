import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { supabase, type QuoteRow } from "@/lib/supabase"
import { useAuth } from "@/hooks/useAuth"
import { useDocumentMeta } from "@/hooks/useDocumentMeta"
import { PortalLogin } from "@/pages/portal/PortalLogin"

const STATUS_LABEL: Record<QuoteRow["status"], string> = {
  draft: "טיוטה",
  sent: "ממתין לחתימה",
  signed: "נחתם",
  declined: "נדחה",
}

export function Portal() {
  useDocumentMeta("פורטל לקוחות — RAZ")
  const { user, loading } = useAuth()
  const [quotes, setQuotes] = useState<QuoteRow[]>([])
  const [loadingQuotes, setLoadingQuotes] = useState(true)

  useEffect(() => {
    if (!user) return
    supabase
      .from("quotes")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setQuotes(data ?? [])
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
      {!loadingQuotes && quotes.length === 0 && (
        <p className="text-dim text-sm">אין הצעות מחיר זמינות כרגע. אם ציפיתם לראות הצעה כאן, צרו קשר.</p>
      )}
      <div className="grid gap-3 max-w-2xl">
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
              {STATUS_LABEL[q.status]}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
