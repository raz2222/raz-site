import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { ChevronLeft, Phone } from "lucide-react"
import {
  supabase,
  type ContractRow,
  type ClientRow,
  type LeadRow,
  type QuoteRow,
} from "@/lib/supabase"
import { AdminGate } from "@/components/AdminGate"
import { AdminPage, AdminAction, EmptyState } from "@/components/admin/AdminPage"
import { AdminModalShell } from "@/components/admin/AdminModalShell"
import { Field } from "@/components/admin/FieldEditors"
import { SwipeRow } from "@/components/admin/SwipeRow"
import { ensureLeadForClient } from "@/lib/crm"
import { cn } from "@/lib/utils"
import { adminNotify } from "@/components/admin/AdminToaster"

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
  /** Whether swiping this row offers to put it away. Only a raw lead does. */
  putAway: boolean
  archived: boolean
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
  const [showArchive, setShowArchive] = useState(false)
  const [clientForm, setClientForm] = useState<ClientFormState | null>(null)
  const [saving, setSaving] = useState(false)

  async function refresh() {
    const [{ data: cl }, { data: l }, { data: q }, { data: ct }] = await Promise.all([
      supabase.from("clients").select("*").order("created_at", { ascending: false }),
      supabase.from("leads").select("*").is("deleted_at", null).order("created_at", { ascending: false }),
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
    // A lead from a comment or a DM has a handle and no email, so it can never
    // be the same person as a client · matching is on the address or not at all.
    const leadByEmail = new Map(
      leads.filter((l) => l.email?.trim()).map((l) => [l.email!.trim().toLowerCase(), l])
    )
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
        putAway: false,
        archived: false,
      }
    })

    const clientEmails = new Set(clients.map((c) => c.email.trim().toLowerCase()))
    const fromLeads: Person[] = leads
      .filter((l) => !(l.email?.trim() && clientEmails.has(l.email.trim().toLowerCase())))
      .map((l) => ({
        id: l.id,
        name: l.name,
        company: l.company,
        phone: l.phone,
        leadId: l.id,
        stage: "lead" as const,
        stageLabel: "ליד חדש",
        // Only a raw lead is put away this way. A client with a quote or a
        // signed contract is referenced by those, and hiding one would hide
        // the deal with it.
        putAway: true,
        archived: Boolean(l.archived_at),
      }))

    return [...fromLeads, ...fromClients]
  }, [clients, leads, quotes, contracts])

  const filtered = useMemo(() => {
    // The archive is a separate view rather than a section at the bottom: a
    // list you scroll to find someone should not be padded with everyone you
    // already decided to stop thinking about.
    const inView = people.filter((p) => p.archived === showArchive)
    const term = search.trim().toLowerCase()
    if (!term) return inView
    return inView.filter((p) => `${p.name} ${p.company ?? ""}`.toLowerCase().includes(term))
  }, [people, search, showArchive])

  const archivedCount = useMemo(() => people.filter((p) => p.archived).length, [people])

  /** Neither of these removes anything · both write a date, and the archive can
   * hand a lead back. The trash is out of the lists and recoverable in the
   * database, which is the level of permanence a lead deserves. */
  async function putLeadAway(person: Person, action: "archive" | "delete" | "restore") {
    if (!person.leadId) return
    const patch =
      action === "archive"
        ? { archived_at: new Date().toISOString() }
        : action === "delete"
          ? { deleted_at: new Date().toISOString() }
          : { archived_at: null }
    const { error } = await supabase.from("leads").update(patch).eq("id", person.leadId)
    if (error) {
      adminNotify("לא הצלחתי לעדכן. נסה שוב.", "error")
      return
    }
    adminNotify(action === "archive" ? "הועבר לארכיון" : action === "delete" ? "הועבר לפח" : "הוחזר לרשימה")
    refresh()
  }

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
      return adminNotify(error.message)
    }
    // Someone added by hand is a lead like anyone else, so the pipeline and the
    // call history see him without being entered twice.
    await ensureLeadForClient(data as ClientRow, { message: payload.notes ?? undefined })
    setSaving(false)
    setClientForm(null)
    navigate(`/admin/clients/${data.id}`)
  }


  return (
    <AdminPage
      title={showArchive ? "ארכיון לידים" : "לקוחות ולידים"}
      description={
        showArchive
          ? "לידים שהוצאת מהרשימה. החלקה על שורה מחזירה אותה."
          : `${filtered.length} אנשים. הקשה על שם פותחת את הכל · החלקה מציעה ארכיון או פח.`
      }
      loading={loading}
      search={{ value: search, onChange: setSearch, placeholder: "חיפוש לפי שם או חברה" }}
      action={<AdminAction onClick={() => setClientForm({ ...emptyClientForm })}>+ חדש</AdminAction>}
    >
      {(archivedCount > 0 || showArchive) && (
        <button
          onClick={() => setShowArchive(!showArchive)}
          className="mb-4 font-mono text-[10px] uppercase tracking-wide text-dim hover:text-lime transition-colors py-2"
        >
          {showArchive ? "→ חזרה לרשימה" : `ארכיון (${archivedCount}) ←`}
        </button>
      )}

      {filtered.length === 0 ? (
        <EmptyState
          text={showArchive ? "הארכיון ריק." : search ? "אין אף אחד שתואם את החיפוש." : "אין כאן עדיין אף אחד. פנייה מהאתר תיכנס לבד, ואפשר גם להוסיף מישהו ידנית."}
          action={search ? undefined : <AdminAction onClick={() => setClientForm({ ...emptyClientForm })}>+ חדש</AdminAction>}
        />
      ) : (
        <div className="grid gap-2">
          {filtered.map((person) => {
            const row = (
              <PersonRow
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
            )
            if (!person.putAway) return <div key={person.id}>{row}</div>
            return (
              <SwipeRow
                key={person.id}
                archived={person.archived}
                onArchive={() => putLeadAway(person, "archive")}
                onRestore={() => putLeadAway(person, "restore")}
                onDelete={() => putLeadAway(person, "delete")}
              >
                {row}
              </SwipeRow>
            )
          })}
        </div>
      )}

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
    </AdminPage>
  )
}

export function AdminClients() {
  return (
    <AdminGate>
      <AdminClientsInner />
    </AdminGate>
  )
}
