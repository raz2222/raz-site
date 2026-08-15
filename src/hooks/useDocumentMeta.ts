import { useEffect } from "react"

export function useDocumentMeta(title: string, description?: string) {
  useEffect(() => {
    const prevTitle = document.title
    document.title = title

    let descTag: HTMLMetaElement | null = null
    let prevDesc: string | null = null
    if (description) {
      descTag = document.querySelector('meta[name="description"]')
      if (descTag) {
        prevDesc = descTag.getAttribute("content")
        descTag.setAttribute("content", description)
      }
    }

    return () => {
      document.title = prevTitle
      if (descTag && prevDesc !== null) descTag.setAttribute("content", prevDesc)
    }
  }, [title, description])
}
