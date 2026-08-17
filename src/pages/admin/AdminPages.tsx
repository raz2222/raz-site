import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { AdminGate } from "@/components/AdminGate"
import { AdminNav } from "@/components/AdminNav"
import { Field, TextArea, StringListEditor, PairListEditor, TripleListEditor } from "@/components/admin/FieldEditors"
import {
  HERO_DEFAULT,
  POSITIONING_DEFAULT,
  HOME_ABOUT_DEFAULT,
  PROCESS_DEFAULT,
  MODERNIZATION_DEFAULT,
  FINAL_CTA_DEFAULT,
  ABOUT_PAGE_DEFAULT,
  PROFILE_DEFAULT,
  CONTACT_PAGE_DEFAULT,
  CONTACT_INFO_DEFAULT,
  FOOTER_DEFAULT,
  TERMS_DEFAULT,
  PRIVACY_DEFAULT,
  TESTIMONIALS_DEFAULT,
} from "@/lib/siteContentDefaults"

type FieldDef =
  | { kind: "text"; key: string; label: string }
  | { kind: "textarea"; key: string; label: string; rows?: number }
  | { kind: "stringlist"; key: string; label: string }
  | { kind: "pairlist"; key: string; label: string; keyA: string; keyB: string; placeholderA: string; placeholderB: string; addLabel: string }
  | { kind: "triplelist"; key: string; label: string; keyA: string; keyB: string; keyC: string; placeholderA: string; placeholderB: string; placeholderC: string; addLabel: string }

type BlockConfig = {
  key: string
  section: string
  title: string
  fields: FieldDef[]
  defaults: Record<string, unknown>
}

const BLOCKS: BlockConfig[] = [
  {
    key: "home_hero",
    section: "דף הבית",
    title: "Hero — כותרת ראשית",
    fields: [
      { kind: "text", key: "heading_line1", label: "כותרת — שורה 1" },
      { kind: "text", key: "heading_line2", label: "כותרת — שורה 2" },
      { kind: "textarea", key: "subheading", label: "תת-כותרת", rows: 2 },
      { kind: "text", key: "cta_label", label: "טקסט כפתור" },
      { kind: "text", key: "stats_line", label: "שורת הוכחה (מספרים/ניסיון)" },
    ],
    defaults: HERO_DEFAULT,
  },
  {
    key: "home_positioning",
    section: "דף הבית",
    title: "מיצוב (אחרי ה-Hero)",
    fields: [
      { kind: "text", key: "heading_line1", label: "כותרת — שורה 1" },
      { kind: "text", key: "heading_line2", label: "כותרת — שורה 2" },
      { kind: "textarea", key: "body", label: "טקסט", rows: 3 },
    ],
    defaults: POSITIONING_DEFAULT,
  },
  {
    key: "home_about",
    section: "דף הבית",
    title: "About (תקציר בדף הבית)",
    fields: [
      { kind: "text", key: "heading", label: "כותרת" },
      { kind: "textarea", key: "paragraph1", label: "פסקה 1", rows: 2 },
      { kind: "textarea", key: "paragraph2", label: "פסקה 2", rows: 3 },
    ],
    defaults: HOME_ABOUT_DEFAULT,
  },
  {
    key: "home_process",
    section: "דף הבית",
    title: "תהליך העבודה",
    fields: [
      { kind: "text", key: "heading", label: "כותרת" },
      { kind: "pairlist", key: "steps", label: "שלבים", keyA: "title", keyB: "text", placeholderA: "כותרת שלב", placeholderB: "תיאור", addLabel: "+ הוספת שלב" },
    ],
    defaults: PROCESS_DEFAULT,
  },
  {
    key: "home_modernization",
    section: "דף הבית",
    title: "שדרוג אתר קיים",
    fields: [
      { kind: "text", key: "heading_line1", label: "כותרת — שורה 1" },
      { kind: "text", key: "heading_line2", label: "כותרת — שורה 2" },
      { kind: "textarea", key: "body", label: "טקסט", rows: 2 },
      { kind: "stringlist", key: "items", label: "תגיות" },
      { kind: "text", key: "cta_label", label: "טקסט כפתור" },
    ],
    defaults: MODERNIZATION_DEFAULT,
  },
  {
    key: "home_final_cta",
    section: "דף הבית",
    title: "CTA סופי (תחתית הדף)",
    fields: [
      { kind: "text", key: "heading_line1", label: "כותרת — שורה 1" },
      { kind: "text", key: "heading_line2", label: "כותרת — שורה 2" },
      { kind: "text", key: "cta_label", label: "טקסט כפתור" },
      { kind: "text", key: "tagline", label: "שורת תחתית" },
    ],
    defaults: FINAL_CTA_DEFAULT,
  },
  {
    key: "home_testimonials",
    section: "דף הבית",
    title: "מה אומרים (המלצות לקוחות)",
    fields: [
      {
        kind: "triplelist",
        key: "items",
        label: "המלצות — הסקשן מוסתר אוטומטית כשהרשימה ריקה",
        keyA: "quote",
        keyB: "name",
        keyC: "role",
        placeholderA: "ציטוט",
        placeholderB: "שם",
        placeholderC: "תפקיד / חברה",
        addLabel: "+ הוספת המלצה",
      },
    ],
    defaults: TESTIMONIALS_DEFAULT,
  },
  {
    key: "about_page",
    section: "עמוד עליי",
    title: "עמוד About",
    fields: [
      { kind: "text", key: "heading", label: "כותרת" },
      { kind: "textarea", key: "paragraph1", label: "פסקה 1", rows: 2 },
      { kind: "textarea", key: "paragraph2", label: "פסקה 2", rows: 3 },
      { kind: "textarea", key: "philosophy", label: "פילוסופיה (ציטוט)", rows: 3 },
    ],
    defaults: ABOUT_PAGE_DEFAULT,
  },
  {
    key: "shared_profile",
    section: "עמוד עליי",
    title: "יכולות וכלים (משותף לדף הבית ולעמוד עליי)",
    fields: [
      { kind: "stringlist", key: "capabilities", label: "יכולות" },
      { kind: "stringlist", key: "tools", label: "כלים" },
    ],
    defaults: PROFILE_DEFAULT,
  },
  {
    key: "contact_page",
    section: "צור קשר",
    title: "עמוד צור קשר",
    fields: [
      { kind: "text", key: "heading", label: "כותרת" },
      { kind: "textarea", key: "gift_note", label: "הודעת המתנה בראש הטופס", rows: 2 },
    ],
    defaults: CONTACT_PAGE_DEFAULT,
  },
  {
    key: "shared_contact",
    section: "פרטי קשר (גלובלי)",
    title: "אימייל / וואטסאפ / אינסטגרם — משמש בכל האתר",
    fields: [
      { kind: "text", key: "email", label: "אימייל ציבורי" },
      { kind: "text", key: "whatsapp_url", label: "קישור וואטסאפ" },
      { kind: "text", key: "instagram_url", label: "קישור אינסטגרם" },
    ],
    defaults: CONTACT_INFO_DEFAULT,
  },
  {
    key: "footer_content",
    section: "פוטר",
    title: "טאגליין הפוטר",
    fields: [
      { kind: "text", key: "tagline_he", label: "טאגליין (עברית)" },
      { kind: "text", key: "tagline_en", label: "Tagline (English)" },
    ],
    defaults: FOOTER_DEFAULT,
  },
  {
    key: "terms_content",
    section: "משפטי",
    title: "תנאי שימוש",
    fields: [
      { kind: "text", key: "updated_date", label: "תאריך עדכון" },
      { kind: "textarea", key: "intro", label: "פתיח", rows: 2 },
      { kind: "pairlist", key: "sections", label: "סעיפים", keyA: "heading", keyB: "body", placeholderA: "כותרת סעיף", placeholderB: "תוכן", addLabel: "+ הוספת סעיף" },
    ],
    defaults: TERMS_DEFAULT,
  },
  {
    key: "privacy_content",
    section: "משפטי",
    title: "מדיניות פרטיות",
    fields: [
      { kind: "text", key: "updated_date", label: "תאריך עדכון" },
      { kind: "textarea", key: "intro", label: "פתיח", rows: 2 },
      { kind: "pairlist", key: "sections", label: "סעיפים", keyA: "heading", keyB: "body", placeholderA: "כותרת סעיף", placeholderB: "תוכן", addLabel: "+ הוספת סעיף" },
    ],
    defaults: PRIVACY_DEFAULT,
  },
]

function BlockEditor({ block, value, onSave, saving }: { block: BlockConfig; value: Record<string, unknown>; onSave: (v: Record<string, unknown>) => void; saving: boolean }) {
  const [form, setForm] = useState<Record<string, unknown>>(value)

  function setField(key: string, v: unknown) {
    setForm((f) => ({ ...f, [key]: v }))
  }

  return (
    <div className="border border-white/10 rounded-lg px-5 py-5 grid gap-4">
      <div className="font-medium">{block.title}</div>
      {block.fields.map((f) => {
        if (f.kind === "text") {
          return <Field key={f.key} label={f.label} value={(form[f.key] as string) ?? ""} onChange={(v) => setField(f.key, v)} />
        }
        if (f.kind === "textarea") {
          return <TextArea key={f.key} label={f.label} value={(form[f.key] as string) ?? ""} onChange={(v) => setField(f.key, v)} rows={f.rows} />
        }
        if (f.kind === "stringlist") {
          return <StringListEditor key={f.key} label={f.label} items={(form[f.key] as string[]) ?? []} onChange={(v) => setField(f.key, v)} />
        }
        if (f.kind === "triplelist") {
          return (
            <TripleListEditor
              key={f.key}
              label={f.label}
              items={(form[f.key] as Record<string, string>[]) ?? []}
              keyA={f.keyA}
              keyB={f.keyB}
              keyC={f.keyC}
              placeholderA={f.placeholderA}
              placeholderB={f.placeholderB}
              placeholderC={f.placeholderC}
              addLabel={f.addLabel}
              emptyItem={{ [f.keyA]: "", [f.keyB]: "", [f.keyC]: "" }}
              onChange={(v) => setField(f.key, v)}
            />
          )
        }
        return (
          <PairListEditor
            key={f.key}
            label={f.label}
            items={(form[f.key] as Record<string, string>[]) ?? []}
            keyA={f.keyA}
            keyB={f.keyB}
            placeholderA={f.placeholderA}
            placeholderB={f.placeholderB}
            addLabel={f.addLabel}
            emptyItem={{ [f.keyA]: "", [f.keyB]: "" }}
            onChange={(v) => setField(f.key, v)}
          />
        )
      })}
      <button
        onClick={() => onSave(form)}
        disabled={saving}
        className="mt-1 font-mono text-xs uppercase tracking-wide border border-white/30 rounded-full px-5 py-2.5 hover:bg-foreground hover:text-background transition-colors disabled:opacity-50 w-fit"
      >
        {saving ? "שומר…" : "שמירה"}
      </button>
    </div>
  )
}

function AdminPagesInner() {
  const [values, setValues] = useState<Record<string, Record<string, unknown>>>({})
  const [loading, setLoading] = useState(true)
  const [savingKey, setSavingKey] = useState<string | null>(null)

  useEffect(() => {
    supabase
      .from("site_content")
      .select("key, value")
      .then(({ data }) => {
        const byKey = Object.fromEntries((data ?? []).map((row) => [row.key, row.value]))
        const merged: Record<string, Record<string, unknown>> = {}
        for (const block of BLOCKS) {
          merged[block.key] = (byKey[block.key] as Record<string, unknown>) ?? block.defaults
        }
        setValues(merged)
        setLoading(false)
      })
  }, [])

  async function save(key: string, value: Record<string, unknown>) {
    setSavingKey(key)
    const { error } = await supabase.from("site_content").upsert({ key, value })
    setSavingKey(null)
    if (error) return alert(error.message)
    setValues((v) => ({ ...v, [key]: value }))
  }

  if (loading) return <div className="pt-40 pb-40 container font-mono text-xs text-dim uppercase">טוען…</div>

  const sections = [...new Set(BLOCKS.map((b) => b.section))]

  return (
    <div className="min-h-[100dvh] pt-28 pb-28 md:pb-20 px-6 md:px-12">
      <AdminNav />

      <div className="mb-8">
        <h1 className="font-display font-bold text-xl">עמודים</h1>
        <p className="text-dim text-xs mt-1 max-w-md">
          עריכת התוכן הקבוע באתר — דף הבית, עמוד עליי, צור קשר, פוטר ועמודים משפטיים. שינוי כאן
          משפיע ישירות על מה שמוצג באתר החי.
        </p>
      </div>

      <div className="grid gap-12 max-w-2xl">
        {sections.map((section) => (
          <div key={section}>
            <div className="font-mono text-xs uppercase tracking-wide text-dim mb-4">{section}</div>
            <div className="grid gap-4">
              {BLOCKS.filter((b) => b.section === section).map((block) => (
                <BlockEditor
                  key={block.key}
                  block={block}
                  value={values[block.key] ?? block.defaults}
                  saving={savingKey === block.key}
                  onSave={(v) => save(block.key, v)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function AdminPages() {
  return (
    <AdminGate>
      <AdminPagesInner />
    </AdminGate>
  )
}
