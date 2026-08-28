import { Link } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"

/** Compact auth affordance for the course top bar. */
export function CourseAuthControls() {
  const { user, loading } = useAuth()
  if (loading) return null

  if (user) {
    return (
      <Link
        to="/account"
        className="rounded-full border border-white/25 px-3 py-1.5 font-mono text-xs uppercase tracking-wide transition-colors hover:border-[#D1FE17] hover:text-[#D1FE17]"
      >
        האזור שלי
      </Link>
    )
  }

  return (
    <Link
      to="/login"
      className="rounded-full border border-white/25 px-3 py-1.5 font-mono text-xs uppercase tracking-wide transition-colors hover:border-foreground"
    >
      התחברות
    </Link>
  )
}
