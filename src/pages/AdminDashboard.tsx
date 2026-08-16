import { useEffect, useState } from "react"
import { supabase, type ProjectRow, type QuoteRow, type QuoteLineItem, type QuoteSignatureRow, PROJECT_CATEGORIES } from "@/lib/supabase"
import { useProjects } from "@/hooks/useProjects"
import { AdminNav } from "@/components/AdminNav"
import { Field, TextArea, StringListEditor, PairListEditor } from "@/components/admin/FieldEditors"
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

const TABS = ["פרויקטים", "לידים", "הצעות מחיר", "תור תוכן", "כלי AI"] as const
type Tab = (typeof TABS)[number]

type QuoteFormState = {
  id?: string
  lead_id?: string | null
  client_name: string
  client_email: string
  title: string
  currency: string
  status: QuoteRow["status"]
  notes: string
  line_items: QuoteLineItem[]
}

const emptyQuote: QuoteFormState = {
  client_name: "",
  client_email: "",
  title: "",
  currency: "ILS",
  status: "draft",
  notes: "",
  line_items: [{ label: "", description: "", price: 0 }],
}

const IMAGE_CONTEXTS = [
  { value: "service", label: "שירות (hub)" },
  { value: "sub-service", label: "תת-שירות" },
  { value: "guide", label: "כתבת מדריך" },
  { value: "project", label: "פרויקט" },
] as const

export function AdminDashboard() {
  const { projects, loading } = useProjects()
  const [tab, setTab] = useState<Tab>("פרויקטים")
  const [form, setForm] = useState<FormState | null>(null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  const [leads, setLeads] = useState<Lead[]>([])
  const [content, setContent] = useState<ContentItem[]>([])
  const [contentForm, setContentForm] = useState<Partial<ContentItem> | null>(null)

  const [quotes, setQuotes] = useState<QuoteRow[]>([])
  const [signatures, setSignatures] = useState<Record<string, QuoteSignatureRow>>({})
  const [quoteForm, setQuoteForm] = useState<QuoteFormState | null>(null)
  const [savingQuote, setSavingQuote] = useState(false)
  const [creatingFolderFor, setCreatingFolderFor] = useState<string | null>(null)

  const [imgSubject, setImgSubject] = useState("")
  const [imgContext, setImgContext] = useState<(typeof IMAGE_CONTEXTS)[number]["value"]>("guide")
  const [imgLoading, setImgLoading] = useState(false)
  const [imgError, setImgError] = useState<string | null>(null)
  const [imgResult, setImgResult] = useState<string | null>(null)

  useEffect(() => {
    if (tab === "לידים" || tab === "הצעות מחיר") {
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
    if (tab === "הצעות מחיר") {
      refreshQuotes()
    }
  }, [tab])

  async function refreshQuotes() {
    const [{ data: q }, { data: s }] = await Promise.all([
      supabase.from("quotes").select("*").order("created_at", { ascending: false }),
      supabase.from("quote_signatures").select("*"),
    ])
    setQuotes(q ?? [])
    setSignatures(Object.fromEntries((s ?? []).map((sig) => [sig.quote_id, sig])))
  }

  function editQuote(q: QuoteRow) {
    setQuoteForm({
      id: q.id,
      lead_id: q.lead_id,
      client_name: q.client_name,
      client_email: q.client_email,
      title: q.title,
      currency: q.currency,
      status: q.status,
      notes: q.notes ?? "",
      line_items: q.line_items.length > 0 ? q.line_items : [{ label: "", description: "", price: 0 }],
    })
  }

  function newQuote() {
    setQuoteForm({ ...emptyQuote, line_items: [{ label: "", description: "", price: 0 }] })
  }

  function quoteTotal(items: QuoteLineItem[]) {
    return items.reduce((sum, it) => sum + (Number(it.price) || 0), 0)
  }

  async function handleSaveQuote() {
    if (!quoteForm) return
    setSavingQuote(true)
    const payload = {
      lead_id: quoteForm.lead_id || null,
      client_name: quoteForm.client_name,
      client_email: quoteForm.client_email,
      title: quoteForm.title,
      currency: quoteForm.currency,
      status: quoteForm.status,
      notes: quoteForm.notes || null,
      line_items: quoteForm.line_items.filter((it) => it.label.trim()),
      total: quoteTotal(quoteForm.line_items),
    }
    const { error } = quoteForm.id
      ? await supabase.from("quotes").update(payload).eq("id", quoteForm.id)
      : await supabase.from("quotes").insert(payload)

    setSavingQuote(false)
    if (error) {
      alert(error.message)
      return
    }
    setQuoteForm(null)
    refreshQuotes()
  }

  async function handleDeleteQuote(id: string) {
    if (!confirm("למחוק את ההצעה?")) return
    await supabase.from("quotes").delete().eq("id", id)
    refreshQuotes()
  }

  async function handleCreateFolder(q: QuoteRow) {
    setCreatingFolderFor(q.id)
    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData.session?.access_token
      if (!token) {
        alert("צריך להתחבר מחדש.")
        return
      }
      const res = await fetch("/api/create-client-folder", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ folderName: `${q.client_name} — ${q.title}` }),
      })
      const data = await res.json()
      if (!res.ok) {
        alert(data?.error ?? "שגיאה ביצירת התיקייה");
        return
      }
      await supabase.from("quotes").update({ drive_folder_url: data.folderUrl }).eq("id", q.id)
      refreshQuotes()
    } finally {
      setCreatingFolderFor(null)
    }
  }

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
    <div className="min-h-[100dvh] pt-28 pb-20 px-6 md:px-12">
      <AdminNav />

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

      {tab === "הצעות מחיר" && (
        <>
          <div className="flex justify-between items-center mb-6">
            <p className="text-dim text-xs max-w-md">
              יצירת הצעת מחיר ללקוח, שהוא רואה ויכול לחתום עליה בפורטל שלו (/portal) אחרי התחברות עם
              אותו אימייל שהוזן כאן. אין חיבור לסליקה — התשלום עצמו מתואם בנפרד.
            </p>
            <button
              onClick={newQuote}
              className="font-mono text-xs uppercase tracking-wide border border-white/30 rounded-full px-4 py-2 hover:bg-foreground hover:text-background transition-colors flex-none"
            >
              + הצעה חדשה
            </button>
          </div>
          <div className="grid gap-3">
            {quotes.length === 0 && <p className="text-dim text-sm">אין הצעות מחיר עדיין.</p>}
            {quotes.map((q) => {
              const sig = signatures[q.id]
              return (
                <div key={q.id} className="border border-white/10 rounded px-5 py-4">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <div className="font-medium">{q.title}</div>
                      <div className="text-dim text-xs mt-1">{q.client_name} · {q.client_email}</div>
                      <div className="text-dim text-xs mt-1 font-mono">
                        {q.total.toLocaleString("he-IL")} {q.currency === "ILS" ? "₪" : q.currency}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="font-mono text-[11px] uppercase tracking-wide border border-white/20 rounded-full px-3 py-1">
                        {sig ? "נחתם" : q.status}
                      </span>
                      <div className="flex gap-3">
                        <button onClick={() => editQuote(q)} className="font-mono text-xs uppercase tracking-wide underline underline-offset-4">
                          Edit
                        </button>
                        <button onClick={() => handleDeleteQuote(q.id)} className="font-mono text-xs uppercase tracking-wide text-red-400">
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                  {sig && (
                    <div className="text-[10px] text-dim mt-3 font-mono">
                      נחתם ע"י {sig.full_name} · {new Date(sig.signed_at).toLocaleString("he-IL")} {sig.ip_address && `· IP ${sig.ip_address}`}
                    </div>
                  )}
                  <div className="text-[10px] text-dim mt-2 font-mono break-all">
                    {window.location.origin}/portal/quote/{q.id}
                  </div>
                  <div className="mt-3">
                    {q.drive_folder_url ? (
                      <a
                        href={q.drive_folder_url}
                        target="_blank"
                        rel="noreferrer"
                        className="font-mono text-xs uppercase tracking-wide underline underline-offset-4 hover:text-[#D1FE17] transition-colors"
                      >
                        📁 תיקיית הלקוח ←
                      </a>
                    ) : (
                      <button
                        onClick={() => handleCreateFolder(q)}
                        disabled={creatingFolderFor === q.id}
                        className="font-mono text-xs uppercase tracking-wide border border-white/20 rounded-full px-3 py-1.5 hover:border-[#D1FE17] transition-colors disabled:opacity-50"
                      >
                        {creatingFolderFor === q.id ? "יוצר תיקייה…" : "+ צור תיקיית Drive"}
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </>
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

      {tab === "כלי AI" && (
        <div className="max-w-xl">
          <p className="text-dim text-xs mb-6 max-w-md">
            יצירת תמונה חד-פעמית באמצעות OpenAI — לשימוש ידני (למשל כשאין עדיין מדיה אמיתית לכתבה או
            לתת-שירות). לא מתחבר אוטומטית לשום עמוד באתר — אתה מוריד ומעלה בעצמך איפה שצריך.
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
                <img src={imgResult} alt={imgSubject} className="w-full rounded-lg border border-white/10" />
                <a
                  href={imgResult}
                  download={`${imgSubject.trim().replace(/\s+/g, "-")}.png`}
                  className="inline-block mt-3 font-mono text-xs uppercase tracking-wide underline underline-offset-4"
                >
                  הורדה ←
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {quoteForm && (
        <div className="fixed inset-0 z-[60] bg-background/95 overflow-y-auto py-16 px-6">
          <div className="max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <div className="font-display font-bold text-xl">{quoteForm.id ? "עריכת הצעה" : "הצעה חדשה"}</div>
              <button onClick={() => setQuoteForm(null)} className="font-mono text-xs uppercase">Close ×</button>
            </div>

            <div className="grid gap-4">
              {leads.length > 0 && (
                <div>
                  <label className="text-dim text-xs uppercase font-mono mb-2 block">קישור לליד (אופציונלי)</label>
                  <select
                    value={quoteForm.lead_id ?? ""}
                    onChange={(e) => {
                      const lead = leads.find((l) => l.id === e.target.value)
                      setQuoteForm({
                        ...quoteForm,
                        lead_id: e.target.value || null,
                        client_name: lead?.name ?? quoteForm.client_name,
                        client_email: lead?.email ?? quoteForm.client_email,
                      })
                    }}
                    className="bg-background border border-white/30 rounded px-4 py-3 text-sm w-full"
                  >
                    <option value="">— ללא —</option>
                    {leads.map((l) => (
                      <option key={l.id} value={l.id}>{l.name} · {l.email}</option>
                    ))}
                  </select>
                </div>
              )}
              <Field label="שם לקוח" value={quoteForm.client_name} onChange={(v) => setQuoteForm({ ...quoteForm, client_name: v })} />
              <Field label="אימייל לקוח (משמש להתחברות לפורטל)" value={quoteForm.client_email} onChange={(v) => setQuoteForm({ ...quoteForm, client_email: v })} />
              <Field label="כותרת ההצעה" value={quoteForm.title} onChange={(v) => setQuoteForm({ ...quoteForm, title: v })} />

              <div>
                <label className="text-dim text-xs uppercase font-mono mb-2 block">סעיפי ההצעה</label>
                <div className="grid gap-3">
                  {quoteForm.line_items.map((item, i) => (
                    <div key={i} className="border border-white/10 rounded p-3 grid gap-2">
                      <div className="flex gap-2">
                        <input
                          value={item.label}
                          onChange={(e) => {
                            const items = [...quoteForm.line_items]
                            items[i] = { ...items[i], label: e.target.value }
                            setQuoteForm({ ...quoteForm, line_items: items })
                          }}
                          placeholder="שם הסעיף"
                          className="flex-1 bg-transparent border border-white/30 rounded px-3 py-2 text-sm"
                        />
                        <input
                          type="number"
                          value={item.price}
                          onChange={(e) => {
                            const items = [...quoteForm.line_items]
                            items[i] = { ...items[i], price: Number(e.target.value) }
                            setQuoteForm({ ...quoteForm, line_items: items })
                          }}
                          placeholder="מחיר"
                          className="w-28 bg-transparent border border-white/30 rounded px-3 py-2 text-sm"
                        />
                        <button
                          onClick={() => {
                            const items = quoteForm.line_items.filter((_, idx) => idx !== i)
                            setQuoteForm({ ...quoteForm, line_items: items.length ? items : [{ label: "", description: "", price: 0 }] })
                          }}
                          className="text-red-400 text-xs px-2"
                        >
                          ✕
                        </button>
                      </div>
                      <input
                        value={item.description ?? ""}
                        onChange={(e) => {
                          const items = [...quoteForm.line_items]
                          items[i] = { ...items[i], description: e.target.value }
                          setQuoteForm({ ...quoteForm, line_items: items })
                        }}
                        placeholder="תיאור (אופציונלי)"
                        className="bg-transparent border border-white/20 rounded px-3 py-2 text-xs"
                      />
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setQuoteForm({ ...quoteForm, line_items: [...quoteForm.line_items, { label: "", description: "", price: 0 }] })}
                  className="mt-3 font-mono text-xs uppercase tracking-wide underline underline-offset-4 hover:text-[#D1FE17] transition-colors"
                >
                  + הוספת סעיף
                </button>
                <div className="mt-3 text-sm font-medium">
                  סה"כ: {quoteTotal(quoteForm.line_items).toLocaleString("he-IL")} {quoteForm.currency === "ILS" ? "₪" : quoteForm.currency}
                </div>
              </div>

              <TextArea label="הערות (מוצג ללקוח)" value={quoteForm.notes} onChange={(v) => setQuoteForm({ ...quoteForm, notes: v })} />

              <div>
                <label className="text-dim text-xs uppercase font-mono mb-2 block">סטטוס</label>
                <select
                  value={quoteForm.status}
                  onChange={(e) => setQuoteForm({ ...quoteForm, status: e.target.value as QuoteRow["status"] })}
                  className="bg-background border border-white/30 rounded px-4 py-3 text-sm"
                >
                  <option value="draft">טיוטה</option>
                  <option value="sent">נשלח ללקוח</option>
                  <option value="declined">נדחה</option>
                </select>
              </div>

              <button
                onClick={handleSaveQuote}
                disabled={savingQuote || !quoteForm.client_name || !quoteForm.client_email || !quoteForm.title}
                className="mt-4 font-mono text-xs uppercase tracking-wide border border-white/30 rounded-full px-6 py-3 hover:bg-foreground hover:text-background transition-colors disabled:opacity-50"
              >
                {savingQuote ? "שומר…" : "שמירת הצעה"}
              </button>
            </div>
          </div>
        </div>
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

              <Field label="Tech Stack — web tools (comma separated)" value={form.techStackText} onChange={(v) => setForm({ ...form, techStackText: v })} />
              <Field label="AI Tools & Models (comma separated)" value={form.aiToolsText} onChange={(v) => setForm({ ...form, aiToolsText: v })} />

              <TextArea label="Testimonial quote (optional — only real testimonials)" value={form.testimonial_quote} onChange={(v) => setForm({ ...form, testimonial_quote: v })} />
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
          </div>
        </div>
      )}
    </div>
  )
}

