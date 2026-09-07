import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import { adminNotify } from "@/components/admin/AdminToaster"
import {
  supabase,
  type CallScriptRow,
  type CallSessionRow,
  type ClientRow,
  type LeadRow,
} from "@/lib/supabase"
import {
  CALL_PACKAGES,
  EMPTY_GRAPH,
  endingFor,
  endingKeyOf,
  isEndingRef,
  packageForEnding,
  renderScript,
  type CallGraph,
  type CallNode,
} from "@/lib/callScript"

type SessionState = Partial<CallSessionRow>

/** Drives one live call: which node is on screen, what was answered, and the
 * record of it all on the lead. Every answer is written through to the database
 * as it is given, because a call that crashes the tab must not lose the call. */
export function useCallSession() {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const isNew = id === "new"

  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [session, setSession] = useState<SessionState>({})
  const [script, setScript] = useState<CallScriptRow | null>(null)
  const [clients, setClients] = useState<ClientRow[]>([])
  const [leads, setLeads] = useState<LeadRow[]>([])
  const [notesDirty, setNotesDirty] = useState(false)

  useEffect(() => {
    async function load() {
      const [{ data: scripts }, { data: cl }, { data: ld }] = await Promise.all([
        supabase.from("call_scripts").select("*").eq("active", true).order("sort_order"),
        supabase.from("clients").select("*").order("name"),
        supabase.from("leads").select("*").order("created_at", { ascending: false }),
      ])
      const activeScript = (scripts ?? [])[0] ?? null
      setScript(activeScript)
      setClients(cl ?? [])
      setLeads(ld ?? [])

      if (!isNew && id) {
        const { data } = await supabase.from("call_sessions").select("*").eq("id", id).maybeSingle()
        setSession(data ?? {})
      } else {
        const clientId = searchParams.get("clientId")
        const leadId = searchParams.get("leadId")
        const client = clientId ? (cl ?? []).find((c) => c.id === clientId) : undefined
        const lead = leadId ? (ld ?? []).find((l) => l.id === leadId) : undefined
        setSession({
          client_id: client?.id ?? lead?.client_id ?? null,
          lead_id: lead?.id ?? null,
          contact_name: client?.name ?? lead?.name ?? "",
          contact_phone: client?.phone ?? lead?.phone ?? "",
          contact_email: client?.email ?? lead?.email ?? "",
          business_name: client?.company ?? lead?.company ?? "",
          call_context: lead?.message ?? "",
          answers: {},
          path: [],
          status: "in_progress",
        })
      }
      setLoading(false)
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const graph: CallGraph = useMemo(() => {
    const raw = (session.script_snapshot ?? script?.graph) as CallGraph | undefined
    if (!raw || typeof raw !== "object" || !("nodes" in raw)) return EMPTY_GRAPH
    return raw
  }, [session.script_snapshot, script])

  const answers = (session.answers ?? {}) as Record<string, string>
  const path = (session.path ?? []) as string[]
  const endingKey = session.ending_key ?? null
  const ending = endingFor(graph, endingKey)
  const node: CallNode | null = session.current_node ? graph.nodes?.[session.current_node] ?? null : null

  const subject = {
    contactName: session.contact_name,
    businessName: session.business_name,
    callContext: session.call_context,
  }

  const spokenScript = node ? renderScript(node.script, subject, answers) : ""

  /** Writes a patch to the row and to local state at once, so the screen and the
   * record never disagree about what was answered. */
  const patch = useCallback(
    async (changes: Partial<CallSessionRow>) => {
      setSession((prev) => ({ ...prev, ...changes }))
      if (!session.id) return
      await supabase
        .from("call_sessions")
        .update({ ...changes, updated_at: new Date().toISOString() })
        .eq("id", session.id)
    },
    [session.id]
  )

  /** Creating the session is what freezes the script: from here the call runs
   * against this copy whatever anyone edits later. */
  async function startCall(): Promise<string | null> {
    if (!session.contact_name?.trim()) {
      adminNotify("צריך שם איש קשר כדי להתחיל שיחה.")
      return null
    }
    // Freezing an empty graph would open a call with no first line and no way
    // forward, which is the worst possible moment to discover the problem.
    const graphCheck = script?.graph as CallGraph | undefined
    if (!graphCheck?.start || !graphCheck.nodes?.[graphCheck.start]) {
      adminNotify("אין תסריט פעיל להתחיל איתו. אפשר לבדוק את זה בלשונית התסריט.")
      return null
    }
    setCreating(true)
    try {
      const graphToFreeze = (script?.graph ?? EMPTY_GRAPH) as CallGraph
      const { data, error } = await supabase
        .from("call_sessions")
        .insert({
          lead_id: session.lead_id ?? null,
          client_id: session.client_id ?? null,
          script_id: script?.id ?? null,
          script_snapshot: graphToFreeze,
          contact_name: session.contact_name?.trim() ?? "",
          contact_phone: session.contact_phone || null,
          contact_email: session.contact_email || null,
          business_name: session.business_name || null,
          call_context: session.call_context || null,
          current_node: graphToFreeze.start,
          answers: {},
          path: [],
          status: "in_progress",
        })
        .select()
        .single()
      if (error) { adminNotify(error.message); return null }
      setSession(data)
      navigate(`/admin/calls/${data.id}`, { replace: true })
      return data.id as string
    } finally {
      setCreating(false)
    }
  }

  /** One answer: remember it, remember where we were, and move on. An answer
   * that lands on an ending finishes the call in the same write. */
  async function choose(choiceKey: string, next: string) {
    if (!session.current_node) return
    const nextAnswers = { ...answers, [session.current_node]: choiceKey }
    const nextPath = [...path, session.current_node]

    if (isEndingRef(next)) {
      const key = endingKeyOf(next)
      const finish = graph.endings?.[key]
      await patch({
        answers: nextAnswers,
        path: nextPath,
        current_node: null,
        ending_key: key,
        status: "completed",
        outcome: finish?.outcome ?? null,
        recommended_package: finish?.package ?? null,
        ended_at: new Date().toISOString(),
      })
      return
    }

    await patch({ answers: nextAnswers, path: nextPath, current_node: next, ending_key: null })
  }

  /** Back one step. Reopens a finished call rather than refusing, because the
   * usual reason to go back is that Raz clicked the wrong answer mid-sentence. */
  async function goBack() {
    if (path.length === 0) return
    const previous = path[path.length - 1]
    const nextAnswers = { ...answers }
    delete nextAnswers[previous]
    await patch({
      current_node: previous,
      path: path.slice(0, -1),
      answers: nextAnswers,
      ending_key: null,
      status: "in_progress",
      outcome: null,
      recommended_package: null,
      ended_at: null,
    })
  }

  // Notes are typed while someone is talking, so they save on a pause rather
  // than on every keystroke.
  const notesTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  function setNotes(value: string) {
    setSession((prev) => ({ ...prev, notes: value }))
    setNotesDirty(true)
    if (notesTimer.current) clearTimeout(notesTimer.current)
    notesTimer.current = setTimeout(async () => {
      if (session.id) {
        await supabase.from("call_sessions").update({ notes: value, updated_at: new Date().toISOString() }).eq("id", session.id)
      }
      setNotesDirty(false)
    }, 800)
  }

  async function setNextStep(value: string) {
    await patch({ next_step: value })
  }

  async function abandon() {
    if (!session.id) return
    if (!confirm("לסמן את השיחה כלא הושלמה?")) return
    await patch({ status: "abandoned", ended_at: new Date().toISOString() })
    navigate("/admin/calls")
  }

  const packageKey = packageForEnding(graph, endingKey)
  const chosenPackage = packageKey ? CALL_PACKAGES[packageKey] : null

  const durationMinutes = session.started_at
    ? Math.max(1, Math.round((new Date(session.ended_at ?? Date.now()).getTime() - new Date(session.started_at).getTime()) / 60000))
    : 0

  return {
    isNew,
    loading,
    creating,
    session,
    setSession,
    script,
    graph,
    node,
    spokenScript,
    answers,
    path,
    ending,
    endingKey,
    clients,
    leads,
    packageKey,
    chosenPackage,
    durationMinutes,
    notesDirty,
    startCall,
    choose,
    goBack,
    setNotes,
    setNextStep,
    abandon,
    patch,
  }
}

export type CallSession = ReturnType<typeof useCallSession>
