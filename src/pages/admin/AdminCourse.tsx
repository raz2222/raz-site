import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { AdminGate } from "@/components/AdminGate"
import { AdminNav } from "@/components/AdminNav"
import { Field, TextArea, PairListEditor } from "@/components/admin/FieldEditors"
import { cn } from "@/lib/utils"

const TABS = ["שיעורים", "גישות", "הזמנות", "הגדרות"] as const
type Tab = (typeof TABS)[number]

type LessonRow = {
  id: string
  slug: string
  module_no: number
  lesson_no: number
  order_index: number
  title_he: string
  summary_he: string | null
  duration_min: number | null
  is_free: boolean
  published: boolean
  resources: { label: string; url: string }[]
}

type LessonForm = Partial<LessonRow> & { body_he?: string; video_url?: string }

const emptyLesson: LessonForm = {
  slug: "",
  module_no: 0,
  lesson_no: 1,
  order_index: 1,
  title_he: "",
  summary_he: "",
  duration_min: 12,
  is_free: false,
  published: false,
  resources: [],
  body_he: "",
  video_url: "",
}

type AccessRow = {
  user_id: string
  email: string
  status: string
  source: string
  granted_at: string
  expires_at: string | null
}

type OrderRow = {
  id: string
  email: string
  amount_agorot: number
  currency: string
  status: string
  provider: string | null
  note: string | null
  created_at: string
}

type CourseConfigRow = { price_agorot: number; currency: string; checkout_mode: string }
const DEFAULT_CONFIG: CourseConfigRow = { price_agorot: 30000, currency: "ILS", checkout_mode: "manual" }

// ---------------------------------------------------------------- Lessons tab
function LessonsTab() {
  const [lessons, setLessons] = useState<LessonRow[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState<LessonForm | null>(null)
  const [saving, setSaving] = useState(false)

  async function refresh() {
    const { data } = await supabase
      .from("course_lessons")
      .select("id,slug,module_no,lesson_no,order_index,title_he,summary_he,duration_min,is_free,published,resources")
      .order("order_index", { ascending: true })
    setLessons((data as LessonRow[]) ?? [])
    setLoading(false)
  }
  useEffect(() => {
    refresh()
  }, [])

  async function edit(row: LessonRow) {
    const { data } = await supabase
      .from("course_lesson_content")
      .select("body_he,video_url")
      .eq("lesson_id", row.id)
      .maybeSingle()
    setForm({ ...row, body_he: data?.body_he ?? "", video_url: data?.video_url ?? "" })
  }

  async function save() {
    if (!form) return
    setSaving(true)
    const meta = {
      slug: form.slug?.trim(),
      module_no: Number(form.module_no) || 0,
      lesson_no: Number(form.lesson_no) || 1,
      order_index: Number(form.order_index) || 1,
      title_he: form.title_he?.trim(),
      summary_he: form.summary_he?.trim() || null,
      duration_min: form.duration_min ? Number(form.duration_min) : null,
      is_free: !!form.is_free,
      published: !!form.published,
      resources: (form.resources ?? []).filter((r) => r.label.trim() && r.url.trim()),
    }

    let lessonId = form.id
    if (lessonId) {
      const { error } = await supabase.from("course_lessons").update(meta).eq("id", lessonId)
      if (error) {
        setSaving(false)
        return alert(error.message)
      }
    } else {
      const { data, error } = await supabase.from("course_lessons").insert(meta).select("id").single()
      if (error) {
        setSaving(false)
        return alert(error.message)
      }
      lessonId = data.id
    }

    const { error: cErr } = await supabase
      .from("course_lesson_content")
      .upsert(
        { lesson_id: lessonId, slug: meta.slug, body_he: form.body_he ?? "", video_url: form.video_url?.trim() || null },
        { onConflict: "lesson_id" }
      )
    setSaving(false)
    if (cErr) return alert(cErr.message)
    setForm(null)
    refresh()
  }

  async function remove(id: string) {
    if (!confirm("למחוק את השיעור? זה מוחק גם את התוכן וההתקדמות שלו.")) return
    await supabase.from("course_lessons").delete().eq("id", id)
    refresh()
  }

  if (loading) return <p className="text-dim text-sm">טוען…</p>

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <p className="max-w-md text-xs text-dim">
          מקור האמת של תוכן הקורס. body_he ו-video_url יושבים בטבלה נעולה — נחשפים רק
          לבעלים / שיעור חינם / משתמש עם גישה.
        </p>
        <button
          onClick={() => setForm({ ...emptyLesson, order_index: lessons.length + 1 })}
          className="flex-none rounded-full border border-white/30 px-4 py-2 font-mono text-xs uppercase tracking-wide transition-colors hover:bg-foreground hover:text-background"
        >
          + שיעור חדש
        </button>
      </div>

      <div className="grid gap-3">
        {lessons.map((l) => (
          <div key={l.id} className="flex items-center justify-between rounded border border-white/10 px-5 py-4">
            <div className="min-w-0">
              <div className="font-medium">
                <span className="font-mono text-dim">{String(l.order_index).padStart(2, "0")}</span> {l.title_he}
              </div>
              <div className="mt-1 text-xs text-dim">
                {l.slug} · מודול {l.module_no} · {l.is_free ? "חינם" : "נעול"} ·{" "}
                {l.published ? "מפורסם" : "טיוטה"}
              </div>
            </div>
            <div className="flex flex-none gap-3">
              <button onClick={() => edit(l)} className="p-1 font-mono text-xs uppercase underline underline-offset-4">
                Edit
              </button>
              <button onClick={() => remove(l.id)} className="p-1 font-mono text-xs uppercase text-red-400">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {form && (
        <div className="fixed inset-0 z-[60] overflow-y-auto bg-background/95 px-6 py-16">
          <div className="mx-auto max-w-2xl">
            <div className="mb-8 flex items-center justify-between">
              <div className="font-display text-xl font-bold">{form.id ? "עריכת שיעור" : "שיעור חדש"}</div>
              <button onClick={() => setForm(null)} className="-m-2 p-2 font-mono text-xs uppercase">
                Close ×
              </button>
            </div>
            <div className="grid gap-4">
              <Field label="Slug" value={form.slug} onChange={(v) => setForm({ ...form, slug: v })} />
              <div className="grid grid-cols-3 gap-3">
                <Field label="Module no" value={String(form.module_no ?? "")} onChange={(v) => setForm({ ...form, module_no: Number(v) })} />
                <Field label="Lesson no" value={String(form.lesson_no ?? "")} onChange={(v) => setForm({ ...form, lesson_no: Number(v) })} />
                <Field label="Order index" value={String(form.order_index ?? "")} onChange={(v) => setForm({ ...form, order_index: Number(v) })} />
              </div>
              <Field label="כותרת" value={form.title_he} onChange={(v) => setForm({ ...form, title_he: v })} />
              <TextArea label="תקציר" value={form.summary_he} onChange={(v) => setForm({ ...form, summary_he: v })} rows={2} />
              <Field label="משך (דקות)" value={String(form.duration_min ?? "")} onChange={(v) => setForm({ ...form, duration_min: Number(v) })} />
              <Field
                label="Video URL (https://www.youtube-nocookie.com/embed/…)"
                value={form.video_url}
                onChange={(v) => setForm({ ...form, video_url: v })}
              />
              <TextArea label="תוכן (Markdown)" value={form.body_he} onChange={(v) => setForm({ ...form, body_he: v })} rows={14} />
              <PairListEditor
                label="קבצים להורדה"
                items={form.resources ?? []}
                keyA="label"
                keyB="url"
                placeholderA="שם הקובץ"
                placeholderB="/course/resources/…"
                addLabel="+ הוספת קובץ"
                emptyItem={{ label: "", url: "" }}
                onChange={(items) => setForm({ ...form, resources: items })}
              />
              <div className="flex gap-6">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={!!form.is_free} onChange={(e) => setForm({ ...form, is_free: e.target.checked })} />
                  שיעור חינם
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={!!form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} />
                  מפורסם
                </label>
              </div>
              <button
                onClick={save}
                disabled={saving}
                className="mt-2 rounded-full border border-white/30 px-6 py-3 font-mono text-xs uppercase tracking-wide transition-colors hover:bg-foreground hover:text-background disabled:opacity-50"
              >
                {saving ? "שומר…" : "שמירה"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// ---------------------------------------------------------------- Access tab
function AccessTab() {
  const [rows, setRows] = useState<AccessRow[]>([])
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState("")
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  async function refresh() {
    const { data, error } = await supabase.rpc("admin_list_course_access")
    if (error) setMsg(error.message)
    setRows((data as AccessRow[]) ?? [])
    setLoading(false)
  }
  useEffect(() => {
    refresh()
  }, [])

  async function grant() {
    if (!email.trim()) return
    setBusy(true)
    setMsg(null)
    const { error } = await supabase.rpc("admin_grant_course_access", { p_email: email.trim() })
    setBusy(false)
    if (error) return setMsg(error.message)
    setEmail("")
    refresh()
  }

  async function setStatus(user_id: string, status: string) {
    await supabase.rpc("admin_set_course_access_status", { p_user_id: user_id, p_status: status })
    refresh()
  }

  return (
    <>
      <div className="mb-6 flex flex-wrap items-end gap-3">
        <div className="grow">
          <label className="mb-2 block font-mono text-xs uppercase text-dim">הענקת גישה לפי אימייל (משתמש רשום)</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="student@example.com"
            className="w-full rounded border border-white/30 bg-transparent px-4 py-3 text-sm"
          />
        </div>
        <button
          onClick={grant}
          disabled={busy}
          className="rounded-full border border-white/30 px-4 py-3 font-mono text-xs uppercase tracking-wide transition-colors hover:bg-foreground hover:text-background disabled:opacity-50"
        >
          הענקה
        </button>
      </div>
      {msg && <p className="mb-4 text-sm text-red-400">{msg}</p>}

      {loading ? (
        <p className="text-dim text-sm">טוען…</p>
      ) : rows.length === 0 ? (
        <p className="text-dim text-sm">אין עדיין גישות.</p>
      ) : (
        <div className="grid gap-3">
          {rows.map((r) => (
            <div key={r.user_id} className="flex items-center justify-between rounded border border-white/10 px-5 py-4">
              <div className="min-w-0">
                <div className="font-medium">{r.email}</div>
                <div className="mt-1 text-xs text-dim">
                  {r.source} · הוענק {new Date(r.granted_at).toLocaleDateString("he-IL")} ·{" "}
                  <span className={r.status === "active" ? "text-[#D1FE17]" : "text-red-400"}>{r.status}</span>
                </div>
              </div>
              <button
                onClick={() => setStatus(r.user_id, r.status === "active" ? "revoked" : "active")}
                className="flex-none p-1 font-mono text-xs uppercase underline underline-offset-4"
              >
                {r.status === "active" ? "בטל גישה" : "החזר גישה"}
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  )
}

// ---------------------------------------------------------------- Orders tab
function OrdersTab() {
  const [rows, setRows] = useState<OrderRow[]>([])
  const [loading, setLoading] = useState(true)

  async function refresh() {
    const { data } = await supabase
      .from("course_orders")
      .select("id,email,amount_agorot,currency,status,provider,note,created_at")
      .order("created_at", { ascending: false })
    setRows((data as OrderRow[]) ?? [])
    setLoading(false)
  }
  useEffect(() => {
    refresh()
  }, [])

  async function fulfill(id: string) {
    if (!confirm("לאשר את ההזמנה ולפתוח גישה למשתמש?")) return
    const { error } = await supabase.rpc("admin_fulfill_course_order", { p_order_id: id })
    if (error) return alert(error.message)
    refresh()
  }

  if (loading) return <p className="text-dim text-sm">טוען…</p>
  if (rows.length === 0) return <p className="text-dim text-sm">אין הזמנות.</p>

  return (
    <div className="grid gap-3">
      {rows.map((o) => (
        <div key={o.id} className="flex items-center justify-between rounded border border-white/10 px-5 py-4">
          <div className="min-w-0">
            <div className="font-medium">
              {o.email} · ₪{Math.round(o.amount_agorot / 100)}
            </div>
            <div className="mt-1 text-xs text-dim">
              {new Date(o.created_at).toLocaleString("he-IL")} · {o.provider ?? "—"} ·{" "}
              <span className={o.status === "paid" ? "text-[#D1FE17]" : "text-dim"}>{o.status}</span>
              {o.note ? ` · ${o.note}` : ""}
            </div>
          </div>
          {o.status === "pending" && (
            <button
              onClick={() => fulfill(o.id)}
              className="flex-none rounded-full border border-white/30 px-3 py-1.5 font-mono text-xs uppercase tracking-wide transition-colors hover:bg-foreground hover:text-background"
            >
              אשר ופתח גישה
            </button>
          )}
        </div>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------- Settings tab
function SettingsTab() {
  const [config, setConfig] = useState<CourseConfigRow>(DEFAULT_CONFIG)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    supabase
      .from("site_content")
      .select("value")
      .eq("key", "course")
      .maybeSingle()
      .then(({ data }) => {
        if (data?.value && typeof data.value === "object") {
          setConfig({ ...DEFAULT_CONFIG, ...(data.value as Partial<CourseConfigRow>) })
        }
        setLoading(false)
      })
  }, [])

  async function save() {
    setSaving(true)
    setSaved(false)
    const { error } = await supabase
      .from("site_content")
      .upsert({ key: "course", value: config }, { onConflict: "key" })
    setSaving(false)
    if (error) return alert(error.message)
    setSaved(true)
  }

  if (loading) return <p className="text-dim text-sm">טוען…</p>

  return (
    <div className="grid max-w-md gap-4">
      <div>
        <label className="mb-2 block font-mono text-xs uppercase text-dim">מחיר (₪)</label>
        <input
          type="number"
          value={Math.round(config.price_agorot / 100)}
          onChange={(e) => setConfig({ ...config, price_agorot: Math.round(Number(e.target.value) * 100) })}
          className="w-full rounded border border-white/30 bg-transparent px-4 py-3 text-sm"
        />
      </div>
      <div>
        <label className="mb-2 block font-mono text-xs uppercase text-dim">מצב דף התשלום</label>
        <select
          value={config.checkout_mode}
          onChange={(e) => setConfig({ ...config, checkout_mode: e.target.value })}
          className="w-full rounded border border-white/30 bg-background px-4 py-3 text-sm"
        >
          <option value="manual">manual — טופס «שלחו לי קישור תשלום»</option>
          <option value="disabled">disabled — «פתיחה לרכישה בקרוב»</option>
          <option value="provider">provider — סליקה אמיתית (בהמשך)</option>
        </select>
      </div>
      <button
        onClick={save}
        disabled={saving}
        className="mt-2 w-fit rounded-full border border-white/30 px-6 py-3 font-mono text-xs uppercase tracking-wide transition-colors hover:bg-foreground hover:text-background disabled:opacity-50"
      >
        {saving ? "שומר…" : "שמירה"}
      </button>
      {saved && <p className="text-sm text-[#D1FE17]">נשמר.</p>}
    </div>
  )
}

// ---------------------------------------------------------------- shell
function AdminCourseInner() {
  const [tab, setTab] = useState<Tab>("שיעורים")
  return (
    <div className="min-h-[100dvh] px-6 pb-28 pt-28 md:px-12 md:pb-20">
      <AdminNav />
      <div className="mb-10 flex gap-2 overflow-x-auto border-b border-white/10">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "-mb-px flex-none whitespace-nowrap border-b-2 px-4 py-3 font-mono text-xs uppercase tracking-wide transition-colors",
              tab === t ? "border-foreground text-foreground" : "border-transparent text-dim hover:text-foreground"
            )}
          >
            {t}
          </button>
        ))}
      </div>
      {tab === "שיעורים" && <LessonsTab />}
      {tab === "גישות" && <AccessTab />}
      {tab === "הזמנות" && <OrdersTab />}
      {tab === "הגדרות" && <SettingsTab />}
    </div>
  )
}

export function AdminCourse() {
  return (
    <AdminGate>
      <AdminCourseInner />
    </AdminGate>
  )
}
