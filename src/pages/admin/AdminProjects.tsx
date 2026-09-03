import { useEffect, useState } from "react"
import { Pencil, Trash2 } from "lucide-react"
import { supabase, type ProjectRow } from "@/lib/supabase"
import { AdminGate } from "@/components/AdminGate"
import { AdminNav } from "@/components/AdminNav"
import { AdminModalShell } from "@/components/admin/AdminModalShell"
import { RowActions } from "@/components/admin/RowActions"
import { Field, TextArea, StringListEditor, PairListEditor, MediaField, GalleryEditor } from "@/components/admin/FieldEditors"

type ProjectFormState = Omit<ProjectRow, "id" | "sort_order"> & { id?: string; sort_order?: number }

const emptyProject: ProjectFormState = {
  slug: "",
  number: "",
  title: "",
  category: "",
  disciplines: [],
  year: new Date().getFullYear().toString(),
  video: "",
  thumb_class: "",
  concept: false,
  featured: false,
  overview: "",
  duration: "",
  client_name: "",
  role: "",
  live_url: "",
  challenges: [],
  solutions: [],
  results: [],
  testimonial_quote: "",
  testimonial_author: "",
  testimonial_role: "",
  project_type: "website",
  categories: [],
  tech_stack: [],
  ai_tools: [],
  gallery: [],
}

function AdminProjectsInner() {
  const [projects, setProjects] = useState<ProjectRow[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState<ProjectFormState | null>(null)
  const [saving, setSaving] = useState(false)

  async function refresh() {
    const { data } = await supabase.from("projects").select("*").order("sort_order")
    setProjects(data ?? [])
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
      number: form.number,
      title: form.title,
      category: form.category,
      disciplines: form.disciplines.filter(Boolean),
      year: form.year,
      video: form.video || null,
      thumb_class: form.thumb_class || "",
      concept: form.concept,
      featured: form.featured,
      overview: form.overview || null,
      duration: form.duration || null,
      client_name: form.client_name || null,
      role: form.role || null,
      live_url: form.live_url || null,
      challenges: form.challenges.filter((c) => c.title.trim() || c.description.trim()),
      solutions: form.solutions.filter((s) => s.title.trim() || s.description.trim()),
      results: form.results.filter(Boolean),
      testimonial_quote: form.testimonial_quote || null,
      testimonial_author: form.testimonial_author || null,
      testimonial_role: form.testimonial_role || null,
      project_type: form.project_type,
      categories: form.categories.filter(Boolean),
      tech_stack: form.tech_stack.filter(Boolean),
      ai_tools: form.ai_tools.filter(Boolean),
      gallery: form.gallery.filter((g) => g.url.trim()),
    }
    const { error } = form.id
      ? await supabase.from("projects").update(payload).eq("id", form.id)
      : await supabase.from("projects").insert({ ...payload, sort_order: projects.length })
    setSaving(false)
    if (error) return alert(error.message)
    setForm(null)
    refresh()
  }

  async function remove(id: string) {
    if (!confirm("למחוק את הפרויקט?")) return
    await supabase.from("projects").delete().eq("id", id)
    refresh()
  }

  if (loading) return <div className="pt-40 pb-40 container font-mono text-xs text-dim uppercase">טוען…</div>

  return (
    <div className="min-h-[100dvh] pt-28 pb-28 md:pb-20 px-6 md:px-12">
      <AdminNav />

      <div className="flex justify-between items-center mb-6">
        <h1 className="font-display font-bold text-xl">עבודות / קייס סטאדי</h1>
        <button
          onClick={() => setForm({ ...emptyProject })}
          className="font-mono text-xs uppercase tracking-wide border border-white/30 rounded-full px-4 py-2 hover:bg-foreground hover:text-background transition-colors"
        >
          + פרויקט חדש
        </button>
      </div>

      <div className="grid gap-3">
        {projects.map((p) => (
          <div key={p.id} className="border border-white/10 rounded px-5 py-4 flex justify-between items-center gap-4">
            <div className="min-w-0">
              <div className="font-medium truncate">{p.title}</div>
              <div className="text-dim text-xs mt-1 flex flex-wrap gap-x-3">
                <span>{p.project_type === "website" ? "אתר" : "AI"} · {p.slug}</span>
                <span>{p.challenges.length} אתגרים · {p.solutions.length} פתרונות · {p.results.length} תוצאות · {p.gallery.length} מדיה נוספת</span>
                {!p.testimonial_quote && <span className="text-yellow-500">בלי המלצה</span>}
              </div>
            </div>
            <RowActions
              actions={[
                { icon: Pencil, label: "עריכה", onClick: () => setForm(p) },
                { icon: Trash2, label: "מחיקה", onClick: () => remove(p.id), variant: "danger" },
              ]}
            />
          </div>
        ))}
      </div>

      {form && (
        <AdminModalShell title={form.id ? "עריכת פרויקט" : "פרויקט חדש"} onClose={() => setForm(null)} maxWidth="max-w-2xl">
          <div className="grid gap-4">
              <Field label="Slug (url)" value={form.slug} onChange={(v) => setForm({ ...form, slug: v })} />
              <div className="grid grid-cols-2 gap-4">
                <Field label="מספר (01, 02...)" value={form.number} onChange={(v) => setForm({ ...form, number: v })} />
                <Field label="שנה" value={form.year} onChange={(v) => setForm({ ...form, year: v })} />
              </div>
              <div>
                <label className="text-dim text-xs uppercase font-mono mb-2 block">סוג פרויקט</label>
                <select
                  value={form.project_type}
                  onChange={(e) => setForm({ ...form, project_type: e.target.value as ProjectRow["project_type"] })}
                  className="bg-background border border-white/30 rounded px-4 py-3 text-sm"
                >
                  <option value="website">אתר</option>
                  <option value="ai">AI</option>
                </select>
              </div>
              <Field label="כותרת" value={form.title} onChange={(v) => setForm({ ...form, title: v })} />
              <Field label="קטגוריה" value={form.category} onChange={(v) => setForm({ ...form, category: v })} />
              <StringListEditor label="תחומים (disciplines)" items={form.disciplines} onChange={(v) => setForm({ ...form, disciplines: v })} />
              <MediaField label="וידאו ראשי" value={form.video} bucket="project-media" onChange={(v) => setForm({ ...form, video: v })} />
              <TextArea label="סקירה (Overview)" value={form.overview ?? ""} onChange={(v) => setForm({ ...form, overview: v })} />
              <div className="grid grid-cols-2 gap-4">
                <Field label="משך זמן" value={form.duration ?? ""} onChange={(v) => setForm({ ...form, duration: v })} />
                <Field label="שם לקוח (אופציונלי)" value={form.client_name ?? ""} onChange={(v) => setForm({ ...form, client_name: v })} />
                <Field label="התפקיד שלי · פיתוח ועיצוב / ייעוץ ואפיון / בימוי (ריק = לא מוצג)" value={form.role ?? ""} onChange={(v) => setForm({ ...form, role: v })} />
              </div>
              <Field label="קישור לאתר חי (אופציונלי)" value={form.live_url ?? ""} onChange={(v) => setForm({ ...form, live_url: v })} />

              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.concept} onChange={(e) => setForm({ ...form, concept: e.target.checked })} />
                קונספט עצמאי (ללא לקוח אמיתי)
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
                מוצג בעמוד הבית (Featured)
              </label>

              <PairListEditor
                label="אתגרים"
                items={form.challenges}
                keyA="title"
                keyB="description"
                placeholderA="כותרת האתגר"
                placeholderB="תיאור"
                addLabel="+ הוספת אתגר"
                emptyItem={{ title: "", description: "" }}
                onChange={(v) => setForm({ ...form, challenges: v })}
              />
              <PairListEditor
                label="פתרונות"
                items={form.solutions}
                keyA="title"
                keyB="description"
                placeholderA="כותרת הפתרון"
                placeholderB="תיאור"
                addLabel="+ הוספת פתרון"
                emptyItem={{ title: "", description: "" }}
                onChange={(v) => setForm({ ...form, solutions: v })}
              />
              <StringListEditor label="תוצאות" items={form.results} onChange={(v) => setForm({ ...form, results: v })} />

              <TextArea label="ציטוט המלצה (אופציונלי)" value={form.testimonial_quote ?? ""} onChange={(v) => setForm({ ...form, testimonial_quote: v })} />
              <div className="grid grid-cols-2 gap-4">
                <Field label="שם הממליץ/ה" value={form.testimonial_author ?? ""} onChange={(v) => setForm({ ...form, testimonial_author: v })} />
                <Field label="תפקיד / חברה" value={form.testimonial_role ?? ""} onChange={(v) => setForm({ ...form, testimonial_role: v })} />
              </div>

              <StringListEditor label="קטגוריות סינון (categories)" items={form.categories} onChange={(v) => setForm({ ...form, categories: v })} />
              <StringListEditor label="Tech Stack" items={form.tech_stack} onChange={(v) => setForm({ ...form, tech_stack: v })} />
              <StringListEditor label="כלי AI" items={form.ai_tools} onChange={(v) => setForm({ ...form, ai_tools: v })} />

              <GalleryEditor label="מדיה נוספת (תמונות/סרטונים לעמוד הפרויקט)" items={form.gallery} bucket="project-media" onChange={(v) => setForm({ ...form, gallery: v })} />

              <button
                onClick={save}
                disabled={saving}
                className="mt-4 font-mono text-xs uppercase tracking-wide border border-white/30 rounded-full px-6 py-3 hover:bg-foreground hover:text-background transition-colors disabled:opacity-50"
              >
                {saving ? "שומר…" : "שמירת פרויקט"}
              </button>
          </div>
        </AdminModalShell>
      )}
    </div>
  )
}

export function AdminProjects() {
  return (
    <AdminGate>
      <AdminProjectsInner />
    </AdminGate>
  )
}
