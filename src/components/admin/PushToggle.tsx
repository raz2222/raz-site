import { useEffect, useState } from "react"
import { disablePush, enablePush, pushState, type PushState } from "@/lib/push"
import { adminNotify } from "@/components/admin/AdminToaster"

/** Turning phone notifications on. It has to be a button: iOS refuses a
 * permission prompt that no tap asked for, and having refused once it will not
 * ask again on that page load. */
export function PushToggle() {
  const [state, setState] = useState<PushState | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let alive = true
    pushState().then((next) => alive && setState(next))
    return () => {
      alive = false
    }
  }, [])

  async function toggle() {
    setBusy(true)
    try {
      const next = state === "on" ? await disablePush() : await enablePush()
      setState(next)
      if (next === "on") adminNotify("התראות בנייד פועלות")
      else if (next === "blocked") adminNotify("הדפדפן חוסם התראות · צריך לאשר אותן בהגדרות שלו", "error")
    } catch {
      adminNotify("ההפעלה נכשלה. נסה שוב.", "error")
    } finally {
      setBusy(false)
    }
  }

  if (state === null) return null

  return (
    <div className="border border-white/10 rounded-lg p-5 grid gap-3 max-w-md">
      <div>
        <div className="font-mono text-[10px] uppercase tracking-wide text-dim">התראות בנייד</div>
        <p className="text-dim text-xs mt-2 leading-relaxed">{DESCRIPTIONS[state]}</p>
      </div>

      {(state === "on" || state === "off") && (
        <button
          onClick={toggle}
          disabled={busy}
          className={
            state === "on"
              ? "w-fit font-mono text-[10px] uppercase tracking-wide border border-white/25 rounded-full px-5 min-h-[44px] hover:border-lime transition-colors disabled:opacity-40"
              : "w-fit font-mono text-[10px] font-bold uppercase tracking-wide bg-lime text-black rounded-full px-5 min-h-[44px] hover:scale-105 transition-transform disabled:opacity-40 disabled:hover:scale-100"
          }
        >
          {busy ? "רגע…" : state === "on" ? "כיבוי" : "הפעלת התראות"}
        </button>
      )}
    </div>
  )
}

const DESCRIPTIONS: Record<PushState, string> = {
  on: "פנייה מהאתר או חתימה יקפצו לך על המסך. בין 22:00 ל-08:00 שקט · הן עדיין נספרות בבאדג' ומחכות בבוקר.",
  off: "אפשר לקבל פנייה חדשה או חתימה כהתראה על המסך, בלי לפתוח את האדמין.",
  "not-installed":
    "התראות עובדות רק כשהאדמין מותקן כאפליקציה. בספארי: שיתוף ← הוסף למסך הבית, ואז פתח מהאייקון וחזור לכאן.",
  blocked: "הדפדפן חוסם התראות לאתר הזה. צריך לאשר אותן בהגדרות שלו, ואז לחזור לכאן.",
  unsupported: "הדפדפן הזה לא תומך בהתראות.",
}
