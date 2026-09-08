import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { subscribeToTable } from "@/lib/realtime"
import { setAppBadge } from "@/lib/appBadge"

/** How many things are waiting, for the badge in the nav.
 *
 * Subscribed rather than polled: a lead that arrives while Raz has the admin
 * open should light up without him refreshing, which is the whole point of
 * making it move.
 *
 * Realtime is best effort, and that has to be true in code and not only in a
 * comment. It was not: `supabase.channel(...).subscribe()` throws outright in
 * Safari when site data is blocked, the exception escaped this effect, and
 * React unmounted the entire admin · the black screen Raz spent an afternoon
 * on. `subscribeToTable` swallows it now. The count above is already correct
 * either way; what is lost is the update without a refresh.
 *
 * The same number goes onto the app icon. The service worker sets it when a
 * push arrives with the app closed; this is the other half · it corrects the
 * icon the moment Raz opens the admin, and clears it when he has read
 * everything. It also covers the one case a push cannot: nothing is sent
 * between 22:00 and 08:00, so a lead that lands at 03:00 badges the icon when
 * he opens the app in the morning rather than never. */
export function useUnreadNotifications(): number {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let alive = true

    async function refresh() {
      const { count: unread } = await supabase
        .from("admin_notifications")
        .select("id", { count: "exact", head: true })
        .eq("read", false)
      if (alive && typeof unread === "number") {
        setCount(unread)
        setAppBadge(unread)
      }
    }

    refresh()
    const unsubscribe = subscribeToTable("admin-notifications-badge", "admin_notifications", refresh)

    return () => {
      alive = false
      unsubscribe()
    }
  }, [])

  return count
}
