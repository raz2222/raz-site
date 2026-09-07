import { useEffect, useState } from "react"
import { Trash2 } from "lucide-react"
import { supabase, type FaqGroupRow } from "@/lib/supabase"
import { AdminGate } from "@/components/AdminGate"
import { AdminPage, AdminAction, AdminRow, EmptyState } from "@/components/admin/AdminPage"
import { AdminModalShell } from "@/components/admin/AdminModalShell"
import { RowActions } from "@/components/admin/RowActions"
import { Field, PairListEditor } from "@/components/admin/FieldEditors"
import { adminNotify } from "@/components/admin/AdminToaster"

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
    if (error) return adminNotify(error.message)
    setForm(null)
    refresh()
  }

  async function remove(id: string) {
    if (!confirm("למחוק את קבוצת ה-FAQ?")) return
    await supabase.from("faq_groups").delete().eq("id", id)
    refresh()
  }


  return (
    <AdminPage
      title="קבוצות FAQ"
      description="קבוצות ה-FAQ הכלליות. שאלות שנוגעות לשירות מסוים נערכות בעמוד השירותים."
      loading={loading}
      action={<AdminAction onClick={() => setForm({ ...emptyGroup })}>+ קבוצה</AdminAction>}
    >

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
      {groups.length === 0 ? (
        <EmptyState
          text="אין עדיין קבוצות FAQ. קבוצה היא אוסף שאלות שמופיע בעמוד שאלות נפוצות."
          action={<AdminAction onClick={() => setForm({ ...emptyGroup })}>+ קבוצה</AdminAction>}
        />
      ) : (
        <div className="grid gap-2">
          {groups.map((g) => (
            <AdminRow
              key={g.id}
              title={g.title}
              meta={`${g.items.length} שאלות`}
              onClick={() => setForm(g)}
              actions={
                <RowActions actions={[{ icon: Trash2, label: "מחיקה", onClick: () => remove(g.id), variant: "danger" }]} />
              }
            />
          ))}
        </div>
      )}

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
    </AdminPage>
  )
}

export function AdminFaq() {
  return (
    <AdminGate>
      <AdminFaqInner />
    </AdminGate>
  )
}
