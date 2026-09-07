import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  supabase,
  CALL_OUTCOME_LABELS,
  type CallScriptRow,
  type CallSessionRow,
} from "@/lib/supabase"
import { EMPTY_GRAPH, type CallGraph, type CallNode } from "@/lib/callScript"
import { AdminGate } from "@/components/AdminGate"
import { AdminPage, AdminAction } from "@/components/admin/AdminPage"
import { SwipeRow } from "@/components/admin/SwipeRow"
import { cn } from "@/lib/utils"
import { adminNotify } from "@/components/admin/AdminToaster"

const TABS = ["שיחות", "התסריט"] as const
type Tab = (typeof TABS)[number]

function CallsTab() {
  const navigate = useNavigate()
  const [sessions, setSessions] = useState<CallSessionRow[]>([])
  const [loading, setLoading] = useState(true)
  const [showArchive, setShowArchive] = useState(false)

  function load() {
    supabase
      .from("call_sessions")
      .select("*")
      .is("deleted_at", null)
      .order("started_at", { ascending: false })
      .then(({ data }) => {
        setSessions((data ?? []) as CallSessionRow[])
        setLoading(false)
      })
  }

  useEffect(load, [])

  /** A call is a record of something that happened, so neither action removes
   * it · the archive is for calls that are simply over. */
  async function putAway(id: string, action: "archive" | "delete" | "restore") {
    const patch =
      action === "archive"
        ? { archived_at: new Date().toISOString() }
        : action === "delete"
          ? { deleted_at: new Date().toISOString() }
          : { archived_at: null }
    const { error } = await supabase.from("call_sessions").update(patch).eq("id", id)
    if (error) {
      adminNotify("לא הצלחתי לעדכן. נסה שוב.", "error")
      return
    }
    adminNotify(action === "archive" ? "הועבר לארכיון" : action === "delete" ? "הועבר לפח" : "הוחזר לרשימה")
    load()
  }

  const inView = sessions.filter((s) => Boolean(s.archived_at) === showArchive)
  const archivedCount = sessions.filter((s) => s.archived_at).length

  if (loading) return <p className="text-dim text-sm">טוען…</p>

  if (inView.length === 0 && !showArchive) {
    return (
      <p className="text-dim text-sm max-w-md">
        עוד לא הייתה שיחה. אפשר להתחיל אחת מכאן, או ישירות מכרטיס הלקוח במסך לקוחות · שם הפרטים שלו כבר ממולאים.
      </p>
    )
  }

  return (
    <div className="grid gap-2">
      {(archivedCount > 0 || showArchive) && (
        <button
          onClick={() => setShowArchive(!showArchive)}
          className="w-fit mb-2 font-mono text-[10px] uppercase tracking-wide text-dim hover:text-lime transition-colors py-2"
        >
          {showArchive ? "→ חזרה לשיחות" : `ארכיון (${archivedCount}) ←`}
        </button>
      )}
      {inView.length === 0 && <p className="text-dim text-sm">הארכיון ריק.</p>}
      {inView.map((s) => (
        <SwipeRow
          key={s.id}
          archived={Boolean(s.archived_at)}
          onArchive={() => putAway(s.id, "archive")}
          onRestore={() => putAway(s.id, "restore")}
          onDelete={() => putAway(s.id, "delete")}
        >
        <button
          onClick={() => navigate(`/admin/calls/${s.id}`)}
          className="text-right border border-white/10 rounded-lg px-5 py-4 hover:border-lime/40 transition-colors flex items-center justify-between gap-4 flex-wrap"
        >
          <div>
            <div className="font-medium text-sm">
              {s.contact_name}
              {s.business_name ? <span className="text-dim text-xs"> · {s.business_name}</span> : null}
            </div>
            <div className="text-dim text-xs mt-1 font-mono">
              {new Date(s.started_at).toLocaleString("he-IL")}
              {s.next_step ? ` · ${s.next_step}` : ""}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-none">
            {s.follow_up_at && (
              <span className="font-mono text-[10px] uppercase tracking-wide text-dim">
                פולואפ {new Date(s.follow_up_at).toLocaleDateString("he-IL")}
              </span>
            )}
            <span
              className={cn(
                "font-mono text-[11px] uppercase tracking-wide border rounded-full px-3 py-1",
                s.outcome === "monthly" || s.outcome === "pilot" ? "border-lime text-lime" : "border-white/20"
              )}
            >
              {s.status === "in_progress"
                ? "באמצע שיחה"
                : s.outcome
                  ? CALL_OUTCOME_LABELS[s.outcome] ?? s.outcome
                  : "לא הושלמה"}
            </span>
          </div>
        </button>
        </SwipeRow>
      ))}
    </div>
  )
}

/** Editing the wording, not the wiring. Raz asked to improve the questions; the
 * shape of the tree is a separate, rarer job, so the branches are shown as
 * read-only destinations and everything a person actually says is editable. */
function ScriptTab() {
  const [script, setScript] = useState<CallScriptRow | null>(null)
  const [graph, setGraph] = useState<CallGraph>(EMPTY_GRAPH)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [openNode, setOpenNode] = useState<string | null>(null)

  useEffect(() => {
    supabase
      .from("call_scripts")
      .select("*")
      .eq("active", true)
      .order("sort_order")
      .then(({ data }) => {
        const first = (data ?? [])[0] as CallScriptRow | undefined
        setScript(first ?? null)
        setGraph((first?.graph as CallGraph) ?? EMPTY_GRAPH)
        setLoading(false)
      })
  }, [])

  const nodeKeys = useMemo(() => Object.keys(graph.nodes ?? {}), [graph])

  function updateNode(key: string, patch: Partial<CallNode>) {
    setGraph((g) => ({ ...g, nodes: { ...g.nodes, [key]: { ...g.nodes[key], ...patch } } }))
  }

  function updateChoiceLabel(nodeKey: string, index: number, label: string) {
    setGraph((g) => {
      const node = g.nodes[nodeKey]
      const choices = [...node.choices]
      choices[index] = { ...choices[index], label }
      return { ...g, nodes: { ...g.nodes, [nodeKey]: { ...node, choices } } }
    })
  }

  async function save() {
    if (!script) return
    setSaving(true)
    const { error } = await supabase
      .from("call_scripts")
      .update({ graph, updated_at: new Date().toISOString() })
      .eq("id", script.id)
    setSaving(false)
    if (error) return adminNotify(error.message)
  }

  if (loading) return <p className="text-dim text-sm">טוען…</p>
  if (!script) return <p className="text-dim text-sm">אין תסריט פעיל.</p>

  return (
    <>
      <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
        <p className="text-dim text-xs max-w-lg">
          מה שאתה אומר בכל שלב, ומה שכתוב על כפתורי התשובה. שינוי כאן משפיע רק על שיחות חדשות · שיחה שכבר רצה
          שומרת את התסריט שהיא רצה מולו. אפשר להשתמש ב-{"{{contact}}"} · {"{{business}}"} · {"{{context}}"},
          ובשלב הסיכום גם ב-{"{{pain}}"} · {"{{consequence}}"} · {"{{goal}}"} שמתמלאים מהתשובות של הליד.
        </p>
        <button
          onClick={save}
          disabled={saving}
          className="font-mono text-xs uppercase tracking-wide bg-lime text-black rounded-full px-5 py-2.5 hover:scale-105 transition-transform disabled:opacity-50 flex-none"
        >
          {saving ? "שומר…" : "שמירת התסריט"}
        </button>
      </div>

      <div className="grid gap-2">
        {nodeKeys.map((key) => {
          const node = graph.nodes[key]
          const isOpen = openNode === key
          return (
            <div key={key} className="border border-white/10 rounded-lg">
              <button
                onClick={() => setOpenNode(isOpen ? null : key)}
                className="w-full text-right px-5 py-3 flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{node.title}</div>
                  <div className="text-dim text-[10px] font-mono uppercase tracking-wide mt-0.5">
                    {node.phase} · {key} · {node.choices.length} תשובות
                  </div>
                </div>
                <span className="text-dim text-xs flex-none">{isOpen ? "סגור" : "עריכה"}</span>
              </button>

              {isOpen && (
                <div className="px-5 pb-5 grid gap-3 border-t border-white/10 pt-4">
                  <div>
                    <label className="text-dim text-xs uppercase font-mono mb-2 block">כותרת השלב</label>
                    <input
                      value={node.title}
                      onChange={(e) => updateNode(key, { title: e.target.value })}
                      className="w-full bg-transparent border border-white/20 rounded px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-dim text-xs uppercase font-mono mb-2 block">מה אומרים</label>
                    <textarea
                      value={node.script}
                      onChange={(e) => updateNode(key, { script: e.target.value })}
                      rows={5}
                      className="w-full bg-transparent border border-white/20 rounded px-3 py-2 text-sm leading-relaxed"
                    />
                  </div>
                  <div>
                    <label className="text-dim text-xs uppercase font-mono mb-2 block">טיפ (לא נאמר בקול)</label>
                    <textarea
                      value={node.tip ?? ""}
                      onChange={(e) => updateNode(key, { tip: e.target.value })}
                      rows={2}
                      className="w-full bg-transparent border border-white/20 rounded px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-dim text-xs uppercase font-mono mb-2 block">השאלה שאני עונה עליה</label>
                    <input
                      value={node.question}
                      onChange={(e) => updateNode(key, { question: e.target.value })}
                      className="w-full bg-transparent border border-white/20 rounded px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-dim text-xs uppercase font-mono mb-2 block">תשובות</label>
                    <div className="grid gap-2">
                      {node.choices.map((choice, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <input
                            value={choice.label}
                            onChange={(e) => updateChoiceLabel(key, i, e.target.value)}
                            className="flex-1 bg-transparent border border-white/20 rounded px-3 py-2 text-sm"
                          />
                          <span className="font-mono text-[10px] text-dim flex-none w-32 truncate" title={choice.next}>
                            ← {choice.next}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </>
  )
}

function AdminCallsInner() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>("שיחות")

  return (
    <AdminPage
      title="שיחות מכירה"
      description="טלפרומפטר לשיחה חיה. כל תשובה נשמרת על הליד, והסיכום מוביל לחוזה ולתשלום."
      action={<AdminAction onClick={() => navigate("/admin/calls/new")}>+ שיחה</AdminAction>}
    >

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

      {tab === "שיחות" ? <CallsTab /> : <ScriptTab />}
    </AdminPage>
  )
}

export function AdminCalls() {
  return (
    <AdminGate>
      <AdminCallsInner />
    </AdminGate>
  )
}
