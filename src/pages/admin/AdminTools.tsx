import { useEffect, useState } from "react"
import { Pencil, Trash2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { AdminGate } from "@/components/AdminGate"
import { AdminNav } from "@/components/AdminNav"
import { AdminModalShell } from "@/components/admin/AdminModalShell"
import { RowActions } from "@/components/admin/RowActions"
import { Field, TextArea } from "@/components/admin/FieldEditors"
import { cn } from "@/lib/utils"

type ContentItem = {
  id: string
  platform: string
  caption: string | null
  media_url: string | null
  status: string
  notes: string | null
  scheduled_for: string | null
}

const IMAGE_CONTEXTS = [
  { value: "service", label: "שירות (hub)" },
  { value: "sub-service", label: "תת-שירות" },
  { value: "guide", label: "כתבת מדריך" },
  { value: "project", label: "פרויקט" },
] as const

const TABS = ["תור תוכן", "יצירת תמונה"] as const
type Tab = (typeof TABS)[number]

function ContentQueue() {
  const [content, setContent] = useState<ContentItem[]>([])
  const [form, setForm] = useState<Partial<ContentItem> | null>(null)

  async function refresh() {
    const { data } = await supabase.from("content_queue").select("*").order("created_at", { ascending: false })
    setContent(data ?? [])
  }

  useEffect(() => {
    refresh()
  }, [])

  async function save() {
    if (!form) return
    const payload = {
      platform: form.platform || "instagram",
      caption: form.caption || null,
      media_url: form.media_url || null,
      status: form.status || "draft",
      notes: form.notes || null,
    }
    if (form.id) await supabase.from("content_queue").update(payload).eq("id", form.id)
    else await supabase.from("content_queue").insert(payload)
    setForm(null)
    refresh()
  }

  async function remove(id: string) {
    await supabase.from("content_queue").delete().eq("id", id)
    setContent((c) => c.filter((i) => i.id !== id))
  }

  return (
    <>
      <div className="flex justify-between items-center gap-4 flex-wrap mb-6">
        <p className="text-dim text-xs max-w-md">
          תכנון פוסטים: אין חיבור חי לרשתות, זה תור לתכנון ולתיעוד.
        </p>
        <button
          onClick={() => setForm({ platform: "instagram", status: "draft" })}
          className="font-mono text-xs uppercase tracking-wide border border-white/30 rounded-full px-4 py-2 hover:bg-foreground hover:text-background transition-colors"
        >
          + פריט חדש
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
                { icon: Pencil, label: "עריכה", onClick: () => setForm(c) },
                { icon: Trash2, label: "מחיקה", onClick: () => remove(c.id), variant: "danger" },
              ]}
            />
          </div>
        ))}
      </div>

      {form && (
        <AdminModalShell title={form.id ? "עריכת פריט" : "פריט חדש"} onClose={() => setForm(null)}>
          <div className="grid gap-4">
            <div>
              <label className="text-dim text-xs uppercase font-mono mb-2 block">פלטפורמה</label>
              <select
                value={form.platform}
                onChange={(e) => setForm({ ...form, platform: e.target.value })}
                className="bg-background border border-white/30 rounded px-4 py-3 text-sm w-full"
              >
                <option value="instagram">Instagram</option>
                <option value="tiktok">TikTok</option>
                <option value="linkedin">LinkedIn</option>
              </select>
            </div>
            <Field label="Media URL" value={form.media_url ?? ""} onChange={(v) => setForm({ ...form, media_url: v })} />
            <TextArea label="קופי" value={form.caption} onChange={(v) => setForm({ ...form, caption: v })} />
            <TextArea label="הערות" value={form.notes} onChange={(v) => setForm({ ...form, notes: v })} />
            <div>
              <label className="text-dim text-xs uppercase font-mono mb-2 block">סטטוס</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="bg-background border border-white/30 rounded px-4 py-3 text-sm w-full"
              >
                <option value="draft">טיוטה</option>
                <option value="ready">מוכן</option>
                <option value="posted">פורסם</option>
              </select>
            </div>
            <button
              onClick={save}
              className="mt-2 font-mono text-xs uppercase tracking-wide border border-white/30 rounded-full px-6 py-3 hover:bg-foreground hover:text-background transition-colors"
            >
              שמירה
            </button>
          </div>
        </AdminModalShell>
      )}
    </>
  )
}

function ImageGenerator() {
  const [subject, setSubject] = useState("")
  const [context, setContext] = useState<(typeof IMAGE_CONTEXTS)[number]["value"]>("guide")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<string | null>(null)

  async function generate() {
    if (!subject.trim()) return
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: subject.trim(), context }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data?.error ?? "שגיאה לא ידועה")
        return
      }
      setResult(data.image)
    } catch (err) {
      setError(String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl grid gap-4">
      <p className="text-dim text-xs max-w-md">
        יצירת תמונה חד-פעמית לשימוש ידני, למשל כשאין עדיין מדיה אמיתית לכתבה או לתת-שירות. לא מתחבר אוטומטית לשום
        עמוד באתר · מורידים ומעלים איפה שצריך.
      </p>
      <Field label="נושא" value={subject} onChange={setSubject} />
      <div>
        <label className="text-dim text-xs uppercase font-mono mb-2 block">סוג תוכן</label>
        <select
          value={context}
          onChange={(e) => setContext(e.target.value as typeof context)}
          className="bg-background border border-white/30 rounded px-4 py-3 text-sm"
        >
          {IMAGE_CONTEXTS.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>
      <button
        onClick={generate}
        disabled={loading || !subject.trim()}
        className="font-mono text-xs uppercase tracking-wide border border-white/30 rounded-full px-6 py-3 hover:bg-foreground hover:text-background transition-colors disabled:opacity-50 w-fit"
      >
        {loading ? "מייצר…" : "צור תמונה"}
      </button>
      {error && <p className="text-sm text-red-400">{error}</p>}
      {result && (
        <div>
          <img src={result} alt={subject} loading="lazy" className="w-full rounded-lg border border-white/10" />
          <a
            href={result}
            download={`${subject.trim().replace(/\s+/g, "-")}.png`}
            className="inline-block mt-3 font-mono text-xs uppercase tracking-wide underline underline-offset-4 p-1 -m-1"
          >
            הורדה ←
          </a>
        </div>
      )}
    </div>
  )
}

function AdminToolsInner() {
  const [tab, setTab] = useState<Tab>("תור תוכן")

  return (
    <div className="min-h-[100dvh] pt-28 pb-28 md:pb-20 px-6 md:px-12">
      <AdminNav />

      <div className="mb-6">
        <h1 className="font-display font-bold text-xl">כלים</h1>
        <p className="text-dim text-xs mt-1 max-w-md">עזרים צדדיים שלא שייכים לאף מסך תוכן.</p>
      </div>

      <div className="flex gap-2 mb-8 border-b border-white/10">
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

      {tab === "תור תוכן" ? <ContentQueue /> : <ImageGenerator />}
    </div>
  )
}

export function AdminTools() {
  return (
    <AdminGate>
      <AdminToolsInner />
    </AdminGate>
  )
}
