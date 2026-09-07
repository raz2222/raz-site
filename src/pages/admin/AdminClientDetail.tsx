import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { ChevronRight, Mail, MessageCircle, Pencil, Phone } from "lucide-react"
import {
  supabase,
  QUOTE_STATUS_LABELS,
  CALL_OUTCOME_LABELS,
  CONTRACT_STATUS_LABELS,
  type CallSessionRow,
  type ClientProjectRow,
  type ClientRow,
  type ContractRow,
  type LeadRow,
  type QuoteRow,
  type QuoteSignatureRow,
} from "@/lib/supabase"
import { formatCurrency } from "@/lib/quotePricing"
import { internationalPhone } from "@/lib/contracts"
import { PROJECT_STAGES, ON_HOLD, nextStage, stageMeta, type ProjectStage } from "@/lib/projectStage"
import { AdminGate } from "@/components/AdminGate"
import { AdminNav } from "@/components/AdminNav"
import { AdminModalShell } from "@/components/admin/AdminModalShell"
import { Field } from "@/components/admin/FieldEditors"
import { cn } from "@/lib/utils"
import { adminNotify } from "@/components/admin/AdminToaster"

type ClientForm = { name: string; email: string; phone: string; company: string; notes: string }

function Section({ title, count, children }: { title: string; count?: number; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-mono text-xs uppercase tracking-wide text-dim mb-3">
        {title}
        {count !== undefined && count > 0 ? ` · ${count}` : ""}
      </h2>
      {children}
    </section>
  )
}

function Row({ to, title, meta, pill, pillClass }: { to: string; title: string; meta?: string; pill?: string; pillClass?: string }) {
  return (
    <Link
      to={to}
      className="flex items-center justify-between gap-3 border border-white/10 rounded-lg px-4 py-3.5 hover:border-lime/40 transition-colors"
    >
      <div className="min-w-0">
        <div className="text-sm font-medium truncate">{title}</div>
        {meta && <div className="text-dim text-xs mt-0.5 truncate">{meta}</div>}
      </div>
      {pill && (
        <span className={cn("font-mono text-[10px] uppercase tracking-wide border rounded-full px-2.5 py-1 flex-none", pillClass ?? "border-white/20")}>
          {pill}
        </span>
      )}
    </Link>
  )
}

/** The work in flight for this client, and the one control that moves it.
 *
 * Raz asked to update "roughly where it is" and have the client see it. So the
 * stage is a picker (six words the client understands), the note is the
 * sentence underneath it, and the common case · this moved one step forward ·
 * is a single button rather than opening a form. */
function ProjectsSection({ clientId, projects, onChanged }: { clientId: string; projects: ClientProjectRow[]; onChanged: () => void }) {
  const [busy, setBusy] = useState<string | null>(null)
  const [noteDraft, setNoteDraft] = useState<Record<string, string>>({})

  async function patch(id: string, patchValues: Partial<ClientProjectRow>) {
    setBusy(id)
    await supabase
      .from("client_projects")
      .update({ ...patchValues, updated_at: new Date().toISOString() })
      .eq("id", id)
    setBusy(null)
    onChanged()
  }

  async function addProject() {
    const title = prompt("שם העבודה")
    if (!title?.trim()) return
    await supabase.from("client_projects").insert({
      client_id: clientId,
      title: title.trim(),
      stage: "brief",
      sort_order: projects.length,
    })
    onChanged()
  }

  return (
    <Section title="עבודות" count={projects.length}>
      <div className="grid gap-3">
        {projects.map((project) => {
          const stage = project.stage as ProjectStage
          const forward = nextStage(stage)
          const note = noteDraft[project.id] ?? project.stage_note ?? ""
          return (
            <div key={project.id} className="border border-white/10 rounded-lg p-4 grid gap-3">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <span className="text-sm font-medium">{project.title}</span>
                <span className="font-mono text-[10px] uppercase tracking-wide text-lime">{stageMeta(stage).label}</span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <select
                  value={stage}
                  onChange={(e) => patch(project.id, { stage: e.target.value })}
                  disabled={busy === project.id}
                  className="bg-background border border-white/25 rounded px-3 py-2 text-xs"
                >
                  {[...PROJECT_STAGES, ON_HOLD].map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
                {forward && (
                  <button
                    onClick={() =>
                      patch(project.id, {
                        stage: forward,
                        ...(forward === "delivered" ? { delivered_at: new Date().toISOString().slice(0, 10) } : {}),
                      })
                    }
                    disabled={busy === project.id}
                    className="font-mono text-[10px] uppercase tracking-wide bg-lime text-black rounded-full px-4 py-2 hover:scale-105 transition-transform disabled:opacity-40"
                  >
                    {stageMeta(forward).label} ←
                  </button>
                )}
              </div>

              <div className="grid gap-2">
                <input
                  value={note}
                  onChange={(e) => setNoteDraft({ ...noteDraft, [project.id]: e.target.value })}
                  placeholder="מה לכתוב ללקוח על המצב"
                  className="w-full bg-transparent border border-white/20 rounded px-3 py-2 text-sm"
                />
                {note !== (project.stage_note ?? "") && (
                  <button
                    onClick={() => patch(project.id, { stage_note: note.trim() || null })}
                    className="w-fit font-mono text-[10px] uppercase tracking-wide border border-white/25 rounded-full px-4 py-2 hover:border-lime transition-colors"
                  >
                    שמירת העדכון
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <button
        onClick={addProject}
        className="mt-3 font-mono text-[10px] uppercase tracking-wide border border-white/25 rounded-full px-4 py-2 hover:border-lime transition-colors"
      >
        + עבודה
      </button>
    </Section>
  )
}

function AdminClientDetailInner() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [client, setClient] = useState<ClientRow | null>(null)
  const [lead, setLead] = useState<LeadRow | null>(null)
  const [calls, setCalls] = useState<CallSessionRow[]>([])
  const [quotes, setQuotes] = useState<QuoteRow[]>([])
  const [contracts, setContracts] = useState<ContractRow[]>([])
  const [projects, setProjects] = useState<ClientProjectRow[]>([])
  const [signatures, setSignatures] = useState<Record<string, QuoteSignatureRow>>({})
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState<ClientForm | null>(null)
  const [saving, setSaving] = useState(false)

  async function load() {
    if (!id) return
    setLoading(true)

    // The id is a client, or a lead who has not become one. One page serves
    // both, so a name in the list always opens something.
    const { data: c } = await supabase.from("clients").select("*").eq("id", id).maybeSingle()
    let foundLead: LeadRow | null = null
    if (c) {
      const { data: l } = await supabase
        .from("leads")
        .select("*")
        .ilike("email", c.email.trim().toLowerCase())
        .order("created_at", { ascending: false })
        .limit(1)
      foundLead = ((l ?? [])[0] as LeadRow) ?? null
    } else {
      const { data: l } = await supabase.from("leads").select("*").eq("id", id).maybeSingle()
      foundLead = (l as LeadRow) ?? null
    }
    setClient(c ?? null)
    setLead(foundLead)

    const clientId = c?.id ?? null
    const [{ data: cs }, { data: q }, { data: ct }, { data: sig }, { data: proj }] = await Promise.all([
      clientId
        ? supabase.from("call_sessions").select("*").eq("client_id", clientId).order("started_at", { ascending: false })
        : supabase.from("call_sessions").select("*").eq("lead_id", id).order("started_at", { ascending: false }),
      clientId ? supabase.from("quotes").select("*").eq("client_id", clientId).order("created_at", { ascending: false }) : { data: [] },
      clientId ? supabase.from("contracts").select("*").eq("client_id", clientId).order("created_at", { ascending: false }) : { data: [] },
      supabase.from("quote_signatures").select("*"),
      clientId
        ? supabase.from("client_projects").select("*").eq("client_id", clientId).order("sort_order")
        : { data: [] },
    ])
    setCalls((cs ?? []) as CallSessionRow[])
    setQuotes((q ?? []) as QuoteRow[])
    setContracts((ct ?? []) as ContractRow[])
    setSignatures(Object.fromEntries(((sig ?? []) as QuoteSignatureRow[]).map((s) => [s.quote_id, s])))
    setProjects((proj ?? []) as ClientProjectRow[])
    setLoading(false)
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  async function saveClient() {
    if (!form || !client) return
    setSaving(true)
    const { error } = await supabase
      .from("clients")
      .update({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone || null,
        company: form.company || null,
        notes: form.notes || null,
      })
      .eq("id", client.id)
    setSaving(false)
    if (error) return adminNotify(error.message)
    setForm(null)
    load()
  }

  async function updateLeadStatus(status: string) {
    if (!lead) return
    await supabase.from("leads").update({ status }).eq("id", lead.id)
    setLead({ ...lead, status })
  }

  if (loading) return <div className="pt-40 pb-40 container font-mono text-xs text-dim uppercase">טוען…</div>

  const name = client?.name ?? lead?.name
  if (!name) {
    return (
      <div className="min-h-[100dvh] pt-28 px-5 md:px-12">
        <AdminNav />
        <p className="text-dim text-sm">לא נמצא.</p>
        <Link to="/admin/clients" className="inline-block mt-4 underline underline-offset-4 text-sm hover:text-lime">→ חזרה לרשימה</Link>
      </div>
    )
  }

  const email = client?.email ?? lead?.email ?? ""
  const phone = client?.phone ?? lead?.phone ?? ""
  const company = client?.company ?? lead?.company ?? ""
  const callHref = client ? `/admin/calls/new?clientId=${client.id}${lead ? `&leadId=${lead.id}` : ""}` : `/admin/calls/new?leadId=${id}`

  return (
    <div className="min-h-[100dvh] pt-28 pb-28 md:pb-20 px-5 md:px-12">
      <AdminNav />

      <div className="max-w-2xl mx-auto grid gap-8">
        <div>
          <Link to="/admin/clients" className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wide text-dim hover:text-lime transition-colors mb-3">
            <ChevronRight size={13} /> כל הלקוחות
          </Link>
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <h1 className="font-display font-bold">{name}</h1>
              {company && <p className="text-dim mt-1">{company}</p>}
            </div>
            {client && (
              <button
                onClick={() =>
                  setForm({
                    name: client.name,
                    email: client.email,
                    phone: client.phone ?? "",
                    company: client.company ?? "",
                    notes: client.notes ?? "",
                  })
                }
                aria-label="עריכה"
                className="flex-none w-10 h-10 flex items-center justify-center rounded-lg border border-white/15 hover:border-lime hover:text-lime transition-colors"
              >
                <Pencil size={16} />
              </button>
            )}
          </div>

          {/* One tap to reach him, from a phone. */}
          <div className="flex flex-wrap gap-2 mt-5">
            {phone && (
              <a href={`tel:${phone.replace(/\s/g, "")}`} className="flex items-center gap-2 border border-white/15 rounded-full px-4 py-2 text-sm hover:border-lime transition-colors">
                <Phone size={14} /> {phone}
              </a>
            )}
            {phone && (
              <a href={`https://wa.me/${internationalPhone(phone)}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 border border-white/15 rounded-full px-4 py-2 text-sm hover:border-lime transition-colors">
                <MessageCircle size={14} /> וואטסאפ
              </a>
            )}
            {email && (
              <a href={`mailto:${email}`} className="flex items-center gap-2 border border-white/15 rounded-full px-4 py-2 text-sm hover:border-lime transition-colors">
                <Mail size={14} /> {email}
              </a>
            )}
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            <button onClick={() => navigate(callHref)} className="font-mono text-[10px] font-bold uppercase tracking-wide bg-lime text-black rounded-full px-5 py-2.5 hover:scale-105 transition-transform">
              שיחה חדשה
            </button>
            {client && (
              <>
                <button onClick={() => navigate(`/admin/quotes/new?clientId=${client.id}`)} className="font-mono text-[10px] uppercase tracking-wide border border-white/25 rounded-full px-5 py-2.5 hover:border-lime transition-colors">
                  הצעת מחיר
                </button>
                <button onClick={() => navigate(`/admin/contracts/new?clientId=${client.id}`)} className="font-mono text-[10px] uppercase tracking-wide border border-white/25 rounded-full px-5 py-2.5 hover:border-lime transition-colors">
                  חוזה
                </button>
              </>
            )}
          </div>
        </div>

        {lead && (
          <Section title="הפנייה">
            <div className="border border-white/10 rounded-lg p-4 grid gap-3">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="text-sm">
                  {lead.project_type}
                  {lead.budget ? ` · ${lead.budget}` : ""}
                </div>
                <select
                  value={lead.status}
                  onChange={(e) => updateLeadStatus(e.target.value)}
                  className="bg-background border border-white/25 rounded px-3 py-2 text-xs"
                >
                  <option value="new">חדש</option>
                  <option value="contacted">יצרתי קשר</option>
                  <option value="won">נסגר</option>
                  <option value="lost">לא רלוונטי</option>
                </select>
              </div>
              {lead.message && <p className="text-sm leading-relaxed">{lead.message}</p>}
              <div className="text-dim text-[11px] font-mono">
                התקבלה {new Date(lead.created_at).toLocaleDateString("he-IL")}
              </div>
            </div>
          </Section>
        )}

        {calls.length > 0 && (
          <Section title="שיחות" count={calls.length}>
            <div className="grid gap-2">
              {calls.map((c) => (
                <Row
                  key={c.id}
                  to={`/admin/calls/${c.id}`}
                  title={c.next_step || (c.outcome ? CALL_OUTCOME_LABELS[c.outcome] ?? c.outcome : "שיחה")}
                  meta={new Date(c.started_at).toLocaleString("he-IL")}
                  pill={c.status === "in_progress" ? "באמצע" : c.outcome ? CALL_OUTCOME_LABELS[c.outcome] ?? c.outcome : "לא הושלמה"}
                  pillClass={c.outcome === "monthly" || c.outcome === "pilot" ? "border-lime text-lime" : undefined}
                />
              ))}
            </div>
          </Section>
        )}

        {contracts.length > 0 && (
          <Section title="חוזים" count={contracts.length}>
            <div className="grid gap-2">
              {contracts.map((ct) => (
                <Row
                  key={ct.id}
                  to={`/admin/contracts/${ct.id}`}
                  title={ct.title}
                  meta={`${formatCurrency(ct.total, ct.currency)}${ct.contract_number ? ` · ${ct.contract_number}` : ""}`}
                  pill={CONTRACT_STATUS_LABELS[ct.status] ?? ct.status}
                  pillClass={ct.status === "signed" ? "border-lime text-lime" : undefined}
                />
              ))}
            </div>
          </Section>
        )}

        {client && (
          <ProjectsSection clientId={client.id} projects={projects} onChanged={load} />
        )}

        {quotes.length > 0 && (
          <Section title="הצעות מחיר" count={quotes.length}>
            <div className="grid gap-2">
              {quotes.map((q) => {
                const sig = signatures[q.id]
                return (
                  <Row
                    key={q.id}
                    to={`/admin/quotes/${q.id}`}
                    title={q.title}
                    meta={`${formatCurrency(q.final_total ?? q.calculated_total ?? q.total, q.currency)}${q.quote_number ? ` · ${q.quote_number}` : ""}`}
                    pill={sig ? "נחתם" : QUOTE_STATUS_LABELS[q.status] ?? q.status}
                    pillClass={sig ? "border-lime text-lime" : undefined}
                  />
                )
              })}
            </div>
          </Section>
        )}

        {client?.notes && (
          <Section title="הערות">
            <p className="text-sm leading-relaxed whitespace-pre-wrap text-dim border border-white/10 rounded-lg p-4">{client.notes}</p>
          </Section>
        )}
      </div>

      {form && (
        <AdminModalShell title="עריכת לקוח" onClose={() => setForm(null)} maxWidth="max-w-lg">
          <div className="grid gap-4">
            <Field label="שם" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
            <Field label="אימייל" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
            <Field label="טלפון" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
            <Field label="חברה" value={form.company} onChange={(v) => setForm({ ...form, company: v })} />
            <Field label="הערות" value={form.notes} onChange={(v) => setForm({ ...form, notes: v })} />
            <button
              onClick={saveClient}
              disabled={saving}
              className="mt-2 font-mono text-xs uppercase tracking-wide bg-lime text-black rounded-full px-6 py-3 hover:scale-105 transition-transform disabled:opacity-40 w-fit"
            >
              {saving ? "שומר…" : "שמירה"}
            </button>
          </div>
        </AdminModalShell>
      )}
    </div>
  )
}

export function AdminClientDetail() {
  return (
    <AdminGate>
      <AdminClientDetailInner />
    </AdminGate>
  )
}
