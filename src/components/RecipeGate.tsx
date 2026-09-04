import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { trackEvent } from "@/lib/analytics"
import { ConsentCheckbox } from "@/components/ConsentCheckbox"
import { LegalLink } from "@/components/LegalLink"
import { Reveal } from "@/components/Reveal"

// The guide is a gift, and a gift still has a door.
//
// Someone arriving from the site leaves an email and the guide opens.
// Someone arriving from Raz's Instagram DM already did the work of following,
// so their link carries ?ig= and skips the form entirely.
//
// This is a courtesy gate, not access control. The page is client-rendered, so
// a determined reader can pull the text out of the JS bundle whatever the gate
// does. That is the right trade here: the content is deliberately shallow, and
// real gating would mean serving the guide from an API, which buys friction and
// a moving part for a page whose job is goodwill. What the gate genuinely buys
// is the email of everyone who wanted it enough to type one.

const STORAGE_KEY = "recipe-unlocked"

/** Anyone holding this in the query string came from a DM and walks straight in. */
export const DIRECT_PARAM = "ig"

function alreadyUnlocked(slug: string) {
  try {
    return localStorage.getItem(`${STORAGE_KEY}:${slug}`) === "1"
  } catch {
    // Private browsing and blocked site data both throw here. Failing closed
    // just means the form shows again, which is survivable; failing loudly is not.
    return false
  }
}

function remember(slug: string) {
  try {
    localStorage.setItem(`${STORAGE_KEY}:${slug}`, "1")
  } catch {
    /* nothing to do — they will see the form again next visit */
  }
}

export function useRecipeGate(slug: string) {
  // Starts locked and opens in an effect, so the server-rendered and first
  // client paint agree. Deciding during render would read localStorage during
  // hydration and mismatch.
  const [unlocked, setUnlocked] = useState(false)

  useEffect(() => {
    const fromDm = new URLSearchParams(window.location.search).has(DIRECT_PARAM)
    if (fromDm) {
      remember(slug)
      trackEvent("recipe_unlock", { slug, via: "instagram" })
      setUnlocked(true)
      return
    }
    if (alreadyUnlocked(slug)) setUnlocked(true)
  }, [slug])

  return { unlocked, unlock: () => setUnlocked(true) }
}

export function RecipeGate({
  slug,
  title,
  bullets,
  onUnlock,
}: {
  slug: string
  title: string
  /** What is waiting behind the form. Concrete beats "exclusive content". */
  bullets: string[]
  onUnlock: () => void
}) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [consent, setConsent] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<{ name?: string; email?: string; consent?: string }>({})
  const [failed, setFailed] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const next: typeof errors = {}
    if (!name.trim()) next.name = "שדה חובה"
    if (!email.trim()) next.email = "שדה חובה"
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) next.email = "כתובת אימייל לא תקינה"
    if (!consent) next.consent = "צריך לאשר את מדיניות הפרטיות"
    setErrors(next)
    if (Object.keys(next).length) return

    setSubmitting(true)
    setFailed(false)
    const { error } = await supabase.from("leads").insert({
      name: name.trim(),
      email: email.trim(),
      project_type: "מדריך",
      message: `נרשם כדי לקבל את המדריך: ${title}`,
      metadata: { source: "recipe", slug },
    })
    setSubmitting(false)

    if (error) {
      // The guide is a gift. If the database is having a bad day, a visitor who
      // typed their address should still get what they came for rather than a
      // dead end — the lost row costs Raz far less than the lost goodwill.
      setFailed(true)
      remember(slug)
      onUnlock()
      return
    }

    trackEvent("recipe_unlock", { slug, via: "email" })
    remember(slug)
    onUnlock()
  }

  return (
    <section className="container pb-24">
      <Reveal className="mx-auto max-w-xl surface-raised rounded-2xl p-7 md:p-10">
        <div className="font-mono text-[11px] uppercase tracking-wide text-[#D1FE17] mb-3">
          המדריך המלא
        </div>
        <h2 className="font-display font-bold text-2xl md:text-3xl leading-snug">
          תשאירו אימייל והמדריך נפתח
        </h2>
        <p className="mt-4 text-sm md:text-base leading-relaxed text-foreground/80">
          בלי ניוזלטר יומי ובלי ספאם. אני שולח משהו רק כשיש משהו אמיתי לשלוח.
        </p>

        <ul className="mt-6 flex flex-col gap-2.5">
          {bullets.map((b) => (
            <li key={b} className="flex gap-2.5 text-sm leading-relaxed text-foreground/80">
              <span className="text-[#D1FE17] shrink-0">•</span>
              <span>{b}</span>
            </li>
          ))}
        </ul>

        <form onSubmit={submit} className="mt-8 flex flex-col gap-4" noValidate>
          <div>
            <label htmlFor="recipe-name" className="sr-only">
              שם
            </label>
            <input
              id="recipe-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="שם"
              autoComplete="name"
              className="w-full rounded-lg bg-white/5 border border-white/15 px-4 py-3 text-base outline-none focus:border-[#D1FE17] transition-colors"
            />
            {errors.name && <p className="mt-1.5 text-xs text-red-400">{errors.name}</p>}
          </div>

          <div>
            <label htmlFor="recipe-email" className="sr-only">
              אימייל
            </label>
            <input
              id="recipe-email"
              type="email"
              dir="ltr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              className="w-full rounded-lg bg-white/5 border border-white/15 px-4 py-3 text-base text-right outline-none focus:border-[#D1FE17] transition-colors"
            />
            {errors.email && <p className="mt-1.5 text-xs text-red-400">{errors.email}</p>}
          </div>

          <ConsentCheckbox id="recipe-consent" checked={consent} onChange={setConsent} error={errors.consent}>
            אני מאשר/ת קבלת תוכן ואת <LegalLink to="/privacy">מדיניות הפרטיות</LegalLink>.
          </ConsentCheckbox>

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 font-mono text-sm font-bold uppercase tracking-wide bg-[#D1FE17] text-black rounded-[8px] px-6 py-3.5 hover:scale-[1.02] disabled:opacity-60 disabled:hover:scale-100 transition-transform"
          >
            {submitting ? "רגע…" : "פתחו לי את המדריך ←"}
          </button>

          {failed && (
            <p className="text-xs leading-relaxed text-dim">
              לא הצלחתי לשמור את הפרטים, אבל המדריך נפתח לכם בכל מקרה.
            </p>
          )}
        </form>

        <p className="mt-7 pt-6 border-t border-white/10 text-xs leading-relaxed text-dim">
          עוקבים אחריי באינסטגרם? הלינק שאני שולח בהודעה פותח את המדריך ישר, בלי הטופס.
        </p>
      </Reveal>
    </section>
  )
}
