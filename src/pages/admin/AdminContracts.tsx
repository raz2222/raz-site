import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Pencil, Trash2 } from "lucide-react"
import {
  supabase,
  CONTRACT_STATUS_LABELS,
  type ContractRow,
  type ContractSection,
  type ContractStatus,
  type ContractTemplateRow,
} from "@/lib/supabase"
import { formatCurrency } from "@/lib/quotePricing"
import { CONTRACT_VARIABLE_HELP } from "@/lib/contracts"
import { AdminGate } from "@/components/AdminGate"
import { AdminPage, AdminAction, AdminButton, AdminRow, EmptyState } from "@/components/admin/AdminPage"
import { AdminModalShell } from "@/components/admin/AdminModalShell"
import { RowActions } from "@/components/admin/RowActions"
import { Field, TextArea } from "@/components/admin/FieldEditors"
import { cn } from "@/lib/utils"
import { adminNotify } from "@/components/admin/AdminToaster"

const FILTERS: (ContractStatus | "all")[] = ["all", "draft", "sent", "viewed", "signed", "cancelled"]
const TABS = ["חוזים", "תבניות"] as const
type Tab = (typeof TABS)[number]

function ContractsTab() {
  const navigate = useNavigate()
  const [contracts, setContracts] = useState<ContractRow[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<ContractStatus | "all">("all")

  useEffect(() => {
    supabase
      .from("contracts")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setContracts(data ?? [])
        setLoading(false)
      })
  }, [])

  const filtered = useMemo(
    () => (filter === "all" ? contracts : contracts.filter((c) => c.status === filter)),
    [contracts, filter]
  )

  if (loading) return <p className="text-dim text-sm">טוען…</p>

  return (
    <>
      <div className="flex flex-wrap gap-1.5 mb-6">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "font-mono text-[10px] uppercase tracking-wide rounded-full px-2.5 py-1 border transition-colors",
              filter === f ? "border-lime bg-lime text-black" : "border-white/15 text-dim"
            )}
          >
            {f === "all" ? "הכל" : CONTRACT_STATUS_LABELS[f]}
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <EmptyState
          text={
            filter === "all"
              ? "אין עדיין חוזים. הדרך הקצרה ליצור אחד היא מתוך הצעת מחיר קיימת, בלשונית השליחה שלה."
              : "אין חוזים בסטטוס הזה."
          }
          action={filter === "all" ? <AdminAction onClick={() => navigate("/admin/contracts/new")}>+ חוזה</AdminAction> : undefined}
        />
      )}

      <div className="grid gap-2">
        {filtered.map((c) => (
          <AdminRow
            key={c.id}
            to={`/admin/contracts/${c.id}`}
            title={c.client_name}
            meta={`${c.title}${c.contract_number ? ` · ${c.contract_number}` : ""} · ${formatCurrency(c.total, c.currency)}`}
            pill={CONTRACT_STATUS_LABELS[c.status] ?? c.status}
            pillTone={c.status === "signed" ? "good" : c.status === "draft" ? "quiet" : "neutral"}
          />
        ))}
      </div>
    </>
  )
}

type TemplateForm = Partial<ContractTemplateRow>

function TemplatesTab() {
  const [templates, setTemplates] = useState<ContractTemplateRow[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState<TemplateForm | null>(null)
  const [saving, setSaving] = useState(false)

  async function refresh() {
    const { data } = await supabase.from("contract_templates").select("*").order("sort_order")
    setTemplates(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    refresh()
  }, [])

  async function save() {
    if (!form) return
    setSaving(true)
    const payload = {
      slug: (form.slug ?? "").trim(),
      name: form.name ?? "",
      description: form.description || null,
      sections: form.sections ?? [],
      active: form.active ?? true,
      sort_order: Number(form.sort_order) || 0,
      updated_at: new Date().toISOString(),
    }
    const { error } = form.id
      ? await supabase.from("contract_templates").update(payload).eq("id", form.id)
      : await supabase.from("contract_templates").insert(payload)
    setSaving(false)
    if (error) { adminNotify(error.message); return }
    setForm(null)
    refresh()
  }

  async function remove(id: string) {
    if (!confirm("למחוק את התבנית? חוזים שכבר נוצרו ממנה לא ישתנו.")) return
    await supabase.from("contract_templates").delete().eq("id", id)
    refresh()
  }

  function updateSection(index: number, patch: Partial<ContractSection>) {
    if (!form) return
    const sections = [...(form.sections ?? [])]
    sections[index] = { ...sections[index], ...patch }
    setForm({ ...form, sections })
  }

  function moveSection(index: number, dir: -1 | 1) {
    if (!form) return
    const sections = [...(form.sections ?? [])]
    const target = index + dir
    if (target < 0 || target >= sections.length) return
    ;[sections[index], sections[target]] = [sections[target], sections[index]]
    setForm({ ...form, sections })
  }

  if (loading) return <p className="text-dim text-sm">טוען…</p>

  return (
    <>
      <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
        <p className="text-dim text-xs max-w-lg">
          נוסח הסעיפים שכל חוזה חדש נבנה ממנו. עריכה כאן משפיעה רק על חוזים חדשים · חוזה שכבר נשלח או נחתם שומר את
          הנוסח שלו כפי שהיה. אפשר להשתמש במשתנים כמו {"{{client_name}}"} והם יוחלפו בפרטי הלקוח בפועל.
        </p>
        <div className="flex-none">
          <AdminButton onClick={() => setForm({ name: "", slug: "", sections: [], active: true, sort_order: templates.length })}>
            + תבנית
          </AdminButton>
        </div>
      </div>

      <div className="grid gap-2">
        {templates.map((t) => (
          <AdminRow
            key={t.id}
            onClick={() => setForm(t)}
            title={t.name}
            meta={`${t.slug} · ${t.sections.length} סעיפים`}
            pill={t.active ? undefined : "לא פעילה"}
            pillTone="quiet"
            actions={
              <RowActions
                actions={[
                  { icon: Pencil, label: "עריכה", onClick: () => setForm(t) },
                  { icon: Trash2, label: "מחיקה", onClick: () => remove(t.id), variant: "danger" },
                ]}
              />
            }
          />
        ))}
      </div>

      {form && (
        <AdminModalShell title={form.id ? "עריכת תבנית" : "תבנית חדשה"} onClose={() => setForm(null)} maxWidth="max-w-3xl">
          <div className="grid gap-4">
            <Field label="שם התבנית" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
            <Field label="Slug (אנגלית, ייחודי)" value={form.slug} onChange={(v) => setForm({ ...form, slug: v })} />
            <TextArea label="תיאור פנימי" value={form.description} onChange={(v) => setForm({ ...form, description: v })} rows={2} />

            <div className="border border-white/10 rounded p-3">
              <div className="text-dim text-[11px] font-mono uppercase mb-2">משתנים זמינים</div>
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                {CONTRACT_VARIABLE_HELP.map((v) => (
                  <span key={v.token} className="text-[11px] text-dim">
                    <code className="text-foreground">{v.token}</code> {v.label}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-dim text-xs uppercase font-mono">סעיפים</label>
                <button
                  onClick={() => setForm({ ...form, sections: [...(form.sections ?? []), { heading: "", body: "" }] })}
                  className="font-mono text-[10px] uppercase tracking-wide border border-white/30 rounded-full px-3 py-1 hover:border-lime transition-colors"
                >
                  + סעיף
                </button>
              </div>
              <div className="grid gap-3">
                {(form.sections ?? []).map((section, i) => (
                  <div key={i} className="border border-white/10 rounded p-3 grid gap-2">
                    <div className="flex items-center gap-2">
                      <input
                        value={section.heading}
                        onChange={(e) => updateSection(i, { heading: e.target.value })}
                        placeholder="כותרת הסעיף"
                        className="flex-1 bg-transparent border border-white/20 rounded px-3 py-2 text-sm focus:outline-none focus-visible:border-white/50"
                      />
                      <button onClick={() => moveSection(i, -1)} aria-label="העלאה" className="text-dim px-2 py-1 hover:text-lime">↑</button>
                      <button onClick={() => moveSection(i, 1)} aria-label="הורדה" className="text-dim px-2 py-1 hover:text-lime">↓</button>
                      <button
                        onClick={() => setForm({ ...form, sections: (form.sections ?? []).filter((_, j) => j !== i) })}
                        aria-label="מחיקה"
                        className="text-red-400 px-2 py-1"
                      >
                        ✕
                      </button>
                    </div>
                    <textarea
                      value={section.body}
                      onChange={(e) => updateSection(i, { body: e.target.value })}
                      rows={5}
                      placeholder="נוסח הסעיף"
                      className="w-full bg-transparent border border-white/20 rounded px-3 py-2 text-sm leading-relaxed focus:outline-none focus-visible:border-white/50"
                    />
                  </div>
                ))}
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.active ?? true} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
              תבנית פעילה
            </label>

            <div className="mt-2">
              <AdminAction onClick={save} disabled={saving}>{saving ? "שומר…" : "שמירה"}</AdminAction>
            </div>
          </div>
        </AdminModalShell>
      )}
    </>
  )
}

function AdminContractsInner() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>("חוזים")

  return (
    <AdminPage
      title="חוזים"
      description="חוזי עבודה שנשלחים ללקוח לחתימה דיגיטלית."
      action={<AdminAction onClick={() => navigate("/admin/contracts/new")}>+ חוזה</AdminAction>}
    >

      <div className="flex gap-2 mb-8 border-b border-white/10">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "font-mono text-xs uppercase tracking-wide px-4 py-3 border-b-2 -mb-px transition-colors",
              tab === t ? "border-foreground text-foreground" : "border-transparent text-dim hover:text-foreground"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "חוזים" ? <ContractsTab /> : <TemplatesTab />}
    </AdminPage>
  )
}

export function AdminContracts() {
  return (
    <AdminGate>
      <AdminContractsInner />
    </AdminGate>
  )
}
