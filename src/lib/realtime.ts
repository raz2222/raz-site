import { supabase } from "@/lib/supabase"

/** Subscribe to a table's changes, and survive a browser that will not allow it.
 *
 * Realtime opens a WebSocket, and Safari throws `SecurityError: The operation
 * is insecure` outright when site data is blocked · Lockdown Mode, "Block All
 * Cookies", some content blockers. The throw happens synchronously inside the
 * effect, so it escaped, React unmounted the whole tree, and the admin was a
 * black screen on Raz's phone. A live badge is not worth an app.
 *
 * Everything here is best effort by design: the caller has already fetched the
 * real value once, and losing the socket costs a refresh, not correctness. */
export function subscribeToTable(channelName: string, table: string, onChange: () => void): () => void {
  let channel: ReturnType<typeof supabase.channel> | null = null

  try {
    channel = supabase
      .channel(channelName)
      .on("postgres_changes", { event: "*", schema: "public", table }, onChange)
      .subscribe((_status, error) => {
        // Reported rather than thrown, on the paths that report at all.
        if (error) channel = null
      })
  } catch {
    channel = null
  }

  return () => {
    if (!channel) return
    try {
      supabase.removeChannel(channel)
    } catch {
      // The socket was never usable. There is nothing to take down.
    }
  }
}
