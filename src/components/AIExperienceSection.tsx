import { useEffect, useState } from "react"
import { useAIExperience } from "@/hooks/useAIExperience"
import { useContactModal } from "@/hooks/useContactModal"
import { trackEvent } from "@/lib/analytics"
import { Reveal } from "@/components/Reveal"
import { Eyebrow } from "@/components/Eyebrow"
import { PhoneVideoFrame } from "@/components/ai-experience/PhoneVideoFrame"
import type { AITalentRow, AIProductRow } from "@/lib/supabase"
import { cn } from "@/lib/utils"

export function AIExperienceSection() {
  const { talents, products, findCombination, loading } = useAIExperience()
  const { openModal } = useContactModal()
  const [selectedTalentId, setSelectedTalentId] = useState<string | null>(null)
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null)

  const selectedTalent = talents.find((t) => t.id === selectedTalentId) ?? null
  const selectedProduct = products.find((p) => p.id === selectedProductId) ?? null
  const combination = findCombination(selectedTalentId, selectedProductId)

  useEffect(() => {
    trackEvent("ai_experience_view", { location: "ai_experience_section" })
  }, [])

  useEffect(() => {
    if (!combination) return
    trackEvent("campaign_viewed", { talent: selectedTalent?.slug, product: selectedProduct?.slug, combination: combination.title, location: "ai_experience_section" })
    if (combination.video_url) {
      trackEvent("campaign_played", { talent: selectedTalent?.slug, product: selectedProduct?.slug, combination: combination.title, location: "ai_experience_section" })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [combination?.id])

  function selectTalent(t: AITalentRow) {
    setSelectedTalentId(t.id)
    trackEvent("talent_selected", { talent: t.slug, location: "ai_experience_section" })
  }

  function selectProduct(p: AIProductRow) {
    setSelectedProductId(p.id)
    trackEvent("product_selected", { product: p.slug, category: p.category, location: "ai_experience_section" })
    if (selectedTalentId) {
      trackEvent("combination_changed", { talent: selectedTalent?.slug, product: p.slug, location: "ai_experience_section" })
    }
  }

  function openLead(intent: string, extra?: Record<string, unknown>) {
    trackEvent("ai_campaign_cta_clicked", { intent, location: "ai_experience_section" })
    openModal({
      source: "ai_interactive_demo",
      intent,
      talent: selectedTalent?.full_name ?? null,
      product: selectedProduct?.product_name ?? null,
      category: selectedProduct?.category ?? null,
      combination: combination?.title ?? null,
      ...extra,
    })
    trackEvent("lead_started_from_ai_demo", { intent, location: "ai_experience_section" })
  }

  return (
    <section id="ai-experience" className="py-28 md:py-40 section-divider">
      <div className="container">
        <Reveal className="mb-4">
          <Eyebrow>חוויית קריאייטיב AI</Eyebrow>
        </Reveal>
        <Reveal>
          <h2 className="font-display font-bold text-[clamp(30px,4.6vw,54px)] leading-[1.15] tracking-[-0.04em] text-gradient-accent text-shimmer">
            דמות אחת. מוצר אחד. קמפיין שלם.
          </h2>
        </Reveal>
        <Reveal delay={40}>
          <p className="mt-4 max-w-xl text-dim text-base md:text-lg leading-relaxed">
            בחרו פנים. בחרו מוצר. תראו מה AI קריאייטיבי יודע לעשות.
          </p>
        </Reveal>
        <Reveal delay={60}>
          <p className="mt-4 max-w-2xl text-dim text-sm leading-relaxed">
            כל טאלנט כאן הוא דמות AI עקבית: אותה דמות, בכל תמונה ובכל סרטון. כל מוצר מומחש באותה עקביות מדויקת.
            השילוב בין השניים הוא בדיוק מה שאני עושה בעבודה מול לקוחות: בימוי קריאייטיבי, יצירת דמויות AI עקביות,
            הפקת סרטוני AI ופרסום מבוסס AI סביב מוצר אמיתי של מותג.
          </p>
        </Reveal>

        {/* STEP 01 — TALENT */}
        <div className="mt-14">
          <div className="font-mono text-xs uppercase tracking-wide text-dim mb-4">01 · בחירת דמות</div>
          {loading && <div className="font-mono text-xs text-dim uppercase">טוען…</div>}
          {!loading && talents.length === 0 && (
            <p className="text-dim text-sm">אין עדיין טאלנטים פעילים.</p>
          )}
          <div className="grid grid-cols-3 gap-2 md:gap-3">
            {talents.map((t) => (
              <button
                key={t.id}
                onClick={() => selectTalent(t)}
                className={cn(
                  "aspect-[3/4] rounded-xl overflow-hidden border transition-colors",
                  t.id === selectedTalentId ? "border-[#D1FE17]" : "border-white/10 hover:border-[#D1FE17]/60"
                )}
              >
                {t.portrait_image && <img src={t.portrait_image} alt={t.full_name} loading="lazy" className="w-full h-full object-cover" />}
              </button>
            ))}
          </div>
        </div>

        {/* STEP 02 — PRODUCT */}
        {selectedTalentId && (
          <Reveal className="mt-14">
            <div className="font-mono text-xs uppercase tracking-wide text-dim mb-4">02 · בחירת מוצר</div>
            <div className="grid grid-cols-4 gap-2 md:gap-3">
              {products.map((p) => (
                <button
                  key={p.id}
                  onClick={() => selectProduct(p)}
                  className={cn(
                    "aspect-[3/4] rounded-xl overflow-hidden border transition-colors",
                    p.id === selectedProductId ? "border-[#D1FE17]" : "border-white/10 hover:border-[#D1FE17]/60"
                  )}
                >
                  {p.packshot_image && <img src={p.packshot_image} alt={p.product_name} loading="lazy" className="w-full h-full object-cover" />}
                </button>
              ))}
              <button
                onClick={() => {
                  trackEvent("own_product_clicked", { location: "ai_experience_section" })
                  openLead("own_product")
                }}
                className="group aspect-[3/4] rounded-xl border border-dashed border-white/20 hover:border-[#D1FE17] transition-colors flex flex-col items-center justify-center text-center p-2 gap-1"
              >
                <span className="font-display text-sm font-bold">המוצר שלכם</span>
                <span className="font-mono text-[8px] uppercase tracking-wide text-dim group-hover:text-[#D1FE17] transition-colors">השתמשו במוצר שלכם</span>
              </button>
            </div>
          </Reveal>
        )}

        {/* STEP 03 — RESULT */}
        {selectedTalentId && selectedProductId && (
          <Reveal className="mt-14">
            <div className="flex items-center gap-3 mb-6 font-mono text-xs uppercase tracking-wide text-dim">
              <span>דמות נבחרה ✓</span>
              <span>מוצר נבחר ✓</span>
            </div>

            {combination ? (
              <>
                <h3 className="font-display font-bold text-2xl md:text-4xl mb-6 text-center text-gradient-accent text-shimmer">
                  {combination.title || `${selectedTalent?.full_name} × ${selectedProduct?.product_name}`.toUpperCase()}
                </h3>
                <PhoneVideoFrame
                  video={combination.video_url}
                  poster={combination.poster_image}
                  title={combination.title || `${selectedTalent?.full_name} × ${selectedProduct?.product_name}`}
                />
                <div className="mt-6 flex flex-col items-center gap-1 font-mono text-xs uppercase tracking-wide text-dim">
                  <span>עקביות דמות ✓</span>
                  <span>עקביות מוצר ✓</span>
                  <span>בימוי קריאייטיבי AI ✓</span>
                </div>
                <p className="mt-4 max-w-xl mx-auto text-center text-dim text-sm leading-relaxed">
                  דמות AI עקבית. מוצר עקבי. כיוון קריאייטיבי שלם אחד.
                </p>
              </>
            ) : (
              <div className="border border-dashed border-white/15 rounded-2xl p-10 md:p-16 text-center">
                <p className="font-display text-xl md:text-2xl font-medium mb-3">השילוב הזה מוכן לקמפיין מותאם אישית.</p>
                <p className="text-dim text-sm mb-6">
                  עדיין אין דוגמה מוכנה בדיוק לשילוב הזה, אבל זו בדיוק העבודה: לקחת דמות AI עקבית ומוצר אמיתי,
                  ולבנות סביבם קמפיין שלם.
                </p>
                <button
                  onClick={() => openLead("custom_combination")}
                  className="font-mono text-sm font-bold uppercase tracking-wide bg-[#D1FE17] text-black rounded-[8px] px-6 py-3 hover:scale-105 transition-transform"
                >
                  רוצה קמפיין כזה
                </button>
              </div>
            )}

            <div className="mt-6 flex flex-wrap gap-4 font-mono text-xs uppercase tracking-wide">
              <button onClick={() => setSelectedTalentId(null)} className="text-dim underline underline-offset-4 hover:text-[#D1FE17] transition-colors">החלפת דמות</button>
              <button onClick={() => setSelectedProductId(null)} className="text-dim underline underline-offset-4 hover:text-[#D1FE17] transition-colors">החלפת מוצר</button>
              <button onClick={() => { setSelectedTalentId(null); setSelectedProductId(null) }} className="text-dim underline underline-offset-4 hover:text-[#D1FE17] transition-colors">נסו שילוב אחר</button>
            </div>

            <div className="mt-16 border-t border-white/10 pt-10">
              <h4 className="font-display font-bold text-xl md:text-2xl mb-2">רוצים את זה עם המוצר שלכם?</h4>
              <p className="text-dim text-sm mb-6 max-w-lg">המוצר שלכם. המותג שלכם. עולם חדש לגמרי סביבו.</p>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => openLead("create_campaign")}
                  className="font-mono text-sm font-bold uppercase tracking-wide bg-[#D1FE17] text-black rounded-[8px] px-6 py-3 hover:scale-105 transition-transform"
                >
                  בואו ניצור קמפיין
                </button>
                <button
                  onClick={() => openLead("own_product")}
                  className="font-mono text-sm font-bold uppercase tracking-wide border border-white/30 rounded-[8px] px-6 py-3 hover:border-[#D1FE17] transition-colors"
                >
                  להשתמש במוצר שלי
                </button>
              </div>
            </div>
          </Reveal>
        )}
      </div>
    </section>
  )
}
