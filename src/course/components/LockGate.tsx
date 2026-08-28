import { useAuth } from "@/hooks/useAuth"
import { useCourseConfig } from "../hooks/useCourse"
import { formatPrice } from "../lib/config"
import { BtnLink } from "./ui"

/** Shown in place of a locked lesson body. */
export function LockGate() {
  const { user } = useAuth()
  const { config } = useCourseConfig()
  const price = formatPrice(config.price_agorot, config.currency)

  return (
    <div className="mt-8 rounded border border-white/20 bg-white/[0.02] p-6 text-center md:p-10">
      <span className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-white/20 text-[#D1FE17]">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="4" y="10" width="16" height="11" rx="1.5" stroke="currentColor" strokeWidth="2" />
          <path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="2" />
        </svg>
      </span>
      <h2 className="mt-4 font-display text-xl font-bold">שיעור נעול</h2>
      <p className="mx-auto mt-2 max-w-sm text-sm text-dim">
        שיעור 1 פתוח לכולם. שאר השיעורים ופרויקט הגמר נפתחים עם רכישת גישה — {price}, לכל החיים.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {config.checkout_mode === "disabled" ? (
          <span className="font-mono text-xs uppercase tracking-wide text-dim">פתיחה לרכישה בקרוב</span>
        ) : (
          <BtnLink to="/checkout" size="lg">
            רכוש גישה · {price}
          </BtnLink>
        )}
        {!user && (
          <BtnLink to="/login" variant="ghost" size="lg">
            כבר קניתי — התחברות
          </BtnLink>
        )}
      </div>
    </div>
  )
}
