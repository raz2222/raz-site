import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Pencil, Trash2 } from "lucide-react"
import { supabase, QUOTE_STATUS_LABELS, type ClientRow, type QuoteRow, type QuoteSignatureRow } from "@/lib/supabase"
import { formatCurrency } from "@/lib/quotePricing"
import { AdminGate } from "@/components/AdminGate"
import { AdminNav } from "@/components/AdminNav"
import { AdminModalShell } from "@/components/admin/AdminModalShell"
import { RowActions } from "@/components/admin/RowActions"
import { Field } from "@/components/admin/FieldEditors"

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

type ClientFormState = { id?: string; name: string; email: string; phone: string; company: string; notes: string }
const emptyClientForm: ClientFormState = { name: "", email: "", phone: "", company: "", notes: "" }

function AdminClientsInner() {
  const navigate = useNavigate()
  const [clientsList, setClientsList] = useState<ClientRow[]>([])
  const [leads, setLeads] = useState<Lead[]>([])
  const [quotes, setQuotes] = useState<QuoteRow[]>([])
  const [signatures, setSignatures] = useState<Record<string, QuoteSignatureRow>>({})
  const [loading, setLoading] = useState(true)
  const [creatingFolderFor, setCreatingFolderFor] = useState<string | null>(null)
  const [clientForm, setClientForm] = useState<ClientFormState | null>(null)
  const [savingClient, setSavingClient] = useState(false)

  async function refresh() {
    const [{ data: cl }, { data: l }, { data: q }, { data: s }] = await Promise.all([
      supabase.from("clients").select("*").order("created_at", { ascending: false }),
      supabase.from("leads").select("*").order("created_at", { ascending: false }),
      supabase.from("quotes").select("*").order("created_at", { ascending: false }),
      supabase.from("quote_signatures").select("*"),
    ])
    setClientsList(cl ?? [])
    setLeads(l ?? [])
    setQuotes(q ?? [])
    setSignatures(Object.fromEntries((s ?? []).map((sig) => [sig.quote_id, sig])))
    setLoading(false)
  }

  useEffect(() => {
    refresh()
  }, [])

  const leadByEmail = useMemo(() => {
    const map = new Map<string, Lead>()
    for (const l of leads) {
      const key = l.email.trim().toLowerCase()
      if (!map.has(key)) map.set(key, l)
    }
    return map
  }, [leads])

  const quotesByClientId = useMemo(() => {
    const map = new Map<string, QuoteRow[]>()
    for (const q of quotes) {
      if (!q.client_id) continue
      if (!map.has(q.client_id)) map.set(q.client_id, [])
      map.get(q.client_id)!.push(q)
    }
    return map
  }, [quotes])

  async function updateLeadStatus(id: string, status: string) {
    await supabase.from("leads").update({ status }).eq("id", id)
    setLeads((ls) => ls.map((l) => (l.id === id ? { ...l, status } : l)))
  }

  async function handleDeleteQuote(id: string) {
    if (!confirm("למחוק את ההצעה? הפעולה לא הפיכה.")) return
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
        body: JSON.stringify({ folderName: `${q.client_name} · ${q.title}` }),
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

  function openNewClient() {
    setClientForm({ ...emptyClientForm })
  }

  function openEditClient(c: ClientRow) {
    setClientForm({ id: c.id, name: c.name, email: c.email, phone: c.phone ?? "", company: c.company ?? "", notes: c.notes ?? "" })
  }

  async function saveClient() {
    if (!clientForm) return
    setSavingClient(true)
    const payload = {
      name: clientForm.name.trim(),
      email: clientForm.email.trim(),
      phone: clientForm.phone || null,
      company: clientForm.company || null,
      notes: clientForm.notes || null,
    }
    const { error } = clientForm.id
      ? await supabase.from("clients").update(payload).eq("id", clientForm.id)
      : await supabase.from("clients").insert(payload)
    setSavingClient(false)
    if (error) return alert(error.message)
    setClientForm(null)
    refresh()
  }

  if (loading) return <div className="pt-40 pb-40 container font-mono text-xs text-dim uppercase">טוען…</div>

  return (
    <div className="min-h-[100dvh] pt-28 pb-28 md:pb-20 px-6 md:px-12">
      <AdminNav />

      <div className="flex justify-between items-start gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="font-display font-bold text-xl">לקוחות</h1>
          <p className="text-dim text-xs mt-1 max-w-md">
            כל לקוח עם הפניות, הצעות המחיר שנשלחו אליו והסטטוס שלהן.
          </p>
        </div>
        <button
          onClick={openNewClient}
          className="font-mono text-xs uppercase tracking-wide border border-white/30 rounded-full px-4 py-2 hover:bg-foreground hover:text-background transition-colors flex-none"
        >
          + לקוח חדש
        </button>
      </div>

      {clientsList.length === 0 && <p className="text-dim text-sm">אין לקוחות עדיין.</p>}

      <div className="grid gap-4">
        {clientsList.map((c) => {
          const lead = leadByEmail.get(c.email.trim().toLowerCase())
          const clientQuotes = quotesByClientId.get(c.id) ?? []
          return (
            <div key={c.id} className="border border-white/10 rounded-lg px-5 py-4">
              <div className="flex justify-between items-start gap-4 flex-wrap">
                <div>
                  <div className="font-medium">
                    {c.name} {c.company && `· ${c.company}`}
                  </div>
                  <div className="text-dim text-xs mt-1">
                    {c.email} {c.phone && `· ${c.phone}`}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {lead && (
                    <select
                      value={lead.status}
                      onChange={(e) => updateLeadStatus(lead.id, e.target.value)}
                      className="bg-background border border-white/30 rounded px-3 py-2 text-xs"
                    >
                      <option value="new">חדש</option>
                      <option value="contacted">יצרתי קשר</option>
                      <option value="won">נסגר</option>
                      <option value="lost">לא רלוונטי</option>
                    </select>
                  )}
                  <button
                    onClick={() => navigate(`/admin/quotes/new?clientId=${c.id}`)}
                    className="font-mono text-xs uppercase tracking-wide border border-white/30 rounded-full px-3 py-1.5 hover:border-lime transition-colors"
                  >
                    + הצעת מחיר
                  </button>
                  <RowActions actions={[{ icon: Pencil, label: "עריכה", onClick: () => openEditClient(c) }]} />
                </div>
              </div>

              {lead && (
                <div className="text-sm text-dim mt-2">
                  {lead.project_type} {lead.budget && `· ${lead.budget}`}
                </div>
              )}
              {lead?.message && <p className="text-sm mt-2">{lead.message}</p>}
              {lead && (
                <div className="text-[10px] text-dim mt-2 font-mono">
                  פנייה: {new Date(lead.created_at).toLocaleString("he-IL")}
                </div>
              )}
              {c.notes && <p className="text-sm mt-2 text-dim">{c.notes}</p>}

              {clientQuotes.length > 0 && (
                <div className="mt-4 grid gap-2 border-t border-white/10 pt-4">
                  {clientQuotes.map((q) => {
                    const sig = signatures[q.id]
                    return (
                      <div key={q.id} className="bg-white/[0.03] rounded px-4 py-3">
                        <div className="flex justify-between items-start gap-4 flex-wrap">
                          <div>
                            <div className="text-sm font-medium">{q.title} {q.quote_number && <span className="text-dim text-xs">· {q.quote_number}</span>}</div>
                            <div className="text-dim text-xs mt-1 font-mono">
                              {formatCurrency(q.final_total ?? q.calculated_total ?? q.total, q.currency)}
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="font-mono text-[11px] uppercase tracking-wide border border-white/20 rounded-full px-3 py-1 ml-2">
                              {sig ? "נחתם" : QUOTE_STATUS_LABELS[q.status] ?? q.status}
                            </span>
                            <RowActions
                              actions={[
                                { icon: Pencil, label: "עריכה", onClick: () => navigate(`/admin/quotes/${q.id}`) },
                                { icon: Trash2, label: "מחיקה", onClick: () => handleDeleteQuote(q.id), variant: "danger" },
                              ]}
                            />
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
                              className="font-mono text-xs uppercase tracking-wide underline underline-offset-4 hover:text-lime transition-colors"
                            >
                              📁 תיקיית הלקוח ←
                            </a>
                          ) : (
                            <button
                              onClick={() => handleCreateFolder(q)}
                              disabled={creatingFolderFor === q.id}
                              className="font-mono text-xs uppercase tracking-wide border border-white/20 rounded-full px-3 py-1.5 hover:border-lime transition-colors disabled:opacity-50"
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
          )
        })}
      </div>

      {clientForm && (
        <AdminModalShell title={clientForm.id ? "עריכת לקוח" : "לקוח חדש"} onClose={() => setClientForm(null)} maxWidth="max-w-lg">
          <div className="grid gap-4">
            <Field label="שם" value={clientForm.name} onChange={(v) => setClientForm({ ...clientForm, name: v })} />
            <Field label="אימייל (משמש להתחברות לפורטל)" value={clientForm.email} onChange={(v) => setClientForm({ ...clientForm, email: v })} />
            <Field label="טלפון" value={clientForm.phone} onChange={(v) => setClientForm({ ...clientForm, phone: v })} />
            <Field label="חברה / עסק" value={clientForm.company} onChange={(v) => setClientForm({ ...clientForm, company: v })} />
            <Field label="הערות" value={clientForm.notes} onChange={(v) => setClientForm({ ...clientForm, notes: v })} />
            <button
              onClick={saveClient}
              disabled={savingClient || !clientForm.name.trim() || !clientForm.email.trim()}
              className="mt-2 font-mono text-xs uppercase tracking-wide border border-white/30 rounded-full px-6 py-3 hover:bg-foreground hover:text-background transition-colors disabled:opacity-50 w-fit"
            >
              {savingClient ? "שומר…" : "שמירה"}
            </button>
          </div>
        </AdminModalShell>
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
