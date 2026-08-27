import { useEffect, useLayoutEffect, useRef } from "react"
import { useReducedMotion } from "@/hooks/useReducedMotion"
import { primeWordsHidden, revealWordsIn } from "@/lib/showcaseMotion"

type Tag = "h1" | "h2" | "h3" | "p"

// A reusable word-reveal primitive: each word sits inside its own
// overflow-hidden mask and slides up into place, staggered, the first time
// it scrolls into view. Falls back to plain static text under
// prefers-reduced-motion.
//
// Deliberately never puts the word's transform in React's own JSX/style —
// GSAP owns that property exclusively (primed via useLayoutEffect, then
// animated on reveal). If React's vdom declared the transform instead, any
// later unrelated re-render of an ancestor would reconcile it back to the
// pre-reveal value and silently undo GSAP's already-finished animation.
export function ShowcaseRevealText({
  children,
  as = "h1",
  className,
  delay = 0,
}: {
  children: string
  as?: Tag
  className?: string
  delay?: number
}) {
  const ref = useRef<HTMLElement>(null)
  const reducedMotion = useReducedMotion()

  useLayoutEffect(() => {
    if (reducedMotion) return
    const el = ref.current
    if (el) primeWordsHidden(el)
  }, [reducedMotion])

  useEffect(() => {
    if (reducedMotion) return
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        revealWordsIn(el, { delay: delay / 1000 })
        io.disconnect()
      },
      { threshold: 0.3 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [reducedMotion, delay])

  const words = children.split(" ")
  const Component = as

  // The space between words has to be a plain text node sitting OUTSIDE the
  // masked/overflow-hidden boxes, as a sibling — a trailing space inside the
  // same inline-block as the word collapses to zero width in every browser
  // tested, running every word together with no gap.
  const nodes = words.flatMap((word, i) => {
    const maskedWord = (
      <span key={i} className="inline-block overflow-hidden pb-[0.12em] align-top">
        <span data-reveal-word className="inline-block will-change-transform">
          {word}
        </span>
      </span>
    )
    return i < words.length - 1 ? [maskedWord, " "] : [maskedWord]
  })

  return (
    <Component ref={ref as React.Ref<never>} className={className}>
      {nodes}
    </Component>
  )
}
