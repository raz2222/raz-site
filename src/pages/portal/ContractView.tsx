import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { supabase, type ContractRow, type ContractSignatureRow } from "@/lib/supabase"
import { useAuth } from "@/hooks/useAuth"
import { useDocumentMeta } from "@/hooks/useDocumentMeta"
import { PortalLogin } from "@/pages/portal/PortalLogin"
import { ContractDocument } from "@/components/contract/ContractDocument"
import { SignaturePad } from "@/components/contract/SignaturePad"
import { resolveProvider } from "@/lib/contracts"

export function ContractView() {
  useDocumentMeta("חוזה עבודה · RAZ")
  const { id } = useParams()
  const { user, loading: authLoading } = useAuth()

  const [contract, setContract] = useState<ContractRow | null>(null)
  const [signature, setSignature] = useState<ContractSignatureRow | null>(null)
  const [loading, setLoading] = useState(true)

  const [fullName, setFullName] = useState("")
  const [idNumber, setIdNumber] = useState("")
  const [signatureImage, setSignatureImage] = useState<string | null>(null)
  const [confirmed, setConfirmed] = useState(false)
  const [signing, setSigning] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user || !id) return
    setLoading(true)
    Promise.all([
      supabase.from("contracts").select("*").eq("id", id).maybeSingle(),
      supabase.from("contract_signatures").select("*").eq("contract_id", id).maybeSingle(),
    ]).then(([c, s]) => {
      setContract(c.data ?? null)
      setSignature(s.data ?? null)
      setFullName((c.data?.client_name as string) ?? "")
      setIdNumber((c.data?.client_id_number as string) ?? "")
      setLoading(false)

      // Reading it is worth recording: it tells Raz the contract landed, without
      // him having to ask. Through an RPC because the client has no write access
      // to the row itself.
      if (c.data && c.data.status === "sent") {
        supabase.rpc("mark_contract_viewed", { contract_id: id }).then(() => {})
      }
    })
  }, [user, id])

  async function handleSign() {
    if (!contract || !fullName.trim() || !confirmed) return
    setSigning(true)
    setError(null)
    try {
      const ipRes = await fetch("/api/client-ip").catch(() => null)
      const { ip } = (await ipRes?.json().catch(() => ({ ip: null }))) ?? { ip: null }

      const { data: sig, error: sigError } = await supabase
        .from("contract_signatures")
        .insert({
          contract_id: contract.id,
          full_name: fullName.trim(),
          id_number: idNumber.trim() || null,
          signature_image: signatureImage,
          confirmed: true,
          ip_address: ip,
          user_agent: navigator.userAgent.slice(0, 400),
        })
        .select()
        .single()

      if (sigError) {
        setError("משהו השתבש, נסו שוב.")
        return
      }

      setSignature(sig)
      setContract({ ...contract, status: "signed" })

      // Tells Raz it was signed. A failure here must not look to the client like
      // the signing itself failed, because it did not.
      fetch("/api/notify-contract-signed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contractId: contract.id }),
      }).catch(() => {})
    } finally {
      setSigning(false)
    }
  }

  if (authLoading) return null
  if (!user) return <PortalLogin />
  if (loading) return <div className="pt-40 pb-40 container font-mono text-xs text-dim uppercase">טוען…</div>

  if (!contract) {
    return (
      <div className="pt-40 pb-40 container">
        <p className="font-mono text-sm text-dim uppercase">החוזה לא נמצא.</p>
        <Link to="/portal" className="inline-block mt-6 underline underline-offset-4 text-sm hover:text-[#D1FE17] transition-colors">
          → חזרה לפורטל
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-[100dvh] pt-28 pb-20 px-6 md:px-12 print:pt-0 print:px-0">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between gap-4 mb-8 print:hidden">
          <Link to="/portal" className="font-mono text-xs uppercase tracking-wide text-dim hover:text-[#D1FE17] transition-colors">
            → חזרה לפורטל
          </Link>
          <button
            onClick={() => window.print()}
            className="font-mono text-xs uppercase tracking-wide border border-white/30 rounded-full px-4 py-2 hover:border-[#D1FE17] transition-colors"
          >
            הדפסה / שמירה כ-PDF
          </button>
        </div>

        <ContractDocument contract={contract} provider={resolveProvider(contract.provider)} signature={signature} />

        {!signature && (
          <div className="border border-white/15 rounded-lg p-5 mt-10 print:hidden">
            <h2 className="font-display font-medium text-lg mb-1">חתימה על החוזה</h2>
            <p className="text-dim text-xs mb-5">
              החתימה נשמרת יחד עם השם, התאריך וכתובת ה-IP שממנה נחתמה, ומהווה חתימה אלקטרונית מחייבת.
            </p>
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
              <div>
                <label htmlFor="sig-id" className="block text-xs font-mono text-dim uppercase tracking-wide mb-2">ת.ז / ח.פ</label>
                <input
                  id="sig-id"
                  value={idNumber}
                  onChange={(e) => setIdNumber(e.target.value)}
                  placeholder="לא חובה"
                  className="w-full bg-transparent border border-white/30 rounded px-4 py-3 text-sm focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:border-white/50"
                />
              </div>

              <SignaturePad onChange={setSignatureImage} />

              <label className="flex items-start gap-3 text-sm cursor-pointer">
                <input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} className="mt-0.5" />
                <span>
                  קראתי את החוזה במלואו, אני מסכימ/ה לכל תנאיו, ואני מאשר/ת שהחתימה האלקטרונית שלי כאן מחייבת אותי
                  כמו חתימה על נייר.
                </span>
              </label>

              {error && <p role="alert" className="text-sm text-red-400">{error}</p>}

              <button
                onClick={handleSign}
                disabled={signing || !fullName.trim() || !confirmed}
                className="mt-2 w-fit font-mono text-[10px] font-bold uppercase tracking-wide bg-[#D1FE17] text-black rounded-full px-6 py-3 hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
              >
                {signing ? "חותם…" : "חתימה על החוזה ←"}
              </button>
            </div>
          </div>
        )}

        {signature && (
          <div className="border border-[#D1FE17]/40 bg-[#D1FE17]/5 rounded-lg p-5 mt-10 print:hidden">
            <p className="text-sm">
              ✓ החוזה נחתם ב-{new Date(signature.signed_at).toLocaleString("he-IL")}. אפשר לשמור עותק עם כפתור ההדפסה
              למעלה, ועותק נשלח גם למייל שלכם.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
