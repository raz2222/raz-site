import { useEffect, useMemo, useState } from "react"
import { supabase, ENGAGEMENT_INTENT_LABELS, type SocialEngagementRow } from "@/lib/supabase"
import { AdminButton, AdminRow, EmptyState, NoticeCard } from "@/components/admin/AdminPage"
import { adminNotify } from "@/components/admin/AdminToaster"

/** Who answered, and which video made them answer.
 *
 * Everything that arrives is stored, applause included · that is what the
 * scoring gets measured against, and it is also the only honest way to count
 * what a post actually did. What reads like work is separated out, because a
 * list where "נראה מדהים" and "כמה עולה" sit next to each other is a list that
 * stops being read.
 *
 * The ranking underneath is the part view counts never gave: not which film was
 * watched most, but which film made someone write. */

const PLATFORM_LABEL: Record<SocialEngagementRow["platform"], string> = {
  instagram: "אינסטגרם",
  facebook: "פייסבוק",
}

const KIND_LABEL: Record<SocialEngagementRow["kind"], string> = {
  comment: "תגובה",
  dm: "הודעה",
  mention: "אזכור",
}

type ProjectTitle = { id: string; title: string }

export function EngagementsTab() {
  const [rows, setRows] = useState<SocialEngagementRow[]>([])
  const [projects, setProjects] = useState<ProjectTitle[]>([])
  const [onlyWork, setOnlyWork] = useState(true)
  const [loading, setLoading] = useState(true)

  async function refresh() {
    const [{ data: engagements }, { data: projectRows }] = await Promise.all([
      supabase.from("social_engagements").select("*").order("occurred_at", { ascending: false }).limit(200),
      supabase.from("projects").select("id,title"),
    ])
    setRows(engagements ?? [])
    setProjects(projectRows ?? [])
    setLoading(false)
  }

  useEffect(() => {
    refresh()
  }, [])

  const titleFor = useMemo(() => {
    const byId = new Map(projects.map((p) => [p.id, p.title]))
    return (id: string | null) => (id ? (byId.get(id) ?? null) : null)
  }, [projects])

  /** Ranked by the replies that were worth something, not by how many arrived ·
   * a film with forty hearts and no question did not catch anyone. */
  const ranking = useMemo(() => {
    const tally = new Map<string, { leads: number; total: number }>()
    for (const row of rows) {
      if (!row.project_id) continue
      const entry = tally.get(row.project_id) ?? { leads: 0, total: 0 }
      entry.total++
      if (row.lead_id) entry.leads++
      tally.set(row.project_id, entry)
    }
    return [...tally.entries()]
      .map(([id, counts]) => ({ id, title: titleFor(id) ?? "פרויקט", ...counts }))
      .sort((a, b) => b.leads - a.leads || b.total - a.total)
      .slice(0, 5)
  }, [rows, titleFor])

  const shown = onlyWork ? rows.filter((row) => row.score >= 60 || row.status === "lead") : rows

  async function markHandled(row: SocialEngagementRow) {
    await supabase.from("social_engagements").update({ status: "handled" }).eq("id", row.id)
    setRows((current) => current.map((r) => (r.id === row.id ? { ...r, status: "handled" } : r)))
    adminNotify("סומן כטופל", "success")
  }

  if (loading) return <p className="text-dim text-sm">טוען…</p>

  return (
    <>
      <div className="flex justify-between items-start gap-4 flex-wrap mb-5">
        <p className="text-dim text-xs max-w-md leading-relaxed">
          תגובות והודעות על מה שפרסמת. מחמאות נשמרות ולא מצלצלות · מי ששאל מחיר או אמר שהוא רוצה כזה נשמר כליד עם
          הפוסט שממנו הגיע.
        </p>
        <AdminButton onClick={() => setOnlyWork((v) => !v)}>
          {onlyWork ? "הצג הכל" : "רק מה שנראה עבודה"}
        </AdminButton>
      </div>

      {ranking.length > 0 && (
        <NoticeCard className="mb-5">
          <div className="font-mono text-[10px] uppercase tracking-wide text-dim mb-3">מה תפס</div>
          <div className="grid gap-2">
            {ranking.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between gap-4 text-sm">
                <span className="truncate">{entry.title}</span>
                <span className="font-mono text-[10px] uppercase tracking-wide text-dim flex-none">
                  {entry.leads} לידים · {entry.total} תגובות
                </span>
              </div>
            ))}
          </div>
        </NoticeCard>
      )}

      {shown.length === 0 ? (
        <EmptyState
          text={
            onlyWork
              ? "אף אחד עוד לא כתב משהו שנראה כמו עבודה. כשמישהו ישאל מחיר או יבקש כזה · זה יופיע כאן וגם בטלפון."
              : "עוד לא נקלטו תגובות. הן מגיעות מאינסטגרם ומעמוד הפייסבוק אחרי שמחברים את ה-webhook."
          }
        />
      ) : (
        <div className="grid gap-2">
          {shown.map((row) => (
            <AdminRow
              key={row.id}
              title={`${row.author_handle ? "@" + row.author_handle : (row.author_name ?? "מישהו")} · ${row.text.slice(0, 80)}`}
              meta={[
                PLATFORM_LABEL[row.platform],
                KIND_LABEL[row.kind],
                titleFor(row.project_id),
                new Date(row.occurred_at).toLocaleDateString("he-IL"),
              ]
                .filter(Boolean)
                .join(" · ")}
              pill={row.status === "handled" ? "טופל" : ENGAGEMENT_INTENT_LABELS[row.intent]}
              pillTone={row.status === "handled" ? "quiet" : row.score >= 60 ? "good" : "quiet"}
              onClick={row.permalink ? () => window.open(row.permalink!, "_blank", "noopener,noreferrer") : undefined}
              actions={
                row.status === "handled" ? undefined : (
                  <AdminButton onClick={() => markHandled(row)}>טופל</AdminButton>
                )
              }
            />
          ))}
        </div>
      )}
    </>
  )
}
