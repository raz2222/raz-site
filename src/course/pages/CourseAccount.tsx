import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/hooks/useAuth"
import { useCourseAccess, useCourseConfig, useLessons, useProgress } from "../hooks/useCourse"
import { formatPrice } from "../lib/config"
import { BtnLink, Btn } from "../components/ui"
import { courseSignOut } from "../hooks/useCourseAuth"

type OrderRow = {
  id: string
  amount_agorot: number
  currency: string
  status: string
  created_at: string
}

const STATUS_HE: Record<string, string> = {
  pending: "ממתין לתשלום",
  paid: "שולם",
  refunded: "הוחזר",
  failed: "נכשל",
}

export function CourseAccount() {
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()
  const { hasAccess, loading: accessLoading } = useCourseAccess()
  const { lessons } = useLessons()
  const { done } = useProgress()
  const { config } = useCourseConfig()
  const [orders, setOrders] = useState<OrderRow[]>([])

  useEffect(() => {
    if (!authLoading && !user) navigate("/login", { replace: true })
  }, [authLoading, user, navigate])

  useEffect(() => {
    if (!user) return
    supabase
      .from("course_orders")
      .select("id,amount_agorot,currency,status,created_at")
      .order("created_at", { ascending: false })
      .then(({ data }) => setOrders((data as OrderRow[]) ?? []))
  }, [user?.id])

  if (authLoading || !user) return null

  const doneCount = lessons.filter((l) => done.has(l.slug)).length

  return (
    <div className="mx-auto max-w-3xl px-5 py-14 md:px-8 md:py-16">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">האזור שלי</h1>
          <p className="mt-1 font-mono text-xs text-dim">{user.email}</p>
        </div>
        <button
          onClick={async () => {
            await courseSignOut()
            navigate("/")
          }}
          className="font-mono text-xs uppercase tracking-wide text-dim hover:text-foreground"
        >
          יציאה
        </button>
      </div>

      {/* access */}
      <div className="mt-8 rounded border border-white/15 p-5">
        <div className="font-mono text-xs uppercase tracking-wide text-dim">סטטוס גישה</div>
        {accessLoading ? (
          <p className="mt-2 text-sm text-dim">בודק…</p>
        ) : hasAccess ? (
          <>
            <p className="mt-2 flex items-center gap-2 font-semibold text-[#D1FE17]">
              <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                <path d="M2 9.5 7 14 16 4" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              גישה מלאה פעילה
            </p>
            <p className="mt-1 text-sm text-dim">
              התקדמות: {doneCount} / {lessons.length} שיעורים
            </p>
          </>
        ) : (
          <>
            <p className="mt-2 text-sm text-dim">אין עדיין גישה מלאה. שיעור 1 פתוח לך תמיד.</p>
            <BtnLink to="/checkout" className="mt-4">
              רכוש גישה · {formatPrice(config.price_agorot, config.currency)}
            </BtnLink>
          </>
        )}
      </div>

      {/* lessons + progress */}
      {lessons.length > 0 && (
        <div className="mt-8">
          <div className="font-mono text-xs uppercase tracking-wide text-dim">השיעורים</div>
          <ul className="mt-3 divide-y divide-white/10">
            {lessons.map((l) => {
              const watched = done.has(l.slug)
              return (
                <li key={l.slug}>
                  <Link to={`/lesson/${l.slug}`} className="flex items-center gap-3 py-3 hover:bg-white/[0.02]">
                    <span
                      className={`grid h-4 w-4 flex-none place-items-center rounded-full ${
                        watched ? "bg-[#D1FE17] text-background" : "border border-white/25"
                      }`}
                    >
                      {watched && (
                        <svg width="10" height="10" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                          <path d="M2 9.5 7 14 16 4" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </span>
                    <span className="font-mono text-xs text-dim">{String(l.order_index).padStart(2, "0")}</span>
                    <span className="truncate text-sm">{l.title_he}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      )}

      {/* orders */}
      {orders.length > 0 && (
        <div className="mt-8">
          <div className="font-mono text-xs uppercase tracking-wide text-dim">הזמנות</div>
          <ul className="mt-3 grid gap-2">
            {orders.map((o) => (
              <li
                key={o.id}
                className="flex items-center justify-between rounded border border-white/10 px-4 py-3 text-sm"
              >
                <span>
                  {formatPrice(o.amount_agorot, o.currency)} ·{" "}
                  <span className="text-dim">{new Date(o.created_at).toLocaleDateString("he-IL")}</span>
                </span>
                <span className="font-mono text-xs text-dim">{STATUS_HE[o.status] ?? o.status}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-10">
        <Btn variant="ghost" onClick={() => navigate("/")}>
          ← לעמוד הקורס
        </Btn>
      </div>
    </div>
  )
}
