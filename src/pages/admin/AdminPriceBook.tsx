import { useEffect, useMemo, useState } from "react"
import { Trash2 } from "lucide-react"
import {
  supabase,
  PRICE_BOOK_CATEGORIES,
  type PriceBookItemRow,
  type PriceBookBillingType,
  type QuoteSettingsRow,
  type HiggsfieldCreditType,
} from "@/lib/supabase"
import { AdminGate } from "@/components/AdminGate"
import { AdminNav } from "@/components/AdminNav"
import { AdminModalShell } from "@/components/admin/AdminModalShell"
import { RowActions } from "@/components/admin/RowActions"
import { Field, TextArea } from "@/components/admin/FieldEditors"
import { cn } from "@/lib/utils"

const BILLING_TYPES: { value: PriceBookBillingType; label: string }[] = [
  { value: "fixed", label: "מחיר קבוע" },
  { value: "starting_from", label: "החל מ-" },
  { value: "per_unit", label: "ליחידה" },
  { value: "per_hour", label: "לשעה" },
  { value: "monthly", label: "חודשי" },
  { value: "custom", label: "מותאם (ידני בכל הצעה)" },
]

type ItemFormState = Omit<PriceBookItemRow, "id" | "created_at"> & { id?: string }

const emptyItem: ItemFormState = {
  category: "websites",
  package_slug: "",
  name: "",
  description: "",
  internal_description: "",
  client_description: "",
  base_price: null,
  minimum_price: null,
  recommended_price: null,
  cost: null,
  estimated_hours: null,
  billing_type: "fixed",
  unit: "",
  quantity_enabled: false,
  recurring: false,
  included_by_default: false,
  optional: true,
  active: true,
  sort_order: 0,
}

const TABS = ["מחירון", "הגדרות"] as const
type Tab = (typeof TABS)[number]

function NumField({ label, value, onChange }: { label: string; value: number | null; onChange: (v: number | null) => void }) {
  return (
    <div>
      <label className="text-dim text-xs uppercase font-mono mb-2 block">{label}</label>
      <input
        type="number"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
        className="w-full bg-transparent border border-white/30 rounded px-4 py-3 text-sm focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:border-white/50"
      />
    </div>
  )
}

function AdminPriceBookInner() {
  const [tab, setTab] = useState<Tab>("מחירון")
  const [items, setItems] = useState<PriceBookItemRow[]>([])
  const [settings, setSettings] = useState<QuoteSettingsRow | null>(null)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState<ItemFormState | null>(null)
  const [saving, setSaving] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState<string>("הכל")
  const [search, setSearch] = useState("")
  const [bulkMode, setBulkMode] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())

  async function refresh() {
    const [{ data: i }, { data: s }] = await Promise.all([
      supabase.from("price_book_items").select("*").order("sort_order"),
      supabase.from("quote_settings").select("*").maybeSingle(),
    ])
    setItems(i ?? [])
    setSettings(s ?? null)
    setLoading(false)
  }

  useEffect(() => {
    refresh()
  }, [])

  const filtered = useMemo(() => {
    return items.filter((it) => {
      if (categoryFilter !== "הכל" && it.category !== categoryFilter) return false
      if (search.trim() && !it.name.includes(search.trim()) && !it.package_slug.includes(search.trim())) return false
      return true
    })
  }, [items, categoryFilter, search])

  const grouped = useMemo(() => {
    const map = new Map<string, PriceBookItemRow[]>()
    for (const it of filtered) {
      const key = `${it.category}::${it.package_slug}`
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(it)
    }
    return [...map.entries()]
  }, [filtered])

  function openNew() {
    setForm({ ...emptyItem })
  }

  function openEdit(it: PriceBookItemRow) {
    setForm({ ...it })
  }

  async function saveItem() {
    if (!form) return
    setSaving(true)
    const payload = {
      category: form.category,
      package_slug: form.package_slug.trim(),
      name: form.name.trim(),
      description: form.description || null,
      internal_description: form.internal_description || null,
      client_description: form.client_description || null,
      base_price: form.base_price,
      minimum_price: form.minimum_price,
      recommended_price: form.recommended_price,
      cost: form.cost,
      estimated_hours: form.estimated_hours,
      billing_type: form.billing_type,
      unit: form.unit || null,
      quantity_enabled: form.quantity_enabled,
      recurring: form.recurring,
      included_by_default: form.included_by_default,
      optional: form.optional,
      active: form.active,
      sort_order: form.sort_order,
    }
    const { error } = form.id
      ? await supabase.from("price_book_items").update(payload).eq("id", form.id)
      : await supabase.from("price_book_items").insert(payload)
    setSaving(false)
    if (error) return alert(error.message)
    setForm(null)
    refresh()
  }

  async function deleteItem(id: string) {
    if (!confirm("למחוק את הפריט מהמחירון? הצעות מחיר קיימות שכבר משתמשות בו לא ישתנו.")) return
    await supabase.from("price_book_items").delete().eq("id", id)
    refresh()
  }

  function toggleSelected(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function exitBulkMode() {
    setBulkMode(false)
    setSelected(new Set())
  }

  async function setActiveForSelected(active: boolean) {
    if (selected.size === 0) return
    setSaving(true)
    await supabase.from("price_book_items").update({ active }).in("id", [...selected])
    setSaving(false)
    exitBulkMode()
    refresh()
  }

  function addCreditType() {
    if (!settings) return
    setSettings({
      ...settings,
      higgsfield_credit_types: [
        ...settings.higgsfield_credit_types,
        { id: crypto.randomUUID(), label: "", unit: "per_item", creditsPerUnit: 0 },
      ],
    })
  }

  function updateCreditType(id: string, patch: Partial<QuoteSettingsRow["higgsfield_credit_types"][number]>) {
    if (!settings) return
    setSettings({
      ...settings,
      higgsfield_credit_types: settings.higgsfield_credit_types.map((ct) => (ct.id === id ? { ...ct, ...patch } : ct)),
    })
  }

  function removeCreditType(id: string) {
    if (!settings) return
    setSettings({ ...settings, higgsfield_credit_types: settings.higgsfield_credit_types.filter((ct) => ct.id !== id) })
  }

  async function saveSettings() {
    if (!settings) return
    setSaving(true)
    const { id: _id, ...payload } = settings
    const { error } = await supabase.from("quote_settings").update(payload).eq("id", true)
    setSaving(false)
    if (error) return alert(error.message)
    refresh()
  }

  if (loading) return <div className="pt-40 pb-40 container font-mono text-xs text-dim uppercase">טוען…</div>

  return (
    <div className="min-h-[100dvh] pt-28 pb-28 md:pb-20 px-6 md:px-12">
      <AdminNav />

      <div className="flex items-center gap-2 mb-6 border-b border-white/10">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "font-mono text-xs uppercase tracking-wide px-4 py-3 border-b-2 -mb-px transition-colors",
              tab === t ? "border-foreground text-foreground" : "border-transparent text-dim hover:text-lime"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "מחירון" && (
        <>
          <div className="flex justify-between items-start gap-4 mb-6 flex-wrap">
            <div>
              <h1 className="font-display font-bold text-xl">מחירון פנימי</h1>
              <p className="text-dim text-xs mt-1 max-w-md">
                המקור היחיד לתמחור בבונה ההצעות. שינוי מחיר כאן משפיע רק על הצעות חדשות — הצעות קיימות שומרות את המחיר שנקבע בזמן היצירה.
              </p>
            </div>
            <div className="flex items-center gap-2 flex-none flex-wrap">
              {bulkMode ? (
                <button
                  onClick={exitBulkMode}
                  className="font-mono text-xs uppercase tracking-wide border border-white/30 rounded-full px-4 py-2 hover:bg-foreground hover:text-background transition-colors"
                >
                  ביטול בחירה
                </button>
              ) : (
                <button
                  onClick={() => setBulkMode(true)}
                  className="font-mono text-xs uppercase tracking-wide border border-white/30 rounded-full px-4 py-2 hover:bg-foreground hover:text-background transition-colors"
                >
                  בחירה מרובה
                </button>
              )}
              <button
                onClick={openNew}
                className="font-mono text-xs uppercase tracking-wide border border-white/30 rounded-full px-4 py-2 hover:bg-foreground hover:text-background transition-colors"
              >
                + פריט חדש
              </button>
            </div>
          </div>

          {bulkMode && (
            <div className="sticky top-20 z-30 flex items-center gap-3 flex-wrap mb-6 bg-background/95 backdrop-blur border border-white/15 rounded-lg px-4 py-3">
              <span className="font-mono text-xs text-dim">{selected.size} נבחרו</span>
              <button
                onClick={() => setActiveForSelected(false)}
                disabled={saving || selected.size === 0}
                className="font-mono text-[10px] font-bold uppercase tracking-wide border border-white/30 rounded-full px-4 py-2 hover:border-lime transition-colors disabled:opacity-40"
              >
                כיבוי נבחרים
              </button>
              <button
                onClick={() => setActiveForSelected(true)}
                disabled={saving || selected.size === 0}
                className="font-mono text-[10px] font-bold uppercase tracking-wide border border-white/30 rounded-full px-4 py-2 hover:border-lime transition-colors disabled:opacity-40"
              >
                הפעלת נבחרים
              </button>
              <span className="text-dim text-[11px] max-w-xs">
                לחצו על שורה כדי לסמן/לבטל סימון. פריטים כבויים לא נמחקים — הם נשארים במאגר ולא מוצגים כברירת מחדל בבונה ההצעות.
              </span>
            </div>
          )}

          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => setCategoryFilter("הכל")}
              className={cn(
                "font-mono text-[10px] font-bold uppercase tracking-wide rounded-full px-3 py-1.5 border transition-colors",
                categoryFilter === "הכל" ? "border-lime bg-lime text-black" : "border-white/15 text-dim hover:border-lime"
              )}
            >
              הכל
            </button>
            {PRICE_BOOK_CATEGORIES.map((c) => (
              <button
                key={c.value}
                onClick={() => setCategoryFilter(c.value)}
                className={cn(
                  "font-mono text-[10px] font-bold uppercase tracking-wide rounded-full px-3 py-1.5 border transition-colors",
                  categoryFilter === c.value ? "border-lime bg-lime text-black" : "border-white/15 text-dim hover:border-lime"
                )}
              >
                {c.label}
              </button>
            ))}
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="חיפוש…"
              className="bg-transparent border border-white/20 rounded-full px-4 py-1.5 text-xs w-full sm:w-40"
            />
          </div>

          <div className="grid gap-8">
            {grouped.map(([key, groupItems]) => {
              const [category, packageSlug] = key.split("::")
              return (
                <div key={key}>
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="font-mono text-[11px] uppercase tracking-wide text-dim">
                      {PRICE_BOOK_CATEGORIES.find((c) => c.value === category)?.label} · {packageSlug}
                    </div>
                    {bulkMode && (
                      <button
                        onClick={() =>
                          setSelected((prev) => {
                            const next = new Set(prev)
                            groupItems.forEach((it) => next.add(it.id))
                            return next
                          })
                        }
                        className="font-mono text-[10px] uppercase text-dim hover:text-lime transition-colors flex-none"
                      >
                        בחר את כל הקבוצה
                      </button>
                    )}
                  </div>
                  <div className="grid gap-2">
                    {groupItems.map((it) => (
                      <div
                        key={it.id}
                        onClick={() => (bulkMode ? toggleSelected(it.id) : openEdit(it))}
                        role="button"
                        tabIndex={0}
                        className={cn(
                          "text-right border rounded-lg px-4 py-3 transition-colors flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 cursor-pointer",
                          bulkMode && selected.has(it.id)
                            ? "border-lime bg-lime/10"
                            : "border-white/10 hover:border-lime",
                          !it.active && "opacity-40"
                        )}
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          {bulkMode && (
                            <input
                              type="checkbox"
                              checked={selected.has(it.id)}
                              onChange={() => toggleSelected(it.id)}
                              onClick={(e) => e.stopPropagation()}
                              className="mt-1 flex-none"
                            />
                          )}
                          <div className="min-w-0">
                            <div className="text-sm font-medium">
                              {it.name} {it.recurring && <span className="text-dim text-xs">· חודשי</span>}
                              {!it.active && <span className="text-red-400 text-xs"> · לא פעיל</span>}
                            </div>
                            {it.description && <div className="text-dim text-xs mt-1 max-w-lg truncate">{it.description}</div>}
                          </div>
                        </div>
                        <div className="font-mono text-xs text-dim flex-none">
                          {it.base_price != null ? `₪${it.base_price.toLocaleString("he-IL")}` : "—"}
                          {" · "}
                          {BILLING_TYPES.find((b) => b.value === it.billing_type)?.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      {tab === "הגדרות" && settings && (
        <div className="max-w-lg grid gap-4">
          <h1 className="font-display font-bold text-xl mb-2">הגדרות הצעות מחיר</h1>
          <Field label="מטבע" value={settings.currency} onChange={(v) => setSettings({ ...settings, currency: v })} />
          <NumField label="אחוז מע״מ" value={settings.vat_percent} onChange={(v) => setSettings({ ...settings, vat_percent: v ?? 0 })} />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={settings.vat_included} onChange={(e) => setSettings({ ...settings, vat_included: e.target.checked })} />
            המחירים כוללים מע״מ
          </label>
          <NumField
            label="תוקף הצעה בברירת מחדל (ימים)"
            value={settings.default_validity_days}
            onChange={(v) => setSettings({ ...settings, default_validity_days: v ?? 14 })}
          />
          <Field
            label="תנאי תשלום ברירת מחדל"
            value={settings.default_payment_terms}
            onChange={(v) => setSettings({ ...settings, default_payment_terms: v })}
          />
          <NumField
            label="יעד רווחיות מינימלי (%)"
            value={settings.min_margin_target}
            onChange={(v) => setSettings({ ...settings, min_margin_target: v ?? 0 })}
          />
          <NumField
            label="יעד תעריף שעתי אפקטיבי מינימלי (₪)"
            value={settings.min_hourly_rate_target}
            onChange={(v) => setSettings({ ...settings, min_hourly_rate_target: v ?? 0 })}
          />

          <div>
            <label className="text-dim text-xs uppercase font-mono mb-2 block">מכפילי מורכבות</label>
            <div className="grid grid-cols-3 gap-2">
              {(["standard", "advanced", "complex"] as const).map((k) => (
                <div key={k}>
                  <div className="text-dim text-[10px] font-mono uppercase mb-1">{k}</div>
                  <input
                    type="number"
                    step="0.01"
                    value={settings.complexity_multipliers[k]}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        complexity_multipliers: { ...settings.complexity_multipliers, [k]: Number(e.target.value) },
                      })
                    }
                    className="w-full bg-transparent border border-white/30 rounded px-3 py-2 text-sm"
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="text-dim text-xs uppercase font-mono mb-2 block">מכפילי דחיפות</label>
            <div className="grid grid-cols-3 gap-2">
              {(["normal", "priority", "rush"] as const).map((k) => (
                <div key={k}>
                  <div className="text-dim text-[10px] font-mono uppercase mb-1">{k}</div>
                  <input
                    type="number"
                    step="0.01"
                    value={settings.urgency_multipliers[k]}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        urgency_multipliers: { ...settings.urgency_multipliers, [k]: Number(e.target.value) },
                      })
                    }
                    className="w-full bg-transparent border border-white/30 rounded px-3 py-2 text-sm"
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="text-dim text-xs uppercase font-mono mb-2 block">מחשבון קרדיטים (Higgsfield)</label>
            <p className="text-dim text-xs mb-3 max-w-md">
              הגדירו כאן את סוגי היצירה וכמות הקרדיטים לכל אחד, כדי שהמחשבון בשלב "התאמות" בבונה ההצעות יוכל להעריך עלות פרויקט. המידע הזה פנימי בלבד — הלקוח לא רואה אותו אף פעם.
            </p>
            <div className="grid gap-2 mb-3">
              {settings.higgsfield_credit_types.map((ct) => (
                <div key={ct.id} className="flex items-end gap-2 flex-wrap border border-white/10 rounded-lg p-3">
                  <div className="flex-1 min-w-[120px]">
                    <label className="text-dim text-[10px] font-mono uppercase block mb-1">שם הסוג</label>
                    <input
                      value={ct.label}
                      onChange={(e) => updateCreditType(ct.id, { label: e.target.value })}
                      placeholder="לדוגמה: וידאו, תמונה"
                      className="w-full bg-transparent border border-white/20 rounded px-2 py-1.5 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-dim text-[10px] font-mono uppercase block mb-1">יחידה</label>
                    <select
                      value={ct.unit}
                      onChange={(e) => updateCreditType(ct.id, { unit: e.target.value as HiggsfieldCreditType["unit"] })}
                      className="bg-background border border-white/20 rounded px-2 py-1.5 text-sm"
                    >
                      <option value="per_item">ליחידה</option>
                      <option value="per_second">לשנייה</option>
                    </select>
                  </div>
                  <div className="w-24">
                    <label className="text-dim text-[10px] font-mono uppercase block mb-1">קרדיטים</label>
                    <input
                      type="number"
                      value={ct.creditsPerUnit}
                      onChange={(e) => updateCreditType(ct.id, { creditsPerUnit: Number(e.target.value) })}
                      className="w-full bg-transparent border border-white/20 rounded px-2 py-1.5 text-sm"
                    />
                  </div>
                  <RowActions actions={[{ icon: Trash2, label: "הסרה", onClick: () => removeCreditType(ct.id), variant: "danger" }]} />
                </div>
              ))}
            </div>
            <button onClick={addCreditType} className="font-mono text-xs uppercase tracking-wide underline underline-offset-4 hover:text-lime transition-colors">
              + הוספת סוג יצירה
            </button>
          </div>

          <NumField
            label="עלות לקרדיט (₪) — למשל מחיר המנוי לחודש חלקי כמות הקרדיטים שהוא נותן"
            value={settings.higgsfield_ils_per_credit}
            onChange={(v) => setSettings({ ...settings, higgsfield_ils_per_credit: v ?? 0 })}
          />

          <button
            onClick={saveSettings}
            disabled={saving}
            className="mt-2 font-mono text-xs uppercase tracking-wide border border-white/30 rounded-full px-6 py-3 hover:bg-foreground hover:text-background transition-colors disabled:opacity-50 w-fit"
          >
            {saving ? "שומר…" : "שמירת הגדרות"}
          </button>
        </div>
      )}

      {form && (
        <AdminModalShell title={form.id ? "עריכת פריט" : "פריט חדש"} onClose={() => setForm(null)}>
          <div className="grid gap-4">
              <div>
                <label className="text-dim text-xs uppercase font-mono mb-2 block">קטגוריה</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value as PriceBookItemRow["category"] })}
                  className="w-full bg-background border border-white/30 rounded px-4 py-3 text-sm"
                >
                  {PRICE_BOOK_CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
              <Field label="חבילה (package_slug)" value={form.package_slug} onChange={(v) => setForm({ ...form, package_slug: v })} />
              <Field label="שם" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
              <TextArea label="תיאור קצר (מוצג בקטלוג הפנימי בבונה ההצעות)" value={form.description} onChange={(v) => setForm({ ...form, description: v })} />
              <TextArea
                label="תיאור מלא ללקוח (זמן אספקה, מה כלול — זה מה שמופיע בהצעה שהלקוח מקבל)"
                value={form.client_description ?? ""}
                onChange={(v) => setForm({ ...form, client_description: v })}
              />
              <TextArea label="הערות פנימיות (לא מוצג ללקוח)" value={form.internal_description} onChange={(v) => setForm({ ...form, internal_description: v })} />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <NumField label="מחיר בסיס" value={form.base_price} onChange={(v) => setForm({ ...form, base_price: v })} />
                <NumField label="מחיר מינימום" value={form.minimum_price} onChange={(v) => setForm({ ...form, minimum_price: v })} />
                <NumField label="מחיר מומלץ" value={form.recommended_price} onChange={(v) => setForm({ ...form, recommended_price: v })} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <NumField label="עלות פנימית" value={form.cost} onChange={(v) => setForm({ ...form, cost: v })} />
                <NumField label="שעות עבודה משוערות" value={form.estimated_hours} onChange={(v) => setForm({ ...form, estimated_hours: v })} />
              </div>

              <div>
                <label className="text-dim text-xs uppercase font-mono mb-2 block">סוג תמחור</label>
                <select
                  value={form.billing_type}
                  onChange={(e) => setForm({ ...form, billing_type: e.target.value as PriceBookBillingType })}
                  className="w-full bg-background border border-white/30 rounded px-4 py-3 text-sm"
                >
                  {BILLING_TYPES.map((b) => (
                    <option key={b.value} value={b.value}>{b.label}</option>
                  ))}
                </select>
              </div>
              <Field label="יחידה (למשל: עמוד, שפה, שעה)" value={form.unit ?? ""} onChange={(v) => setForm({ ...form, unit: v })} />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={form.quantity_enabled} onChange={(e) => setForm({ ...form, quantity_enabled: e.target.checked })} />
                  כמות ניתנת לעריכה
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={form.recurring} onChange={(e) => setForm({ ...form, recurring: e.target.checked })} />
                  שירות חוזר (חודשי)
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={form.included_by_default} onChange={(e) => setForm({ ...form, included_by_default: e.target.checked })} />
                  כלול כברירת מחדל
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
                  פעיל
                </label>
              </div>

              <NumField label="סדר תצוגה" value={form.sort_order} onChange={(v) => setForm({ ...form, sort_order: v ?? 0 })} />

              <div className="flex items-center gap-3 mt-2">
                <button
                  onClick={saveItem}
                  disabled={saving || !form.name.trim() || !form.package_slug.trim()}
                  className="font-mono text-xs uppercase tracking-wide border border-white/30 rounded-full px-6 py-3 hover:bg-foreground hover:text-background transition-colors disabled:opacity-50"
                >
                  {saving ? "שומר…" : "שמירה"}
                </button>
                {form.id && (
                  <RowActions actions={[{ icon: Trash2, label: "מחיקה", onClick: () => deleteItem(form.id!), variant: "danger" }]} />
                )}
              </div>
          </div>
        </AdminModalShell>
      )}
    </div>
  )
}

export function AdminPriceBook() {
  return (
    <AdminGate>
      <AdminPriceBookInner />
    </AdminGate>
  )
}
