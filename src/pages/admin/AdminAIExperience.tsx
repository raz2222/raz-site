import { useEffect, useState } from "react"
import { Trash2 } from "lucide-react"
import {
  supabase,
  AI_PRODUCT_CATEGORIES,
  type AITalentRow,
  type AIProductRow,
  type AICampaignCombinationRow,
} from "@/lib/supabase"
import { AdminGate } from "@/components/AdminGate"
import { AdminNav } from "@/components/AdminNav"
import { AdminModalShell } from "@/components/admin/AdminModalShell"
import { RowActions } from "@/components/admin/RowActions"
import { Field, TextArea, StringListEditor, MediaField } from "@/components/admin/FieldEditors"
import { cn } from "@/lib/utils"

const BUCKET = "ai-experience-media"
const TABS = ["טאלנטים", "מוצרים", "קמפיינים"] as const
type Tab = (typeof TABS)[number]

type TalentForm = Omit<AITalentRow, "id" | "sort_order" | "created_at"> & { id?: string; sort_order?: number }
const emptyTalent: TalentForm = {
  slug: "",
  full_name: "",
  portrait_image: "",
  full_body_image: "",
  campaign_image: "",
  gender_presentation: "",
  style: "",
  categories: [],
  description: "",
  creative_styles: [],
  active: true,
}

type ProductForm = Omit<AIProductRow, "id" | "sort_order" | "created_at"> & { id?: string; sort_order?: number }
const emptyProduct: ProductForm = {
  slug: "",
  product_name: "",
  brand_name: "",
  category: AI_PRODUCT_CATEGORIES[0],
  packshot_image: "",
  lifestyle_image: "",
  detail_image: "",
  additional_images: [],
  description: "",
  active: true,
}

type CampaignForm = Omit<AICampaignCombinationRow, "id" | "sort_order" | "created_at"> & { id?: string; sort_order?: number }
const emptyCampaign: CampaignForm = {
  talent_id: "",
  product_id: "",
  video_url: "",
  poster_image: "",
  title: "",
  description: "",
  tags: [],
  active: true,
}

function AdminAIExperienceInner() {
  const [tab, setTab] = useState<Tab>("טאלנטים")
  const [talents, setTalents] = useState<AITalentRow[]>([])
  const [products, setProducts] = useState<AIProductRow[]>([])
  const [campaigns, setCampaigns] = useState<AICampaignCombinationRow[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [talentForm, setTalentForm] = useState<TalentForm | null>(null)
  const [productForm, setProductForm] = useState<ProductForm | null>(null)
  const [campaignForm, setCampaignForm] = useState<CampaignForm | null>(null)

  async function refresh() {
    const [{ data: t }, { data: p }, { data: c }] = await Promise.all([
      supabase.from("ai_talents").select("*").order("sort_order"),
      supabase.from("ai_products").select("*").order("sort_order"),
      supabase.from("ai_campaign_combinations").select("*").order("sort_order"),
    ])
    setTalents(t ?? [])
    setProducts(p ?? [])
    setCampaigns(c ?? [])
    setLoading(false)
  }

  useEffect(() => {
    refresh()
  }, [])

  async function saveTalent() {
    if (!talentForm) return
    setSaving(true)
    const payload = { ...talentForm, sort_order: talentForm.sort_order ?? talents.length }
    delete (payload as { id?: string }).id
    const { error } = talentForm.id
      ? await supabase.from("ai_talents").update(payload).eq("id", talentForm.id)
      : await supabase.from("ai_talents").insert(payload)
    setSaving(false)
    if (error) return alert(error.message)
    setTalentForm(null)
    refresh()
  }

  async function deleteTalent(id: string) {
    if (!confirm("למחוק את הטאלנט? קמפיינים משויכים ימחקו גם הם.")) return
    await supabase.from("ai_talents").delete().eq("id", id)
    refresh()
  }

  async function saveProduct() {
    if (!productForm) return
    setSaving(true)
    const payload = { ...productForm, sort_order: productForm.sort_order ?? products.length }
    delete (payload as { id?: string }).id
    const { error } = productForm.id
      ? await supabase.from("ai_products").update(payload).eq("id", productForm.id)
      : await supabase.from("ai_products").insert(payload)
    setSaving(false)
    if (error) return alert(error.message)
    setProductForm(null)
    refresh()
  }

  async function deleteProduct(id: string) {
    if (!confirm("למחוק את המוצר? קמפיינים משויכים ימחקו גם הם.")) return
    await supabase.from("ai_products").delete().eq("id", id)
    refresh()
  }

  async function saveCampaign() {
    if (!campaignForm) return
    if (!campaignForm.talent_id || !campaignForm.product_id) return alert("יש לבחור טאלנט ומוצר")
    setSaving(true)
    const payload = { ...campaignForm, sort_order: campaignForm.sort_order ?? campaigns.length }
    delete (payload as { id?: string }).id
    const { error } = campaignForm.id
      ? await supabase.from("ai_campaign_combinations").update(payload).eq("id", campaignForm.id)
      : await supabase.from("ai_campaign_combinations").insert(payload)
    setSaving(false)
    if (error) {
      if (error.code === "23505") return alert("כבר קיים קמפיין לשילוב הזה של טאלנט ומוצר.")
      return alert(error.message)
    }
    setCampaignForm(null)
    refresh()
  }

  async function deleteCampaign(id: string) {
    if (!confirm("למחוק את הקמפיין?")) return
    await supabase.from("ai_campaign_combinations").delete().eq("id", id)
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

      {tab === "טאלנטים" && (
        <>
          <div className="flex justify-between items-center mb-6">
            <h1 className="font-display font-bold text-xl">טאלנטים</h1>
            <button
              onClick={() => setTalentForm({ ...emptyTalent })}
              className="font-mono text-xs uppercase tracking-wide border border-white/30 rounded-full px-4 py-2 hover:bg-foreground hover:text-background transition-colors"
            >
              + טאלנט חדש
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {talents.map((t) => (
              <button
                key={t.id}
                onClick={() => setTalentForm({ ...t })}
                className={cn("text-right border border-white/10 rounded-lg overflow-hidden hover:border-lime transition-colors", !t.active && "opacity-40")}
              >
                <div className="aspect-square bg-neutral-900">
                  {t.portrait_image && <img src={t.portrait_image} alt="" loading="lazy" className="w-full h-full object-cover" />}
                </div>
                <div className="p-3">
                  <div className="text-sm font-medium truncate">{t.full_name}</div>
                  <div className="text-dim text-xs mt-0.5 truncate">{t.style}{!t.active && " · לא פעיל"}</div>
                </div>
              </button>
            ))}
          </div>
        </>
      )}

      {tab === "מוצרים" && (
        <>
          <div className="flex justify-between items-center mb-6">
            <h1 className="font-display font-bold text-xl">מוצרים</h1>
            <button
              onClick={() => setProductForm({ ...emptyProduct })}
              className="font-mono text-xs uppercase tracking-wide border border-white/30 rounded-full px-4 py-2 hover:bg-foreground hover:text-background transition-colors"
            >
              + מוצר חדש
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {products.map((p) => (
              <button
                key={p.id}
                onClick={() => setProductForm({ ...p })}
                className={cn("text-right border border-white/10 rounded-lg overflow-hidden hover:border-lime transition-colors", !p.active && "opacity-40")}
              >
                <div className="aspect-square bg-neutral-900">
                  {p.packshot_image && <img src={p.packshot_image} alt="" loading="lazy" className="w-full h-full object-cover" />}
                </div>
                <div className="p-3">
                  <div className="text-sm font-medium truncate">{p.product_name}</div>
                  <div className="text-dim text-xs mt-0.5 truncate">{p.category}{!p.active && " · לא פעיל"}</div>
                </div>
              </button>
            ))}
          </div>
        </>
      )}

      {tab === "קמפיינים" && (
        <>
          <div className="flex justify-between items-center mb-6">
            <h1 className="font-display font-bold text-xl">קמפיינים (טאלנט × מוצר)</h1>
            <button
              onClick={() => setCampaignForm({ ...emptyCampaign })}
              disabled={talents.length === 0 || products.length === 0}
              className="font-mono text-xs uppercase tracking-wide border border-white/30 rounded-full px-4 py-2 hover:bg-foreground hover:text-background transition-colors disabled:opacity-40"
            >
              + קמפיין חדש
            </button>
          </div>
          {(talents.length === 0 || products.length === 0) && (
            <p className="text-dim text-xs mb-4">צריך לפחות טאלנט אחד ומוצר אחד לפני יצירת קמפיין.</p>
          )}
          <div className="grid gap-2">
            {campaigns.map((c) => {
              const talent = talents.find((t) => t.id === c.talent_id)
              const product = products.find((p) => p.id === c.product_id)
              return (
                <button
                  key={c.id}
                  onClick={() => setCampaignForm({ ...c })}
                  className={cn(
                    "text-right border border-white/10 rounded-lg px-4 py-3 hover:border-lime transition-colors flex items-center justify-between gap-4",
                    !c.active && "opacity-40"
                  )}
                >
                  <div>
                    <div className="text-sm font-medium">
                      {c.title || `${talent?.full_name ?? "?"} × ${product?.product_name ?? "?"}`}
                      {!c.active && <span className="text-red-400 text-xs"> · לא פעיל</span>}
                    </div>
                    <div className="text-dim text-xs mt-1">{talent?.full_name ?? "?"} × {product?.product_name ?? "?"}</div>
                  </div>
                  <div className="font-mono text-[10px] text-dim flex-none">{c.video_url ? "סרטון הועלה" : "אין סרטון"}</div>
                </button>
              )
            })}
            {campaigns.length === 0 && talents.length > 0 && products.length > 0 && (
              <p className="text-dim text-sm">אין עדיין קמפיינים.</p>
            )}
          </div>
        </>
      )}

      {talentForm && (
        <AdminModalShell title={talentForm.id ? "עריכת טאלנט" : "טאלנט חדש"} onClose={() => setTalentForm(null)}>
          <div className="grid gap-4">
              <Field label="שם מלא" value={talentForm.full_name} onChange={(v) => setTalentForm({ ...talentForm, full_name: v })} />
              <Field label="Slug" value={talentForm.slug} onChange={(v) => setTalentForm({ ...talentForm, slug: v })} />
              <MediaField label="תמונת פורטרט" value={talentForm.portrait_image} bucket={BUCKET} kind="image" onChange={(v) => setTalentForm({ ...talentForm, portrait_image: v })} />
              <MediaField label="תמונת גוף מלא" value={talentForm.full_body_image} bucket={BUCKET} kind="image" onChange={(v) => setTalentForm({ ...talentForm, full_body_image: v })} />
              <MediaField label="תמונת קמפיין (אופציונלי)" value={talentForm.campaign_image} bucket={BUCKET} kind="image" onChange={(v) => setTalentForm({ ...talentForm, campaign_image: v })} />
              <Field label="מגדר/הצגה" value={talentForm.gender_presentation} onChange={(v) => setTalentForm({ ...talentForm, gender_presentation: v })} />
              <Field label="סגנון (למשל: Lifestyle / Beauty)" value={talentForm.style} onChange={(v) => setTalentForm({ ...talentForm, style: v })} />
              <StringListEditor label="קטגוריות" items={talentForm.categories} onChange={(v) => setTalentForm({ ...talentForm, categories: v })} />
              <StringListEditor label="סגנונות קריאייטיב" items={talentForm.creative_styles} onChange={(v) => setTalentForm({ ...talentForm, creative_styles: v })} />
              <TextArea label="תיאור קצר" value={talentForm.description} onChange={(v) => setTalentForm({ ...talentForm, description: v })} />
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={talentForm.active} onChange={(e) => setTalentForm({ ...talentForm, active: e.target.checked })} />
                פעיל
              </label>
              <div className="flex items-center gap-3 mt-2">
                <button
                  onClick={saveTalent}
                  disabled={saving || !talentForm.full_name.trim() || !talentForm.slug.trim()}
                  className="font-mono text-xs uppercase tracking-wide border border-white/30 rounded-full px-6 py-3 hover:bg-foreground hover:text-background transition-colors disabled:opacity-50"
                >
                  {saving ? "שומר…" : "שמירה"}
                </button>
                {talentForm.id && (
                  <RowActions actions={[{ icon: Trash2, label: "מחיקה", onClick: () => deleteTalent(talentForm.id!), variant: "danger" }]} />
                )}
              </div>
          </div>
        </AdminModalShell>
      )}

      {productForm && (
        <AdminModalShell title={productForm.id ? "עריכת מוצר" : "מוצר חדש"} onClose={() => setProductForm(null)}>
          <div className="grid gap-4">
              <Field label="שם מוצר" value={productForm.product_name} onChange={(v) => setProductForm({ ...productForm, product_name: v })} />
              <Field label="Slug" value={productForm.slug} onChange={(v) => setProductForm({ ...productForm, slug: v })} />
              <Field label="מותג" value={productForm.brand_name} onChange={(v) => setProductForm({ ...productForm, brand_name: v })} />
              <div>
                <label className="text-dim text-xs uppercase font-mono mb-2 block">קטגוריה</label>
                <select
                  value={productForm.category}
                  onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                  className="w-full bg-background border border-white/30 rounded px-4 py-3 text-sm"
                >
                  {AI_PRODUCT_CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <MediaField label="תמונת מוצר ראשית (Packshot)" value={productForm.packshot_image} bucket={BUCKET} kind="image" onChange={(v) => setProductForm({ ...productForm, packshot_image: v })} />
              <MediaField label="תמונת Lifestyle (אופציונלי)" value={productForm.lifestyle_image} bucket={BUCKET} kind="image" onChange={(v) => setProductForm({ ...productForm, lifestyle_image: v })} />
              <MediaField label="תמונת מאקרו/פרטים (אופציונלי)" value={productForm.detail_image} bucket={BUCKET} kind="image" onChange={(v) => setProductForm({ ...productForm, detail_image: v })} />
              <StringListEditor label="תמונות נוספות" items={productForm.additional_images} onChange={(v) => setProductForm({ ...productForm, additional_images: v })} />
              <TextArea label="תיאור קצר" value={productForm.description} onChange={(v) => setProductForm({ ...productForm, description: v })} />
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={productForm.active} onChange={(e) => setProductForm({ ...productForm, active: e.target.checked })} />
                פעיל
              </label>
              <div className="flex items-center gap-3 mt-2">
                <button
                  onClick={saveProduct}
                  disabled={saving || !productForm.product_name.trim() || !productForm.slug.trim()}
                  className="font-mono text-xs uppercase tracking-wide border border-white/30 rounded-full px-6 py-3 hover:bg-foreground hover:text-background transition-colors disabled:opacity-50"
                >
                  {saving ? "שומר…" : "שמירה"}
                </button>
                {productForm.id && (
                  <RowActions actions={[{ icon: Trash2, label: "מחיקה", onClick: () => deleteProduct(productForm.id!), variant: "danger" }]} />
                )}
              </div>
          </div>
        </AdminModalShell>
      )}

      {campaignForm && (
        <AdminModalShell title={campaignForm.id ? "עריכת קמפיין" : "קמפיין חדש"} onClose={() => setCampaignForm(null)}>
          <div className="grid gap-4">
              <div>
                <label className="text-dim text-xs uppercase font-mono mb-2 block">טאלנט</label>
                <select
                  value={campaignForm.talent_id}
                  onChange={(e) => setCampaignForm({ ...campaignForm, talent_id: e.target.value })}
                  className="w-full bg-background border border-white/30 rounded px-4 py-3 text-sm"
                >
                  <option value="">בחרו טאלנט…</option>
                  {talents.map((t) => (
                    <option key={t.id} value={t.id}>{t.full_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-dim text-xs uppercase font-mono mb-2 block">מוצר</label>
                <select
                  value={campaignForm.product_id}
                  onChange={(e) => setCampaignForm({ ...campaignForm, product_id: e.target.value })}
                  className="w-full bg-background border border-white/30 rounded px-4 py-3 text-sm"
                >
                  <option value="">בחרו מוצר…</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.product_name}</option>
                  ))}
                </select>
              </div>
              <MediaField label="סרטון קמפיין" value={campaignForm.video_url} bucket={BUCKET} kind="video" onChange={(v) => setCampaignForm({ ...campaignForm, video_url: v })} />
              <MediaField label="תמונת Poster" value={campaignForm.poster_image} bucket={BUCKET} kind="image" onChange={(v) => setCampaignForm({ ...campaignForm, poster_image: v })} />
              <Field label="כותרת קמפיין (למשל: Maya × Aurea)" value={campaignForm.title} onChange={(v) => setCampaignForm({ ...campaignForm, title: v })} />
              <TextArea label="תיאור" value={campaignForm.description} onChange={(v) => setCampaignForm({ ...campaignForm, description: v })} />
              <StringListEditor label="תגיות" items={campaignForm.tags} onChange={(v) => setCampaignForm({ ...campaignForm, tags: v })} />
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={campaignForm.active} onChange={(e) => setCampaignForm({ ...campaignForm, active: e.target.checked })} />
                פעיל
              </label>
              <div className="flex items-center gap-3 mt-2">
                <button
                  onClick={saveCampaign}
                  disabled={saving}
                  className="font-mono text-xs uppercase tracking-wide border border-white/30 rounded-full px-6 py-3 hover:bg-foreground hover:text-background transition-colors disabled:opacity-50"
                >
                  {saving ? "שומר…" : "שמירה"}
                </button>
                {campaignForm.id && (
                  <RowActions actions={[{ icon: Trash2, label: "מחיקה", onClick: () => deleteCampaign(campaignForm.id!), variant: "danger" }]} />
                )}
              </div>
          </div>
        </AdminModalShell>
      )}
    </div>
  )
}

export function AdminAIExperience() {
  return (
    <AdminGate>
      <AdminAIExperienceInner />
    </AdminGate>
  )
}
