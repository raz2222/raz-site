import { useEffect, useState } from "react"
import { supabase, type SocialSettingsRow } from "@/lib/supabase"
import { AdminAction } from "@/components/admin/AdminPage"
import { NumberField, ToggleField } from "@/components/admin/FieldEditors"
import { adminNotify } from "@/components/admin/AdminToaster"
import { warmupCap } from "@/lib/socialSafety"
import type { SocialData } from "@/hooks/useSocialData"

/** The pacing, written down where it can be changed.
 *
 * Laid out like `/admin/business`, which is the other screen that is a form
 * rather than a list: sections with a real heading and a sentence under it,
 * then the fields. Every number here is a rule about not looking like a bot,
 * and the defaults are slower than what an account can technically get away
 * with · the cost of being wrong is the account, and the upside of one more
 * comment a day is one more comment a day. */
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
    <div className="grid gap-10 max-w-xl">
      <section className="grid gap-4">
        <div>
          <h2 className="font-display font-medium text-lg">קצב בפייסבוק</h2>
          <p className="text-dim text-xs mt-1">מה שמפריד בין חבר בקבוצה לחשבון שנחסם.</p>
        </div>
        <NumberField
          label="תגובות ביום"
          hint={`התקרה. היום מותרות ${today} · חשבון בחימום עולה בהדרגה.`}
          value={form.fb_daily_cap}
          onChange={(v) => setForm({ ...form, fb_daily_cap: v })}
        />
        <NumberField
          label="ימי קירור לקבוצה"
          hint="כמה ממתינים לפני תגובה נוספת באותה קבוצה. לקבוצה אפשר להגדיר משלה."
          value={form.fb_group_cooldown_days}
          onChange={(v) => setForm({ ...form, fb_group_cooldown_days: v })}
        />
        <NumberField
          label="דקות בין תגובות"
          hint="שתי תגובות באותה דקה נראות כמו סקריפט, גם כששתיהן אמיתיות."
          value={form.fb_min_gap_minutes}
          onChange={(v) => setForm({ ...form, fb_min_gap_minutes: v })}
        />
        <NumberField
          label="יחס ערך"
          hint="כמה תשובות מועילות בלי קישור לפני כל תגובה שיווקית."
          value={form.fb_value_ratio}
          onChange={(v) => setForm({ ...form, fb_value_ratio: v })}
        />
        <ToggleField
          label="חשבון בחימום"
          hint="מתחיל מתגובה אחת ביום ומוסיף אחת כל שלושה ימים עד לתקרה. מכבים אחרי שהחשבון ותיק ופעיל."
          checked={Boolean(form.warmup_started_on)}
          onChange={(on) => setForm({ ...form, warmup_started_on: on ? new Date().toISOString().slice(0, 10) : null })}
        />
      </section>

      <section className="grid gap-4">
        <div>
          <h2 className="font-display font-medium text-lg">אינסטגרם</h2>
          <p className="text-dim text-xs mt-1">מה שעולה לבד, ובאיזה קצב.</p>
        </div>
        <NumberField
          label="פרסומים ביום"
          hint="אינסטגרם מרשה 50 ב-24 שעות. המספר כאן הוא החלטה של טעם, לא של מגבלה."
          value={form.ig_daily_cap}
          onChange={(v) => setForm({ ...form, ig_daily_cap: v })}
        />
        <ToggleField
          label="הכנסת פרויקטים לתור"
          hint="סריקה יומית: כל פרויקט שפורסם באתר ויש לו סרטון או תמונה נכנס לתור, אחד ליום."
          checked={form.ig_auto_queue_projects}
          onChange={(v) => setForm({ ...form, ig_auto_queue_projects: v })}
        />
        <ToggleField
          label="פרסום אוטומטי"
          hint="פרויקט חדש נכנס כמוכן ועולה בתאריך שלו בלי אישור. בלי זה הוא מחכה לך כטיוטה. בלי כיתוב שנוסח, כלום לא עולה לבד."
          checked={form.ig_auto_publish}
          onChange={(v) => setForm({ ...form, ig_auto_publish: v })}
        />
      </section>

      <div className="w-fit">
        <AdminAction onClick={save}>שמירה</AdminAction>
      </div>
    </div>
  )
}
