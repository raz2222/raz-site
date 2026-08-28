import { Link } from "react-router-dom"
import { useCourseConfig } from "../hooks/useCourse"
import { formatPrice } from "../lib/config"
import { CourseAuthControls } from "./CourseAuthControls"

export function CourseNav() {
  const { config } = useCourseConfig()

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-5 py-3 md:px-8">
        <Link to="/" className="flex items-baseline gap-2">
          <span className="font-display text-lg font-bold tracking-tight">פריים ראשון</span>
          <span className="hidden font-mono text-[0.68rem] text-dim sm:inline">/ קורס Higgsfield</span>
        </Link>

        <nav className="flex items-center gap-2 md:gap-3">
          <a
            href="/#curriculum"
            className="hidden font-mono text-xs uppercase tracking-wide text-dim transition-colors hover:text-foreground sm:inline"
          >
            תוכנית הקורס
          </a>
          <span className="rounded border border-white/20 px-2 py-1 font-mono text-xs text-dim">
            {formatPrice(config.price_agorot, config.currency)}
          </span>
          <CourseAuthControls />
        </nav>
      </div>
    </header>
  )
}
