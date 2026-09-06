import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { ChevronLeft, Phone, Search } from "lucide-react"
import {
  supabase,
  type ContractRow,
  type ClientRow,
  type LeadRow,
  type QuoteRow,
} from "@/lib/supabase"
import { AdminGate } from "@/components/AdminGate"
import { AdminNav } from "@/components/AdminNav"
import { AdminModalShell } from "@/components/admin/AdminModalShell"
import { Field } from "@/components/admin/FieldEditors"
import { ensureLeadForClient } from "@/lib/crm"
import { cn } from "@/lib/utils"

type ClientFormState = { name: string; email: string; phone: string; company: string; notes: string }
const emptyClientForm: ClientFormState = { name: "", email: "", phone: "", company: "", notes: "" }

/** One line per person, because a list is for finding someone, not for reading
 * everything about them. The whole story lives one tap away, on their own page. */
type Person = {
  id: string
  name: string
  company: string | null
  phone: string | null
  leadId: string | null
  stage: "client" | "in_progress" | "lead"
  stageLabel: string
}

const STAGE_STYLES: Record<Person["stage"], string> = {
  client: "border-lime text-lime",
  in_progress: "border-white/25 text-foreground",
  lead: "border-white/15 text-dim",
}

function PersonRow({ person, onOpen, onCall }: { person: Person; onOpen: () => void; onCall: () => void }) {
  return (
    <div className="flex items-stretch gap-2">
      <button
        onClick={onOpen}
        className="flex-1 min-w-0 text-right flex items-center justify-between gap-3 border border-white/10 rounded-lg px-4 py-4 min-h-[64px] hover:border-lime/40 transition-colors"
      >
        <div className="min-w-0">
          <div className="font-medium truncate">{person.name}</div>
          {person.company && <div className="text-dim text-xs mt-0.5 truncate">{person.company}</div>}
        </div>
        <div className="flex items-center gap-2 flex-none">
          <span className={cn("font-mono text-[10px] uppercase tracking-wide border rounded-full px-2.5 py-1", STAGE_STYLES[person.stage])}>
            {person.stageLabel}
          </span>
          <ChevronLeft size={16} className="text-dim" />
        </div>
      </button>
      <button
        onClick={onCall}
        aria-label={`שיחה עם ${person.name}`}
        className="flex-none w-14 flex items-center justify-center border border-white/10 rounded-lg hover:border-lime hover:text-lime transition-colors"
      >
        <Phone size={18} />
      </button>
    </div>
  )
}

function AdminClientsInner() {
  const navigate = useNavigate()
  const [clients, setClients] = useState<ClientRow[]>([])
  const [leads, setLeads] = useState<LeadRow[]>([])
  const [quotes, setQuotes] = useState<QuoteRow[]>([])
  const [contracts, setContracts] = useState<ContractRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [clientForm, setClientForm] = useState<ClientFormState | null>(null)
  const [saving, setSaving] = useState(false)

  async function refresh() {
    const [{ data: cl }, { data: l }, { data: q }, { data: ct }] = await Promise.all([
      supabase.from("clients").select("*").order("created_at", { ascending: false }),
      supabase.from("leads").select("*").order("created_at", { ascending: false }),
      supabase.from("quotes").select("id,client_id"),
      supabase.from("contracts").select("id,client_id,status"),
    ])
    setClients(cl ?? [])
    setLeads((l ?? []) as LeadRow[])
    setQuotes((q ?? []) as QuoteRow[])
    setContracts((ct ?? []) as ContractRow[])
    setLoading(false)
  }

  useEffect(() => {
    refresh()
  }, [])

  // A client with a signed contract is a client. One with a quote or a contract
  // in flight is mid-deal. Everyone else is still a lead, whichever table they
  // happen to sit in.
  const people = useMemo<Person[]>(() => {
    const leadByEmail = new Map(leads.map((l) => [l.email.trim().toLowerCase(), l]))
    const signedClientIds = new Set(contracts.filter((c) => c.status === "signed").map((c) => c.client_id))
    const busyClientIds = new Set([
      ...quotes.map((q) => q.client_id),
      ...contracts.map((c) => c.client_id),
    ])

    const fromClients: Person[] = clients.map((c) => {
      const stage: Person["stage"] = signedClientIds.has(c.id)
        ? "client"
        : busyClientIds.has(c.id)
          ? "in_progress"
          : "lead"
      return {
        id: c.id,
        name: c.name,
        company: c.company,
        phone: c.phone,
        leadId: leadByEmail.get(c.email.trim().toLowerCase())?.id ?? null,
        stage,
        stageLabel: stage === "client" ? "לקוח" : stage === "in_progress" ? "בתהליך" : "ליד",
      }
    })

    const clientEmails = new Set(clients.map((c) => c.email.trim().toLowerCase()))
    const fromLeads: Person[] = leads
      .filter((l) => !clientEmails.has(l.email.trim().toLowerCase()))
      .map((l) => ({
        id: l.id,
        name: l.name,
        company: l.company,
        phone: l.phone,
        leadId: l.id,
        stage: "lead" as const,
        stageLabel: "ליד חדש",
      }))

    return [...fromLeads, ...fromClients]
  }, [clients, leads, quotes, contracts])

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return people
    return people.filter((p) => `${p.name} ${p.company ?? ""}`.toLowerCase().includes(term))
  }, [people, search])

  async function saveClient() {
    if (!clientForm) return
    setSaving(true)
    const payload = {
      name: clientForm.name.trim(),
      email: clientForm.email.trim(),
      phone: clientForm.phone || null,
      company: clientForm.company || null,
      notes: clientForm.notes || null,
    }
    const { data, error } = await supabase.from("clients").insert(payload).select().single()
    if (error) {
      setSaving(false)
      return alert(error.message)
    }
    // Someone added by hand is a lead like anyone else, so the pipeline and the
    // call history see him without being entered twice.
    await ensureLeadForClient(data as ClientRow, { message: payload.notes ?? undefined })
    setSaving(false)
    setClientForm(null)
    navigate(`/admin/clients/${data.id}`)
  }

  if (loading) return <div className="pt-40 pb-40 container font-mono text-xs text-dim uppercase">טוען…</div>

  return (
    <div className="min-h-[100dvh] pt-28 pb-28 md:pb-20 px-5 md:px-12">
      <AdminNav />

      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-start gap-4 mb-6 flex-wrap">
          <div>
            <h1 className="font-display font-bold">לקוחות ולידים</h1>
            <p className="text-dim text-sm mt-1">{people.length} אנשים. הקשה על שם פותחת את הכל.</p>
          </div>
          <button
            onClick={() => setClientForm({ ...emptyClientForm })}
            className="font-mono text-xs uppercase tracking-wide border border-white/30 rounded-full px-4 py-2 hover:bg-foreground hover:text-background transition-colors flex-none"
          >
            + חדש
          </button>
        </div>

        <div className="relative mb-5">
          <Search size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-dim pointer-events-none" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="חיפוש לפי שם או חברה"
            className="w-full bg-transparent border border-white/30 rounded px-4 py-3 pr-11 text-sm"
          />
        </div>

        {filtered.length === 0 && (
          <p className="text-dim text-sm">{search ? "אין תוצאות." : "אין עדיין אף אחד."}</p>
        )}

        <div className="grid gap-2">
          {filtered.map((person) => (
            <PersonRow
              key={person.id}
              person={person}
              onOpen={() => navigate(`/admin/clients/${person.id}`)}
              onCall={() =>
                navigate(
                  person.stage === "lead" && person.leadId === person.id
                    ? `/admin/calls/new?leadId=${person.id}`
                    : `/admin/calls/new?clientId=${person.id}${person.leadId ? `&leadId=${person.leadId}` : ""}`
                )
              }
            />
          ))}
        </div>
      </div>

      {clientForm && (
        <AdminModalShell title="לקוח חדש" onClose={() => setClientForm(null)} maxWidth="max-w-lg">
          <div className="grid gap-4">
            <Field label="שם" value={clientForm.name} onChange={(v) => setClientForm({ ...clientForm, name: v })} />
            <Field label="אימייל · איתו הוא נכנס לפורטל" value={clientForm.email} onChange={(v) => setClientForm({ ...clientForm, email: v })} />
            <Field label="טלפון" value={clientForm.phone} onChange={(v) => setClientForm({ ...clientForm, phone: v })} />
            <Field label="חברה" value={clientForm.company} onChange={(v) => setClientForm({ ...clientForm, company: v })} />
            <Field label="הערות" value={clientForm.notes} onChange={(v) => setClientForm({ ...clientForm, notes: v })} />
            <button
              onClick={saveClient}
              disabled={saving || !clientForm.name.trim() || !clientForm.email.trim()}
              className="mt-2 font-mono text-xs uppercase tracking-wide bg-lime text-black rounded-full px-6 py-3 hover:scale-105 transition-transform disabled:opacity-40 disabled:hover:scale-100 w-fit"
            >
              {saving ? "שומר…" : "שמירה"}
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
