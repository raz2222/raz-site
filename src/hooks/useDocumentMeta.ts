import { useEffect } from "react"
import { useLocation } from "react-router-dom"

function setMeta(selector: string, attr: string, content: string) {
  const el = document.querySelector<HTMLMetaElement>(selector)
  const prev = el?.getAttribute(attr) ?? null
  el?.setAttribute(attr, content)
  return () => {
    if (el && prev !== null) el.setAttribute(attr, prev)
  }
}

export function useDocumentMeta(title: string, description?: string) {
  const { pathname } = useLocation()

  useEffect(() => {
    const prevTitle = document.title
    document.title = title

    const restores: Array<() => void> = []

    if (description) {
      restores.push(setMeta('meta[name="description"]', "content", description))
      restores.push(setMeta('meta[property="og:description"]', "content", description))
    }
    restores.push(setMeta('meta[property="og:title"]', "content", title))

    let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    const prevHref = canonical?.getAttribute("href") ?? null
    const url = `${window.location.origin}${pathname}`
    canonical?.setAttribute("href", url)

    return () => {
      document.title = prevTitle
      restores.forEach((r) => r())
      if (canonical && prevHref !== null) canonical.setAttribute("href", prevHref)
    }
  }, [title, description, pathname])
}
