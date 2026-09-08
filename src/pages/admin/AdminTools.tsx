import { useState } from "react"
import { Link } from "react-router-dom"
import { AdminGate } from "@/components/AdminGate"
import { AdminPage, AdminAction } from "@/components/admin/AdminPage"
import { Field } from "@/components/admin/FieldEditors"

const IMAGE_CONTEXTS = [
  { value: "service", label: "שירות (hub)" },
  { value: "sub-service", label: "תת-שירות" },
  { value: "guide", label: "כתבת מדריך" },
  { value: "project", label: "פרויקט" },
] as const

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
      <div className="w-fit">
        <AdminAction onClick={generate} disabled={loading || !subject.trim()}>
          {loading ? "מייצר…" : "צור תמונה"}
        </AdminAction>
      </div>
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
  return (
    <AdminPage title="כלים" description="עזרים צדדיים שלא שייכים לאף מסך תוכן.">
      <ImageGenerator />
      <p className="text-dim text-xs mt-10 max-w-md">
        תכנון ופרסום ברשתות עבר ל
        <Link to="/admin/social" className="underline underline-offset-4 hover:text-lime"> סושיאל</Link>
        , שם יש גם קצב פרסום וגם פרסום אמיתי לאינסטגרם.
      </p>
    </AdminPage>
  )
}

export function AdminTools() {
  return (
    <AdminGate>
      <AdminToolsInner />
    </AdminGate>
  )
}
