import { useEffect, useState } from "react"
import { useAIExperience } from "@/hooks/useAIExperience"
import { useContactModal } from "@/hooks/useContactModal"
import { trackEvent } from "@/lib/analytics"
import { Reveal } from "@/components/Reveal"
import { Eyebrow } from "@/components/Eyebrow"
import { ProfileDrawer } from "@/components/ai-experience/ProfileDrawer"
import { PhoneVideoFrame } from "@/components/ai-experience/PhoneVideoFrame"
import type { AITalentRow, AIProductRow } from "@/lib/supabase"
import { cn } from "@/lib/utils"

const cardRailClass =
  "flex overflow-x-auto snap-x snap-mandatory gap-4 pb-2 -mx-4 px-4 md:mx-0 md:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"

export function AIExperienceSection() {
  const { talents, products, findCombination, loading } = useAIExperience()
  const { openModal } = useContactModal()
  const [selectedTalentId, setSelectedTalentId] = useState<string | null>(null)
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null)
  const [talentDrawer, setTalentDrawer] = useState<AITalentRow | null>(null)
  const [productDrawer, setProductDrawer] = useState<AIProductRow | null>(null)

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
    setTalentDrawer(null)
    trackEvent("talent_selected", { talent: t.slug, location: "ai_experience_section" })
  }

  function selectProduct(p: AIProductRow) {
    setSelectedProductId(p.id)
    setProductDrawer(null)
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
          <Eyebrow>AI Creative Experience</Eyebrow>
        </Reveal>
        <Reveal>
          <h2 className="font-display font-bold text-[clamp(30px,4.6vw,54px)] leading-[1.15] tracking-[-0.04em] text-gradient-accent text-shimmer">
            Two inputs. One campaign.
          </h2>
        </Reveal>
        <Reveal delay={40}>
          <p className="mt-4 max-w-xl text-dim text-base md:text-lg leading-relaxed">
            Pick a face. Pick a product. See what AI creative can do.
          </p>
        </Reveal>
        <Reveal delay={60}>
          <p className="mt-4 max-w-2xl text-dim text-sm leading-relaxed">
            כל טאלנט כאן הוא דמות AI עקבית — אותה דמות, בכל תמונה ובכל סרטון. כל מוצר מומחש באותה עקביות מדויקת.
            השילוב בין השניים הוא בדיוק מה שאני עושה בעבודה מול לקוחות: בימוי קריאייטיבי, יצירת דמויות AI עקביות,
            הפקת סרטוני AI ופרסום מבוסס AI סביב מוצר אמיתי של מותג.
          </p>
        </Reveal>

        {/* STEP 01 — TALENT */}
        <div className="mt-14">
          <div className="font-mono text-xs uppercase tracking-wide text-dim mb-4">01 — Choose Your Talent</div>
          {loading && <div className="font-mono text-xs text-dim uppercase">Loading…</div>}
          {!loading && talents.length === 0 && (
            <p className="text-dim text-sm">אין עדיין טאלנטים פעילים.</p>
          )}
          <div className={cardRailClass}>
            {talents.map((t, i) => (
              <Reveal key={t.id} delay={i * 60} className="flex-none w-[180px] sm:w-[220px] snap-start">
                <TalentCard talent={t} selected={t.id === selectedTalentId} onSelect={() => selectTalent(t)} onDetails={() => setTalentDrawer(t)} />
              </Reveal>
            ))}
          </div>
        </div>

        {/* STEP 02 — PRODUCT */}
        {selectedTalentId && (
          <Reveal className="mt-14">
            <div className="font-mono text-xs uppercase tracking-wide text-dim mb-4">02 — Choose a Product</div>
            <div className={cardRailClass}>
              {products.map((p, i) => (
                <Reveal key={p.id} delay={i * 60} className="flex-none w-[180px] sm:w-[220px] snap-start">
                  <ProductCard product={p} selected={p.id === selectedProductId} onSelect={() => selectProduct(p)} onDetails={() => setProductDrawer(p)} />
                </Reveal>
              ))}
              <div className="flex-none w-[180px] sm:w-[220px] snap-start">
                <button
                  onClick={() => {
                    trackEvent("own_product_clicked", { location: "ai_experience_section" })
                    openLead("own_product")
                  }}
                  className="group w-full h-full aspect-[3/4] rounded-2xl border border-dashed border-white/20 hover:border-[#D1FE17] transition-colors flex flex-col items-center justify-center text-center p-4 gap-3"
                >
                  <span className="font-display text-lg font-bold">Your Product</span>
                  <span className="font-mono text-[10px] uppercase tracking-wide text-dim group-hover:text-[#D1FE17] transition-colors">Use Your Own Product</span>
                </button>
              </div>
            </div>
          </Reveal>
        )}

        {/* STEP 03 — RESULT */}
        {selectedTalentId && selectedProductId && (
          <Reveal className="mt-14">
            <div className="flex items-center gap-3 mb-6 font-mono text-xs uppercase tracking-wide text-dim">
              <span>Talent selected ✓</span>
              <span>Product selected ✓</span>
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
                  <span>Character Consistency ✓</span>
                  <span>Product Consistency ✓</span>
                  <span>AI Creative Direction ✓</span>
                </div>
                <p className="mt-4 max-w-xl mx-auto text-center text-dim text-sm leading-relaxed">
                  A consistent AI character. A consistent product. One complete creative direction.
                </p>
              </>
            ) : (
              <div className="border border-dashed border-white/15 rounded-2xl p-10 md:p-16 text-center">
                <p className="font-display text-xl md:text-2xl font-medium mb-3">This combination is ready for a custom campaign.</p>
                <p className="text-dim text-sm mb-6">
                  עדיין אין דוגמה מוכנה בדיוק לשילוב הזה — אבל זו בדיוק העבודה: לקחת דמות AI עקבית ומוצר אמיתי,
                  ולבנות סביבם קמפיין שלם.
                </p>
                <button
                  onClick={() => openLead("custom_combination")}
                  className="font-mono text-sm font-bold uppercase tracking-wide bg-[#D1FE17] text-black rounded-[8px] px-6 py-3 hover:scale-105 transition-transform"
                >
                  Create Something Like This
                </button>
              </div>
            )}

            <div className="mt-6 flex flex-wrap gap-4 font-mono text-xs uppercase tracking-wide">
              <button onClick={() => setSelectedTalentId(null)} className="text-dim underline underline-offset-4 hover:text-[#D1FE17] transition-colors">Change Talent</button>
              <button onClick={() => setSelectedProductId(null)} className="text-dim underline underline-offset-4 hover:text-[#D1FE17] transition-colors">Change Product</button>
              <button onClick={() => { setSelectedTalentId(null); setSelectedProductId(null) }} className="text-dim underline underline-offset-4 hover:text-[#D1FE17] transition-colors">Try Another Combination</button>
            </div>

            <div className="mt-16 border-t border-white/10 pt-10">
              <h4 className="font-display font-bold text-xl md:text-2xl mb-2">Want this with your product?</h4>
              <p className="text-dim text-sm mb-6 max-w-lg">Your product. Your brand. A completely new world around it.</p>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => openLead("create_campaign")}
                  className="font-mono text-sm font-bold uppercase tracking-wide bg-[#D1FE17] text-black rounded-[8px] px-6 py-3 hover:scale-105 transition-transform"
                >
                  Create My Campaign
                </button>
                <button
                  onClick={() => openLead("own_product")}
                  className="font-mono text-sm font-bold uppercase tracking-wide border border-white/30 rounded-[8px] px-6 py-3 hover:border-[#D1FE17] transition-colors"
                >
                  Use My Product
                </button>
              </div>
            </div>
          </Reveal>
        )}
      </div>

      {talentDrawer && (
        <ProfileDrawer
          images={[talentDrawer.portrait_image, talentDrawer.full_body_image, talentDrawer.campaign_image ?? ""].filter(Boolean)}
          eyebrow="AI Talent"
          title={talentDrawer.full_name}
          subtitle={talentDrawer.categories.join(" · ")}
          description={talentDrawer.description}
          ctaLabel={`Choose ${talentDrawer.full_name.split(" ")[0]}`}
          onCta={() => selectTalent(talentDrawer)}
          onClose={() => setTalentDrawer(null)}
        />
      )}
      {productDrawer && (
        <ProfileDrawer
          images={[productDrawer.packshot_image, productDrawer.lifestyle_image ?? "", productDrawer.detail_image ?? ""].filter(Boolean)}
          eyebrow={productDrawer.brand_name || "Product"}
          title={productDrawer.product_name}
          subtitle={productDrawer.category}
          description={productDrawer.description}
          ctaLabel="Use This Product"
          onCta={() => selectProduct(productDrawer)}
          onClose={() => setProductDrawer(null)}
        />
      )}
    </section>
  )
}

function TalentCard({ talent, selected, onSelect, onDetails }: { talent: AITalentRow; selected: boolean; onSelect: () => void; onDetails: () => void }) {
  return (
    <div
      className={cn(
        "group relative rounded-2xl overflow-hidden border transition-colors cursor-pointer",
        selected ? "border-[#D1FE17]" : "border-white/10 hover:border-[#D1FE17]/60"
      )}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onSelect()}
    >
      <div className="aspect-[3/4] bg-neutral-900 relative">
        {talent.portrait_image && (
          <img src={talent.portrait_image} alt={talent.full_name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        )}
        {selected && (
          <span className="absolute top-3 left-3 font-mono text-[9px] font-bold uppercase tracking-wide bg-[#D1FE17] text-black rounded-full px-2 py-1">Selected ✓</span>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); onDetails() }}
          className="absolute bottom-2 right-2 font-mono text-[9px] uppercase tracking-wide text-white/0 group-hover:text-white/80 bg-black/40 rounded-full px-2 py-1 transition-colors"
        >
          Profile
        </button>
      </div>
      <div className="p-3">
        <div className="font-display text-sm font-bold truncate">{talent.full_name}</div>
        <div className="font-mono text-[10px] uppercase tracking-wide text-dim mt-0.5 truncate">{talent.style}</div>
      </div>
    </div>
  )
}

function ProductCard({ product, selected, onSelect, onDetails }: { product: AIProductRow; selected: boolean; onSelect: () => void; onDetails: () => void }) {
  return (
    <div
      className={cn(
        "group relative rounded-2xl overflow-hidden border transition-colors cursor-pointer",
        selected ? "border-[#D1FE17]" : "border-white/10 hover:border-[#D1FE17]/60"
      )}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onSelect()}
    >
      <div className="aspect-[3/4] bg-neutral-900 relative">
        {product.packshot_image && (
          <img src={product.packshot_image} alt={product.product_name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        )}
        {selected && (
          <span className="absolute top-3 left-3 font-mono text-[9px] font-bold uppercase tracking-wide bg-[#D1FE17] text-black rounded-full px-2 py-1">Selected ✓</span>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); onDetails() }}
          className="absolute bottom-2 right-2 font-mono text-[9px] uppercase tracking-wide text-white/0 group-hover:text-white/80 bg-black/40 rounded-full px-2 py-1 transition-colors"
        >
          Profile
        </button>
      </div>
      <div className="p-3">
        <div className="font-display text-sm font-bold truncate">{product.product_name}</div>
        <div className="font-mono text-[10px] uppercase tracking-wide text-dim mt-0.5 truncate">{product.category}</div>
      </div>
    </div>
  )
}
