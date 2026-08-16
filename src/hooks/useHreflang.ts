import { useEffect } from "react"

export function useHreflang(hePath: string, enPath: string) {
  useEffect(() => {
    const origin = window.location.origin
    const links: HTMLLinkElement[] = []

    const specs: [string, string][] = [
      ["he", hePath],
      ["en", enPath],
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
