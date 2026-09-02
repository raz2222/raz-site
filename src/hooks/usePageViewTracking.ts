import { useEffect, useRef } from "react"
import { useLocation } from "react-router-dom"
import { trackPageView } from "@/lib/analytics"

// Sends a GA4 page_view on client-side navigation.
//
// gtag('config') fires one page_view when analytics initialises and nothing
// after that, so in this SPA only the first page of each session was ever
// counted. The first location this hook sees is skipped for that reason —
// config already reported it, and reporting it again would double-count.
//
// The send is deferred a tick because route components are lazy-loaded and set
// their own document.title in an effect; without the delay a first visit to a
// route would be reported under the previous page's title.
export function usePageViewTracking() {
  const { pathname } = useLocation()
  const isFirstLocation = useRef(true)

  useEffect(() => {
    if (isFirstLocation.current) {
      isFirstLocation.current = false
      return
    }
    const timer = setTimeout(() => trackPageView(pathname), 120)
    return () => clearTimeout(timer)
  }, [pathname])
}
