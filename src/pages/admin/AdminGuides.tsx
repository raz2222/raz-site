import { useEffect, useState } from "react"
import { supabase, type GuideRow, type GuideSection } from "@/lib/supabase"
import { AdminGate } from "@/components/AdminGate"
import { AdminNav } from "@/components/AdminNav"
import { Field, TextArea } from "@/components/admin/FieldEditors"

type GuideFormState = Omit<GuideRow, "id" | "sort_order"> & { id?: string; sort_order?: number }

const emptyGuide: GuideFormState = {
  slug: "",
  title: "",
  excerpt: "",
  category: "",
  read_time: "6 דקות קריאה",
  date_published: new Date().toISOString().slice(0, 10),
  hero_video: "",
  related_service_slug: "",
  sections: [],
}

function SectionsEditor({ sections, onChange }: { sections: GuideSection[]; onChange: (s: GuideSection[]) => void }) {
  return (
    <div>
      <label className="text-dim text-xs uppercase font-mono mb-2 block">סקשנים</label>
      <div className="grid gap-4">
        {sections.map((sec, i) => (
          <div key={i} className="border border-white/10 rounded p-4 grid gap-3">
            <div className="flex gap-2">
              <input
                value={sec.heading}
                onChange={(e) => {
                  const next = [...sections]
                  next[i] = { ...next[i], heading: e.target.value }
                  onChange(next)
                }}
                placeholder="כותרת הסקשן"
                className="flex-1 bg-transparent border border-white/30 rounded px-3 py-2 text-sm font-medium"
              />
              <button onClick={() => onChange(sections.filter((_, idx) => idx !== i))} className="text-red-400 text-xs px-2">✕ הסר סקשן</button>
            </div>
            <div className="grid gap-2">
              {sec.paragraphs.map((p, j) => (
                <div key={j} className="flex gap-2">
                  <textarea
                    value={p}
                    onChange={(e) => {
                      const next = [...sections]
                      const paras = [...next[i].paragraphs]
                      paras[j] = e.target.value
                      next[i] = { ...next[i], paragraphs: paras }
                      onChange(next)
                    }}
                    rows={3}
                    placeholder="פסקה"
                    className="flex-1 bg-transparent border border-white/20 rounded px-3 py-2 text-xs"
                  />
                  <button
                    onClick={() => {
                      const next = [...sections]
                      next[i] = { ...next[i], paragraphs: next[i].paragraphs.filter((_, idx) => idx !== j) }
                      onChange(next)
                    }}
                    className="text-red-400 text-xs px-2"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={() => {
                const next = [...sections]
                next[i] = { ...next[i], paragraphs: [...next[i].paragraphs, ""] }
                onChange(next)
              }}
              className="font-mono text-[11px] uppercase tracking-wide underline underline-offset-4 hover:text-[#D1FE17] transition-colors w-fit"
            >
              + הוספת פסקה
            </button>
          </div>
        ))}
      </div>
      <button
        onClick={() => onChange([...sections, { heading: "", paragraphs: [""] }])}
        className="mt-3 font-mono text-xs uppercase tracking-wide underline underline-offset-4 hover:text-[#D1FE17] transition-colors"
      >
        + הוספת סקשן
      </button>
    </div>
  )
}

function AdminGuidesInner() {
  const [guides, setGuides] = useState<GuideRow[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState<GuideFormState | null>(null)
  const [saving, setSaving] = useState(false)

  async function refresh() {
    const { data } = await supabase.from("guides").select("*").order("sort_order")
    setGuides(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    refresh()
  }, [])

  async function save() {
    if (!form) return
    setSaving(true)
    const payload = {
      slug: form.slug,
      title: form.title,
      excerpt: form.excerpt,
      category: form.category,
      read_time: form.read_time,
      date_published: form.date_published,
      hero_video: form.hero_video || null,
      related_service_slug: form.related_service_slug || null,
      sections: form.sections.filter((s) => s.heading.trim()).map((s) => ({ ...s, paragraphs: s.paragraphs.filter((p) => p.trim()) })),
    }
    const { error } = form.id
      ? await supabase.from("guides").update(payload).eq("id", form.id)
      : await supabase.from("guides").insert({ ...payload, sort_order: guides.length })
    setSaving(false)
    if (error) return alert(error.message)
    setForm(null)
    refresh()
  }

  async function remove(id: string) {
    if (!confirm("למחוק את המדריך?")) return
    await supabase.from("guides").delete().eq("id", id)
    refresh()
  }

  if (loading) return <div className="pt-40 pb-40 container font-mono text-xs text-dim uppercase">טוען…</div>

  return (
    <div className="min-h-[100dvh] pt-28 pb-28 md:pb-20 px-6 md:px-12">
      <AdminNav />

      <div className="flex justify-between items-center mb-6">
        <h1 className="font-display font-bold text-xl">מדריכים</h1>
        <button
          onClick={() => setForm({ ...emptyGuide })}
          className="font-mono text-xs uppercase tracking-wide border border-white/30 rounded-full px-4 py-2 hover:bg-foreground hover:text-background transition-colors"
        >
          + מדריך חדש
        </button>
      </div>
      <div className="grid gap-3">
        {guides.map((g) => (
          <div key={g.id} className="border border-white/10 rounded px-5 py-4 flex justify-between items-center">
            <div>
              <div className="font-medium">{g.title}</div>
              <div className="text-dim text-xs mt-1">{g.category} · {g.slug}</div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setForm(g)} className="font-mono text-xs uppercase tracking-wide underline underline-offset-4 p-1 -m-1">Edit</button>
              <button onClick={() => remove(g.id)} className="font-mono text-xs uppercase tracking-wide text-red-400 p-1 -m-1">Delete</button>
            </div>
          </div>
        ))}
      </div>

      {form && (
        <div className="fixed inset-0 z-[60] bg-background/95 overflow-y-auto py-16 px-6">
          <div className="max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <div className="font-display font-bold text-xl">{form.id ? "עריכת מדריך" : "מדריך חדש"}</div>
              <button onClick={() => setForm(null)} className="font-mono text-xs uppercase p-2 -m-2">Close ×</button>
            </div>
            <div className="grid gap-4">
              <Field label="Slug (url)" value={form.slug} onChange={(v) => setForm({ ...form, slug: v })} />
              <Field label="כותרת" value={form.title} onChange={(v) => setForm({ ...form, title: v })} />
              <TextArea label="תקציר" value={form.excerpt} onChange={(v) => setForm({ ...form, excerpt: v })} rows={2} />
              <Field label="קטגוריה" value={form.category} onChange={(v) => setForm({ ...form, category: v })} />
              <Field label="זמן קריאה" value={form.read_time} onChange={(v) => setForm({ ...form, read_time: v })} />
              <Field label="תאריך פרסום (YYYY-MM-DD)" value={form.date_published} onChange={(v) => setForm({ ...form, date_published: v })} />
              <Field label="Hero Video (נתיב)" value={form.hero_video ?? ""} onChange={(v) => setForm({ ...form, hero_video: v })} />
              <Field label="Slug שירות קשור (אופציונלי)" value={form.related_service_slug ?? ""} onChange={(v) => setForm({ ...form, related_service_slug: v })} />
              <SectionsEditor sections={form.sections} onChange={(v) => setForm({ ...form, sections: v })} />
              <button
                onClick={save}
                disabled={saving}
                className="mt-4 font-mono text-xs uppercase tracking-wide border border-white/30 rounded-full px-6 py-3 hover:bg-foreground hover:text-background transition-colors disabled:opacity-50"
              >
                {saving ? "שומר…" : "שמירת מדריך"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export function AdminGuides() {
  return (
    <AdminGate>
      <AdminGuidesInner />
    </AdminGate>
  )
}
