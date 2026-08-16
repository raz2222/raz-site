import { useEffect, useState } from "react"
import { supabase, type ProjectRow, PROJECT_CATEGORIES } from "@/lib/supabase"
import { useAuth } from "@/hooks/useAuth"
import { useProjects } from "@/hooks/useProjects"
import { cn } from "@/lib/utils"

type FormState = Partial<ProjectRow> & { disciplinesText?: string; techStackText?: string; aiToolsText?: string }

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
  project_type: "ai",
  categories: [],
  techStackText: "",
  aiToolsText: "",
}

type Lead = {
  id: string
  name: string
  email: string
  phone: string | null
  company: string | null
  project_type: string
  budget: string | null
  message: string | null
  status: string
  created_at: string
}

type ContentItem = {
  id: string
  platform: string
  caption: string | null
  media_url: string | null
  status: string
  notes: string | null
  scheduled_for: string | null
}

const TABS = ["פרויקטים", "לידים", "תור תוכן"] as const
type Tab = (typeof TABS)[number]

export function AdminDashboard() {
  const { user } = useAuth()
  const { projects, loading } = useProjects()
  const [tab, setTab] = useState<Tab>("פרויקטים")
  const [form, setForm] = useState<FormState | null>(null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  const [leads, setLeads] = useState<Lead[]>([])
  const [content, setContent] = useState<ContentItem[]>([])
  const [contentForm, setContentForm] = useState<Partial<ContentItem> | null>(null)

  useEffect(() => {
    if (tab === "לידים") {
      supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false })
        .then(({ data }) => setLeads(data ?? []))
    }
    if (tab === "תור תוכן") {
      supabase
        .from("content_queue")
        .select("*")
        .order("created_at", { ascending: false })
        .then(({ data }) => setContent(data ?? []))
    }
  }, [tab])

  async function updateLeadStatus(id: string, status: string) {
    await supabase.from("leads").update({ status }).eq("id", id)
    setLeads((ls) => ls.map((l) => (l.id === id ? { ...l, status } : l)))
  }

  async function saveContentItem() {
    if (!contentForm) return
    const payload = {
      platform: contentForm.platform || "instagram",
      caption: contentForm.caption || null,
      media_url: contentForm.media_url || null,
      status: contentForm.status || "draft",
      notes: contentForm.notes || null,
    }
    if (contentForm.id) {
      await supabase.from("content_queue").update(payload).eq("id", contentForm.id)
    } else {
      await supabase.from("content_queue").insert(payload)
    }
    setContentForm(null)
    const { data } = await supabase.from("content_queue").select("*").order("created_at", { ascending: false })
    setContent(data ?? [])
  }

  async function deleteContentItem(id: string) {
    await supabase.from("content_queue").delete().eq("id", id)
    setContent((c) => c.filter((i) => i.id !== id))
  }

  function editProject(p: ProjectRow) {
    setForm({
      ...p,
      disciplinesText: p.disciplines.join(", "),
      techStackText: p.tech_stack.join(", "),
      aiToolsText: p.ai_tools.join(", "),
    })
  }

  function newProject() {
    setForm({ ...empty })
  }

  const ALLOWED_UPLOAD_TYPES = ["video/mp4", "video/webm", "video/quicktime", "image/jpeg", "image/png", "image/webp"]
  const MAX_UPLOAD_BYTES = 100 * 1024 * 1024

  async function handleUpload(file: File) {
    if (!ALLOWED_UPLOAD_TYPES.includes(file.type)) {
      alert("סוג קובץ לא נתמך. אפשר להעלות MP4 / WebM / MOV / JPG / PNG / WebP בלבד.")
      return
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      alert("הקובץ גדול מדי (מקסימום 100MB).")
      return
    }
    setUploading(true)
    const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_")
    const path = `${Date.now()}-${safeName}`
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
      project_type: form.project_type || "ai",
      categories: form.categories || [],
      tech_stack: (form.techStackText ?? "").split(",").map((s) => s.trim()).filter(Boolean),
      ai_tools: (form.aiToolsText ?? "").split(",").map((s) => s.trim()).filter(Boolean),
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
        <button
          onClick={() => supabase.auth.signOut()}
          className="font-mono text-xs uppercase tracking-wide text-dim hover:text-foreground transition-colors"
        >
          Sign out
        </button>
      </div>

      <div className="flex gap-2 mb-10 border-b border-white/10">
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

      {tab === "פרויקטים" && (
        <>
          <div className="flex justify-end mb-6">
            <button
              onClick={newProject}
              className="font-mono text-xs uppercase tracking-wide border border-white/30 rounded-full px-4 py-2 hover:bg-foreground hover:text-background transition-colors"
            >
              + New Project
            </button>
          </div>
          {loading && <p className="text-dim text-sm">Loading…</p>}
          <div className="grid gap-3">
            {projects.map((p) => (
              <div key={p.id} className="flex items-center justify-between border border-white/10 rounded px-5 py-4">
                <div>
                  <div className="font-medium">{p.title}</div>
                  <div className="text-dim text-xs mt-1">
                    {p.slug} · {p.category} · {p.year} {p.featured && "· Featured"}
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => editProject(p)} className="font-mono text-xs uppercase tracking-wide underline underline-offset-4">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(p.id)} className="font-mono text-xs uppercase tracking-wide text-red-400">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {tab === "לידים" && (
        <div className="grid gap-3">
          {leads.length === 0 && <p className="text-dim text-sm">אין לידים עדיין.</p>}
          {leads.map((l) => (
            <div key={l.id} className="border border-white/10 rounded px-5 py-4">
              <div className="flex justify-between items-start gap-4 mb-2">
                <div>
                  <div className="font-medium">{l.name} {l.company && `· ${l.company}`}</div>
                  <div className="text-dim text-xs mt-1">{l.email} {l.phone && `· ${l.phone}`}</div>
                </div>
                <select
                  value={l.status}
                  onChange={(e) => updateLeadStatus(l.id, e.target.value)}
                  className="bg-background border border-white/30 rounded px-2 py-1 text-xs"
                >
                  <option value="new">חדש</option>
                  <option value="contacted">יצרתי קשר</option>
                  <option value="won">נסגר</option>
                  <option value="lost">לא רלוונטי</option>
                </select>
              </div>
              <div className="text-sm text-dim">
                {l.project_type} {l.budget && `· ${l.budget}`}
              </div>
              {l.message && <p className="text-sm mt-2">{l.message}</p>}
              <div className="text-[10px] text-dim mt-2 font-mono">{new Date(l.created_at).toLocaleString("he-IL")}</div>
            </div>
          ))}
        </div>
      )}

      {tab === "תור תוכן" && (
        <>
          <div className="flex justify-between items-center mb-6">
            <p className="text-dim text-xs max-w-md">
              תכנון פוסטים — אין חיבור חי לרשתות עדיין, זה רק תור לתכנון ותיעוד.
            </p>
            <button
              onClick={() => setContentForm({ platform: "instagram", status: "draft" })}
              className="font-mono text-xs uppercase tracking-wide border border-white/30 rounded-full px-4 py-2 hover:bg-foreground hover:text-background transition-colors"
            >
              + New Item
            </button>
          </div>
          <div className="grid gap-3">
            {content.length === 0 && <p className="text-dim text-sm">אין פריטים בתור.</p>}
            {content.map((c) => (
              <div key={c.id} className="flex items-center justify-between border border-white/10 rounded px-5 py-4">
                <div>
                  <div className="font-medium">{c.platform} · {c.status}</div>
                  <div className="text-dim text-xs mt-1 max-w-md truncate">{c.caption}</div>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setContentForm(c)} className="font-mono text-xs uppercase tracking-wide underline underline-offset-4">
                    Edit
                  </button>
                  <button onClick={() => deleteContentItem(c.id)} className="font-mono text-xs uppercase tracking-wide text-red-400">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {contentForm && (
            <div className="fixed inset-0 z-[60] bg-background/95 overflow-y-auto py-16 px-6">
              <div className="max-w-xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                  <div className="font-display font-bold text-xl">{contentForm.id ? "Edit" : "New"} Content Item</div>
                  <button onClick={() => setContentForm(null)} className="font-mono text-xs uppercase">Close ×</button>
                </div>
                <div className="grid gap-4">
                  <div>
                    <label className="text-dim text-xs uppercase font-mono mb-2 block">Platform</label>
                    <select
                      value={contentForm.platform}
                      onChange={(e) => setContentForm({ ...contentForm, platform: e.target.value })}
                      className="bg-background border border-white/30 rounded px-4 py-3 text-sm w-full"
                    >
                      <option value="instagram">Instagram</option>
                      <option value="tiktok">TikTok</option>
                      <option value="linkedin">LinkedIn</option>
                    </select>
                  </div>
                  <Field label="Media URL" value={contentForm.media_url ?? ""} onChange={(v) => setContentForm({ ...contentForm, media_url: v })} />
                  <TextArea label="Caption" value={contentForm.caption} onChange={(v) => setContentForm({ ...contentForm, caption: v })} />
                  <TextArea label="Notes" value={contentForm.notes} onChange={(v) => setContentForm({ ...contentForm, notes: v })} />
                  <div>
                    <label className="text-dim text-xs uppercase font-mono mb-2 block">Status</label>
                    <select
                      value={contentForm.status}
                      onChange={(e) => setContentForm({ ...contentForm, status: e.target.value })}
                      className="bg-background border border-white/30 rounded px-4 py-3 text-sm w-full"
                    >
                      <option value="draft">Draft</option>
                      <option value="ready">Ready</option>
                      <option value="posted">Posted</option>
                    </select>
                  </div>
                  <button
                    onClick={saveContentItem}
                    className="mt-2 font-mono text-xs uppercase tracking-wide border border-white/30 rounded-full px-6 py-3 hover:bg-foreground hover:text-background transition-colors"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

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
                    className="flex-1 bg-transparent border border-white/30 rounded px-4 py-3 text-sm focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
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
                  className="bg-background border border-white/30 rounded px-4 py-3 text-sm"
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

              <div>
                <label className="text-dim text-xs uppercase font-mono mb-2 block">Project type (picks the case study template)</label>
                <select
                  value={form.project_type}
                  onChange={(e) => setForm({ ...form, project_type: e.target.value as "website" | "ai" })}
                  className="bg-background border border-white/30 rounded px-4 py-3 text-sm"
                >
                  <option value="ai">AI project</option>
                  <option value="website">Website</option>
                </select>
              </div>

              <div>
                <label className="text-dim text-xs uppercase font-mono mb-2 block">Categories (עבודות filter — can pick more than one)</label>
                <div className="flex flex-wrap gap-3">
                  {PROJECT_CATEGORIES.map((c) => {
                    const checked = form.categories?.includes(c) ?? false
                    return (
                      <label key={c} className="flex items-center gap-2 text-sm border border-white/20 rounded-full px-3 py-1.5">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            const current = form.categories ?? []
                            setForm({
                              ...form,
                              categories: e.target.checked ? [...current, c] : current.filter((x) => x !== c),
                            })
                          }}
                        />
                        {c}
                      </label>
                    )
                  })}
                </div>
              </div>

              <TextArea label="Overview" value={form.overview} onChange={(v) => setForm({ ...form, overview: v })} />
              <TextArea label="Challenge / Brief" value={form.challenge} onChange={(v) => setForm({ ...form, challenge: v })} />
              <TextArea label="Direction / Concept" value={form.direction} onChange={(v) => setForm({ ...form, direction: v })} />
              <TextArea label="Digital Experience / Creative Direction" value={form.digital_experience} onChange={(v) => setForm({ ...form, digital_experience: v })} />
              <TextArea label="Behind the Scenes / Production" value={form.behind_the_scenes} onChange={(v) => setForm({ ...form, behind_the_scenes: v })} />
              <TextArea label="Result" value={form.result} onChange={(v) => setForm({ ...form, result: v })} />
              <Field label="Tech Stack — web tools (comma separated)" value={form.techStackText} onChange={(v) => setForm({ ...form, techStackText: v })} />
              <Field label="AI Tools & Models (comma separated)" value={form.aiToolsText} onChange={(v) => setForm({ ...form, aiToolsText: v })} />

              <button
                onClick={handleSave}
                disabled={saving}
                className="mt-4 font-mono text-xs uppercase tracking-wide border border-white/30 rounded-full px-6 py-3 hover:bg-foreground hover:text-background transition-colors disabled:opacity-50"
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
        className="w-full bg-transparent border border-white/30 rounded px-4 py-3 text-sm focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:border-white/50"
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
        className="w-full bg-transparent border border-white/30 rounded px-4 py-3 text-sm focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:border-white/50"
      />
    </div>
  )
}
