import { useEffect, useRef, useState } from "react"

type ProgressThumb = { widthPct: number; leftPct: number; visible: boolean }

export function useCarouselProgress<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [thumb, setThumb] = useState<ProgressThumb>({ widthPct: 100, leftPct: 0, visible: false })

  useEffect(() => {
    const el = ref.current
    if (!el) return

    function update() {
      const { scrollLeft, scrollWidth, clientWidth } = el!
      const scrollable = scrollWidth - clientWidth
      if (scrollable <= 1) {
        setThumb({ widthPct: 100, leftPct: 0, visible: false })
        return
      }
      const widthPct = Math.max((clientWidth / scrollWidth) * 100, 12)
      const progress = Math.min(Math.max(Math.abs(scrollLeft) / scrollable, 0), 1)
      setThumb({ widthPct, leftPct: progress * (100 - widthPct), visible: true })
    }

    update()
    el.addEventListener("scroll", update, { passive: true })
    const resizeObserver = new ResizeObserver(update)
    resizeObserver.observe(el)
    return () => {
      el.removeEventListener("scroll", update)
      resizeObserver.disconnect()
    }
  }, [])

  return { ref, thumb }
}

export function CarouselProgressBar({ thumb, className = "" }: { thumb: ProgressThumb; className?: string }) {
  if (!thumb.visible) return null
  return (
    <div className={`h-[3px] rounded-full bg-white/10 overflow-hidden ${className}`} aria-hidden="true">
      <div
        className="h-full rounded-full bg-[#D1FE17]"
        style={{ width: `${thumb.widthPct}%`, marginInlineStart: `${thumb.leftPct}%` }}
      />
    </div>
  )
}
