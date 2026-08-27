import gsap from "gsap"

// One shared easing vocabulary for every showcase-only animation (hero
// crossfades, the cursor, reveal text, card hover, scroll-triggered
// reveals) so the whole subdomain moves with the same feel instead of each
// component picking its own curve.
export const SHOWCASE_EASE = "power3.out"
export const SHOWCASE_EASE_STRONG = "expo.out"
export const SHOWCASE_DURATION = 0.7

/**
 * Sets every `[data-reveal-word]` child inside `container` to its masked,
 * pre-reveal position. Call this from a `useLayoutEffect` — imperatively,
 * outside React's render — so the word's `transform` is never part of
 * React's own vdom for that element. If it were, a later unrelated
 * re-render of an ancestor would reconcile `style.transform` back to
 * whatever JSX last declared, silently undoing whatever revealWordsIn had
 * already animated (GSAP mutates the DOM directly, outside React's model).
 */
export function primeWordsHidden(container: HTMLElement) {
  const words = container.querySelectorAll<HTMLElement>("[data-reveal-word]")
  if (words.length > 0) gsap.set(words, { yPercent: 110 })
}

/**
 * Staggers a translateY reveal over every `[data-reveal-word]` child inside
 * `container` — used by ShowcaseRevealText. Kept as a plain function (not a
 * hook) so it can run once, imperatively, the moment a heading scrolls into
 * view. Assumes `primeWordsHidden` already ran.
 */
export function revealWordsIn(container: HTMLElement, opts?: { delay?: number; stagger?: number }) {
  const words = container.querySelectorAll<HTMLElement>("[data-reveal-word]")
  if (words.length === 0) return
  gsap.to(words, {
    yPercent: 0,
    duration: SHOWCASE_DURATION,
    ease: SHOWCASE_EASE_STRONG,
    stagger: opts?.stagger ?? 0.05,
    delay: opts?.delay ?? 0,
  })
}
