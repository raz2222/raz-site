import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import {
  supabase,
  QUOTE_STATUS_LABELS,
  CONTRACT_STATUS_LABELS,
  type ClientProjectRow,
  type ContractRow,
  type QuoteRow,
} from "@/lib/supabase"
import { useAuth } from "@/hooks/useAuth"
import { useDocumentMeta } from "@/hooks/useDocumentMeta"
import { PortalLogin } from "@/pages/portal/PortalLogin"
import { ProjectStatus } from "@/components/portal/ProjectStatus"
import { isActive, type ProjectStage } from "@/lib/projectStage"

const LIME = "#D1FE17"

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-mono text-xs uppercase tracking-wide text-dim mb-3">{title}</h2>
      {children}
    </section>
  )
}

/** The one thing a client can change about their account.
 *
 * There is no password here: signing in is a one-time link to this address, so
 * there is nothing to choose or forget. The email is not editable either, and
 * deliberately: every contract and project is matched to the client by it, so
 * changing it here would hide their own documents from them. */
function AccountSection({ email }: { email: string }) {
  const [displayName, setDisplayName] = useState("")
  const [initial, setInitial] = useState("")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    supabase
      .from("clients")
      .select("display_name, name")
      .eq("email", email)
      .maybeSingle()
      .then(({ data }) => {
        const value = data?.display_name || data?.name || ""
        setDisplayName(value)
        setInitial(value)
      })
  }, [email])

  async function save() {
    setSaving(true)
    const { error } = await supabase.from("clients").update({ display_name: displayName.trim() }).eq("email", email)
    setSaving(false)
    if (error) return
    setInitial(displayName.trim())
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="border border-white/10 rounded-lg p-5 grid gap-4 max-w-md">
      <div>
        <label htmlFor="display-name" className="block font-mono text-[10px] uppercase tracking-wide text-dim mb-2">
          איך לפנות אליך
        </label>
        <input
          id="display-name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="השם שלך"
          className="w-full bg-transparent border border-white/25 rounded px-4 py-3 text-sm focus:outline-none focus-visible:border-white/50"
        />
      </div>

      <div>
        <div className="font-mono text-[10px] uppercase tracking-wide text-dim mb-2">כתובת המייל</div>
        <div className="text-sm">{email}</div>
        <p className="text-dim text-xs mt-2 leading-relaxed">
          הכניסה היא בקישור חד פעמי לכתובת הזו · אין סיסמה לזכור. המסמכים והפרויקטים שלך מקושרים למייל הזה, ולכן
          שינוי שלו נעשה מולנו ולא כאן.
        </p>
      </div>

      <button
        onClick={save}
        disabled={saving || displayName.trim() === initial}
        className="w-fit font-mono text-[10px] font-bold uppercase tracking-wide bg-[#D1FE17] text-black rounded-full px-5 py-2.5 hover:scale-105 transition-transform disabled:opacity-40 disabled:hover:scale-100"
      >
        {saving ? "שומר…" : saved ? "נשמר ✓" : "שמירה"}
      </button>
    </div>
  )
}

export function Portal() {
  useDocumentMeta("הפורטל שלי · RAZ")
  const { user, loading } = useAuth()
  const [quotes, setQuotes] = useState<QuoteRow[]>([])
  const [contracts, setContracts] = useState<ContractRow[]>([])
  const [projects, setProjects] = useState<ClientProjectRow[]>([])
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    if (!user) return
    Promise.all([
      supabase.from("quotes").select("*").order("created_at", { ascending: false }),
      supabase.from("contracts").select("*").order("created_at", { ascending: false }),
      supabase.from("client_projects").select("*").order("sort_order"),
    ]).then(([q, c, p]) => {
      setQuotes(q.data ?? [])
      setContracts(c.data ?? [])
      setProjects((p.data ?? []) as ClientProjectRow[])
      setLoadingData(false)
    })
  }, [user])

  // Not null · a client staring at a blank page has even less idea what to do
  // about it than Raz did.
  if (loading)
    return (
      <div className="min-h-[100dvh] flex items-center justify-center">
        <p className="font-mono text-xs uppercase tracking-wide text-dim">טוען…</p>
      </div>
    )
  if (!user) return <PortalLogin />

  const live = projects.filter((p) => isActive(p.stage as ProjectStage))
  const done = projects.filter((p) => !isActive(p.stage as ProjectStage))
  const nothingYet = !loadingData && quotes.length === 0 && contracts.length === 0 && projects.length === 0

  return (
    <div className="min-h-[100dvh] pt-28 pb-20 px-6 md:px-12">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between gap-4 mb-10">
          <div>
            <div className="font-display font-bold text-2xl">הפורטל שלי</div>
            <div className="text-dim text-xs mt-1">{user.email}</div>
          </div>
          <button
            onClick={() => supabase.auth.signOut()}
            className="font-mono text-xs uppercase tracking-wide text-dim hover:text-[#D1FE17] transition-colors"
          >
            יציאה
          </button>
        </div>

        {loadingData && <p className="text-dim text-sm">טוען…</p>}
        {nothingYet && (
          <p className="text-dim text-sm">
            אין כאן עדיין מסמכים או פרויקטים. ברגע שנתחיל לעבוד, הכל יופיע כאן.
          </p>
        )}

        <div className="grid gap-10">
          {live.length > 0 && (
            <Section title={`בעבודה עכשיו (${live.length})`}>
              <div className="grid gap-3">
                {live.map((project) => (
                  <article key={project.id} className="border border-white/10 rounded-lg p-5 grid gap-4">
                    <div>
                      <h3 className="font-medium">{project.title}</h3>
                      {project.description && (
                        <p className="text-dim text-xs mt-1 leading-relaxed">{project.description}</p>
                      )}
                    </div>

                    <ProjectStatus stage={project.stage as ProjectStage} note={project.stage_note} />

                    {(project.due_at || project.drive_folder_url) && (
                      <div className="flex items-center gap-4 flex-wrap pt-1">
                        {project.due_at && (
                          <span className="font-mono text-[10px] uppercase tracking-wide text-dim">
                            יעד: {new Date(project.due_at).toLocaleDateString("he-IL")}
                          </span>
                        )}
                        {project.drive_folder_url && (
                          <a
                            href={project.drive_folder_url}
                            target="_blank"
                            rel="noreferrer"
                            className="font-mono text-[10px] uppercase tracking-wide underline underline-offset-4 hover:text-[#D1FE17] transition-colors"
                          >
                            הקבצים שלך ←
                          </a>
                        )}
                      </div>
                    )}
                  </article>
                ))}
              </div>
            </Section>
          )}

          {contracts.length > 0 && (
            <Section title="חוזים">
              <div className="grid gap-3">
                {contracts.map((c) => (
                  <Link
                    key={c.id}
                    to={`/portal/contract/${c.id}`}
                    className="flex items-center justify-between gap-4 border border-white/10 rounded-lg px-5 py-4 min-h-[56px] hover:border-[#D1FE17] transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="font-medium truncate">{c.title}</div>
                      <div className="text-dim text-xs mt-1">
                        {new Date(c.created_at).toLocaleDateString("he-IL")}
                        {c.contract_number ? ` · ${c.contract_number}` : ""}
                      </div>
                    </div>
                    <span
                      className="font-mono text-[11px] uppercase tracking-wide border rounded-full px-3 py-1 flex-none"
                      style={
                        c.status === "signed"
                          ? { borderColor: LIME, color: LIME }
                          : { borderColor: "rgba(255,255,255,0.2)" }
                      }
                    >
                      {c.status === "signed" ? CONTRACT_STATUS_LABELS.signed : "ממתין לחתימה"}
                    </span>
                  </Link>
                ))}
              </div>
            </Section>
          )}

          {quotes.length > 0 && (
            <Section title="הצעות מחיר">
              <div className="grid gap-3">
                {quotes.map((q) => (
                  <Link
                    key={q.id}
                    to={`/portal/quote/${q.id}`}
                    className="flex items-center justify-between gap-4 border border-white/10 rounded-lg px-5 py-4 min-h-[56px] hover:border-[#D1FE17] transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="font-medium truncate">{q.title}</div>
                      <div className="text-dim text-xs mt-1">{new Date(q.created_at).toLocaleDateString("he-IL")}</div>
                    </div>
                    <span className="font-mono text-[11px] uppercase tracking-wide border border-white/20 rounded-full px-3 py-1 flex-none">
                      {QUOTE_STATUS_LABELS[q.status]}
                    </span>
                  </Link>
                ))}
              </div>
            </Section>
          )}

          {done.length > 0 && (
            <Section title="הושלם">
              <div className="grid gap-2">
                {done.map((project) => (
                  <div
                    key={project.id}
                    className="flex items-center justify-between gap-4 border border-white/10 rounded-lg px-5 py-4"
                  >
                    <span className="text-sm truncate">{project.title}</span>
                    <span className="font-mono text-[10px] uppercase tracking-wide text-dim flex-none">
                      {project.delivered_at ? new Date(project.delivered_at).toLocaleDateString("he-IL") : "נמסר"}
                    </span>
                  </div>
                ))}
              </div>
            </Section>
          )}

          <Section title="החשבון שלי">
            <AccountSection email={user.email ?? ""} />
          </Section>
        </div>
      </div>
    </div>
  )
}
