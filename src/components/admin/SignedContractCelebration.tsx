import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { supabase } from "@/lib/supabase"
import { celebrationFloor, shouldCelebrate } from "@/lib/celebration"
import { Confetti } from "@/components/admin/Confetti"

const SEEN_KEY = "raz_admin_last_celebrated_signature"
const SESSION_KEY = "raz_admin_celebrated_this_session"

type Celebration = { kind: "contract" | "quote"; id: string; who: string; title: string; signedAt: string }

/** localStorage throws outright in some privacy modes, and confetti is never
 * worth breaking the admin over. */
function readStore(storage: Storage, key: string): string | null {
  try {
    return storage.getItem(key)
  } catch {
    return null
  }
}

function writeStore(storage: Storage, key: string, value: string) {
  try {
    storage.setItem(key, value)
  } catch {
    // Worst case the same signature is celebrated twice. Fine.
  }
}

async function findCelebration(): Promise<Celebration | null> {
  const lastSeen = readStore(localStorage, SEEN_KEY)
  const floor = celebrationFloor(lastSeen)

  // Both kinds of signature, because both are a closed deal. A quote carries the
  // whole agreement now, so the document a client actually signs is often the
  // quote · and watching only contract_signatures meant the confetti never fired
  // for the case that had become the common one.
  //
  // Two plain selects rather than one embedded join: the join depends on
  // PostgREST naming a foreign key the way we guessed, and a wrong guess here
  // fails silently forever rather than loudly once.
  const [{ data: contractSignatures }, { data: quoteSignatures }] = await Promise.all([
    supabase
      .from("contract_signatures")
      .select("contract_id, full_name, signed_at")
      .gt("signed_at", floor)
      .order("signed_at", { ascending: false })
      .limit(1),
    supabase
      .from("quote_signatures")
      .select("quote_id, full_name, signed_at")
      .gt("signed_at", floor)
      .order("signed_at", { ascending: false })
      .limit(1),
  ])

  const candidates = [
    contractSignatures?.[0] && {
      kind: "contract" as const,
      id: contractSignatures[0].contract_id as string,
      fullName: contractSignatures[0].full_name as string,
      signedAt: contractSignatures[0].signed_at as string,
    },
    quoteSignatures?.[0] && {
      kind: "quote" as const,
      id: quoteSignatures[0].quote_id as string,
      fullName: quoteSignatures[0].full_name as string,
      signedAt: quoteSignatures[0].signed_at as string,
    },
  ].filter(Boolean) as { kind: "contract" | "quote"; id: string; fullName: string; signedAt: string }[]

  // Whichever came last. Celebrating both would be two cards for one deal, since
  // a quote and its contract are usually signed minutes apart.
  const latest = candidates.sort((a, b) => b.signedAt.localeCompare(a.signedAt))[0]
  if (!latest || !shouldCelebrate(latest.signedAt, lastSeen)) return null

  const { data: document } =
    latest.kind === "contract"
      ? await supabase.from("contracts").select("title, client_name").eq("id", latest.id).maybeSingle()
      : await supabase.from("quotes").select("title, client_name").eq("id", latest.id).maybeSingle()

  return {
    kind: latest.kind,
    id: latest.id,
    who: document?.client_name || latest.fullName,
    title: document?.title || (latest.kind === "contract" ? "החוזה" : "ההצעה"),
    signedAt: latest.signedAt,
  }
}

/** Confetti when Raz opens the admin and someone signed since he last looked ·
 * a contract or a quote, since a quote now carries the whole agreement.
 *
 * The watermark is per browser rather than per row, because he asked for this on
 * arriving: a laptop that has not been opened in a week should still say so,
 * even if he already saw it on his phone. The session flag is what stops it
 * firing again on every navigation, since every admin screen mounts its own gate.
 *
 * The card matters as much as the confetti. Confetti on its own is a puzzle;
 * the name and a link make it the shortest route to the thing worth
 * celebrating. */
export function SignedContractCelebration() {
  const [celebration, setCelebration] = useState<Celebration | null>(null)
  const [confettiRunning, setConfettiRunning] = useState(false)

  useEffect(() => {
    if (readStore(sessionStorage, SESSION_KEY)) return

    let cancelled = false
    findCelebration()
      .then((found) => {
        if (cancelled || !found) return
        writeStore(sessionStorage, SESSION_KEY, "1")
        writeStore(localStorage, SEEN_KEY, found.signedAt)
        setCelebration(found)
        setConfettiRunning(true)
      })
      .catch(() => {
        // A celebration that cannot load is not an error worth showing anyone.
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (!celebration) return null

  return (
    <>
      {confettiRunning && <Confetti onDone={() => setConfettiRunning(false)} />}
      <div
        role="status"
        className="fixed z-[101] left-1/2 -translate-x-1/2 top-24 w-[min(92vw,26rem)] border border-lime bg-background rounded-lg px-5 py-4 shadow-2xl admin-enter"
      >
        <div className="font-mono text-[10px] uppercase tracking-wide text-lime mb-1.5">
          {celebration.kind === "contract" ? "חוזה נחתם" : "הצעה נחתמה"}
        </div>
        <p className="text-sm leading-relaxed">
          {celebration.who} חתם על {celebration.title}.
        </p>
        <div className="flex items-center gap-4 mt-3">
          <Link
            to={celebration.kind === "contract" ? `/admin/contracts/${celebration.id}` : `/admin/quotes/${celebration.id}`}
            onClick={() => setCelebration(null)}
            className="font-mono text-[10px] uppercase tracking-wide underline underline-offset-4 hover:text-lime transition-colors"
          >
            {celebration.kind === "contract" ? "לחוזה ←" : "להצעה ←"}
          </Link>
          <button
            onClick={() => setCelebration(null)}
            className="font-mono text-[10px] uppercase tracking-wide text-dim hover:text-foreground transition-colors"
          >
            סגירה
          </button>
        </div>
      </div>
    </>
  )
}
