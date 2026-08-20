import { useState } from "react"
import { Link } from "react-router-dom"
import { useAIExperience } from "@/hooks/useAIExperience"
import { trackEvent } from "@/lib/analytics"
import { Reveal } from "@/components/Reveal"
import { Eyebrow } from "@/components/Eyebrow"
import { AutoVideo } from "@/components/AutoVideo"
import { cn } from "@/lib/utils"

const TEASER_LIMIT = 3

export function AIExperienceTeaser() {
  const { talents, products, findCombination, loading } = useAIExperience()
  const [talentId, setTalentId] = useState<string | null>(null)
  const [productId, setProductId] = useState<string | null>(null)

  const previewTalents = talents.slice(0, TEASER_LIMIT)
  const previewProducts = products.slice(0, TEASER_LIMIT)
  const combination = findCombination(talentId, productId)

  if (!loading && previewTalents.length === 0) return null

  return (
    <section className="py-28 md:py-40 section-divider">
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
            תבחרו דמות AI, תבחרו מוצר, ותראו איך זה נראה יחד.
          </p>
        </Reveal>

        <Reveal delay={80} className="mt-10 grid md:grid-cols-2 gap-8 items-start">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-wide text-dim mb-3">Choose a talent</div>
            <div className="flex gap-3">
              {previewTalents.map((t) => (
                <button
                  key={t.id}
                  onClick={() => { setTalentId(t.id); trackEvent("talent_selected", { talent: t.slug, location: "homepage_teaser" }) }}
                  className={cn(
                    "flex-1 aspect-[3/4] rounded-xl overflow-hidden border transition-colors",
                    talentId === t.id ? "border-[#D1FE17]" : "border-white/10 hover:border-[#D1FE17]/60"
                  )}
                >
                  {t.portrait_image && <img src={t.portrait_image} alt={t.full_name} className="w-full h-full object-cover" />}
                </button>
              ))}
            </div>
            <div className="font-mono text-[11px] uppercase tracking-wide text-dim mt-6 mb-3">Choose a product</div>
            <div className="flex gap-3">
              {previewProducts.map((p) => (
                <button
                  key={p.id}
                  onClick={() => { setProductId(p.id); trackEvent("product_selected", { product: p.slug, location: "homepage_teaser" }) }}
                  className={cn(
                    "flex-1 aspect-[3/4] rounded-xl overflow-hidden border transition-colors",
                    productId === p.id ? "border-[#D1FE17]" : "border-white/10 hover:border-[#D1FE17]/60"
                  )}
                >
                  {p.packshot_image && <img src={p.packshot_image} alt={p.product_name} className="w-full h-full object-cover" />}
                </button>
              ))}
            </div>
          </div>

          <div className="aspect-video rounded-2xl overflow-hidden surface-raised border border-white/10 flex items-center justify-center">
            {combination?.video_url ? (
              <AutoVideo src={combination.video_url} poster={combination.poster_image || undefined} className="w-full h-full object-cover" />
            ) : (
              <p className="text-dim text-sm px-6 text-center">
                {talentId && productId ? "Ready for a custom campaign." : "בחרו דמות ומוצר כדי לראות תצוגה מקדימה"}
              </p>
            )}
          </div>
        </Reveal>

        <Reveal delay={100} className="mt-10">
          <Link
            to="/services/ai-content#ai-experience"
            onClick={() => trackEvent("ai_campaign_cta_clicked", { location: "homepage_teaser" })}
            className="inline-flex items-center justify-center w-full sm:w-fit font-mono text-sm font-bold uppercase tracking-wide bg-[#D1FE17] text-black rounded-[8px] px-6 py-3 hover:scale-105 transition-transform"
          >
            Try the AI Experience ←
          </Link>
        </Reveal>
      </div>
    </section>
  )
}
