import { useEffect, useState } from "react"
import { Pencil, Trash2 } from "lucide-react"
import { supabase, type ProjectRow, type SocialPostRow } from "@/lib/supabase"
import { AdminAction, AdminButton, AdminRow, EmptyState } from "@/components/admin/AdminPage"
import { AdminModalShell } from "@/components/admin/AdminModalShell"
import { RowActions } from "@/components/admin/RowActions"
import { Field, MediaField, StringListEditor, TextArea } from "@/components/admin/FieldEditors"
import { adminNotify } from "@/components/admin/AdminToaster"
import {
  askAgentForCaption,
  connectInstagram,
  disconnectInstagram,
  instagramStatus,
  publishNow,
  type InstagramStatus,
} from "@/lib/socialClient"
import { projectCaption, projectHashtags, projectMedia, stripEmDashes } from "@/lib/socialCopy"
import { instagramRemaining } from "@/lib/socialSafety"
import type { SocialData } from "@/hooks/useSocialData"
import { cn } from "@/lib/utils"

/** The Instagram side, which really does publish itself.
 *
 * The Content Publishing API is a genuine API, so a project Raz finishes ends
 * up on the account without him doing anything: the daily sweep queues it, the
 * queue releases one a day, and the publish happens server-side. Everything on
 * this screen is either the connection, or a way to see and change what is
 * about to go out. */

const DAY_MS = 24 * 60 * 60 * 1000

const STATUS_LABEL: Record<SocialPostRow["status"], string> = {
  draft: "טיוטה",
  ready: "מוכן",
  publishing: "בהעלאה",
  published: "פורסם",
  failed: "נכשל",
  skipped: "דילוג",
}

type QueueProject = Pick<
  ProjectRow,
  "id" | "title" | "overview" | "ai_tools" | "categories" | "client_name" | "video" | "gallery"
>

function ConnectionCard({ status, onChange }: { status: InstagramStatus | null; onChange: () => void }) {
  const [userId, setUserId] = useState("")
  const [token, setToken] = useState("")
  const [busy, setBusy] = useState(false)

  if (status?.connected) {
    return (
      <div className="border border-lime/30 rounded-lg px-4 py-3 mb-5 flex items-center justify-between gap-4 flex-wrap">
        <div className="text-sm">
          מחובר ל-@{status.username}
          {typeof status.followers === "number" && (
            <span className="text-dim"> · {status.followers.toLocaleString("he-IL")} עוקבים</span>
          )}
        </div>
        <AdminButton
          onClick={async () => {
            await disconnectInstagram()
            onChange()
          }}
        >
          ניתוק
        </AdminButton>
      </div>
    )
  }

  return (
    <div className="border border-amber-400/40 rounded-lg px-4 py-4 mb-5 grid gap-3">
      <div className="text-sm">
        {status?.expired ? "הטוקן של אינסטגרם פג · צריך להדביק חדש" : "אינסטגרם לא מחוברת"}
      </div>
      <p className="text-dim text-xs leading-relaxed max-w-lg">
        זה הדבר היחיד כאן שאי אפשר לעשות בשבילך: הטוקן מונפק על החשבון שלך במטא. מחשבון Business שמקושר לעמוד
        פייסבוק · Meta for Developers, Graph API Explorer, הרשאות instagram_content_publish ו-pages_show_list.
        מדביקים כאן פעם אחת, והשאר עובד לבד.
      </p>
      <Field label="Instagram business account ID" value={userId} onChange={setUserId} />
      <Field label="Access token" value={token} onChange={setToken} />
      <div className="w-fit">
        <AdminAction
          onClick={async () => {
            setBusy(true)
            const result = await connectInstagram(userId.trim(), token.trim())
            setBusy(false)
            if ("error" in result) {
              adminNotify(result.error)
              return
            }
            adminNotify(`מחובר ל-@${result.username}`, "success")
            setUserId("")
            setToken("")
            onChange()
          }}
          disabled={busy || !userId.trim() || !token.trim()}
        >
          {busy ? "בודק…" : "חיבור"}
        </AdminAction>
      </div>
    </div>
  )
}

export function InstagramTab({ data }: { data: SocialData }) {
  const [posts, setPosts] = useState<SocialPostRow[]>([])
  const [status, setStatus] = useState<InstagramStatus | null>(null)
  const [form, setForm] = useState<Partial<SocialPostRow> | null>(null)
  const [busy, setBusy] = useState(false)

  async function refresh() {
    const { data: rows } = await supabase
      .from("social_posts")
      .select("*")
      .order("scheduled_for", { ascending: true, nullsFirst: false })
    setPosts(rows ?? [])
  }

  async function refreshStatus() {
    setStatus(await instagramStatus())
  }

  useEffect(() => {
    refresh()
    refreshStatus()
  }, [])

  const remaining = instagramRemaining(data.actions, data.settings?.ig_daily_cap ?? 2)

  /** Queue every finished project that has never been posted.
   *
   * The daily sweep does the same thing server-side · this is the version for
   * "I just added the project and want it in the queue now". They cannot
   * disagree about what is queued: the unique index on `project_id` means the
   * second one to try simply does nothing. */
  async function queueProjects() {
    setBusy(true)
    try {
      const [{ data: projects }, { data: queued }] = await Promise.all([
        supabase
          .from("projects")
          .select("id,title,overview,ai_tools,categories,client_name,video,gallery")
          .not("draft", "is", true)
          .order("created_at", { ascending: true }),
        supabase.from("social_posts").select("project_id,scheduled_for").not("project_id", "is", null),
      ])

      const already = new Set((queued ?? []).map((row) => row.project_id))
      const lastScheduled = (queued ?? [])
        .map((row) => (row.scheduled_for ? Date.parse(row.scheduled_for) : 0))
        .reduce((max, value) => Math.max(max, value), 0)

      let cursor = Math.max(Date.now() - DAY_MS, lastScheduled)
      let added = 0

      for (const project of (projects ?? []) as QueueProject[]) {
        if (already.has(project.id)) continue
        const media = projectMedia(project)
        if (!media) continue

        cursor += DAY_MS
        const { error } = await supabase.from("social_posts").insert({
          platform: "instagram",
          project_id: project.id,
          media_url: media.url,
          media_type: media.type,
          caption: projectCaption(project),
          hashtags: projectHashtags(project),
          scheduled_for: new Date(cursor).toISOString(),
          status: "draft",
          source: "project",
        })
        if (!error) added++
      }

      adminNotify(
        added ? `${added} פרויקטים נכנסו לתור, אחד ליום` : "אין פרויקטים חדשים עם מדיה לפרסום",
        added ? "success" : "error"
      )
      refresh()
    } finally {
      setBusy(false)
    }
  }

  async function save() {
    if (!form) return
    const payload = {
      media_url: form.media_url || null,
      media_type: form.media_type ?? "image",
      caption: form.caption ? stripEmDashes(form.caption) : null,
      hashtags: form.hashtags ?? [],
      scheduled_for: form.scheduled_for || null,
      status: form.status ?? "draft",
    }
    const { error } = form.id
      ? await supabase.from("social_posts").update(payload).eq("id", form.id)
      : await supabase.from("social_posts").insert({ ...payload, platform: "instagram", source: "manual" })
    if (error) {
      adminNotify(error.message)
      return
    }
    setForm(null)
    refresh()
  }

  async function redraft(post: Partial<SocialPostRow>) {
    if (!post.project_id) {
      adminNotify("הסוכן מנסח כיתוב מפרויקט · לפוסט ידני צריך לכתוב אותו")
      return
    }
    setBusy(true)
    try {
      const { data: project } = await supabase
        .from("projects")
        .select("title,overview,ai_tools,categories,client_name")
        .eq("id", post.project_id)
        .maybeSingle()
      if (!project) return
      const drafted = await askAgentForCaption({
        title: project.title,
        overview: project.overview,
        tools: project.ai_tools,
        categories: project.categories,
        clientName: project.client_name,
        mediaType: post.media_type ?? "image",
      })
      if (!drafted) {
        adminNotify("הסוכן לא זמין כרגע")
        return
      }
      setForm({ ...post, caption: stripEmDashes(drafted.caption), hashtags: drafted.hashtags })
    } finally {
      setBusy(false)
    }
  }

  async function publish(post: SocialPostRow) {
    setBusy(true)
    const result = await publishNow(post.id)
    setBusy(false)
    if (!result.ok) {
      adminNotify(result.message)
    } else {
      adminNotify(result.state === "published" ? "עלה לאינסטגרם" : "בהעלאה · הסרטון עדיין מתקודד, יסתיים לבד", "success")
    }
    setForm(null)
    await Promise.all([refresh(), data.refresh()])
  }

  async function remove(post: SocialPostRow) {
    await supabase.from("social_posts").delete().eq("id", post.id)
    setPosts((rows) => rows.filter((row) => row.id !== post.id))
  }

  return (
    <>
      <div className="flex justify-between items-start gap-4 flex-wrap mb-5">
        <p className="text-dim text-xs max-w-md leading-relaxed">
          פרויקט שסיימת נכנס לתור ועולה מעצמו, אחד ליום. נשארו היום {remaining} פרסומים.
        </p>
        <AdminAction onClick={queueProjects} disabled={busy}>
          {busy ? "עובד…" : "סרוק פרויקטים חדשים"}
        </AdminAction>
      </div>

      <ConnectionCard status={status} onChange={refreshStatus} />

      {posts.length === 0 ? (
        <EmptyState
          text="התור ריק. הכפתור למעלה ימלא אותו מהעבודות שכבר באתר, אחת ליום."
          action={<AdminButton onClick={() => setForm({ status: "draft", media_type: "image", hashtags: [] })}>+ פוסט ידני</AdminButton>}
        />
      ) : (
        <div className="grid gap-2">
          {posts.map((post) => (
            <AdminRow
              key={post.id}
              title={post.caption?.split("\n")[0] || "ללא כיתוב"}
              meta={[
                post.scheduled_for ? new Date(post.scheduled_for).toLocaleDateString("he-IL") : "בלי תאריך",
                post.media_type === "video" ? "סרטון" : "תמונה",
                post.error,
              ]
                .filter(Boolean)
                .join(" · ")}
              pill={STATUS_LABEL[post.status]}
              pillTone={post.status === "published" ? "good" : post.status === "failed" ? "neutral" : "quiet"}
              onClick={() => setForm(post)}
              actions={
                <RowActions
                  actions={[
                    { icon: Pencil, label: "עריכה", onClick: () => setForm(post) },
                    { icon: Trash2, label: "מחיקה", onClick: () => remove(post), variant: "danger" },
                  ]}
                />
              }
            />
          ))}
        </div>
      )}

      <div className="mt-5">
        <AdminButton onClick={() => setForm({ status: "draft", media_type: "image", hashtags: [] })}>
          + פוסט ידני
        </AdminButton>
      </div>

      {form && (
        <AdminModalShell title={form.id ? "עריכת פוסט" : "פוסט חדש"} onClose={() => setForm(null)}>
          <div className="grid gap-4">
            <MediaField
              label="מדיה"
              value={form.media_url}
              onChange={(url) => setForm({ ...form, media_url: url, media_type: /\.(mp4|webm|mov)$/i.test(url) ? "video" : "image" })}
              bucket="site-media"
            />
            <TextArea label="כיתוב" value={form.caption} onChange={(v) => setForm({ ...form, caption: v })} rows={6} />
            <StringListEditor
              label="האשטגים"
              items={form.hashtags ?? []}
              onChange={(items) => setForm({ ...form, hashtags: items })}
            />
            <div>
              <label className="text-dim text-xs uppercase font-mono mb-2 block">מתי</label>
              <input
                type="date"
                value={form.scheduled_for ? form.scheduled_for.slice(0, 10) : ""}
                onChange={(e) =>
                  setForm({ ...form, scheduled_for: e.target.value ? new Date(e.target.value).toISOString() : null })
                }
                className="bg-background border border-white/30 rounded px-4 py-3 text-sm"
              />
            </div>
            <div>
              <label className="text-dim text-xs uppercase font-mono mb-2 block">סטטוס</label>
              <select
                value={form.status ?? "draft"}
                onChange={(e) => setForm({ ...form, status: e.target.value as SocialPostRow["status"] })}
                className="bg-background border border-white/30 rounded px-4 py-3 text-sm w-full"
              >
                <option value="draft">טיוטה</option>
                <option value="ready">מוכן · יעלה בתאריך</option>
                <option value="skipped">דילוג</option>
              </select>
            </div>

            {form.permalink && (
              <a
                href={form.permalink}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-[10px] uppercase tracking-wide underline underline-offset-4 hover:text-lime"
              >
                לצפייה באינסטגרם ←
              </a>
            )}

            <div className={cn("flex flex-wrap gap-2", form.status === "published" && "opacity-60")}>
              <AdminAction onClick={save}>שמירה</AdminAction>
              {form.project_id && (
                <AdminButton onClick={() => redraft(form)} disabled={busy}>
                  {busy ? "מנסח…" : "נסח מחדש"}
                </AdminButton>
              )}
              {form.id && form.status !== "published" && (
                <AdminButton
                  onClick={() => publish(form as SocialPostRow)}
                  disabled={busy || !status?.connected || !form.media_url}
                >
                  פרסם עכשיו
                </AdminButton>
              )}
            </div>
          </div>
        </AdminModalShell>
      )}
    </>
  )
}
