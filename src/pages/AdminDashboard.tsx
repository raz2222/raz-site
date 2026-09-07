import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { supabase, type AdminNotificationRow } from "@/lib/supabase"
import { AdminPage, AdminTabs } from "@/components/admin/AdminPage"
import { OverviewTab } from "@/pages/admin/dashboard/OverviewTab"
import { cn } from "@/lib/utils"

// The dashboard answers one question: what needs Raz's attention today. Editing
// lives on the screen that owns the thing being edited — projects on /admin/projects,
// the content queue and the image tool on /admin/tools — so there is exactly one
// place to change any given row, and no second copy of a form to drift out of date.
const TABS = ["סקירה", "התראות"] as const
type Tab = (typeof TABS)[number]

export function AdminDashboard() {
  const [tab, setTab] = useState<Tab>("סקירה")
  const [notifications, setNotifications] = useState<AdminNotificationRow[]>([])
  useEffect(() => {
    supabase
      .from("admin_notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => setNotifications(data ?? []))
  }, [])

  const unreadCount = notifications.filter((n) => !n.read).length

  async function markNotificationRead(id: string) {
    await supabase.from("admin_notifications").update({ read: true }).eq("id", id)
    setNotifications((ns) => ns.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  return (
    <AdminPage title="לוח בקרה" description="מה דורש טיפול היום, ואיפה עומד העסק." width="wide">

      <AdminTabs tabs={TABS} value={tab} onChange={setTab} badge={(t) => (t === "התראות" ? unreadCount : 0)} />

      {tab === "סקירה" && <OverviewTab onShowNotifications={() => setTab("התראות")} />}

      {tab === "התראות" && (
        <div className="max-w-xl">
          <p className="text-dim text-xs mb-6 max-w-md">
            מה שהמערכת זיהתה שדורש פעולה: פנייה חדשה מהאתר, חוזה שנחתם, או לקוח שלא ענה על הצעת מחיר.
          </p>
          {notifications.length === 0 && <p className="text-dim text-sm">אין התראות.</p>}
          <div className="grid gap-3">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={cn("border rounded-lg px-5 py-4 flex items-start justify-between gap-4", n.read ? "border-white/10 opacity-50" : "border-lime/30")}
              >
                <div>
                  <div className="text-sm">{n.message}</div>
                  <div className="text-dim text-[10px] mt-2 font-mono">{new Date(n.created_at).toLocaleString("he-IL")}</div>
                  {n.lead_id && (
                    <Link
                      to="/admin/clients"
                      className="inline-block mt-2 font-mono text-[10px] uppercase tracking-wide text-lime underline underline-offset-4"
                    >
                      פתיחת הלידים ←
                    </Link>
                  )}
                  {n.quote_id && (
                    <Link
                      to={`/admin/quotes/${n.quote_id}`}
                      className="inline-block mt-2 font-mono text-[10px] uppercase tracking-wide underline underline-offset-4 hover:text-lime"
                    >
                      פתיחת ההסכם ←
                    </Link>
                  )}
                  {n.kind?.startsWith("social_") && (
                    <Link
                      to="/admin/social"
                      className="inline-block mt-2 font-mono text-[10px] uppercase tracking-wide text-lime underline underline-offset-4"
                    >
                      פתיחת סושיאל ←
                    </Link>
                  )}
                </div>
                {!n.read && (
                  <button
                    onClick={() => markNotificationRead(n.id)}
                    className="font-mono text-[10px] uppercase tracking-wide border border-white/30 rounded-full px-3 py-1.5 hover:border-lime transition-colors flex-none"
                  >
                    סימון כטופל
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </AdminPage>
  )
}
