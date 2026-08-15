import { useState } from "react"
import { supabase, type ProjectRow } from "@/lib/supabase"
import { useAuth } from "@/hooks/useAuth"
import { useProjects } from "@/hooks/useProjects"

type FormState = Partial<ProjectRow> & { disciplinesText?: string; toolsText?: string }

const empty: FormState = {
  slug: "",
  number: "",
  title: "",
  category: "",
  disciplinesText: "",
  year: new Date().getFullYear().toString(),
  video: "",
  thumb_class: "normal",
  concept: true,
  featured: false,
  sort_order: 0,
  overview: "",
  challenge: "",
  direction: "",
  digital_experience: "",
  behind_the_scenes: "",
  result: "",
  toolsText: "",
}

export function AdminDashboard() {
  const { user } = useAuth()
  const { projects, loading } = useProjects()
  const [form, setForm] = useState<FormState | null>(null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  function editProject(p: ProjectRow) {
    setForm({
      ...p,
      disciplinesText: p.disciplines.join(", "),
      toolsText: p.tools.join(", "),
    })
  }

  function newProject() {
    setForm({ ...empty })
  }

  async function handleUpload(file: File) {
    setUploading(true)
    const path = `${Date.now()}-${file.name}`
    const { error } = await supabase.storage.from("project-media").upload(path, file)
    setUploading(false)
    if (error) {
      alert(error.message)
      return
    }
    const { data } = supabase.storage.from("project-media").getPublicUrl(path)
    setForm((f) => (f ? { ...f, video: data.publicUrl } : f))
  }

  async function handleSave() {
    if (!form) return
    setSaving(true)
    const payload = {
      slug: form.slug,
      number: form.number,
      title: form.title,
      category: form.category,
      disciplines: (form.disciplinesText ?? "").split(",").map((s) => s.trim()).filter(Boolean),
      year: form.year,
      video: form.video || null,
      thumb_class: form.thumb_class,
      concept: !!form.concept,
      featured: !!form.featured,
      sort_order: Number(form.sort_order) || 0,
      overview: form.overview || null,
      challenge: form.challenge || null,
      direction: form.direction || null,
      digital_experience: form.digital_experience || null,
      behind_the_scenes: form.behind_the_scenes || null,
      result: form.result || null,
      tools: (form.toolsText ?? "").split(",").map((s) => s.trim()).filter(Boolean),
    }

    const { error } = form.id
      ? await supabase.from("projects").update(payload).eq("id", form.id)
      : await supabase.from("projects").insert(payload)

    setSaving(false)
    if (error) {
      alert(error.message)
      return
    }
    setForm(null)
    window.location.reload()
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this project?")) return
    await supabase.from("projects").delete().eq("id", id)
    window.location.reload()
  }

  return (
    <div className="min-h-[100dvh] pt-28 pb-20 px-6 md:px-12">
      <div className="flex items-center justify-between mb-10">
        <div>
          <div className="font-display font-bold text-2xl">RAZ Admin</div>
          <div className="text-dim text-xs mt-1">{user?.email}</div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={newProject}
            className="font-mono text-xs uppercase tracking-wide border border-white/20 rounded-full px-4 py-2 hover:bg-foreground hover:text-background transition-colors"
          >
            + New Project
          </button>
          <button
            onClick={() => supabase.auth.signOut()}
            className="font-mono text-xs uppercase tracking-wide text-dim hover:text-foreground transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>

      {loading && <p className="text-dim text-sm">Loading…</p>}

      <div className="grid gap-3">
        {projects.map((p) => (
          <div
            key={p.id}
            className="flex items-center justify-between border border-white/10 rounded px-5 py-4"
          >
            <div>
              <div className="font-medium">{p.title}</div>
              <div className="text-dim text-xs mt-1">
                {p.slug} · {p.category} · {p.year} {p.featured && "· Featured"}
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => editProject(p)}
                className="font-mono text-xs uppercase tracking-wide underline underline-offset-4"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(p.id)}
                className="font-mono text-xs uppercase tracking-wide text-red-400"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {form && (
        <div className="fixed inset-0 z-[60] bg-background/95 overflow-y-auto py-16 px-6">
          <div className="max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <div className="font-display font-bold text-xl">
                {form.id ? "Edit Project" : "New Project"}
              </div>
              <button onClick={() => setForm(null)} className="font-mono text-xs uppercase">
                Close ×
              </button>
            </div>

            <div className="grid gap-4">
              <Field label="Slug (url)" value={form.slug} onChange={(v) => setForm({ ...form, slug: v })} />
              <Field label="Number (e.g. PROJECT 05)" value={form.number} onChange={(v) => setForm({ ...form, number: v })} />
              <Field label="Title" value={form.title} onChange={(v) => setForm({ ...form, title: v })} />
              <Field label="Category" value={form.category} onChange={(v) => setForm({ ...form, category: v })} />
              <Field label="Disciplines (comma separated)" value={form.disciplinesText} onChange={(v) => setForm({ ...form, disciplinesText: v })} />
              <Field label="Year" value={form.year} onChange={(v) => setForm({ ...form, year: v })} />

              <div>
                <label className="text-dim text-xs uppercase font-mono mb-2 block">Video</label>
                <div className="flex gap-3 items-center">
                  <input
                    value={form.video ?? ""}
                    onChange={(e) => setForm({ ...form, video: e.target.value })}
                    className="flex-1 bg-transparent border border-white/20 rounded px-4 py-3 text-sm outline-none"
                    placeholder="/videos/... or upload below"
                  />
                </div>
                <input
                  type="file"
                  accept="video/*,image/*"
                  className="mt-2 text-xs"
                  onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
                />
                {uploading && <p className="text-xs text-dim mt-1">Uploading…</p>}
                {form.video && (
                  <video src={form.video} muted loop className="mt-3 w-full rounded aspect-video object-cover" />
                )}
              </div>

              <div>
                <label className="text-dim text-xs uppercase font-mono mb-2 block">Thumb class</label>
                <select
                  value={form.thumb_class}
                  onChange={(e) => setForm({ ...form, thumb_class: e.target.value })}
                  className="bg-background border border-white/20 rounded px-4 py-3 text-sm"
                >
                  <option value="normal">normal</option>
                  <option value="big">big</option>
                  <option value="wide">wide</option>
                  <option value="tall">tall</option>
                </select>
              </div>

              <div className="flex gap-6">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={!!form.concept} onChange={(e) => setForm({ ...form, concept: e.target.checked })} />
                  Concept project
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={!!form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
                  Featured on homepage
                </label>
              </div>

              <TextArea label="Overview" value={form.overview} onChange={(v) => setForm({ ...form, overview: v })} />
              <TextArea label="Challenge" value={form.challenge} onChange={(v) => setForm({ ...form, challenge: v })} />
              <TextArea label="Direction" value={form.direction} onChange={(v) => setForm({ ...form, direction: v })} />
              <TextArea label="Digital Experience" value={form.digital_experience} onChange={(v) => setForm({ ...form, digital_experience: v })} />
              <TextArea label="Behind the Scenes" value={form.behind_the_scenes} onChange={(v) => setForm({ ...form, behind_the_scenes: v })} />
              <TextArea label="Result" value={form.result} onChange={(v) => setForm({ ...form, result: v })} />
              <Field label="Tools (comma separated)" value={form.toolsText} onChange={(v) => setForm({ ...form, toolsText: v })} />

              <button
                onClick={handleSave}
                disabled={saving}
                className="mt-4 font-mono text-xs uppercase tracking-wide border border-white/20 rounded-full px-6 py-3 hover:bg-foreground hover:text-background transition-colors disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save Project"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Field({ label, value, onChange }: { label: string; value?: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-dim text-xs uppercase font-mono mb-2 block">{label}</label>
      <input
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-transparent border border-white/20 rounded px-4 py-3 text-sm outline-none focus:border-white/50"
      />
    </div>
  )
}

function TextArea({ label, value, onChange }: { label: string; value?: string | null; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-dim text-xs uppercase font-mono mb-2 block">{label}</label>
      <textarea
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className="w-full bg-transparent border border-white/20 rounded px-4 py-3 text-sm outline-none focus:border-white/50"
      />
    </div>
  )
}
