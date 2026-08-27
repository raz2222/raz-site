import type { ReactNode } from "react"
import { Link } from "react-router-dom"

const MAIN_SITE = "https://madebyraz.co.il"
const isLandingSubdomain =
  typeof window !== "undefined" && /^(ai|web|show)\./.test(window.location.hostname)

/**
 * /ai, /web and /show render outside the app's <Routes> tree (see App.tsx's
 * hostname branches), so a plain <Link to="/privacy"> there navigates
 * to a path nothing renders for. On those subdomains this links to the
 * real page on the main domain instead; everywhere else it's a normal
 * in-app <Link>.
 */
export function LegalLink({
  to,
  className,
  children,
}: {
  to: "/privacy" | "/terms"
  className?: string
  children: ReactNode
}) {
  if (isLandingSubdomain) {
    return (
      <a href={`${MAIN_SITE}${to}`} target="_blank" rel="noreferrer" className={className}>
        {children}
      </a>
    )
  }
  return (
    <Link to={to} className={className}>
      {children}
    </Link>
  )
}
