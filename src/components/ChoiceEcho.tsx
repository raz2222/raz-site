import { useCallback, useEffect, useRef, useState, type ReactNode } from "react"
import { useReducedMotion } from "@/hooks/useReducedMotion"

// The answer a visitor just picked, said back to them huge behind the form:
// outlined in the accent, growing as it fades. Raz asked for it on 2026-10-21
// after income-calculator.consulting.com, whose questionnaire does this after
// every choice. The forms here allow several picks and a Continue, so unlike
// that page nothing advances on its own: the echo plays, the form stays.
//
// It is centred on the option that was tapped, not on the form: the popup is
// taller than a phone's screen on its later steps, and a word centred in the
// whole box would play off-screen.
//
// Purely decorative: aria-hidden, pointer-events none, and off entirely under
// prefers-reduced-motion. A form uses it by calling `echo(text, element)` on a
// pick, rendering `layer` first inside a `relative` box, and putting its own
// content in a `relative z-[1]` wrapper whose className takes `dimClass`.

const DIM_FOR_MS = 420

/** Shorter options get bigger type. Sized to the form's own width (cqi), not
 *  the screen's: the footer's form is a narrow column, where a size from the
 *  viewport overflowed it. Never clamped with an ellipsis: the display font
 *  has no "…" and drew it as empty boxes. */
export function echoFontSize(text: string): string {
  const n = text.length
  if (n <= 6) return "min(168px, 38cqi)"
  if (n <= 12) return "min(116px, 24cqi)"
  if (n <= 20) return "min(84px, 16cqi)"
  return "min(64px, 12cqi)"
}

/** `color`: the outline, the accent by default; black on the accent-coloured footer. */
export function useChoiceEcho(color = "#D1FE17"): {
  echo: (text: string, from?: Element | null) => void
  layer: ReactNode
  dimClass: string
} {
  const reduced = useReducedMotion()
  const [shown, setShown] = useState<{ text: string; id: number; y: number | null } | null>(null)
  const [dim, setDim] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const box = useRef<HTMLDivElement>(null)

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current)
  }, [])

  const echo = useCallback(
    (text: string, from?: Element | null) => {
      if (reduced || !text.trim()) return
      let y: number | null = null
      const b = box.current?.getBoundingClientRect()
      const r = from?.getBoundingClientRect()
      if (b && r && b.height > 0) y = r.top + r.height / 2 - b.top
      setShown((s) => ({ text: text.trim(), id: (s?.id ?? 0) + 1, y }))
      setDim(true)
      if (timer.current) clearTimeout(timer.current)
      timer.current = setTimeout(() => setDim(false), DIM_FOR_MS)
    },
    [reduced],
  )

  const layer = (
    <div ref={box} aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]" style={{ containerType: "inline-size" }}>
      {shown && (
        <div
          className="absolute inset-x-0 flex justify-center"
          style={shown.y === null ? { top: "50%", transform: "translateY(-50%)" } : { top: shown.y, transform: "translateY(-50%)" }}
        >
          <span
            key={shown.id}
            className="choice-echo font-display font-black leading-[0.95] tracking-[-0.04em] text-center px-4"
            style={{ fontSize: echoFontSize(shown.text), WebkitTextStrokeColor: color }}
          >
            {shown.text}
          </span>
        </div>
      )}
    </div>
  )

  return { echo, layer, dimClass: dim ? "opacity-40" : "opacity-100" }
}
