import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

/** How many things are waiting, for the badge in the nav.
 *
 * Subscribed rather than polled: a lead that arrives while Raz has the admin
 * open should light up without him refreshing, which is the whole point of
 * making it move. Realtime is best effort · if the socket never connects, the
 * count is still right on the next screen he opens. */
export function useUnreadNotifications(): number {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let alive = true

    async function refresh() {
      const { count: unread } = await supabase
        .from("admin_notifications")
        .select("id", { count: "exact", head: true })
        .eq("read", false)
      if (alive && typeof unread === "number") setCount(unread)
    }

    refresh()

    const channel = supabase
      .channel("admin-notifications-badge")
      .on("postgres_changes", { event: "*", schema: "public", table: "admin_notifications" }, refresh)
      .subscribe()

    return () => {
      alive = false
      supabase.removeChannel(channel)
    }
  }, [])

  return count
}
