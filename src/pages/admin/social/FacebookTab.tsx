import { useEffect, useMemo, useState } from "react"
import { ClipboardPaste, Trash2 } from "lucide-react"
import { supabase, type FbOpportunityRow } from "@/lib/supabase"
import { AdminAction, AdminButton, AdminRow, EmptyState, NoticeCard } from "@/components/admin/AdminPage"
import { AdminModalShell } from "@/components/admin/AdminModalShell"
import { RowActions } from "@/components/admin/RowActions"
import { Field, SelectField, TextArea } from "@/components/admin/FieldEditors"
import { adminNotify } from "@/components/admin/AdminToaster"
import { askAgentForReply, copyAndOpen } from "@/lib/socialClient"
import { looksPromotional, scoreOpportunity, stripEmDashes } from "@/lib/socialCopy"
import { evaluateFacebookAction, textFingerprint, type SafetyVerdict } from "@/lib/socialSafety"
import type { SocialData } from "@/hooks/useSocialData"
import type { SharedPost } from "@/lib/sharedPost"

/** The Facebook side of the room.
 *
 * It drafts, it paces, and it hands over a reply plus the post it answers · a
 * person presses post. That is not a shortcut taken here: there is no API for
 * commenting in a group Raz does not own, so the only "automatic" version is a
 * script driving his logged-in account, which is the thing that gets an account
 * disabled. What a machine can do honestly is remember which groups were used
 * when, refuse the same paragraph twice, and keep the promotional replies rare.
 * That is what this screen is. */

type Capture = {
  group_id: string
  post_url: string
  author: string
  post_text: string
}

const EMPTY_CAPTURE: Capture = { group_id: "", post_url: "", author: "", post_text: "" }

function scoreTone(score: number) {
  return score >= 70 ? "good" : score >= 40 ? "neutral" : "quiet"
}

/** What the budget looks like right now, said before anything is opened · a
 * blocked reply discovered after it is written is a reply written for nothing. */
function SafetyStrip({ verdict }: { verdict: SafetyVerdict }) {
  return (
    <NoticeCard tone={verdict.allowed ? "good" : "warn"} className="mb-5">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="font-medium text-sm">{verdict.allowed ? "אפשר להגיב עכשיו" : verdict.reason}</div>
        <div className="font-mono text-[10px] uppercase tracking-wide text-dim">
          היום {verdict.usedToday}/{verdict.capToday}
        </div>
      </div>
    </NoticeCard>
  )
}

export function FacebookTab({
  data,
  shared,
  onSharedConsumed,
}: {
  data: SocialData
  /** A post shared in from another app, waiting to be captured. */
  shared?: SharedPost | null
  onSharedConsumed?: () => void
}) {
  const [items, setItems] = useState<FbOpportunityRow[]>([])
  const [capture, setCapture] = useState<Capture | null>(null)
  const [busy, setBusy] = useState(false)
  const [open, setOpen] = useState<FbOpportunityRow | null>(null)
  const [reply, setReply] = useState("")

  async function refresh() {
    const { data: rows } = await supabase
      .from("fb_opportunities")
      .select("*")
      .is("archived_at", null)
      .order("score", { ascending: false })
      .order("created_at", { ascending: false })
    setItems(rows ?? [])
  }

  useEffect(() => {
    refresh()
  }, [])

  /** Open the capture with what the share sheet gave.
   *
   * It rarely gives everything: Android hands over text and link, and the
   * Facebook app usually shares a permalink with no body at all. Whatever
   * arrived is filled in and the rest is one paste away · which is why the
   * form has a paste button. */
  useEffect(() => {
    if (!shared) return
    setCapture({ ...EMPTY_CAPTURE, post_text: shared.text, post_url: shared.url })
    onSharedConsumed?.()
  }, [shared, onSharedConsumed])

  // The strip answers the general question · nothing about a specific group or
  // a specific paragraph, both of which are checked again when one is opened.
  const generalVerdict = useMemo(
    () => evaluateFacebookAction({ groupId: null, text: "", promotional: false }, data.actions, data.limits),
    [data.actions, data.limits]
  )

  const openVerdict = useMemo(() => {
    if (!open) return null
    const group = data.groups.find((g) => g.id === open.group_id)
    return evaluateFacebookAction(
      {
        groupId: open.group_id,
        text: reply,
        promotional: looksPromotional(reply),
        groupCooldownDays: group?.cooldown_days ?? null,
      },
      data.actions,
      data.limits
    )
  }, [open, reply, data.actions, data.groups, data.limits])

  async function saveCapture() {
    if (!capture?.post_text.trim()) return
    setBusy(true)
    try {
      const group = data.groups.find((g) => g.id === capture.group_id)
      const local = scoreOpportunity(capture.post_text)
      const drafted = await askAgentForReply({
        postText: capture.post_text,
        groupName: group?.name ?? null,
        groupRules: group?.rules_note ?? null,
        linksAllowed: group?.links_allowed ?? false,
      })

      const { error } = await supabase.from("fb_opportunities").insert({
        group_id: capture.group_id || null,
        group_name: group?.name ?? null,
        post_url: capture.post_url.trim() || null,
        author: capture.author.trim() || null,
        post_text: capture.post_text.trim(),
        intent: drafted?.intent ?? local.intent,
        score: drafted?.score ?? local.score,
        summary: drafted?.summary ?? null,
        draft_reply: drafted ? stripEmDashes(drafted.reply) : null,
        draft_dm: drafted ? stripEmDashes(drafted.dm) : null,
        status: drafted ? "ready" : "new",
      })
      if (error) {
        adminNotify(error.message)
        return
      }
      if (!drafted) {
        adminNotify("נשמר · הסוכן לא ניסח תגובה, אפשר לכתוב אותה ידנית", "success")
      }
      setCapture(null)
      refresh()
    } finally {
      setBusy(false)
    }
  }

  async function redraft(item: FbOpportunityRow) {
    setBusy(true)
    try {
      const group = data.groups.find((g) => g.id === item.group_id)
      const drafted = await askAgentForReply({
        postText: item.post_text,
        groupName: group?.name ?? item.group_name,
        groupRules: group?.rules_note ?? null,
        linksAllowed: group?.links_allowed ?? false,
      })
      if (!drafted) {
        adminNotify("הסוכן לא זמין כרגע")
        return
      }
      setReply(stripEmDashes(drafted.reply))
    } finally {
      setBusy(false)
    }
  }

  /** Sending is the one thing this screen does not do. Marking it sent is · and
   * it is the write that every pacing rule afterwards reads. */
  async function markReplied(item: FbOpportunityRow) {
    const text = reply.trim()
    if (!text) return
    const now = new Date().toISOString()

    const { error } = await supabase.from("social_actions").insert({
      platform: "facebook",
      action: "fb_comment",
      group_id: item.group_id,
      opportunity_id: item.id,
      text_fingerprint: textFingerprint(text),
      promotional: looksPromotional(text),
    })
    if (error) {
      adminNotify(error.message)
      return
    }

    await supabase
      .from("fb_opportunities")
      .update({ status: "replied", replied_at: now, draft_reply: text })
      .eq("id", item.id)
    if (item.group_id) await supabase.from("fb_groups").update({ last_action_at: now }).eq("id", item.group_id)

    setOpen(null)
    await Promise.all([refresh(), data.refresh()])
    adminNotify("נרשם · הקבוצה הזאת בהמתנה עד סוף הקירור", "success")
  }

  async function archive(item: FbOpportunityRow) {
    await supabase.from("fb_opportunities").update({ archived_at: new Date().toISOString() }).eq("id", item.id)
    setItems((rows) => rows.filter((row) => row.id !== item.id))
    setOpen(null)
  }

  return (
    <>
      <div className="flex justify-between items-start gap-4 flex-wrap mb-5">
        <p className="text-dim text-xs max-w-md leading-relaxed">
          פוסט שמישהו כתב בקבוצה נכנס לכאן, הסוכן מדרג אותו ומנסח תשובה. השליחה עצמה ידנית · לפייסבוק אין ממשק
          לפרסום בקבוצות, וכל מה שמתחזה לאוטומציה הוא סקריפט שמפעיל את החשבון שלך, וזה בדיוק מה שחוסמים עליו.
        </p>
        <AdminAction onClick={() => setCapture(EMPTY_CAPTURE)}>+ פוסט מקבוצה</AdminAction>
      </div>

      <SafetyStrip verdict={generalVerdict} />

      {items.length === 0 ? (
        <EmptyState
          text="אין הזדמנויות פתוחות. כשמישהו בקבוצה מחפש סרטון או פרסומת · מדביקים כאן את הפוסט, והסוכן מדרג ומנסח."
          action={<AdminButton onClick={() => setCapture(EMPTY_CAPTURE)}>+ פוסט מקבוצה</AdminButton>}
        />
      ) : (
        <div className="grid gap-2">
          {items.map((item) => (
            <AdminRow
              key={item.id}
              title={item.summary || item.post_text.slice(0, 90)}
              meta={[item.group_name, item.author, new Date(item.created_at).toLocaleDateString("he-IL")]
                .filter(Boolean)
                .join(" · ")}
              pill={item.status === "replied" ? "הגבתי" : `${item.score}`}
              pillTone={item.status === "replied" ? "quiet" : scoreTone(item.score)}
              onClick={() => {
                setOpen(item)
                setReply(item.draft_reply ?? "")
              }}
              actions={
                <RowActions
                  actions={[{ icon: Trash2, label: "ארכיון", onClick: () => archive(item), variant: "danger" }]}
                />
              }
            />
          ))}
        </div>
      )}

      {capture && (
        <AdminModalShell title="פוסט מקבוצה" onClose={() => setCapture(null)}>
          <div className="grid gap-4">
            <SelectField
              label="קבוצה"
              value={capture.group_id}
              onChange={(v) => setCapture({ ...capture, group_id: v })}
              options={[
                { value: "", label: "בלי קבוצה" },
                ...data.groups.map((group) => ({ value: group.id, label: group.name })),
              ]}
            />
            <div>
              <TextArea
                label="הפוסט עצמו"
                value={capture.post_text}
                onChange={(v) => setCapture({ ...capture, post_text: v })}
                rows={6}
              />
              <button
                onClick={async () => {
                  try {
                    const clip = await navigator.clipboard.readText()
                    if (clip.trim()) setCapture({ ...capture, post_text: clip.trim() })
                  } catch {
                    // Safari refuses a clipboard read that no gesture asked for,
                    // and some browsers refuse it outright. Typing still works.
                    adminNotify("הדפדפן לא נתן לקרוא מהלוח · אפשר להדביק ידנית")
                  }
                }}
                className="mt-2 inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wide text-dim hover:text-lime transition-colors p-1 -m-1"
              >
                <ClipboardPaste size={13} /> הדבקה מהלוח
              </button>
            </div>
            <Field label="קישור לפוסט" value={capture.post_url} onChange={(v) => setCapture({ ...capture, post_url: v })} />
            <Field label="מי כתב" value={capture.author} onChange={(v) => setCapture({ ...capture, author: v })} />
            <div className="w-fit">
              <AdminAction onClick={saveCapture} disabled={busy || !capture.post_text.trim()}>
                {busy ? "מנתח…" : "נתח ונסח"}
              </AdminAction>
            </div>
          </div>
        </AdminModalShell>
      )}

      {open && (
        <AdminModalShell title={open.group_name || "הזדמנות"} onClose={() => setOpen(null)}>
          <div className="grid gap-5">
            <div className="border border-white/10 rounded-lg p-4">
              <div className="font-mono text-[10px] uppercase tracking-wide text-dim mb-2">הפוסט</div>
              <p className="text-sm whitespace-pre-wrap leading-relaxed">{open.post_text}</p>
            </div>

            {open.summary && <p className="text-sm text-dim">{open.summary}</p>}

            <TextArea label="התגובה" value={reply} onChange={setReply} rows={6} />

            {open.draft_dm && (
              <div className="border border-white/10 rounded-lg p-4">
                <div className="font-mono text-[10px] uppercase tracking-wide text-dim mb-2">פתיח לפרטי</div>
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{open.draft_dm}</p>
              </div>
            )}

            {openVerdict && !openVerdict.allowed && (
              <NoticeCard tone="warn">
                <p className="text-sm">{openVerdict.reason}</p>
              </NoticeCard>
            )}

            <div className="flex flex-wrap gap-2">
              <AdminAction
                onClick={async () => {
                  const copied = await copyAndOpen(reply, open.post_url)
                  adminNotify(
                    copied ? "התגובה הועתקה · הדבק ושלח" : "לא הצלחתי להעתיק · סמן והעתק ידנית",
                    copied ? "success" : "error"
                  )
                }}
                disabled={!reply.trim() || !openVerdict?.allowed}
              >
                העתק ופתח את הפוסט
              </AdminAction>
              <AdminButton onClick={() => markReplied(open)} disabled={!reply.trim()}>
                סמן שהגבתי
              </AdminButton>
              <AdminButton onClick={() => redraft(open)} disabled={busy}>
                {busy ? "מנסח…" : "נסח מחדש"}
              </AdminButton>
              <AdminButton onClick={() => archive(open)} tone="danger">
                ארכיון
              </AdminButton>
            </div>
          </div>
        </AdminModalShell>
      )}
    </>
  )
}
