import { useCallback, useEffect, useRef, useState, type MouseEvent as ReactMouseEvent, type PointerEvent as ReactPointerEvent } from "react"
import { useAIExperience } from "@/hooks/useAIExperience"
import { useReducedMotion } from "@/hooks/useReducedMotion"
import { PhoneVideoFrame } from "@/components/ai-experience/PhoneVideoFrame"
import type { AITalentRow, AIProductRow } from "@/lib/supabase"
import { cn } from "@/lib/utils"

// EXPERIMENT — not wired into any public page. Rendered only by
// /lab/ai-experience so the slot idea can be judged next to the shipped
// AIExperienceSection, which this file deliberately leaves untouched.
//
// Drag is built on Pointer Events, not HTML5 drag-and-drop. HTML5 DnD never
// fires on touch, which is why the first pass here was desktop-only; pointer
// events are one code path for mouse, touch and pen, so the drag is the same
// gesture on a phone as on a laptop. Tap-to-select still works everywhere and
// is what a tap that never becomes a drag falls back to.
//
// No analytics: a lab page firing talent_selected / campaign_viewed would
// poison the real funnel numbers.

type SlotKind = "talent" | "product"

// A touch that starts on a tile is ambiguous — it could be the start of a
// page scroll. Waiting this long before claiming it as a drag is what keeps
// the grids scrollable; a mouse has no such ambiguity and picks up on the
// first few pixels of movement instead.
const TOUCH_HOLD_MS = 200
const MOUSE_THRESHOLD_PX = 6
const TOUCH_CANCEL_PX = 10

type Pending = {
  pointerId: number
  kind: SlotKind
  id: string
  image: string | null
  startX: number
  startY: number
  touch: boolean
  timer: number | null
  el: HTMLElement
}

type Ghost = { kind: SlotKind; id: string; image: string | null; x: number; y: number }

export function AIExperienceSlots({ enableDrag = true }: { enableDrag?: boolean }) {
  const { talents, products, findCombination, loading } = useAIExperience()
  const reduced = useReducedMotion()

  const [talentId, setTalentId] = useState<string | null>(null)
  const [productId, setProductId] = useState<string | null>(null)
  const [ghost, setGhost] = useState<Ghost | null>(null)
  const [over, setOver] = useState<SlotKind | null>(null)

  const pendingRef = useRef<Pending | null>(null)
  const draggingRef = useRef(false)
  const dragEndedAtRef = useRef(0)
  const overRef = useRef<SlotKind | null>(null)

  const setOverBoth = useCallback((next: SlotKind | null) => {
    overRef.current = next
    setOver(next)
  }, [])

  const talent = talents.find((t) => t.id === talentId) ?? null
  const product = products.find((p) => p.id === productId) ?? null
  const combination = findCombination(talentId, productId)
  const ready = Boolean(talentId && productId)

  const assign = useCallback((kind: SlotKind, id: string) => {
    if (kind === "talent") setTalentId(id)
    else setProductId(id)
  }, [])

  // While a drag is live the page must not scroll under the finger. Locking
  // the body is what makes this work on touch at all: preventDefault on
  // pointermove does not stop a pan that the browser has already claimed.
  const lockScroll = useCallback((locked: boolean) => {
    const s = document.body.style
    if (locked) {
      s.overflow = "hidden"
      s.touchAction = "none"
      s.userSelect = "none"
    } else {
      s.overflow = ""
      s.touchAction = ""
      s.userSelect = ""
    }
  }, [])

  const endDrag = useCallback(
    (commit: boolean) => {
      const p = pendingRef.current
      if (p?.timer) clearTimeout(p.timer)
      if (draggingRef.current) {
        const target = overRef.current
        if (commit && target && p && target === p.kind) assign(p.kind, p.id)
        dragEndedAtRef.current = Date.now()
        lockScroll(false)
        if (p) {
          try {
            p.el.releasePointerCapture(p.pointerId)
          } catch {
            // The pointer is already gone (cancel, or the element unmounted).
          }
        }
      }
      draggingRef.current = false
      pendingRef.current = null
      setGhost(null)
      setOverBoth(null)
    },
    [assign, lockScroll, setOverBoth]
  )

  const hitTest = useCallback((x: number, y: number) => {
    const el = document.elementFromPoint(x, y)
    const slot = el?.closest<HTMLElement>("[data-slot]")
    return (slot?.dataset.slot as SlotKind | undefined) ?? null
  }, [])

  const beginDrag = useCallback(
    (x: number, y: number) => {
      const p = pendingRef.current
      if (!p) return
      draggingRef.current = true
      lockScroll(true)
      try {
        p.el.setPointerCapture(p.pointerId)
      } catch {
        // Safe to continue without capture: the window listeners still track.
      }
      if (p.touch && typeof navigator.vibrate === "function") navigator.vibrate(8)
      setGhost({ kind: p.kind, id: p.id, image: p.image, x, y })
      setOverBoth(hitTest(x, y))
    },
    [hitTest, lockScroll, setOverBoth]
  )

  // Move/up are bound to the window rather than the tile: a fast drag outruns
  // the element it started on, and the gesture has to keep tracking regardless
  // of what is under the pointer.
  useEffect(() => {
    if (!enableDrag) return

    const onMove = (e: PointerEvent) => {
      const p = pendingRef.current
      if (!p || e.pointerId !== p.pointerId) return
      const dx = e.clientX - p.startX
      const dy = e.clientY - p.startY
      const dist = Math.hypot(dx, dy)

      if (!draggingRef.current) {
        if (p.touch) {
          // Moved before the hold completed — the user is scrolling, so let
          // the browser have the gesture.
          if (dist > TOUCH_CANCEL_PX) endDrag(false)
        } else if (dist > MOUSE_THRESHOLD_PX) {
          beginDrag(e.clientX, e.clientY)
        }
        return
      }

      e.preventDefault()
      setGhost((g) => (g ? { ...g, x: e.clientX, y: e.clientY } : g))
      setOverBoth(hitTest(e.clientX, e.clientY))
    }

    const onUp = (e: PointerEvent) => {
      const p = pendingRef.current
      if (!p || e.pointerId !== p.pointerId) return
      endDrag(true)
    }

    const onCancel = () => endDrag(false)

    const onTouchMove = (e: TouchEvent) => {
      if (draggingRef.current) e.preventDefault()
    }

    window.addEventListener("pointermove", onMove, { passive: false })
    window.addEventListener("pointerup", onUp)
    window.addEventListener("pointercancel", onCancel)
    window.addEventListener("touchmove", onTouchMove, { passive: false })
    return () => {
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("pointerup", onUp)
      window.removeEventListener("pointercancel", onCancel)
      window.removeEventListener("touchmove", onTouchMove)
    }
  }, [beginDrag, enableDrag, endDrag, hitTest, setOverBoth])

  // A drag left mid-flight when the component unmounts must not leave the
  // page permanently unscrollable.
  useEffect(() => () => lockScroll(false), [lockScroll])

  function tileHandlers(kind: SlotKind, id: string, image: string | null) {
    if (!enableDrag) return {}
    return {
      onPointerDown: (e: ReactPointerEvent) => {
        if (e.button !== 0) return
        const touch = e.pointerType !== "mouse"
        const pending: Pending = {
          pointerId: e.pointerId,
          kind,
          id,
          image,
          startX: e.clientX,
          startY: e.clientY,
          touch,
          timer: null,
          el: e.currentTarget as HTMLElement,
        }
        if (touch) {
          const { clientX, clientY } = e
          pending.timer = window.setTimeout(() => beginDrag(clientX, clientY), TOUCH_HOLD_MS)
        }
        pendingRef.current = pending
      },
      onClick: (e: ReactMouseEvent) => {
        // The click that trails a drag would re-select whatever tile the
        // gesture started on, undoing a drop into the other slot.
        if (Date.now() - dragEndedAtRef.current < 250) {
          e.preventDefault()
          return
        }
        assign(kind, id)
      },
    }
  }

  const hint = enableDrag ? "גררו או לחצו" : "לחצו לבחירה"

  return (
    <div>
      {/* The slots stay stuck to the top of the viewport, so on a phone the
          drop target is still on screen once you have scrolled down to the
          tile you want to drag. */}
      <div className="sticky top-0 z-30 -mx-4 px-4 py-3 bg-black/80 backdrop-blur border-b border-white/10">
        <div className="flex items-center justify-center gap-3 md:gap-5">
          <div className="w-[92px] md:w-[120px]">
            <Slot
              kind="talent"
              label="דמות"
              hint={hint}
              image={talent?.portrait_image}
              name={talent?.full_name}
              over={over === "talent"}
              armed={ghost?.kind === "talent"}
              onClear={() => setTalentId(null)}
            />
          </div>
          <span className="font-display text-2xl md:text-3xl text-dim select-none">×</span>
          <div className="w-[92px] md:w-[120px]">
            <Slot
              kind="product"
              label="מוצר"
              hint={hint}
              image={product?.packshot_image}
              name={product?.product_name}
              over={over === "product"}
              armed={ghost?.kind === "product"}
              onClear={() => setProductId(null)}
            />
          </div>
        </div>
      </div>

      {/* Tweening grid-template-rows rather than height keeps the reveal off
          the layout-per-frame path, which matters with a video playing inside
          it. Same easing as the snippet this started from. */}
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

      <Grid
        title="דמויות"
        cols="grid-cols-3 md:grid-cols-4"
        items={talents.map((t: AITalentRow) => ({ id: t.id, image: t.portrait_image, alt: t.full_name }))}
        selectedId={talentId}
        draggable={enableDrag}
        pickedUpId={ghost?.kind === "talent" ? ghost.id : null}
        handlers={(id, image) => tileHandlers("talent", id, image)}
      />

      <Grid
        title="מוצרים"
        cols="grid-cols-4 md:grid-cols-5"
        items={products.map((p: AIProductRow) => ({ id: p.id, image: p.packshot_image, alt: p.product_name }))}
        selectedId={productId}
        draggable={enableDrag}
        pickedUpId={ghost?.kind === "product" ? ghost.id : null}
        handlers={(id, image) => tileHandlers("product", id, image)}
      />

      {/* The tile that follows the pointer. pointer-events:none is load-bearing —
          elementFromPoint has to see the slot underneath, not this. */}
      {ghost && (
        <div
          className="fixed z-[60] pointer-events-none w-[88px] aspect-[3/4] rounded-xl overflow-hidden border-2 border-[#D1FE17] shadow-2xl shadow-black/60"
          style={{ left: ghost.x, top: ghost.y, transform: "translate(-50%, -50%) rotate(-3deg) scale(1.06)" }}
        >
          {ghost.image && <img src={ghost.image} alt="" className="w-full h-full object-cover" />}
        </div>
      )}
    </div>
  )
}

function Slot({
  kind,
  label,
  hint,
  image,
  name,
  over,
  armed,
  onClear,
}: {
  kind: SlotKind
  label: string
  hint: string
  image?: string | null
  name?: string | null
  over: boolean
  armed: boolean
  onClear: () => void
}) {
  const filled = Boolean(name)

  return (
    <div
      data-slot={kind}
      className={cn(
        "relative aspect-[3/4] rounded-xl border overflow-hidden transition-all duration-200",
        over && "border-[#D1FE17] bg-[#D1FE17]/15 scale-105",
        !over && armed && "border-[#D1FE17]/60 border-dashed",
        !over && !armed && filled && "border-[#D1FE17]/70",
        !over && !armed && !filled && "border-dashed border-white/20"
      )}
    >
      {filled ? (
        <>
          {image && <img src={image} alt={name ?? ""} draggable={false} className="w-full h-full object-cover" />}
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

function Grid({
  title,
  cols,
  items,
  selectedId,
  draggable,
  pickedUpId,
  handlers,
}: {
  title: string
  cols: string
  items: Array<{ id: string; image: string | null; alt: string }>
  selectedId: string | null
  draggable: boolean
  pickedUpId: string | null
  handlers: (id: string, image: string | null) => Record<string, unknown>
}) {
  return (
    <div className="mt-10">
      <div className="font-mono text-xs uppercase tracking-wide text-dim mb-3">{title}</div>
      <div className={cn("grid gap-2 md:gap-3", cols)}>
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            {...handlers(item.id, item.image)}
            className={cn(
              "aspect-[3/4] rounded-xl overflow-hidden border transition-all",
              draggable && "cursor-grab active:cursor-grabbing",
              pickedUpId === item.id && "opacity-40 scale-95",
              item.id === selectedId ? "border-[#D1FE17]" : "border-white/10 hover:border-[#D1FE17]/60"
            )}
          >
            {item.image && (
              <img src={item.image} alt={item.alt} loading="lazy" draggable={false} className="w-full h-full object-cover" />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
