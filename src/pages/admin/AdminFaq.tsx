import { useEffect, useState } from "react"
import { Pencil, Trash2 } from "lucide-react"
import { supabase, type FaqGroupRow } from "@/lib/supabase"
import { AdminGate } from "@/components/AdminGate"
import { AdminNav } from "@/components/AdminNav"
import { AdminModalShell } from "@/components/admin/AdminModalShell"
import { RowActions } from "@/components/admin/RowActions"
import { Field, PairListEditor } from "@/components/admin/FieldEditors"

type FaqGroupFormState = Omit<FaqGroupRow, "id" | "sort_order"> & { id?: string; sort_order?: number }

const emptyGroup: FaqGroupFormState = { title: "", items: [] }

function AdminFaqInner() {
  const [groups, setGroups] = useState<FaqGroupRow[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState<FaqGroupFormState | null>(null)
  const [saving, setSaving] = useState(false)

  async function refresh() {
    const { data } = await supabase.from("faq_groups").select("*").order("sort_order")
    setGroups(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    refresh()
  }, [])

  async function save() {
    if (!form) return
    setSaving(true)
    const payload = {
      title: form.title,
      items: form.items.filter((i) => i.q.trim() || i.a.trim()),
    }
    const { error } = form.id
      ? await supabase.from("faq_groups").update(payload).eq("id", form.id)
      : await supabase.from("faq_groups").insert({ ...payload, sort_order: groups.length })
    setSaving(false)
    if (error) return alert(error.message)
    setForm(null)
    refresh()
  }

  async function remove(id: string) {
    if (!confirm("למחוק את קבוצת ה-FAQ?")) return
    await supabase.from("faq_groups").delete().eq("id", id)
    refresh()
  }

  if (loading) return <div className="pt-40 pb-40 container font-mono text-xs text-dim uppercase">טוען…</div>

  return (
    <div className="min-h-[100dvh] pt-28 pb-28 md:pb-20 px-6 md:px-12">
      <AdminNav />

      <p className="text-dim text-xs mb-6 max-w-md">
        אלה קבוצות ה-FAQ הכלליות (לא קשורות לתת-שירות ספציפי). שאלות שנוגעות לשירות ספציפי נערכות דרך
        עמוד "שירותים" בכל תת-שירות בנפרד.
      </p>

      <div className="flex justify-between items-center mb-6">
        <h1 className="font-display font-bold text-xl">קבוצות FAQ</h1>
        <button
          onClick={() => setForm({ ...emptyGroup })}
          className="font-mono text-xs uppercase tracking-wide border border-white/30 rounded-full px-4 py-2 hover:bg-foreground hover:text-background transition-colors"
        >
          + קבוצה חדשה
        </button>
      </div>
      <div className="grid gap-3">
        {groups.map((g) => (
          <div key={g.id} className="border border-white/10 rounded px-5 py-4 flex flex-wrap justify-between items-center gap-3">
            <div className="min-w-0">
              <div className="font-medium truncate">{g.title}</div>
              <div className="text-dim text-xs mt-1">{g.items.length} שאלות</div>
            </div>
            <RowActions
              actions={[
                { icon: Pencil, label: "עריכה", onClick: () => setForm(g) },
                { icon: Trash2, label: "מחיקה", onClick: () => remove(g.id), variant: "danger" },
              ]}
            />
          </div>
        ))}
      </div>

      {form && (
        <AdminModalShell title={form.id ? "עריכת קבוצה" : "קבוצה חדשה"} onClose={() => setForm(null)} maxWidth="max-w-2xl">
          <div className="grid gap-4">
            <Field label="כותרת הקבוצה" value={form.title} onChange={(v) => setForm({ ...form, title: v })} />
            <PairListEditor
              label="שאלות ותשובות"
              items={form.items}
              keyA="q"
              keyB="a"
              placeholderA="שאלה"
              placeholderB="תשובה"
              addLabel="+ הוספת שאלה"
              emptyItem={{ q: "", a: "" }}
              onChange={(v) => setForm({ ...form, items: v })}
            />
            <button
              onClick={save}
              disabled={saving}
              className="mt-4 font-mono text-xs uppercase tracking-wide border border-white/30 rounded-full px-6 py-3 hover:bg-foreground hover:text-background transition-colors disabled:opacity-50"
            >
              {saving ? "שומר…" : "שמירת קבוצה"}
            </button>
          </div>
        </AdminModalShell>
      )}
    </div>
  )
}

export function AdminFaq() {
  return (
    <AdminGate>
      <AdminFaqInner />
    </AdminGate>
  )
}
