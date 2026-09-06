import { useEffect, useRef } from "react"

type Piece = {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  rotation: number
  spin: number
  color: string
  wobble: number
}

// The site's own palette, so a celebration still looks like this brand rather
// than like a party-supplies website.
const COLORS = ["#D1FE17", "#FFFFFF", "#B7E014", "#8FA80F", "#F4FFC2"]

const GRAVITY = 0.14
const DRAG = 0.995

/** Confetti, drawn on a canvas over everything, for one short burst.
 *
 * Written rather than pulled in as a dependency: it is eighty lines, it only
 * ever runs inside /admin, and this way nothing extra reaches the public bundle
 * that CLAUDE.md says is already main-thread bound.
 *
 * It stops on its own, removes its own listener and canvas, and does not run at
 * all for someone who asked for reduced motion. */
export function Confetti({ durationMs = 4000, onDone }: { durationMs?: number; onDone?: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const doneRef = useRef(onDone)
  doneRef.current = onDone

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      doneRef.current?.()
      return
    }

    const context = canvas.getContext("2d")
    if (!context) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let width = 0
    let height = 0

    function resize() {
      if (!canvas) return
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = width * dpr
      canvas.height = height * dpr
      context?.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener("resize", resize)

    // Everything falls from above the top edge, so the first frame is empty sky
    // rather than a rectangle of confetti appearing over the page.
    const pieces: Piece[] = Array.from({ length: 140 }, () => ({
      x: Math.random() * width,
      y: -20 - Math.random() * height * 0.6,
      vx: (Math.random() - 0.5) * 1.4,
      vy: 1.6 + Math.random() * 2.6,
      size: 5 + Math.random() * 6,
      rotation: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.2,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      wobble: Math.random() * Math.PI * 2,
    }))

    const start = performance.now()
    let frame = 0

    function draw(now: number) {
      const elapsed = now - start
      // The last second fades out, so the burst ends rather than being cut.
      const fade = elapsed > durationMs - 1000 ? Math.max(0, (durationMs - elapsed) / 1000) : 1

      context!.clearRect(0, 0, width, height)

      for (const p of pieces) {
        p.wobble += 0.06
        p.vy = p.vy * DRAG + GRAVITY
        p.vx *= DRAG
        p.x += p.vx + Math.sin(p.wobble) * 0.7
        p.y += p.vy
        p.rotation += p.spin

        if (p.y > height + 20) {
          p.y = -20
          p.x = Math.random() * width
          p.vy = 1.6 + Math.random() * 2.6
        }

        context!.save()
        context!.translate(p.x, p.y)
        context!.rotate(p.rotation)
        context!.globalAlpha = fade
        context!.fillStyle = p.color
        // A flat rectangle spinning on one axis reads as a paper strip.
        context!.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2)
        context!.restore()
      }

      if (elapsed < durationMs) {
        frame = requestAnimationFrame(draw)
      } else {
        context!.clearRect(0, 0, width, height)
        doneRef.current?.()
      }
    }
    frame = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener("resize", resize)
    }
  }, [durationMs])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 z-[100] pointer-events-none"
    />
  )
}
