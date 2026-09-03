import { useEffect } from "react"

// enPath is null for a Hebrew-only section. /tutorials has no English mirror
// (it is content for Raz's Hebrew Instagram audience), and pointing hreflang at
// a page that 404s is worse than shipping no alternate at all: Google drops the
// whole annotation and can distrust the ones that are correct.
export function useHreflang(hePath: string, enPath: string | null) {
  useEffect(() => {
    const origin = window.location.origin
    const links: HTMLLinkElement[] = []

    // Prerendered pages (scripts/prerender.mjs) already ship these tags in the
    // static HTML. Without this the mounted app would append a second,
    // identical set on top of them.
    document.head.querySelectorAll('link[rel="alternate"][hreflang]').forEach((el) => el.remove())

    const specs: [string, string][] = [
      ["he", hePath],
      ...(enPath ? ([["en", enPath]] as [string, string][]) : []),
      ["x-default", hePath],
    ]

    for (const [lang, path] of specs) {
      const link = document.createElement("link")
      link.rel = "alternate"
      link.hreflang = lang
      link.href = `${origin}${path}`
      document.head.appendChild(link)
      links.push(link)
    }

    return () => {
      links.forEach((l) => l.remove())
    }
  }, [hePath, enPath])
}
