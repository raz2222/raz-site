import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { AdminGate } from "@/components/AdminGate"
import { AdminPage } from "@/components/admin/AdminPage"
import { Field, TextArea, StringListEditor, PairListEditor, TripleListEditor, MediaField } from "@/components/admin/FieldEditors"
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
import { PAGE_SEO_DEFAULTS } from "@/lib/pageSeo"
import { adminNotify } from "@/components/admin/AdminToaster"

type FieldDef =
  | { kind: "text"; key: string; label: string }
  | { kind: "image"; key: string; label: string }
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
    title: "Hero · כותרת ראשית",
    fields: [
      { kind: "text", key: "heading_line1", label: "כותרת · שורה 1" },
      { kind: "text", key: "heading_line2", label: "כותרת · שורה 2" },
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
      { kind: "text", key: "heading_line1", label: "כותרת · שורה 1" },
      { kind: "text", key: "heading_line2", label: "כותרת · שורה 2" },
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
      { kind: "text", key: "heading_line1", label: "כותרת · שורה 1" },
      { kind: "text", key: "heading_line2", label: "כותרת · שורה 2" },
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
      { kind: "text", key: "heading_line1", label: "כותרת · שורה 1" },
      { kind: "text", key: "heading_line2", label: "כותרת · שורה 2" },
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
        label: "המלצות: הסקשן מוסתר אוטומטית כשהרשימה ריקה",
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
      { kind: "image", key: "portrait", label: "תמונת הפרופיל" },
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
    title: "אימייל / וואטסאפ / אינסטגרם: משמש בכל האתר",
    fields: [
      { kind: "text", key: "email", label: "אימייל ציבורי" },
      { kind: "text", key: "whatsapp_url", label: "קישור וואטסאפ" },
      { kind: "text", key: "instagram_url", label: "קישור אינסטגרם" },
      { kind: "text", key: "linkedin_url", label: "קישור לינקדאין" },
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

// Only pages whose own text has actually been moved into PAGE_SEO_DEFAULTS. A
// page listed before that would show invented copy in these boxes as if it were
// the site's, and one save would publish it.
const SEO_PAGES: { key: string; title: string }[] = [
  { key: "seo_home", title: "דף הבית" },
  { key: "seo_about", title: "עליי" },
  { key: "seo_contact", title: "צור קשר" },
  { key: "seo_work", title: "עבודות" },
  { key: "seo_faq", title: "שאלות ותשובות" },
  { key: "seo_guides", title: "בלוג" },
  { key: "seo_tutorials", title: "מדריכים" },
]

/** SEO for the pages that are components rather than rows. Guides, projects and
 * services carry their own meta on their own row and are edited there. */
const SEO_BLOCKS: BlockConfig[] = SEO_PAGES.map(({ key, title }) => ({
  key,
  section: "SEO",
  title,
  fields: [
    { kind: "text", key: "meta_title", label: "כותרת לגוגל (Title)" },
    { kind: "textarea", key: "meta_description", label: "תיאור לגוגל (Description)", rows: 2 },
    { kind: "image", key: "og_image", label: "תמונת שיתוף (OG)" },
  ],
  defaults: PAGE_SEO_DEFAULTS[key],
}))

const ALL_BLOCKS: BlockConfig[] = [...BLOCKS, ...SEO_BLOCKS]

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
        if (f.kind === "image") {
          // The same upload field the projects and AI screens already use, so a
          // page image is chosen the way every other image on the site is.
          return (
            <MediaField
              key={f.key}
              label={f.label}
              kind="image"
              bucket="site-media"
              value={(form[f.key] as string) ?? ""}
              onChange={(v) => setField(f.key, v)}
            />
          )
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
        for (const block of ALL_BLOCKS) {
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
    if (error) return adminNotify(error.message)
    setValues((v) => ({ ...v, [key]: value }))
  }


  const sections = [...new Set(ALL_BLOCKS.map((b) => b.section))]

  return (
    <AdminPage
      title="עמודים"
      description="התוכן הקבוע באתר: דף הבית, עליי, צור קשר, פוטר והעמודים המשפטיים."
      loading={loading}
    >

      <div className="grid gap-12 max-w-2xl">
        {sections.map((section) => (
          <div key={section}>
            <div className="font-mono text-xs uppercase tracking-wide text-dim mb-4">{section}</div>
            <div className="grid gap-4">
              {ALL_BLOCKS.filter((b) => b.section === section).map((block) => (
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
    </AdminPage>
  )
}

export function AdminPages() {
  return (
    <AdminGate>
      <AdminPagesInner />
    </AdminGate>
  )
}
