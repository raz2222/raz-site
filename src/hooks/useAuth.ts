import { useEffect, useState } from "react"
import type { Session } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"

/** The session, and whether we are still finding out.
 *
 * `getSession()` used to be awaited with a bare `.then()`. Two ways that ends
 * with `loading` true forever, and a gate that renders nothing while loading is
 * a black screen · no crash to catch, no error to report, nothing on the page
 * to press. Raz got exactly that.
 *
 * It rejects: a refresh token the server has revoked, or the network dropping
 * mid-refresh. Nothing set `loading` to false on that path.
 *
 * It hangs: supabase-js takes a Web Lock around session reads so two tabs
 * cannot refresh at once, and a lock held by a context that went away is never
 * released. A home-screen app that is opened, backgrounded and reopened is the
 * shape that hits this.
 *
 * So: both paths settle, and a deadline settles it anyway. Being told to sign
 * in again is a bad outcome; a black rectangle is not an outcome at all. */
const SESSION_DEADLINE_MS = 6000

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let settled = false

    function settle(next: Session | null) {
      // A late answer that actually has a session still wins: the deadline may
      // have shown the login screen a moment before the lock let go.
      if (settled && !next) return
      settled = true
      setSession(next)
      setLoading(false)
    }

    supabase.auth
      .getSession()
      .then(({ data }) => settle(data.session))
      .catch(() => settle(null))

    const deadline = setTimeout(() => settle(null), SESSION_DEADLINE_MS)

    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      settled = true
      setSession(next)
      setLoading(false)
    })

    return () => {
      clearTimeout(deadline)
      sub.subscription.unsubscribe()
    }
  }, [])

  return { session, loading, user: session?.user ?? null }
}
