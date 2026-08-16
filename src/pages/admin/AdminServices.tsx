import { useEffect, useState } from "react"
import { supabase, type SubServiceRow, type ServiceHubRow } from "@/lib/supabase"
import { AdminGate } from "@/components/AdminGate"
import { AdminNav } from "@/components/AdminNav"
import { Field, TextArea, StringListEditor, PairListEditor } from "@/components/admin/FieldEditors"

type SubFormState = Omit<SubServiceRow, "id" | "sort_order"> & { id?: string; sort_order?: number }

const emptySub: SubFormState = {
  slug: "",
  hub_slug: "web-design",
  title: "",
  tagline: "",
  hero_video: "",
  explanation: "",
  who_for: [],
  problem: "",
  benefits: [],
  process: [],
  deliverables: [],
  use_cases: [],
  faq: [],
  related_slugs: [],
  related_guide_slug: "",
}

function AdminServicesInner() {
  const [hubs, setHubs] = useState<ServiceHubRow[]>([])
  const [subs, setSubs] = useState<SubServiceRow[]>([])
  const [loading, setLoading] = useState(true)
  const [hubForm, setHubForm] = useState<ServiceHubRow | null>(null)
  const [subForm, setSubForm] = useState<SubFormState | null>(null)
  const [saving, setSaving] = useState(false)

  async function refresh() {
    const [{ data: h }, { data: s }] = await Promise.all([
      supabase.from("service_hubs").select("*").order("sort_order"),
      supabase.from("sub_services").select("*").order("sort_order"),
    ])
    setHubs(h ?? [])
    setSubs(s ?? [])
    setLoading(false)
  }

  useEffect(() => {
    refresh()
  }, [])

  async function saveHub() {
    if (!hubForm) return
    setSaving(true)
    const { error } = await supabase
      .from("service_hubs")
      .update({
        title: hubForm.title,
        tagline: hubForm.tagline,
        hero_description: hubForm.hero_description,
        cta_label: hubForm.cta_label,
      })
      .eq("id", hubForm.id)
    setSaving(false)
    if (error) return alert(error.message)
    setHubForm(null)
    refresh()
  }

  async function saveSub() {
    if (!subForm) return
    setSaving(true)
    const payload = {
      slug: subForm.slug,
      hub_slug: subForm.hub_slug,
      title: subForm.title,
      tagline: subForm.tagline,
      hero_video: subForm.hero_video || null,
      explanation: subForm.explanation,
      who_for: subForm.who_for.filter(Boolean),
      problem: subForm.problem,
      benefits: subForm.benefits.filter(Boolean),
      process: subForm.process.filter((p) => p.title.trim() || p.text.trim()),
      deliverables: subForm.deliverables.filter(Boolean),
      use_cases: subForm.use_cases.filter(Boolean),
      faq: subForm.faq.filter((f) => f.q.trim() || f.a.trim()),
      related_slugs: subForm.related_slugs.filter(Boolean),
      related_guide_slug: subForm.related_guide_slug || null,
    }
    const { error } = subForm.id
      ? await supabase.from("sub_services").update(payload).eq("id", subForm.id)
      : await supabase.from("sub_services").insert({ ...payload, sort_order: subs.length })
    setSaving(false)
    if (error) return alert(error.message)
    setSubForm(null)
    refresh()
  }

  async function deleteSub(id: string) {
    if (!confirm("למחוק את תת-השירות?")) return
    await supabase.from("sub_services").delete().eq("id", id)
    refresh()
  }

  if (loading) return <div className="pt-40 pb-40 container font-mono text-xs text-dim uppercase">טוען…</div>

  return (
    <div className="min-h-[100dvh] pt-28 pb-20 px-6 md:px-12">
      <AdminNav />

      <h1 className="font-display font-bold text-xl mb-6">שירותים (Hubs)</h1>
      <div className="grid gap-3 mb-14 max-w-2xl">
        {hubs.map((h) => (
          <div key={h.id} className="border border-white/10 rounded px-5 py-4 flex justify-between items-center">
            <div>
              <div className="font-medium">{h.title}</div>
              <div className="text-dim text-xs mt-1">{h.tagline}</div>
            </div>
            <button onClick={() => setHubForm(h)} className="font-mono text-xs uppercase tracking-wide underline underline-offset-4">Edit</button>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center mb-6">
        <h1 className="font-display font-bold text-xl">תת-שירותים</h1>
        <button
          onClick={() => setSubForm({ ...emptySub })}
          className="font-mono text-xs uppercase tracking-wide border border-white/30 rounded-full px-4 py-2 hover:bg-foreground hover:text-background transition-colors"
        >
          + תת-שירות חדש
        </button>
      </div>
      <div className="grid gap-3">
        {subs.map((s) => (
          <div key={s.id} className="border border-white/10 rounded px-5 py-4 flex justify-between items-center">
            <div>
              <div className="font-medium">{s.title}</div>
              <div className="text-dim text-xs mt-1">{s.hub_slug} / {s.slug}</div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setSubForm(s)} className="font-mono text-xs uppercase tracking-wide underline underline-offset-4">Edit</button>
              <button onClick={() => deleteSub(s.id)} className="font-mono text-xs uppercase tracking-wide text-red-400">Delete</button>
            </div>
          </div>
        ))}
      </div>

      {hubForm && (
        <div className="fixed inset-0 z-[60] bg-background/95 overflow-y-auto py-16 px-6">
          <div className="max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <div className="font-display font-bold text-xl">עריכת Hub</div>
              <button onClick={() => setHubForm(null)} className="font-mono text-xs uppercase">Close ×</button>
            </div>
            <div className="grid gap-4">
              <Field label="כותרת" value={hubForm.title} onChange={(v) => setHubForm({ ...hubForm, title: v })} />
              <Field label="Tagline" value={hubForm.tagline} onChange={(v) => setHubForm({ ...hubForm, tagline: v })} />
              <TextArea label="תיאור Hero" value={hubForm.hero_description} onChange={(v) => setHubForm({ ...hubForm, hero_description: v })} />
              <Field label="טקסט כפתור CTA" value={hubForm.cta_label} onChange={(v) => setHubForm({ ...hubForm, cta_label: v })} />
              <button
                onClick={saveHub}
                disabled={saving}
                className="mt-4 font-mono text-xs uppercase tracking-wide border border-white/30 rounded-full px-6 py-3 hover:bg-foreground hover:text-background transition-colors disabled:opacity-50"
              >
                {saving ? "שומר…" : "שמירה"}
              </button>
            </div>
          </div>
        </div>
      )}

      {subForm && (
        <div className="fixed inset-0 z-[60] bg-background/95 overflow-y-auto py-16 px-6">
          <div className="max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <div className="font-display font-bold text-xl">{subForm.id ? "עריכת תת-שירות" : "תת-שירות חדש"}</div>
              <button onClick={() => setSubForm(null)} className="font-mono text-xs uppercase">Close ×</button>
            </div>
            <div className="grid gap-4">
              <Field label="Slug (url)" value={subForm.slug} onChange={(v) => setSubForm({ ...subForm, slug: v })} />
              <div>
                <label className="text-dim text-xs uppercase font-mono mb-2 block">Hub</label>
                <select
                  value={subForm.hub_slug}
                  onChange={(e) => setSubForm({ ...subForm, hub_slug: e.target.value as SubServiceRow["hub_slug"] })}
                  className="bg-background border border-white/30 rounded px-4 py-3 text-sm"
                >
                  <option value="web-design">בניית אתרים</option>
                  <option value="ai-content">יצירת תוכן ב-AI</option>
                </select>
              </div>
              <Field label="כותרת" value={subForm.title} onChange={(v) => setSubForm({ ...subForm, title: v })} />
              <Field label="Tagline" value={subForm.tagline} onChange={(v) => setSubForm({ ...subForm, tagline: v })} />
              <Field label="Hero Video (נתיב)" value={subForm.hero_video ?? ""} onChange={(v) => setSubForm({ ...subForm, hero_video: v })} />
              <TextArea label="הסבר" value={subForm.explanation} onChange={(v) => setSubForm({ ...subForm, explanation: v })} />
              <StringListEditor label="למי זה מתאים" items={subForm.who_for} onChange={(v) => setSubForm({ ...subForm, who_for: v })} />
              <TextArea label="הבעיה" value={subForm.problem} onChange={(v) => setSubForm({ ...subForm, problem: v })} />
              <StringListEditor label="יתרונות" items={subForm.benefits} onChange={(v) => setSubForm({ ...subForm, benefits: v })} />
              <PairListEditor
                label="תהליך העבודה"
                items={subForm.process}
                keyA="title"
                keyB="text"
                placeholderA="כותרת שלב"
                placeholderB="תיאור"
                addLabel="+ הוספת שלב"
                emptyItem={{ title: "", text: "" }}
                onChange={(v) => setSubForm({ ...subForm, process: v })}
              />
              <StringListEditor label="מה מקבלים" items={subForm.deliverables} onChange={(v) => setSubForm({ ...subForm, deliverables: v })} />
              <StringListEditor label="Use Cases" items={subForm.use_cases} onChange={(v) => setSubForm({ ...subForm, use_cases: v })} />
              <PairListEditor
                label="שאלות ותשובות"
                items={subForm.faq}
                keyA="q"
                keyB="a"
                placeholderA="שאלה"
                placeholderB="תשובה"
                addLabel="+ הוספת שאלה"
                emptyItem={{ q: "", a: "" }}
                onChange={(v) => setSubForm({ ...subForm, faq: v })}
              />
              <StringListEditor label="שירותים קשורים (slugs)" items={subForm.related_slugs} onChange={(v) => setSubForm({ ...subForm, related_slugs: v })} />
              <Field label="Slug מדריך קשור (אופציונלי)" value={subForm.related_guide_slug ?? ""} onChange={(v) => setSubForm({ ...subForm, related_guide_slug: v })} />
              <button
                onClick={saveSub}
                disabled={saving}
                className="mt-4 font-mono text-xs uppercase tracking-wide border border-white/30 rounded-full px-6 py-3 hover:bg-foreground hover:text-background transition-colors disabled:opacity-50"
              >
                {saving ? "שומר…" : "שמירת תת-שירות"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export function AdminServices() {
  return (
    <AdminGate>
      <AdminServicesInner />
    </AdminGate>
  )
}
