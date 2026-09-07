import { useEffect, useState } from "react"
import { supabase, type SocialSettingsRow } from "@/lib/supabase"
import { AdminAction } from "@/components/admin/AdminPage"
import { adminNotify } from "@/components/admin/AdminToaster"
import { warmupCap } from "@/lib/socialSafety"
import type { SocialData } from "@/hooks/useSocialData"

/** The pacing, written down where it can be changed.
 *
 * Every number here is a rule about not looking like a bot, and the defaults
 * are deliberately slower than what an account can technically get away with:
 * the cost of being wrong is the account, and the upside of one more comment a
 * day is one more comment a day. */

function NumberField({
  label,
  hint,
  value,
  onChange,
}: {
  label: string
  hint: string
  value: number
  onChange: (value: number) => void
}) {
  return (
    <div>
      <label className="text-dim text-xs uppercase font-mono mb-2 block">{label}</label>
      <input
        inputMode="numeric"
        value={String(value)}
        onChange={(e) => onChange(Number(e.target.value.replace(/\D/g, "")) || 0)}
        className="bg-transparent border border-white/30 rounded px-4 py-3 text-sm w-28"
      />
      <p className="text-dim text-xs mt-2 max-w-sm leading-relaxed">{hint}</p>
    </div>
  )
}

function Switch({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string
  hint: string
  checked: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <label className="flex items-start gap-3 cursor-pointer">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="w-4 h-4 mt-1 accent-lime" />
      <span>
        <span className="text-sm block">{label}</span>
        <span className="text-dim text-xs block mt-1 max-w-sm leading-relaxed">{hint}</span>
      </span>
    </label>
  )
}

export function SettingsTab({ data }: { data: SocialData }) {
  const [form, setForm] = useState<SocialSettingsRow | null>(data.settings)

  useEffect(() => {
    setForm(data.settings)
  }, [data.settings])

  if (!form) return <p className="text-dim text-sm">טוען…</p>

  async function save() {
    if (!form) return
    const { error } = await supabase
      .from("social_settings")
      .update({
        fb_daily_cap: form.fb_daily_cap,
        fb_group_cooldown_days: form.fb_group_cooldown_days,
        fb_min_gap_minutes: form.fb_min_gap_minutes,
        fb_value_ratio: form.fb_value_ratio,
        warmup_started_on: form.warmup_started_on,
        ig_daily_cap: form.ig_daily_cap,
        ig_auto_publish: form.ig_auto_publish,
        ig_auto_queue_projects: form.ig_auto_queue_projects,
        updated_at: new Date().toISOString(),
      })
      .eq("id", true)
    if (error) {
      adminNotify(error.message)
      return
    }
    adminNotify("נשמר", "success")
    data.refresh()
  }

  const today = warmupCap(
    {
      fb_daily_cap: form.fb_daily_cap,
      fb_group_cooldown_days: form.fb_group_cooldown_days,
      fb_min_gap_minutes: form.fb_min_gap_minutes,
      fb_value_ratio: form.fb_value_ratio,
      warmup_started_on: form.warmup_started_on,
    },
    new Date()
  )

  return (
    <div className="max-w-xl grid gap-8">
      <div className="grid gap-6">
        <h2 className="font-mono text-[10px] uppercase tracking-wide text-dim">פייסבוק</h2>
        <NumberField
          label="תגובות ביום"
          hint={`התקרה. היום מותרות ${today} · חשבון בחימום עולה בהדרגה.`}
          value={form.fb_daily_cap}
          onChange={(v) => setForm({ ...form, fb_daily_cap: v })}
        />
        <NumberField
          label="ימי קירור לקבוצה"
          hint="כמה זמן ממתינים לפני תגובה נוספת באותה קבוצה. קבוצה יכולה להגדיר לעצמה אחרת."
          value={form.fb_group_cooldown_days}
          onChange={(v) => setForm({ ...form, fb_group_cooldown_days: v })}
        />
        <NumberField
          label="דקות בין תגובות"
          hint="שתי תגובות באותה דקה נראות כמו סקריפט, גם אם שתיהן אמיתיות."
          value={form.fb_min_gap_minutes}
          onChange={(v) => setForm({ ...form, fb_min_gap_minutes: v })}
        />
        <NumberField
          label="יחס ערך"
          hint="כמה תשובות מועילות בלי קישור לפני כל תגובה שיווקית. זה מה שמפריד בין חבר בקבוצה לספאמר."
          value={form.fb_value_ratio}
          onChange={(v) => setForm({ ...form, fb_value_ratio: v })}
        />
        <Switch
          label="חשבון בחימום"
          hint="מתחיל מתגובה אחת ביום ומוסיף אחת כל שלושה ימים עד לתקרה. מכבים אחרי שהחשבון פעיל וותיק."
          checked={Boolean(form.warmup_started_on)}
          onChange={(on) =>
            setForm({ ...form, warmup_started_on: on ? new Date().toISOString().slice(0, 10) : null })
          }
        />
      </div>

      <div className="grid gap-6">
        <h2 className="font-mono text-[10px] uppercase tracking-wide text-dim">אינסטגרם</h2>
        <NumberField
          label="פרסומים ביום"
          hint="אינסטגרם מרשה 50 ב-24 שעות. המספר כאן הוא החלטה של טעם, לא של מגבלה."
          value={form.ig_daily_cap}
          onChange={(v) => setForm({ ...form, ig_daily_cap: v })}
        />
        <Switch
          label="הכנסת פרויקטים חדשים לתור"
          hint="סריקה יומית: כל פרויקט שפורסם באתר ויש לו סרטון או תמונה נכנס לתור, אחד ליום."
          checked={form.ig_auto_queue_projects}
          onChange={(v) => setForm({ ...form, ig_auto_queue_projects: v })}
        />
        <Switch
          label="פרסום אוטומטי"
          hint="פרויקט חדש נכנס כמוכן ועולה בתאריך שלו בלי אישור. בלי זה הוא נכנס כטיוטה ומחכה לך. בלי כיתוב שנוסח, כלום לא עולה לבד."
          checked={form.ig_auto_publish}
          onChange={(v) => setForm({ ...form, ig_auto_publish: v })}
        />
      </div>

      <div className="w-fit">
        <AdminAction onClick={save}>שמירה</AdminAction>
      </div>
    </div>
  )
}
