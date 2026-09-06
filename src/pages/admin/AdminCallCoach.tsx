import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { ArrowRight, Copy, Phone } from "lucide-react"
import { AdminGate } from "@/components/AdminGate"
import { AdminNav } from "@/components/AdminNav"
import { Field, TextArea } from "@/components/admin/FieldEditors"
import { useCallSession } from "@/hooks/useCallSession"
import { CALL_PACKAGES, callProgress, type CallPackageKey } from "@/lib/callScript"
import { internationalPhone } from "@/lib/contracts"
import { buildPackageContract, insertContract, insertPackageQuote } from "@/lib/packageContract"
import { sendContract, sendQuote } from "@/lib/sendDocument"
import { ensureClientForContact } from "@/lib/crm"
import { formatCurrency } from "@/lib/quotePricing"
import { supabase } from "@/lib/supabase"
import { cn } from "@/lib/utils"

function OfferCard({ packageKey }: { packageKey: CallPackageKey }) {
  const pack = CALL_PACKAGES[packageKey]
  return (
    <div className="mt-6 border-t border-lime/20 pt-5">
      <div className="font-display font-bold text-3xl text-lime">
        {formatCurrency(pack.price)} <span className="text-sm font-normal text-dim">{pack.unit}</span>
      </div>
      <div className="text-dim text-xs mt-1">{pack.meta}</div>
      <ul className="grid gap-1.5 mt-4">
        {pack.bullets.map((b) => (
          <li key={b} className="flex items-start gap-2 text-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-lime flex-none mt-2" />
            {b}
          </li>
        ))}
      </ul>
    </div>
  )
}

function AdminCallCoachInner() {
  const call = useCallSession()
  const navigate = useNavigate()
  const [copied, setCopied] = useState(false)
  const [linking, setLinking] = useState(false)
  const [closing, setClosing] = useState<null | "contract" | "quote">(null)
  const [closeResult, setCloseResult] = useState<string | null>(null)

  if (call.loading) return <div className="pt-40 pb-40 container font-mono text-xs text-dim uppercase">טוען…</div>

  const { session, setSession, node, ending } = call
  const phoneHref = session.contact_phone ? `tel:${session.contact_phone.replace(/\s/g, "")}` : null
  const whatsappHref = session.contact_phone
    ? `https://wa.me/${internationalPhone(session.contact_phone)}`
    : null

  // A contract needs a client row. A call may have started from nothing but a
  // name, so the client is created on the way out rather than demanded on the
  // way in, which would have put a form between Raz and the phone ringing.
  async function goToContract() {
    setLinking(true)
    try {
      let clientId = session.client_id
      if (!clientId) {
        const client = await ensureClientForContact({
          name: session.contact_name ?? "",
          email: session.contact_email,
          phone: session.contact_phone,
          company: session.business_name,
        })
        if (!client) {
          alert("כדי ליצור חוזה צריך אימייל של הלקוח. אפשר להוסיף אותו כאן ולנסות שוב.")
          return
        }
        clientId = client.id
        await call.patch({ client_id: client.id })
      }
      const params = new URLSearchParams({ clientId, callId: session.id ?? "" })
      if (call.packageKey) params.set("package", call.packageKey)
      navigate(`/admin/contracts/new?${params.toString()}`)
    } finally {
      setLinking(false)
    }
  }

  async function goToQuote() {
    setLinking(true)
    try {
      let clientId = session.client_id
      if (!clientId) {
        const client = await ensureClientForContact({
          name: session.contact_name ?? "",
          email: session.contact_email,
          phone: session.contact_phone,
          company: session.business_name,
        })
        if (!client) {
          alert("כדי ליצור הצעת מחיר צריך אימייל של הלקוח.")
          return
        }
        clientId = client.id
        await call.patch({ client_id: client.id })
      }
      navigate(`/admin/quotes/new?clientId=${clientId}&callId=${session.id ?? ""}`)
    } finally {
      setLinking(false)
    }
  }

  /** Everything a closed call needs, without leaving the call.
   *
   * The lead said yes on the phone; making Raz open a builder, retype the
   * package, save, find the send tab and send is five screens between the yes
   * and the signature. The client row, the agreement, its clauses, its number
   * and the email all happen here. */
  async function clientForClose() {
    if (session.client_id) {
      const { data } = await supabase.from("clients").select("*").eq("id", session.client_id).maybeSingle()
      if (data) return data
    }
    const client = await ensureClientForContact({
      name: session.contact_name ?? "",
      email: session.contact_email,
      phone: session.contact_phone,
      company: session.business_name,
    })
    if (client && !session.client_id) await call.patch({ client_id: client.id })
    return client
  }

  async function closeWithContract() {
    if (!call.packageKey) return
    setClosing("contract")
    setCloseResult(null)
    try {
      const client = await clientForClose()
      if (!client) {
        setCloseResult("כדי לשלוח חוזה צריך אימייל של הלקוח. אפשר להוסיף אותו בכרטיס הלקוח ולנסות שוב.")
        return
      }

      const { data: settings } = await supabase.from("quote_settings").select("*").maybeSingle()
      const { data: templates } = await supabase
        .from("contract_templates")
        .select("*")
        .eq("active", true)
        .order("sort_order")

      const draft = buildPackageContract({
        packageKey: call.packageKey,
        client,
        settings: settings ?? null,
        templates: templates ?? [],
      })
      const contract = await insertContract(draft, settings ?? null)
      if (!contract) {
        setCloseResult("יצירת החוזה נכשלה. נסה שוב, או פתח אותו לעריכה.")
        return
      }

      await call.patch({ contract_id: contract.id })

      const sent = await sendContract(contract, window.location.origin)
      setCloseResult(
        sent.ok
          ? `החוזה נשלח ל-${contract.client_email}. הוא ייפתח אצלו לקריאה ולחתימה.`
          : `החוזה נוצר אבל השליחה נכשלה · ${sent.message} אפשר לפתוח אותו ולשלוח שוב.`
      )
    } finally {
      setClosing(null)
    }
  }

  async function closeWithQuote() {
    if (!call.packageKey) return
    setClosing("quote")
    setCloseResult(null)
    try {
      const client = await clientForClose()
      if (!client) {
        setCloseResult("כדי לשלוח הצעת מחיר צריך אימייל של הלקוח.")
        return
      }

      const { data: settings } = await supabase.from("quote_settings").select("*").maybeSingle()
      const quote = await insertPackageQuote({
        packageKey: call.packageKey,
        client,
        settings: settings ?? null,
        callId: session.id,
      })
      if (!quote) {
        setCloseResult("יצירת ההצעה נכשלה. נסה שוב, או בנה אותה במסך ההצעות.")
        return
      }

      const sent = await sendQuote(
        {
          id: quote.id,
          client_email: quote.client_email,
          client_name: quote.client_name,
          title: quote.title,
          total: quote.total,
          currency: quote.currency,
        },
        window.location.origin
      )
      setCloseResult(
        sent.ok
          ? `ההצעה נשלחה ל-${quote.client_email}. הוא יוכל לקרוא, לאשר ולחתום עליה.`
          : `ההצעה נוצרה אבל השליחה נכשלה · ${sent.message} אפשר לפתוח אותה ולשלוח שוב.`
      )
    } finally {
      setClosing(null)
    }
  }

  async function markLeadStatus(status: string) {
    if (!session.lead_id) return
    await supabase.from("leads").update({ status }).eq("id", session.lead_id)
  }

  // ── Setup: everything the script needs before the phone rings ──────────────
  if (call.isNew || !session.id) {
    return (
      <div className="min-h-[100dvh] pt-28 pb-28 md:pb-20 px-6 md:px-12">
        <AdminNav />
        <div className="max-w-lg">
          <Link to="/admin/calls" className="font-mono text-[10px] uppercase tracking-wide text-dim hover:text-lime transition-colors">
            → כל השיחות
          </Link>
          <h1 className="font-display font-bold text-2xl mt-3 mb-1">שיחה חדשה</h1>
          <p className="text-dim text-xs mb-8 max-w-md">
            שלושת השדות האלה נכנסים לתוך מה שאתה אומר בפתיחה. הכל נשמר על הליד ברגע שמתחילים.
          </p>
          <div className="grid gap-4">
            <Field label="שם איש הקשר" value={session.contact_name ?? ""} onChange={(v) => setSession({ ...session, contact_name: v })} />
            <Field label="שם העסק" value={session.business_name ?? ""} onChange={(v) => setSession({ ...session, business_name: v })} />
            <Field label="טלפון" value={session.contact_phone ?? ""} onChange={(v) => setSession({ ...session, contact_phone: v })} />
            <Field label="אימייל" value={session.contact_email ?? ""} onChange={(v) => setSession({ ...session, contact_email: v })} />
            <Field
              label="מה כבר שלחת · ההקשר לפנייה"
              value={session.call_context ?? ""}
              onChange={(v) => setSession({ ...session, call_context: v })}
            />
            <button
              onClick={call.startCall}
              disabled={call.creating || !session.contact_name?.trim()}
              className="mt-2 font-mono text-xs uppercase tracking-wide bg-lime text-black rounded-full px-6 py-3 hover:scale-105 transition-transform disabled:opacity-40 disabled:hover:scale-100 w-fit"
            >
              {call.creating ? "מתחיל…" : "התחל שיחה"}
            </button>
          </div>
        </div>
      </div>
    )
  }

  const progress = callProgress(call.path.length, !!ending)

  return (
    <div className="min-h-[100dvh] pt-24 pb-40 md:pb-24 px-4 md:px-12">
      <div className="max-w-2xl mx-auto">
        {/* Who is on the phone, and how far in we are. Sticky, because it is the
            one thing worth glancing at mid-sentence. */}
        <div className="sticky top-0 z-30 -mx-4 md:-mx-12 px-4 md:px-12 py-3 bg-background/95 backdrop-blur-xl border-b border-white/10">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="min-w-0">
              <div className="font-medium text-sm truncate">
                {session.contact_name}
                {session.business_name ? ` · ${session.business_name}` : ""}
              </div>
              <div className="text-dim text-[10px] font-mono uppercase tracking-wide">
                {ending ? "סיכום" : node?.phase ?? ""} · {call.durationMinutes} דק׳
              </div>
            </div>
            <div className="flex items-center gap-2 flex-none">
              {phoneHref && (
                <a href={phoneHref} className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wide border border-white/25 rounded-full px-3 py-1.5 hover:border-lime transition-colors">
                  <Phone size={13} /> חיוג
                </a>
              )}
              <Link to="/admin/calls" className="font-mono text-[10px] uppercase tracking-wide text-dim hover:text-lime px-2 py-1.5">
                יציאה
              </Link>
            </div>
          </div>
          <div className="h-0.5 bg-white/10 rounded-full mt-3 overflow-hidden">
            <div className="h-full bg-lime transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {ending ? (
          <div className="call-screen pt-8">
            <p className="text-lime text-sm font-bold mb-1">תוצאת השיחה</p>
            <h1 className="font-display font-bold mt-1">{ending.title}</h1>
            <p className="text-dim text-sm mt-3 leading-relaxed">{ending.sub}</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8">
              {[
                { label: "עסק", value: session.business_name || "לא הוזן" },
                { label: "משך", value: `${call.durationMinutes} דקות` },
                { label: "שלבים", value: String(call.path.length) },
                { label: "חבילה", value: call.chosenPackage ? formatCurrency(call.chosenPackage.price) : "לא נסגרה" },
              ].map((stat) => (
                <div key={stat.label} className="border border-white/10 rounded-lg p-3">
                  <div className="text-dim text-[10px] font-mono uppercase tracking-wide mb-1">{stat.label}</div>
                  <div className="font-medium text-sm">{stat.value}</div>
                </div>
              ))}
            </div>

            <div className="grid gap-4 mt-8">
              <TextArea label="הערות מהשיחה" value={session.notes} onChange={call.setNotes} rows={4} />
              <Field label="הצעד הבא" value={session.next_step ?? ""} onChange={call.setNextStep} />
              <div>
                <label className="text-dim text-xs uppercase font-mono mb-2 block">תאריך פולואפ</label>
                <input
                  type="date"
                  value={session.follow_up_at ?? ""}
                  onChange={(e) => call.patch({ follow_up_at: e.target.value || null })}
                  className="bg-transparent border border-white/30 rounded px-4 py-3 text-sm"
                />
              </div>
            </div>

            {(session.contract_id || session.quote_id) && (
              <div className="border border-lime/30 bg-lime/[0.04] rounded-lg p-4 mt-8 grid gap-2">
                <div className="font-mono text-[10px] uppercase tracking-wide text-dim">מה יצא מהשיחה</div>
                {session.contract_id && (
                  <Link to={`/admin/contracts/${session.contract_id}`} className="text-sm underline underline-offset-4 hover:text-lime transition-colors">
                    החוזה שנוצר ←
                  </Link>
                )}
                {session.quote_id && (
                  <Link to={`/admin/quotes/${session.quote_id}`} className="text-sm underline underline-offset-4 hover:text-lime transition-colors">
                    הצעת המחיר שנוצרה ←
                  </Link>
                )}
              </div>
            )}

            {call.chosenPackage && call.packageKey && !session.contract_id && (
              <div className="border border-lime/40 bg-lime/[0.06] rounded-lg p-4 mt-8 grid gap-3">
                <div className="font-mono text-[10px] uppercase tracking-wide text-lime">סגירה עכשיו</div>
                <p className="text-dim text-xs leading-relaxed">
                  סגרתם בשיחה? זה בונה את החוזה על {call.chosenPackage.name}, עם אותם מספרים ואותם סעיפים, ושולח אותו
                  ללקוח לחתימה · בלי לצאת מהמסך הזה.
                </p>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={closeWithContract}
                    disabled={closing !== null}
                    className="font-mono text-[10px] font-bold uppercase tracking-wide bg-lime text-black rounded-full px-5 py-3 hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
                  >
                    {closing === "contract" ? "שולח…" : "שליחת חוזה לחתימה ←"}
                  </button>
                  <button
                    onClick={closeWithQuote}
                    disabled={closing !== null}
                    className="font-mono text-[10px] uppercase tracking-wide border border-white/25 rounded-full px-5 py-3 hover:border-lime transition-colors disabled:opacity-50"
                  >
                    {closing === "quote" ? "שולח…" : "שליחת הצעת מחיר ←"}
                  </button>
                </div>
                {closeResult && <p className="text-sm">{closeResult}</p>}
              </div>
            )}

            <div className="flex flex-wrap gap-3 mt-8">
              {call.chosenPackage && (
                <button
                  onClick={goToContract}
                  disabled={linking}
                  className="font-mono text-[10px] uppercase tracking-wide border border-white/30 rounded-full px-5 py-3 hover:border-lime transition-colors disabled:opacity-50"
                >
                  {linking ? "רגע…" : "עריכת חוזה לפני שליחה ←"}
                </button>
              )}
              <button
                onClick={goToQuote}
                disabled={linking}
                className="font-mono text-[10px] uppercase tracking-wide border border-white/30 rounded-full px-5 py-3 hover:border-lime transition-colors disabled:opacity-50"
              >
                בניית הצעה מפורטת ←
              </button>
              {whatsappHref && (
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-[10px] uppercase tracking-wide border border-white/30 rounded-full px-5 py-3 hover:border-lime transition-colors"
                >
                  וואטסאפ ←
                </a>
              )}
              {session.lead_id && (
                <button
                  onClick={() => markLeadStatus(ending.outcome === "not_relevant" ? "lost" : "contacted")}
                  className="font-mono text-[10px] uppercase tracking-wide text-dim underline underline-offset-4 hover:text-lime px-2"
                >
                  עדכון סטטוס הליד
                </button>
              )}
              <button
                onClick={call.goBack}
                className="font-mono text-[10px] uppercase tracking-wide text-dim underline underline-offset-4 hover:text-lime px-2"
              >
                חזרה לשלב הקודם
              </button>
            </div>
          </div>
        ) : node ? (
          <div className="call-screen pt-8">
            <p className="text-lime text-sm font-bold mb-1">{node.phase}</p>
            <h1 className="font-display font-bold mt-1 mb-6">{node.title}</h1>

            <section className={cn("border rounded-xl p-5 md:p-6 relative", node.offer ? "border-lime/40 bg-lime/[0.04]" : "border-white/15")}>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(call.spokenScript)
                  setCopied(true)
                  setTimeout(() => setCopied(false), 1500)
                }}
                className="absolute top-4 left-4 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wide text-dim hover:text-lime transition-colors p-1"
              >
                <Copy size={12} /> {copied ? "הועתק" : "העתק"}
              </button>
              <div className="inline-flex items-center gap-2 text-lime text-xs font-bold mb-3"><span className="bg-lime text-black rounded px-1.5 py-0.5 text-[10px]">תגיד</span>מה אומרים</div>
              {/* Read aloud, sometimes from a phone held to an ear: bigger and
                  looser than anything else in the admin, on purpose. */}
              <p className="call-script whitespace-pre-wrap">{call.spokenScript}</p>
              {node.offer && <OfferCard packageKey={node.offer} />}
              {node.tip && (
                <div className="mt-5 border-r-[3px] border-lime/60 bg-lime/[0.04] rounded-l-lg py-3 pr-4 pl-4 text-dim text-sm leading-relaxed">{node.tip}</div>
              )}
            </section>

            {node.customNote && (
              <div className="mt-5">
                <TextArea label="רשום את התיקון שלו" value={session.notes} onChange={call.setNotes} rows={3} />
              </div>
            )}

            <div className="mt-8">
              <div className="font-display font-bold text-lg mb-3">{node.question}</div>
              <div className="grid gap-2">
                {node.choices.map((choice) => (
                  <button
                    key={choice.key + choice.next}
                    onClick={() => {
                      call.choose(choice.key, choice.next)
                      window.scrollTo({ top: 0, behavior: "smooth" })
                    }}
                    className="group flex items-center justify-between gap-4 text-right border border-white/15 rounded-lg px-5 py-4 min-h-[58px] hover:border-lime hover:bg-lime/[0.07] hover:-translate-y-px transition-all"
                  >
                    <span className="text-sm">{choice.label}</span>
                    <ArrowRight size={16} className="flex-none text-dim group-hover:text-lime transition-colors" />
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-8">
              <TextArea label="הערות" value={session.notes} onChange={call.setNotes} rows={3} />
              <div className="text-dim text-[10px] font-mono mt-1 h-4">{call.notesDirty ? "שומר…" : "נשמר"}</div>
            </div>

            <div className="flex items-center justify-between mt-6 pt-6 border-t border-white/10">
              <button
                onClick={call.goBack}
                disabled={call.path.length === 0}
                className="font-mono text-xs uppercase tracking-wide border border-white/30 rounded-full px-5 py-2.5 hover:border-lime transition-colors disabled:opacity-30"
              >
                → חזרה
              </button>
              <button
                onClick={call.abandon}
                className="font-mono text-[10px] uppercase tracking-wide text-dim hover:text-red-400 transition-colors px-2 py-2"
              >
                סיום בלי תוצאה
              </button>
            </div>
          </div>
        ) : (
          <div className="pt-10">
            <p className="text-dim text-sm">
              לשיחה הזו אין שלב פעיל. כנראה שהתסריט השתנה מאז שהיא נשמרה.
            </p>
            <button
              onClick={call.goBack}
              disabled={call.path.length === 0}
              className="mt-4 font-mono text-xs uppercase tracking-wide border border-white/30 rounded-full px-5 py-2.5 hover:border-lime transition-colors disabled:opacity-30"
            >
              → חזרה לשלב הקודם
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export function AdminCallCoach() {
  return (
    <AdminGate>
      <AdminCallCoachInner />
    </AdminGate>
  )
}
