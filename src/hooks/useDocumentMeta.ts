import { useEffect } from "react"
import { useLocation } from "react-router-dom"

function setMeta(selector: string, attr: string, content: string) {
  let el = document.querySelector<HTMLMetaElement>(selector)
  const created = !el
  if (!el) {
    el = document.createElement("meta")
    const match = selector.match(/\[([a-z]+)="([^"]+)"\]/)
    if (match) el.setAttribute(match[1], match[2])
    document.head.appendChild(el)
  }
  const prev = el.getAttribute(attr)
  el.setAttribute(attr, content)
  return () => {
    if (!el) return
    if (created) el.remove()
    else if (prev !== null) el.setAttribute(attr, prev)
  }
}

export function useDocumentMeta(
  title: string,
  description?: string,
  image?: string,
  publishedTime?: string,
  options?: { noindex?: boolean }
) {
  const { pathname } = useLocation()
  const noindex = options?.noindex ?? false

  useEffect(() => {
    const prevTitle = document.title
    document.title = title

    const restores: Array<() => void> = []

    if (description) {
      restores.push(setMeta('meta[name="description"]', "content", description))
      restores.push(setMeta('meta[property="og:description"]', "content", description))
    }
    restores.push(setMeta('meta[property="og:title"]', "content", title))

    if (noindex) {
      restores.push(setMeta('meta[name="robots"]', "content", "noindex, follow"))
    }

    if (image) {
      const absoluteImage = image.startsWith("http") ? image : `${window.location.origin}${image}`
      restores.push(setMeta('meta[property="og:image"]', "content", absoluteImage))
      restores.push(setMeta('meta[name="twitter:image"]', "content", absoluteImage))
    }

    if (publishedTime) {
      restores.push(setMeta('meta[property="og:type"]', "content", "article"))
      restores.push(setMeta('meta[property="article:published_time"]', "content", publishedTime))
    }

    let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    const prevHref = canonical?.getAttribute("href") ?? null
    const url = `${window.location.origin}${pathname}`
    canonical?.setAttribute("href", url)
    restores.push(setMeta('meta[property="og:url"]', "content", url))

    return () => {
      document.title = prevTitle
      restores.forEach((r) => r())
      if (canonical && prevHref !== null) canonical.setAttribute("href", prevHref)
    }
  }, [title, description, image, publishedTime, pathname, noindex])
}
