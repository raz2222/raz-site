import { useEffect, useState } from "react"
import { Pencil, Trash2 } from "lucide-react"
import { supabase, type ProjectRow, type AdminNotificationRow, PROJECT_CATEGORIES } from "@/lib/supabase"
import { useProjects } from "@/hooks/useProjects"
import { AdminNav } from "@/components/AdminNav"
import { AdminModalShell } from "@/components/admin/AdminModalShell"
import { RowActions } from "@/components/admin/RowActions"
import { Field, TextArea, StringListEditor, PairListEditor } from "@/components/admin/FieldEditors"
import { OverviewTab } from "@/pages/admin/dashboard/OverviewTab"
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
  duration: "",
  client_name: "",
  live_url: "",
  challenges: [],
  solutions: [],
  results: [],
  testimonial_quote: "",
  testimonial_author: "",
  testimonial_role: "",
  project_type: "ai",
  categories: [],
  techStackText: "",
  aiToolsText: "",
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

const TABS = ["סקירה", "פרויקטים", "תור תוכן", "כלי AI", "התראות"] as const
type Tab = (typeof TABS)[number]

const IMAGE_CONTEXTS = [
  { value: "service", label: "שירות (hub)" },
  { value: "sub-service", label: "תת-שירות" },
  { value: "guide", label: "כתבת מדריך" },
  { value: "project", label: "פרויקט" },
] as const

export function AdminDashboard() {
  const { projects, loading } = useProjects()
  const [tab, setTab] = useState<Tab>("סקירה")
  const [form, setForm] = useState<FormState | null>(null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  const [content, setContent] = useState<ContentItem[]>([])
  const [contentForm, setContentForm] = useState<Partial<ContentItem> | null>(null)

  const [imgSubject, setImgSubject] = useState("")
  const [imgContext, setImgContext] = useState<(typeof IMAGE_CONTEXTS)[number]["value"]>("guide")
  const [imgLoading, setImgLoading] = useState(false)
  const [imgError, setImgError] = useState<string | null>(null)
  const [imgResult, setImgResult] = useState<string | null>(null)

  const [notifications, setNotifications] = useState<AdminNotificationRow[]>([])

  useEffect(() => {
    if (tab === "תור תוכן") {
      supabase
        .from("content_queue")
        .select("*")
        .order("created_at", { ascending: false })
        .then(({ data }) => setContent(data ?? []))
    }
  }, [tab])

  useEffect(() => {
    supabase
      .from("admin_notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => setNotifications(data ?? []))
  }, [])

  async function markNotificationRead(id: string) {
    await supabase.from("admin_notifications").update({ read: true }).eq("id", id)
    setNotifications((ns) => ns.map((n) => (n.id === id ? { ...n, read: true } : n)))
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
      duration: form.duration || null,
      client_name: form.client_name || null,
      live_url: form.live_url || null,
      challenges: (form.challenges ?? []).filter((c) => c.title.trim() || c.description.trim()),
      solutions: (form.solutions ?? []).filter((s) => s.title.trim() || s.description.trim()),
      results: (form.results ?? []).filter((r) => r.trim()),
      testimonial_quote: form.testimonial_quote || null,
      testimonial_author: form.testimonial_author || null,
      testimonial_role: form.testimonial_role || null,
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

  async function generateImage() {
    if (!imgSubject.trim()) return
    setImgLoading(true)
    setImgError(null)
    setImgResult(null)
    try {
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: imgSubject.trim(), context: imgContext }),
      })
      const data = await res.json()
      if (!res.ok) {
        setImgError(data?.error ?? "שגיאה לא ידועה")
        return
      }
      setImgResult(data.image)
    } catch (err) {
      setImgError(String(err))
    } finally {
      setImgLoading(false)
    }
  }

  return (
    <div className="min-h-[100dvh] pt-28 pb-28 md:pb-20 px-6 md:px-12">
      <AdminNav />

      <div className="flex gap-2 mb-10 border-b border-white/10 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "font-mono text-xs uppercase tracking-wide px-4 py-3 border-b-2 -mb-px transition-colors whitespace-nowrap flex-none",
              tab === t ? "border-foreground text-foreground" : "border-transparent text-dim hover:text-foreground"
            )}
          >
            {t}
            {t === "התראות" && notifications.some((n) => !n.read) && (
              <span className="mr-1.5 inline-block w-1.5 h-1.5 rounded-full bg-lime" />
            )}
          </button>
        ))}
      </div>

      {tab === "סקירה" && <OverviewTab />}

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
              <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 border border-white/10 rounded px-5 py-4">
                <div className="min-w-0">
                  <div className="font-medium truncate">{p.title}</div>
                  <div className="text-dim text-xs mt-1">
                    {p.slug} · {p.category} · {p.year} {p.featured && "· Featured"}
                  </div>
                </div>
                <RowActions
                  actions={[
                    { icon: Pencil, label: "Edit", onClick: () => editProject(p) },
                    { icon: Trash2, label: "Delete", onClick: () => handleDelete(p.id), variant: "danger" },
                  ]}
                />
              </div>
            ))}
          </div>
        </>
      )}

      {tab === "תור תוכן" && (
        <>
          <div className="flex justify-between items-center mb-6">
            <p className="text-dim text-xs max-w-md">
              תכנון פוסטים: אין חיבור חי לרשתות עדיין, זה רק תור לתכנון ותיעוד.
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
              <div key={c.id} className="flex flex-wrap items-center justify-between gap-3 border border-white/10 rounded px-5 py-4">
                <div className="min-w-0">
                  <div className="font-medium">{c.platform} · {c.status}</div>
                  <div className="text-dim text-xs mt-1 max-w-md truncate">{c.caption}</div>
                </div>
                <RowActions
                  actions={[
                    { icon: Pencil, label: "Edit", onClick: () => setContentForm(c) },
                    { icon: Trash2, label: "Delete", onClick: () => deleteContentItem(c.id), variant: "danger" },
                  ]}
                />
              </div>
            ))}
          </div>

          {contentForm && (
            <AdminModalShell title={`${contentForm.id ? "Edit" : "New"} Content Item`} onClose={() => setContentForm(null)}>
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
            </AdminModalShell>
          )}
        </>
      )}

      {tab === "כלי AI" && (
        <div className="max-w-xl">
          <p className="text-dim text-xs mb-6 max-w-md">
            יצירת תמונה חד-פעמית באמצעות OpenAI: לשימוש ידני (למשל כשאין עדיין מדיה אמיתית לכתבה או
            לתת-שירות). לא מתחבר אוטומטית לשום עמוד באתר. אתה מוריד ומעלה בעצמך איפה שצריך.
          </p>
          <div className="grid gap-4">
            <Field label="נושא (Subject)" value={imgSubject} onChange={setImgSubject} />
            <div>
              <label className="text-dim text-xs uppercase font-mono mb-2 block">סוג תוכן</label>
              <select
                value={imgContext}
                onChange={(e) => setImgContext(e.target.value as typeof imgContext)}
                className="bg-background border border-white/30 rounded px-4 py-3 text-sm"
              >
                {IMAGE_CONTEXTS.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <button
              onClick={generateImage}
              disabled={imgLoading || !imgSubject.trim()}
              className="font-mono text-xs uppercase tracking-wide border border-white/30 rounded-full px-6 py-3 hover:bg-foreground hover:text-background transition-colors disabled:opacity-50 w-fit"
            >
              {imgLoading ? "מייצר…" : "צור תמונה"}
            </button>
            {imgError && <p className="text-sm text-red-400">{imgError}</p>}
            {imgResult && (
              <div>
                <img src={imgResult} alt={imgSubject} loading="lazy" className="w-full rounded-lg border border-white/10" />
                <a
                  href={imgResult}
                  download={`${imgSubject.trim().replace(/\s+/g, "-")}.png`}
                  className="inline-block mt-3 font-mono text-xs uppercase tracking-wide underline underline-offset-4 p-1 -m-1"
                >
                  הורדה ←
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === "התראות" && (
        <div className="max-w-xl">
          <p className="text-dim text-xs mb-6 max-w-md">
            תזכורות שהמערכת זיהתה שדורשות פעולה ידנית שלך — בעיקר שליחת תזכורת וואטסאפ ללקוח שלא ענה על הצעת מחיר.
          </p>
          {notifications.length === 0 && <p className="text-dim text-sm">אין התראות.</p>}
          <div className="grid gap-3">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={cn("border rounded-lg px-5 py-4 flex items-start justify-between gap-4", n.read ? "border-white/10 opacity-50" : "border-lime/30")}
              >
                <div>
                  <div className="text-sm">{n.message}</div>
                  <div className="text-dim text-[10px] mt-2 font-mono">{new Date(n.created_at).toLocaleString("he-IL")}</div>
                </div>
                {!n.read && (
                  <button
                    onClick={() => markNotificationRead(n.id)}
                    className="font-mono text-[10px] uppercase tracking-wide border border-white/30 rounded-full px-3 py-1.5 hover:border-lime transition-colors flex-none"
                  >
                    סימון כטופל
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {form && (
        <AdminModalShell title={form.id ? "Edit Project" : "New Project"} onClose={() => setForm(null)} maxWidth="max-w-2xl">
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
                <label className="text-dim text-xs uppercase font-mono mb-2 block">Categories (עבודות filter, can pick more than one)</label>
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
              <Field label="Duration (e.g. כשבועיים)" value={form.duration ?? ""} onChange={(v) => setForm({ ...form, duration: v })} />
              <Field label="Client name" value={form.client_name ?? ""} onChange={(v) => setForm({ ...form, client_name: v })} />
              <Field label="Live project URL (optional)" value={form.live_url ?? ""} onChange={(v) => setForm({ ...form, live_url: v })} />

              <PairListEditor
                label="Challenges (אתגרים)"
                items={form.challenges ?? []}
                keyA="title"
                keyB="description"
                placeholderA="כותרת"
                placeholderB="תיאור"
                addLabel="+ הוספת פריט"
                emptyItem={{ title: "", description: "" }}
                onChange={(items) => setForm({ ...form, challenges: items })}
              />
              <PairListEditor
                label="Solutions (פתרונות)"
                items={form.solutions ?? []}
                keyA="title"
                keyB="description"
                placeholderA="כותרת"
                placeholderB="תיאור"
                addLabel="+ הוספת פריט"
                emptyItem={{ title: "", description: "" }}
                onChange={(items) => setForm({ ...form, solutions: items })}
              />
              <StringListEditor
                label="Results (תוצאות)"
                items={form.results ?? []}
                onChange={(items) => setForm({ ...form, results: items })}
              />

              <Field label="Tech Stack · web tools (comma separated)" value={form.techStackText} onChange={(v) => setForm({ ...form, techStackText: v })} />
              <Field label="AI Tools & Models (comma separated)" value={form.aiToolsText} onChange={(v) => setForm({ ...form, aiToolsText: v })} />

              <TextArea label="Testimonial quote (optional, only real testimonials)" value={form.testimonial_quote} onChange={(v) => setForm({ ...form, testimonial_quote: v })} />
              <Field label="Testimonial author" value={form.testimonial_author ?? ""} onChange={(v) => setForm({ ...form, testimonial_author: v })} />
              <Field label="Testimonial role" value={form.testimonial_role ?? ""} onChange={(v) => setForm({ ...form, testimonial_role: v })} />

              <button
                onClick={handleSave}
                disabled={saving}
                className="mt-4 font-mono text-xs uppercase tracking-wide border border-white/30 rounded-full px-6 py-3 hover:bg-foreground hover:text-background transition-colors disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save Project"}
              </button>
            </div>
        </AdminModalShell>
      )}
    </div>
  )
}

