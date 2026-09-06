import { useEffect, useRef, useState } from "react"

export type SignaturePadProps = {
  /** Called with a PNG data URL after every stroke, and with null when cleared. */
  onChange: (dataUrl: string | null) => void
  label?: string
}

/** A place to actually sign with a finger or a mouse. The typed full name plus
 * the confirmation checkbox is what makes the signature binding; this is what
 * makes it look and feel like signing, which is most of why people trust it. */
export function SignaturePad({ onChange, label = "חתימה" }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawing = useRef(false)
  const hasInk = useRef(false)
  const [empty, setEmpty] = useState(true)

  // The canvas is sized in device pixels so a finger stroke is not a blurry
  // smear on a phone, while CSS keeps it laid out at its element size.
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    function resize() {
      const el = canvasRef.current
      if (!el) return
      const ratio = window.devicePixelRatio || 1
      const { width, height } = el.getBoundingClientRect()
      el.width = Math.round(width * ratio)
      el.height = Math.round(height * ratio)
      const ctx = el.getContext("2d")
      if (!ctx) return
      ctx.scale(ratio, ratio)
      ctx.lineWidth = 2
      ctx.lineCap = "round"
      ctx.lineJoin = "round"
      ctx.strokeStyle = "#111111"
    }

    resize()
    window.addEventListener("resize", resize)
    return () => window.removeEventListener("resize", resize)
  }, [])

  function pointFrom(e: React.PointerEvent<HTMLCanvasElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  function start(e: React.PointerEvent<HTMLCanvasElement>) {
    const ctx = canvasRef.current?.getContext("2d")
    if (!ctx) return
    e.currentTarget.setPointerCapture(e.pointerId)
    drawing.current = true
    const { x, y } = pointFrom(e)
    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  function move(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return
    const ctx = canvasRef.current?.getContext("2d")
    if (!ctx) return
    const { x, y } = pointFrom(e)
    ctx.lineTo(x, y)
    ctx.stroke()
    hasInk.current = true
    if (empty) setEmpty(false)
  }

  function end() {
    if (!drawing.current) return
    drawing.current = false
    if (!hasInk.current) return
    onChange(canvasRef.current?.toDataURL("image/png") ?? null)
  }

  function clear() {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    hasInk.current = false
    setEmpty(true)
    onChange(null)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="block text-xs font-mono text-dim uppercase tracking-wide">{label}</label>
        {!empty && (
          <button type="button" onClick={clear} className="font-mono text-[10px] uppercase tracking-wide text-dim hover:text-[#D1FE17] transition-colors p-1 -m-1">
            ניקוי
          </button>
        )}
      </div>
      <div className="relative rounded border border-white/30 bg-white overflow-hidden">
        <canvas
          ref={canvasRef}
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={end}
          onPointerLeave={end}
          onPointerCancel={end}
          aria-label={label}
          className="block w-full h-36 touch-none cursor-crosshair"
        />
        {empty && (
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-black/30 text-sm">
            חתמו כאן באצבע או בעכבר
          </span>
        )}
      </div>
    </div>
  )
}
