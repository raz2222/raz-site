import { useEffect, useState } from "react"
import { authHeaders } from "@/lib/accessToken"
import { adminNotify } from "@/components/admin/AdminToaster"
import { AdminButton } from "@/components/admin/AdminPage"

type Status = { connected: boolean; email?: string | null; busyCount?: number; error?: string }

const ERRORS: Record<string, string> = {
  invalid_url: "זו לא הכתובת הסודית. היא מתחילה ב-https://calendar.google.com/calendar/ical/ ונגמרת ב-basic.ics",
  unreadable: "גוגל לא החזיר יומן מהכתובת הזו. כדאי להעתיק אותה שוב.",
  unauthorized: "צריך להתחבר מחדש לאדמין.",
}

/** Connecting Google Calendar, so the time picker on the thank-you page only
 * offers slots Raz is actually free for. The one step only he can take:
 * Google shows the secret address to the calendar's owner and nobody else. */
export function CalendarConnect() {
  const [status, setStatus] = useState<Status | null>(null)
  const [url, setUrl] = useState("")
  const [busy, setBusy] = useState(false)

  async function call(method: "GET" | "POST" | "DELETE", body?: unknown) {
    const res = await fetch("/api/notify-lead?action=calendar", {
      method,
      headers: { "Content-Type": "application/json", ...(await authHeaders()) },
      body: body ? JSON.stringify(body) : undefined,
    })
    const json = (await res.json().catch(() => ({}))) as Status & { code?: string }
    if (!res.ok) throw new Error(json.code ?? String(res.status))
    return json
  }

  useEffect(() => {
    call("GET").then(setStatus, () => setStatus({ connected: false }))
  }, [])

  async function save() {
    setBusy(true)
    try {
      const next = await call("POST", { url })
      setStatus(next)
      setUrl("")
      adminNotify("היומן מחובר")
    } catch (err) {
      adminNotify(ERRORS[(err as Error).message] ?? "החיבור נכשל. נסה שוב.", "error")
    } finally {
      setBusy(false)
    }
  }

  async function disconnect() {
    if (!confirm("לנתק את היומן? דף התודה יציע שוב את כל השעות.")) return
    setBusy(true)
    try {
      setStatus(await call("DELETE"))
    } finally {
      setBusy(false)
    }
  }

  if (status === null) return null

  return (
    <div className="border border-white/10 rounded-lg p-5 grid gap-3 max-w-md">
      <div>
        <div className="font-mono text-[10px] uppercase tracking-wide text-dim">יומן Google</div>
        {status.connected ? (
          <p className="text-dim text-xs mt-2 leading-relaxed">
            {status.error
              ? `מחובר ל-${status.email ?? "יומן"}, אבל הקריאה האחרונה נכשלה. דף התודה מציע בינתיים את כל השעות פחות הפגישות שבאדמין.`
              : `מחובר ל-${status.email ?? "יומן"}. דף התודה מסתיר כל שעה שתפוסה אצלך (${status.busyCount ?? 0} אירועים בשבועיים הקרובים), וכל שיחה שנקבעת נכנסת ליומן לבד.`}
          </p>
        ) : (
          <p className="text-dim text-xs mt-2 leading-relaxed">
            כדי שלקוחות יוכלו לקבוע רק כשאתה באמת פנוי: ביומן Google במחשב, גלגל השיניים ← הגדרות ← בצד, היומן שלך ← גוללים ל"כתובת סודית בפורמט iCal" ← מעתיקים ומדביקים כאן.
          </p>
        )}
      </div>

      {status.connected ? (
        <AdminButton onClick={disconnect} disabled={busy} tone="danger">
          ניתוק
        </AdminButton>
      ) : (
        <>
          <input
            dir="ltr"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://calendar.google.com/calendar/ical/…/basic.ics"
            className="w-full bg-transparent border border-white/15 rounded-lg px-3 min-h-[44px] text-xs focus:outline-none focus:border-lime"
          />
          <button
            onClick={save}
            disabled={busy || !url.trim()}
            className="w-fit font-mono text-[10px] font-bold uppercase tracking-wide bg-lime text-black rounded-full px-5 min-h-[44px] hover:scale-105 transition-transform disabled:opacity-40 disabled:hover:scale-100"
          >
            {busy ? "בודק…" : "חיבור"}
          </button>
        </>
      )}
    </div>
  )
}
