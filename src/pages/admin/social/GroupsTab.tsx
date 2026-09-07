import { useState } from "react"
import { Pencil, Trash2 } from "lucide-react"
import { supabase, type FbGroupRow } from "@/lib/supabase"
import { AdminAction, AdminButton, AdminRow, EmptyState } from "@/components/admin/AdminPage"
import { AdminModalShell } from "@/components/admin/AdminModalShell"
import { RowActions } from "@/components/admin/RowActions"
import { Field, NumberField, TextArea, ToggleField } from "@/components/admin/FieldEditors"
import { adminNotify } from "@/components/admin/AdminToaster"
import type { SocialData } from "@/hooks/useSocialData"

/** The groups, and when each one is next free.
 *
 * `rules_note` is the field that matters most and the easiest to skip: most
 * groups forbid links outright, or allow them one day a week, and breaking a
 * group's own rule gets a person removed long before Meta notices anything. It
 * is passed to the agent with every draft, so the reply obeys the group it is
 * going into. */

const DAY_MS = 24 * 60 * 60 * 1000

type Draft = Partial<FbGroupRow>

function readiness(group: FbGroupRow, data: SocialData): { label: string; tone: "good" | "quiet" } {
  const last = data.actions.find((action) => action.group_id === group.id)
  if (!last) return { label: "פנוי", tone: "good" }
  const readyAt = Date.parse(last.created_at) + group.cooldown_days * DAY_MS
  if (Date.now() >= readyAt) return { label: "פנוי", tone: "good" }
  return { label: `עוד ${Math.ceil((readyAt - Date.now()) / DAY_MS)} ימים`, tone: "quiet" }
}

export function GroupsTab({ data }: { data: SocialData }) {
  const [form, setForm] = useState<Draft | null>(null)

  async function save() {
    if (!form?.name?.trim()) return
    const payload = {
      name: form.name.trim(),
      url: form.url?.trim() || null,
      members: form.members ? Number(form.members) : null,
      rules_note: form.rules_note?.trim() || null,
      links_allowed: form.links_allowed ?? false,
      cooldown_days: Number(form.cooldown_days) || 7,
      active: form.active ?? true,
    }
    const { error } = form.id
      ? await supabase.from("fb_groups").update(payload).eq("id", form.id)
      : await supabase.from("fb_groups").insert(payload)
    if (error) {
      adminNotify(error.message)
      return
    }
    setForm(null)
    data.refresh()
  }

  async function remove(group: FbGroupRow) {
    await supabase.from("fb_groups").delete().eq("id", group.id)
    data.refresh()
  }

  return (
    <>
      <div className="flex justify-between items-start gap-4 flex-wrap mb-5">
        <p className="text-dim text-xs max-w-md leading-relaxed">
          כל קבוצה והכללים שלה. הכללים נשלחים לסוכן עם כל ניסוח · קבוצה שאוסרת קישורים תקבל תגובה בלי קישור.
        </p>
        <AdminAction onClick={() => setForm({ cooldown_days: 7, links_allowed: false, active: true })}>
          + קבוצה
        </AdminAction>
      </div>

      {data.groups.length === 0 ? (
        <EmptyState
          text="עוד לא הוגדרו קבוצות. מוסיפים את הקבוצות שאתה חבר בהן, וכל אחת מקבלת קצב משלה."
          action={<AdminButton onClick={() => setForm({ cooldown_days: 7, links_allowed: false, active: true })}>+ קבוצה</AdminButton>}
        />
      ) : (
        <div className="grid gap-2">
          {data.groups.map((group) => {
            const state = readiness(group, data)
            return (
              <AdminRow
                key={group.id}
                title={group.name}
                meta={[
                  group.members ? `${group.members.toLocaleString("he-IL")} חברים` : null,
                  group.links_allowed ? "קישורים מותרים" : "בלי קישורים",
                  `קירור ${group.cooldown_days} ימים`,
                ]
                  .filter(Boolean)
                  .join(" · ")}
                pill={group.active ? state.label : "כבוי"}
                pillTone={group.active ? state.tone : "quiet"}
                onClick={() => setForm(group)}
                actions={
                  <RowActions
                    actions={[
                      { icon: Pencil, label: "עריכה", onClick: () => setForm(group) },
                      { icon: Trash2, label: "מחיקה", onClick: () => remove(group), variant: "danger" },
                    ]}
                  />
                }
              />
            )
          })}
        </div>
      )}

      {form && (
        <AdminModalShell title={form.id ? "עריכת קבוצה" : "קבוצה חדשה"} onClose={() => setForm(null)}>
          <div className="grid gap-4">
            <Field label="שם" value={form.name ?? ""} onChange={(v) => setForm({ ...form, name: v })} />
            <Field label="קישור" value={form.url ?? ""} onChange={(v) => setForm({ ...form, url: v })} />
            <NumberField
              label="מספר חברים"
              value={form.members ?? 0}
              onChange={(v) => setForm({ ...form, members: v || null })}
            />
            <TextArea
              label="כללי הקבוצה"
              value={form.rules_note}
              onChange={(v) => setForm({ ...form, rules_note: v })}
              rows={3}
            />
            <NumberField
              label="ימי קירור בין תגובות"
              hint="כמה ממתינים לפני תגובה נוספת כאן. גובר על ברירת המחדל שבטאב קצב."
              value={form.cooldown_days ?? 7}
              onChange={(v) => setForm({ ...form, cooldown_days: v })}
            />
            <ToggleField
              label="קישורים"
              hint="רוב הקבוצות אוסרות קישורים. הסוכן מנסח בהתאם, ותגובה עם קישור לקבוצה שאוסרת היא הדרך המהירה להיזרק ממנה."
              checked={form.links_allowed ?? false}
              onChange={(v) => setForm({ ...form, links_allowed: v })}
              onLabel="ביטול"
              offLabel="הקבוצה מרשה קישורים"
            />
            <ToggleField
              label="פעילה"
              hint="קבוצה כבויה נשארת ברשימה עם ההיסטוריה שלה, ולא מוצעת לתגובה."
              checked={form.active ?? true}
              onChange={(v) => setForm({ ...form, active: v })}
              onLabel="כיבוי"
              offLabel="הפעלה"
            />
            <div className="w-fit">
              <AdminAction onClick={save} disabled={!form.name?.trim()}>שמירה</AdminAction>
            </div>
          </div>
        </AdminModalShell>
      )}
    </>
  )
}
