import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { supabase, type QuoteRow, type QuoteSignatureRow, type QuoteItemRow } from "@/lib/supabase"
import { useAuth } from "@/hooks/useAuth"
import { useDocumentMeta } from "@/hooks/useDocumentMeta"
import { PortalLogin } from "@/pages/portal/PortalLogin"
import { QuoteDocument } from "@/components/quote/QuoteDocument"

export function QuoteView() {
  useDocumentMeta("הצעת מחיר · RAZ")
  const { id } = useParams()
  const { user, loading: authLoading } = useAuth()

  const [quote, setQuote] = useState<QuoteRow | null>(null)
  const [items, setItems] = useState<QuoteItemRow[]>([])
  const [signature, setSignature] = useState<QuoteSignatureRow | null>(null)
  const [loading, setLoading] = useState(true)

  const [fullName, setFullName] = useState("")
  const [confirmed, setConfirmed] = useState(false)
  const [signing, setSigning] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user || !id) return
    setLoading(true)
    Promise.all([
      supabase.from("quotes").select("*").eq("id", id).single(),
      supabase.from("quote_items").select("*").eq("quote_id", id).order("sort_order"),
      supabase.from("quote_signatures").select("*").eq("quote_id", id).maybeSingle(),
    ]).then(([q, qi, s]) => {
      setQuote(q.data ?? null)
      setItems(qi.data ?? [])
      setSignature(s.data ?? null)
      setLoading(false)
    })
  }, [user, id])

  async function handleSign() {
    if (!quote || !fullName.trim() || !confirmed) return
    setSigning(true)
    setError(null)
    try {
      const ipRes = await fetch("/api/client-ip")
      const { ip } = await ipRes.json().catch(() => ({ ip: null }))

      const { data: sig, error: sigError } = await supabase
        .from("quote_signatures")
        .insert({ quote_id: quote.id, full_name: fullName.trim(), confirmed: true, ip_address: ip })
        .select()
        .single()

      if (sigError) {
        setError("משהו השתבש, נסו שוב.")
        return
      }

      await supabase.from("quotes").update({ status: "signed" }).eq("id", quote.id)
      setSignature(sig)
      setQuote({ ...quote, status: "signed" })
    } finally {
      setSigning(false)
    }
  }

  if (authLoading) return null
  if (!user) return <PortalLogin />
  if (loading) return <div className="pt-40 pb-40 container font-mono text-xs text-dim uppercase">טוען…</div>

  if (!quote) {
    return (
      <div className="pt-40 pb-40 container">
        <p className="font-mono text-sm text-dim uppercase">ההצעה לא נמצאה.</p>
        <Link to="/portal" className="inline-block mt-6 underline underline-offset-4 text-sm hover:text-[#D1FE17] transition-colors">
          → חזרה לפורטל
        </Link>
      </div>
    )
  }

  const displayTotal = quote.final_total ?? (quote.calculated_total > 0 ? quote.calculated_total : quote.total)

  return (
    <div className="min-h-[100dvh] pt-28 pb-20 px-6 md:px-12">
      <div className="max-w-2xl mx-auto">
        <Link to="/portal" className="inline-block mb-8 font-mono text-xs uppercase tracking-wide text-dim hover:text-[#D1FE17] transition-colors">
          → חזרה לפורטל
        </Link>

        <QuoteDocument
          title={quote.title}
          createdAt={quote.created_at}
          validityDays={quote.validity_days}
          currency={quote.currency}
          items={items.map((it) => ({
            key: it.id,
            name: it.name,
            description: it.description,
            quantity: it.quantity,
            unit_price: it.unit_price,
            included: it.included,
            recurring: it.recurring,
          }))}
          legacyLineItems={quote.line_items}
          displayTotal={displayTotal}
          presentationMode={quote.presentation_mode ?? "package"}
          notes={quote.notes}
          paymentTerms={quote.payment_terms}
          driveFolderUrl={quote.drive_folder_url}
          signature={signature ? { fullName: signature.full_name, signedAt: signature.signed_at } : null}
        />

        {!signature && (
          <div className="border border-white/15 rounded-lg p-5">
            <h2 className="font-display font-medium text-lg mb-4">אישור וחתימה על ההצעה</h2>
            <div className="flex flex-col gap-4">
              <div>
                <label htmlFor="sig-name" className="block text-xs font-mono text-dim uppercase tracking-wide mb-2">שם מלא *</label>
                <input
                  id="sig-name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="שם מלא"
                  className="w-full bg-transparent border border-white/30 rounded px-4 py-3 text-sm focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:border-white/50"
                />
              </div>
              <label className="flex items-start gap-3 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={(e) => setConfirmed(e.target.checked)}
                  className="mt-0.5"
                />
                <span>
                  אני מאשר/ת שקראתי את ההצעה ואת{" "}
                  <Link to="/terms" target="_blank" className="underline underline-offset-4 hover:text-[#D1FE17] transition-colors">תנאי השימוש</Link>
                  , ומסכימ/ה לתנאים המפורטים בה.
                </span>
              </label>
              {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
              <button
                onClick={handleSign}
                disabled={signing || !fullName.trim() || !confirmed}
                className="mt-2 w-fit font-mono text-[10px] font-bold uppercase tracking-wide bg-[#D1FE17] text-black rounded-full px-6 py-3 hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
              >
                {signing ? "חותם…" : "חתימה ואישור ההצעה ←"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
