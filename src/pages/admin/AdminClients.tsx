import { useEffect, useMemo, useState } from "react"
import { supabase, type QuoteRow, type QuoteLineItem, type QuoteSignatureRow } from "@/lib/supabase"
import { AdminGate } from "@/components/AdminGate"
import { AdminNav } from "@/components/AdminNav"
import { Field, TextArea } from "@/components/admin/FieldEditors"

type Lead = {
  id: string
  name: string
  email: string
  phone: string | null
  company: string | null
  project_type: string
  budget: string | null
  message: string | null
  status: string
  created_at: string
}

type QuoteFormState = {
  id?: string
  lead_id?: string | null
  client_name: string
  client_email: string
  title: string
  currency: string
  status: QuoteRow["status"]
  notes: string
  line_items: QuoteLineItem[]
}

const emptyQuote: QuoteFormState = {
  client_name: "",
  client_email: "",
  title: "",
  currency: "ILS",
  status: "draft",
  notes: "",
  line_items: [{ label: "", description: "", price: 0 }],
}

type Client = {
  key: string
  name: string
  email: string
  phone: string | null
  company: string | null
  lead: Lead | null
  quotes: QuoteRow[]
  lastActivity: string
}

function AdminClientsInner() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [quotes, setQuotes] = useState<QuoteRow[]>([])
  const [signatures, setSignatures] = useState<Record<string, QuoteSignatureRow>>({})
  const [loading, setLoading] = useState(true)
  const [quoteForm, setQuoteForm] = useState<QuoteFormState | null>(null)
  const [savingQuote, setSavingQuote] = useState(false)
  const [creatingFolderFor, setCreatingFolderFor] = useState<string | null>(null)

  async function refresh() {
    const [{ data: l }, { data: q }, { data: s }] = await Promise.all([
      supabase.from("leads").select("*").order("created_at", { ascending: false }),
      supabase.from("quotes").select("*").order("created_at", { ascending: false }),
      supabase.from("quote_signatures").select("*"),
    ])
    setLeads(l ?? [])
    setQuotes(q ?? [])
    setSignatures(Object.fromEntries((s ?? []).map((sig) => [sig.quote_id, sig])))
    setLoading(false)
  }

  useEffect(() => {
    refresh()
  }, [])

  const clients = useMemo<Client[]>(() => {
    const byKey = new Map<string, Client>()

    for (const lead of leads) {
      const key = lead.email.trim().toLowerCase()
      byKey.set(key, {
        key,
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        company: lead.company,
        lead,
        quotes: [],
        lastActivity: lead.created_at,
      })
    }

    for (const quote of quotes) {
      const key = quote.client_email.trim().toLowerCase()
      const existing = byKey.get(key)
      if (existing) {
        existing.quotes.push(quote)
        if (quote.created_at > existing.lastActivity) existing.lastActivity = quote.created_at
      } else {
        byKey.set(key, {
          key,
          name: quote.client_name,
          email: quote.client_email,
          phone: null,
          company: null,
          lead: null,
          quotes: [quote],
          lastActivity: quote.created_at,
        })
      }
    }

    return [...byKey.values()].sort((a, b) => (a.lastActivity < b.lastActivity ? 1 : -1))
  }, [leads, quotes])

  async function updateLeadStatus(id: string, status: string) {
    await supabase.from("leads").update({ status }).eq("id", id)
    setLeads((ls) => ls.map((l) => (l.id === id ? { ...l, status } : l)))
  }

  function quoteTotal(items: QuoteLineItem[]) {
    return items.reduce((sum, it) => sum + (Number(it.price) || 0), 0)
  }

  function newQuoteFor(client?: Client) {
    setQuoteForm({
      ...emptyQuote,
      lead_id: client?.lead?.id ?? null,
      client_name: client?.name ?? "",
      client_email: client?.email ?? "",
      line_items: [{ label: "", description: "", price: 0 }],
    })
  }

  function editQuote(q: QuoteRow) {
    setQuoteForm({
      id: q.id,
      lead_id: q.lead_id,
      client_name: q.client_name,
      client_email: q.client_email,
      title: q.title,
      currency: q.currency,
      status: q.status,
      notes: q.notes ?? "",
      line_items: q.line_items.length > 0 ? q.line_items : [{ label: "", description: "", price: 0 }],
    })
  }

  async function handleSaveQuote() {
    if (!quoteForm) return
    setSavingQuote(true)
    const payload = {
      lead_id: quoteForm.lead_id || null,
      client_name: quoteForm.client_name,
      client_email: quoteForm.client_email,
      title: quoteForm.title,
      currency: quoteForm.currency,
      status: quoteForm.status,
      notes: quoteForm.notes || null,
      line_items: quoteForm.line_items.filter((it) => it.label.trim()),
      total: quoteTotal(quoteForm.line_items),
    }
    const { error } = quoteForm.id
      ? await supabase.from("quotes").update(payload).eq("id", quoteForm.id)
      : await supabase.from("quotes").insert(payload)
    setSavingQuote(false)
    if (error) return alert(error.message)
    setQuoteForm(null)
    refresh()
  }

  async function handleDeleteQuote(id: string) {
    if (!confirm("למחוק את ההצעה?")) return
    await supabase.from("quotes").delete().eq("id", id)
    refresh()
  }

  async function handleCreateFolder(q: QuoteRow) {
    setCreatingFolderFor(q.id)
    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData.session?.access_token
      if (!token) {
        alert("צריך להתחבר מחדש.")
        return
      }
      const res = await fetch("/api/create-client-folder", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ folderName: `${q.client_name} — ${q.title}` }),
      })
      const data = await res.json()
      if (!res.ok) {
        alert(data?.error ?? "שגיאה ביצירת התיקייה")
        return
      }
      await supabase.from("quotes").update({ drive_folder_url: data.folderUrl }).eq("id", q.id)
      refresh()
    } finally {
      setCreatingFolderFor(null)
    }
  }

  if (loading) return <div className="pt-40 pb-40 container font-mono text-xs text-dim uppercase">טוען…</div>

  return (
    <div className="min-h-[100dvh] pt-28 pb-28 md:pb-20 px-6 md:px-12">
      <AdminNav />

      <div className="flex justify-between items-start gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="font-display font-bold text-xl">לקוחות</h1>
          <p className="text-dim text-xs mt-1 max-w-md">
            כל ליד והצעת מחיר מאוחדים כאן לפי אימייל — כרטיס אחד לכל לקוח: מאיפה הגיע, מה הסטטוס,
            אילו הצעות מחיר נשלחו והאם יש תיקיית Drive.
          </p>
        </div>
        <button
          onClick={() => newQuoteFor()}
          className="font-mono text-xs uppercase tracking-wide border border-white/30 rounded-full px-4 py-2 hover:bg-foreground hover:text-background transition-colors flex-none"
        >
          + הצעה ללקוח חדש
        </button>
      </div>

      {clients.length === 0 && <p className="text-dim text-sm">אין לקוחות עדיין.</p>}

      <div className="grid gap-4">
        {clients.map((c) => (
          <div key={c.key} className="border border-white/10 rounded-lg px-5 py-4">
            <div className="flex justify-between items-start gap-4 flex-wrap">
              <div>
                <div className="font-medium">
                  {c.name} {c.company && `· ${c.company}`}
                </div>
                <div className="text-dim text-xs mt-1">
                  {c.email} {c.phone && `· ${c.phone}`}
                </div>
                {!c.lead && <div className="text-[10px] text-dim mt-1 font-mono">לקוח ידני (ללא ליד נכנס)</div>}
              </div>
              <div className="flex items-center gap-3">
                {c.lead && (
                  <select
                    value={c.lead.status}
                    onChange={(e) => updateLeadStatus(c.lead!.id, e.target.value)}
                    className="bg-background border border-white/30 rounded px-3 py-2 text-xs"
                  >
                    <option value="new">חדש</option>
                    <option value="contacted">יצרתי קשר</option>
                    <option value="won">נסגר</option>
                    <option value="lost">לא רלוונטי</option>
                  </select>
                )}
                <button onClick={() => newQuoteFor(c)} className="font-mono text-xs uppercase tracking-wide underline underline-offset-4 p-1 -m-1">
                  + הצעה
                </button>
              </div>
            </div>

            {c.lead && (
              <div className="text-sm text-dim mt-2">
                {c.lead.project_type} {c.lead.budget && `· ${c.lead.budget}`}
              </div>
            )}
            {c.lead?.message && <p className="text-sm mt-2">{c.lead.message}</p>}
            {c.lead && (
              <div className="text-[10px] text-dim mt-2 font-mono">
                פנייה: {new Date(c.lead.created_at).toLocaleString("he-IL")}
              </div>
            )}

            {c.quotes.length > 0 && (
              <div className="mt-4 grid gap-2 border-t border-white/10 pt-4">
                {c.quotes.map((q) => {
                  const sig = signatures[q.id]
                  return (
                    <div key={q.id} className="bg-white/[0.03] rounded px-4 py-3">
                      <div className="flex justify-between items-start gap-4 flex-wrap">
                        <div>
                          <div className="text-sm font-medium">{q.title}</div>
                          <div className="text-dim text-xs mt-1 font-mono">
                            {q.total.toLocaleString("he-IL")} {q.currency === "ILS" ? "₪" : q.currency}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-[11px] uppercase tracking-wide border border-white/20 rounded-full px-3 py-1">
                            {sig ? "נחתם" : q.status}
                          </span>
                          <button onClick={() => editQuote(q)} className="font-mono text-xs uppercase tracking-wide underline underline-offset-4 p-1 -m-1">
                            Edit
                          </button>
                          <button onClick={() => handleDeleteQuote(q.id)} className="font-mono text-xs uppercase tracking-wide text-red-400 p-1 -m-1">
                            Delete
                          </button>
                        </div>
                      </div>
                      {sig && (
                        <div className="text-[10px] text-dim mt-2 font-mono">
                          נחתם ע"י {sig.full_name} · {new Date(sig.signed_at).toLocaleString("he-IL")} {sig.ip_address && `· IP ${sig.ip_address}`}
                        </div>
                      )}
                      <div className="text-[10px] text-dim mt-2 font-mono break-all">
                        {window.location.origin}/portal/quote/{q.id}
                      </div>
                      <div className="mt-2">
                        {q.drive_folder_url ? (
                          <a
                            href={q.drive_folder_url}
                            target="_blank"
                            rel="noreferrer"
                            className="font-mono text-xs uppercase tracking-wide underline underline-offset-4 hover:text-[#D1FE17] transition-colors"
                          >
                            📁 תיקיית הלקוח ←
                          </a>
                        ) : (
                          <button
                            onClick={() => handleCreateFolder(q)}
                            disabled={creatingFolderFor === q.id}
                            className="font-mono text-xs uppercase tracking-wide border border-white/20 rounded-full px-3 py-1.5 hover:border-[#D1FE17] transition-colors disabled:opacity-50"
                          >
                            {creatingFolderFor === q.id ? "יוצר תיקייה…" : "+ צור תיקיית Drive"}
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {quoteForm && (
        <div className="fixed inset-0 z-[60] bg-background/95 overflow-y-auto py-16 px-6">
          <div className="max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <div className="font-display font-bold text-xl">{quoteForm.id ? "עריכת הצעה" : "הצעה חדשה"}</div>
              <button onClick={() => setQuoteForm(null)} className="font-mono text-xs uppercase p-2 -m-2">Close ×</button>
            </div>

            <div className="grid gap-4">
              <Field label="שם לקוח" value={quoteForm.client_name} onChange={(v) => setQuoteForm({ ...quoteForm, client_name: v })} />
              <Field label="אימייל לקוח (משמש להתחברות לפורטל)" value={quoteForm.client_email} onChange={(v) => setQuoteForm({ ...quoteForm, client_email: v })} />
              <Field label="כותרת ההצעה" value={quoteForm.title} onChange={(v) => setQuoteForm({ ...quoteForm, title: v })} />

              <div>
                <label className="text-dim text-xs uppercase font-mono mb-2 block">סעיפי ההצעה</label>
                <div className="grid gap-3">
                  {quoteForm.line_items.map((item, i) => (
                    <div key={i} className="border border-white/10 rounded p-3 grid gap-2">
                      <div className="flex gap-2">
                        <input
                          value={item.label}
                          onChange={(e) => {
                            const items = [...quoteForm.line_items]
                            items[i] = { ...items[i], label: e.target.value }
                            setQuoteForm({ ...quoteForm, line_items: items })
                          }}
                          placeholder="שם הסעיף"
                          className="flex-1 bg-transparent border border-white/30 rounded px-3 py-2 text-sm"
                        />
                        <input
                          type="number"
                          value={item.price}
                          onChange={(e) => {
                            const items = [...quoteForm.line_items]
                            items[i] = { ...items[i], price: Number(e.target.value) }
                            setQuoteForm({ ...quoteForm, line_items: items })
                          }}
                          placeholder="מחיר"
                          className="w-28 bg-transparent border border-white/30 rounded px-3 py-2 text-sm"
                        />
                        <button
                          onClick={() => {
                            const items = quoteForm.line_items.filter((_, idx) => idx !== i)
                            setQuoteForm({ ...quoteForm, line_items: items.length ? items : [{ label: "", description: "", price: 0 }] })
                          }}
                          className="text-red-400 text-xs px-2"
                        >
                          ✕
                        </button>
                      </div>
                      <input
                        value={item.description ?? ""}
                        onChange={(e) => {
                          const items = [...quoteForm.line_items]
                          items[i] = { ...items[i], description: e.target.value }
                          setQuoteForm({ ...quoteForm, line_items: items })
                        }}
                        placeholder="תיאור (אופציונלי)"
                        className="bg-transparent border border-white/20 rounded px-3 py-2 text-xs"
                      />
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setQuoteForm({ ...quoteForm, line_items: [...quoteForm.line_items, { label: "", description: "", price: 0 }] })}
                  className="mt-3 font-mono text-xs uppercase tracking-wide underline underline-offset-4 hover:text-[#D1FE17] transition-colors"
                >
                  + הוספת סעיף
                </button>
                <div className="mt-3 text-sm font-medium">
                  סה"כ: {quoteTotal(quoteForm.line_items).toLocaleString("he-IL")} {quoteForm.currency === "ILS" ? "₪" : quoteForm.currency}
                </div>
              </div>

              <TextArea label="הערות (מוצג ללקוח)" value={quoteForm.notes} onChange={(v) => setQuoteForm({ ...quoteForm, notes: v })} />

              <div>
                <label className="text-dim text-xs uppercase font-mono mb-2 block">סטטוס</label>
                <select
                  value={quoteForm.status}
                  onChange={(e) => setQuoteForm({ ...quoteForm, status: e.target.value as QuoteRow["status"] })}
                  className="bg-background border border-white/30 rounded px-4 py-3 text-sm"
                >
                  <option value="draft">טיוטה</option>
                  <option value="sent">נשלח ללקוח</option>
                  <option value="declined">נדחה</option>
                </select>
              </div>

              <button
                onClick={handleSaveQuote}
                disabled={savingQuote || !quoteForm.client_name || !quoteForm.client_email || !quoteForm.title}
                className="mt-4 font-mono text-xs uppercase tracking-wide border border-white/30 rounded-full px-6 py-3 hover:bg-foreground hover:text-background transition-colors disabled:opacity-50"
              >
                {savingQuote ? "שומר…" : "שמירת הצעה"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export function AdminClients() {
  return (
    <AdminGate>
      <AdminClientsInner />
    </AdminGate>
  )
}
