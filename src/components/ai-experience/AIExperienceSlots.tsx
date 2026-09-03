import { useEffect, useState, type DragEvent } from "react"
import { useAIExperience } from "@/hooks/useAIExperience"
import { useReducedMotion } from "@/hooks/useReducedMotion"
import { PhoneVideoFrame } from "@/components/ai-experience/PhoneVideoFrame"
import type { AITalentRow, AIProductRow } from "@/lib/supabase"
import { cn } from "@/lib/utils"

// EXPERIMENT — not wired into any public page. Rendered only by
// /lab/ai-experience so the slot idea can be judged next to the shipped
// AIExperienceSection, which this file deliberately leaves untouched.
//
// Two differences from the shipped section:
//   1. Both grids are visible from the start. The shipped flow hides products
//      until a talent is picked; with the slots showing state, that gate stops
//      earning its keep.
//   2. No analytics. A lab page firing talent_selected / campaign_viewed would
//      poison the real funnel numbers, so nothing here calls trackEvent.

type SlotKind = "talent" | "product"

const DRAG_MIME = "application/x-raz-slot"

/**
 * Drag is offered only on real pointer devices. HTML5 drag-and-drop does not
 * fire on touch at all, so on a phone the grids stay tap-only — which is the
 * behaviour we actually expect most visitors to get.
 */
function useFinePointer() {
  const [fine, setFine] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)")
    const apply = () => setFine(mq.matches)
    apply()
    mq.addEventListener("change", apply)
    return () => mq.removeEventListener("change", apply)
  }, [])
  return fine
}

function Slot({
  kind,
  label,
  hint,
  image,
  name,
  armed,
  onClear,
  onDropId,
}: {
  kind: SlotKind
  label: string
  hint: string
  image?: string | null
  name?: string | null
  armed: boolean
  onClear: () => void
  onDropId: (id: string) => void
}) {
  const [over, setOver] = useState(false)
  const filled = Boolean(name)

  return (
    <div
      onDragOver={(e) => {
        if (!armed) return
        e.preventDefault()
        e.dataTransfer.dropEffect = "copy"
        setOver(true)
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        setOver(false)
        if (!armed) return
        e.preventDefault()
        const raw = e.dataTransfer.getData(DRAG_MIME)
        const [droppedKind, id] = raw.split(":")
        if (droppedKind === kind && id) onDropId(id)
      }}
      className={cn(
        "relative aspect-[3/4] rounded-xl border overflow-hidden transition-colors",
        over && "border-[#D1FE17] bg-[#D1FE17]/10",
        !over && filled && "border-[#D1FE17]/70",
        !over && !filled && (armed ? "border-[#D1FE17]/40 border-dashed" : "border-dashed border-white/20")
      )}
    >
      {filled ? (
        <>
          {image && <img src={image} alt={name ?? ""} className="w-full h-full object-cover" />}
          <button
            type="button"
            onClick={onClear}
            aria-label={`הסרת ${label}`}
            className="absolute top-1.5 left-1.5 w-6 h-6 rounded-full bg-black/70 text-white text-xs leading-none flex items-center justify-center hover:bg-black"
          >
            ×
          </button>
          <span className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/85 to-transparent px-2 pt-6 pb-1.5 font-mono text-[9px] uppercase tracking-wide text-white truncate">
            {name}
          </span>
        </>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 p-2 text-center">
          <span className="font-display text-sm font-bold">{label}</span>
          <span className="font-mono text-[8px] uppercase tracking-wide text-dim">{hint}</span>
        </div>
      )}
    </div>
  )
}

export function AIExperienceSlots({ enableDrag = true }: { enableDrag?: boolean }) {
  const { talents, products, findCombination, loading } = useAIExperience()
  const reduced = useReducedMotion()
  const finePointer = useFinePointer()
  const draggable = enableDrag && finePointer && !reduced

  const [talentId, setTalentId] = useState<string | null>(null)
  const [productId, setProductId] = useState<string | null>(null)
  const [dragKind, setDragKind] = useState<SlotKind | null>(null)

  const talent = talents.find((t) => t.id === talentId) ?? null
  const product = products.find((p) => p.id === productId) ?? null
  const combination = findCombination(talentId, productId)
  const ready = Boolean(talentId && productId)

  function tileProps(kind: SlotKind, id: string) {
    if (!draggable) return {}
    return {
      draggable: true,
      onDragStart: (e: DragEvent) => {
        e.dataTransfer.setData(DRAG_MIME, `${kind}:${id}`)
        e.dataTransfer.effectAllowed = "copy"
        setDragKind(kind)
      },
      onDragEnd: () => setDragKind(null),
    }
  }

  return (
    <div>
      {/* SLOTS — the whole point of the variant: state is visible before,
          during and after the choice, instead of living in a hidden step. */}
      <div className="flex items-center justify-center gap-3 md:gap-5">
        <div className="w-[104px] md:w-[132px]">
          <Slot
            kind="talent"
            label="דמות"
            hint={draggable ? "גררו או לחצו" : "בחרו למטה"}
            image={talent?.portrait_image}
            name={talent?.full_name}
            armed={dragKind === "talent"}
            onClear={() => setTalentId(null)}
            onDropId={setTalentId}
          />
        </div>
        <span className="font-display text-2xl md:text-3xl text-dim select-none">×</span>
        <div className="w-[104px] md:w-[132px]">
          <Slot
            kind="product"
            label="מוצר"
            hint={draggable ? "גררו או לחצו" : "בחרו למטה"}
            image={product?.packshot_image}
            name={product?.product_name}
            armed={dragKind === "product"}
            onClear={() => setProductId(null)}
            onDropId={setProductId}
          />
        </div>
      </div>

      {/* RESULT — grid-rows 0fr→1fr tweens the height without animating
          `height` itself, so no per-frame layout thrash behind a playing video.
          Same easing as the snippet in the brief. */}
      <div
        className={cn(
          "grid mt-8",
          reduced ? "" : "transition-[grid-template-rows] duration-[420ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
          ready ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className="overflow-hidden min-h-0">
          {ready &&
            (combination ? (
              <>
                <h3 className="font-display font-bold text-xl md:text-3xl mb-5 text-center text-gradient-accent">
                  {combination.title || `${talent?.full_name} × ${product?.product_name}`.toUpperCase()}
                </h3>
                <PhoneVideoFrame
                  video={combination.video_url}
                  poster={combination.poster_image}
                  title={combination.title || `${talent?.full_name} × ${product?.product_name}`}
                />
              </>
            ) : (
              <div className="border border-dashed border-white/15 rounded-2xl p-8 md:p-12 text-center">
                <p className="font-display text-lg md:text-xl font-medium mb-2">השילוב הזה מוכן לקמפיין מותאם אישית.</p>
                <p className="text-dim text-sm">עדיין אין דוגמה מוכנה בדיוק לשילוב הזה.</p>
                <p className="mt-4 font-mono text-[10px] uppercase tracking-wide text-dim">CTA מנוטרל בדמו</p>
              </div>
            ))}
        </div>
      </div>

      {loading && <div className="mt-10 font-mono text-xs text-dim uppercase text-center">טוען…</div>}

      <div className="mt-12">
        <div className="font-mono text-xs uppercase tracking-wide text-dim mb-3">דמויות</div>
        <div className="grid grid-cols-3 md:grid-cols-4 gap-2 md:gap-3">
          {talents.map((t: AITalentRow) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTalentId(t.id)}
              {...tileProps("talent", t.id)}
              className={cn(
                "aspect-[3/4] rounded-xl overflow-hidden border transition-colors",
                draggable && "cursor-grab active:cursor-grabbing",
                t.id === talentId ? "border-[#D1FE17]" : "border-white/10 hover:border-[#D1FE17]/60"
              )}
            >
              {t.portrait_image && (
                <img src={t.portrait_image} alt={t.full_name} loading="lazy" draggable={false} className="w-full h-full object-cover" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-10">
        <div className="font-mono text-xs uppercase tracking-wide text-dim mb-3">מוצרים</div>
        <div className="grid grid-cols-4 md:grid-cols-5 gap-2 md:gap-3">
          {products.map((p: AIProductRow) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setProductId(p.id)}
              {...tileProps("product", p.id)}
              className={cn(
                "aspect-[3/4] rounded-xl overflow-hidden border transition-colors",
                draggable && "cursor-grab active:cursor-grabbing",
                p.id === productId ? "border-[#D1FE17]" : "border-white/10 hover:border-[#D1FE17]/60"
              )}
            >
              {p.packshot_image && (
                <img src={p.packshot_image} alt={p.product_name} loading="lazy" draggable={false} className="w-full h-full object-cover" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
