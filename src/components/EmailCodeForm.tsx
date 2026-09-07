import { useState } from "react"
import { supabase } from "@/lib/supabase"

export type LoginCodeAudience = "admin" | "portal"

/** What `/api/send-login-code` can answer, for the screen to word its own way. */
export type SendCodeFailure = "rate_limited" | "not_authorized" | "not_configured" | "send_failed"

/** Signing in with a code typed into the app, rather than a link tapped in Mail.
 *
 * Raz keeps the admin on his phone's home screen, and it asked him to sign in
 * every single time. A magic link is the reason: tapping it in Mail opens
 * Safari, and on iOS a home-screen app has its own storage container. The
 * session was being created in Safari, where the app cannot see it, so the app
 * had nothing and asked again.
 *
 * A six-digit code has no such problem · it is typed into whatever window is
 * already open, and the session is written there. The link still works and is
 * still in the same email, which is the nicer path on a desktop.
 *
 * The code is not requested from Supabase directly. `signInWithOtp` only mails
 * a code if the Magic Link template prints `{{ .Token }}`, and that template
 * cannot be edited at all without configuring a custom SMTP server first. So
 * `/api/send-login-code` generates the code with the admin API and sends the
 * email through Resend, from the same address as the rest of the site's mail. */
export function EmailCodeForm({
  audience,
  title,
  intro,
  submitLabel,
  sendError,
}: {
  audience: LoginCodeAudience
  title: string
  intro: string
  submitLabel: string
  /** Each screen words a failed send its own way. */
  sendError: (failure: SendCodeFailure) => string
}) {
  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const [stage, setStage] = useState<"email" | "code">("email")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function send(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setBusy(true)
    setError(null)
    try {
      const res = await fetch("/api/send-login-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), audience }),
      })
      if (res.ok) setStage("code")
      else {
        const body = (await res.json().catch(() => null)) as { code?: string } | null
        setError(sendError(failureFor(body?.code, res.status)))
      }
    } catch {
      setError(sendError("send_failed"))
    } finally {
      setBusy(false)
    }
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault()
    const token = code.replace(/\D/g, "")
    if (token.length < 6) {
      setError("הקוד הוא שש ספרות.")
      return
    }
    setBusy(true)
    setError(null)
    // "email" is the catch-all type and the one the docs give; "magiclink" is
    // what the code was actually issued as. Trying both costs one extra request
    // on a wrong code and nothing at all on a right one.
    let { error: verifyError } = await supabase.auth.verifyOtp({ email: email.trim(), token, type: "email" })
    if (verifyError) {
      ;({ error: verifyError } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token,
        type: "magiclink",
      }))
    }
    setBusy(false)
    if (verifyError) {
      const message = (verifyError.message ?? "").toLowerCase()
      setError(
        message.includes("expired")
          ? "הקוד פג תוקף. אפשר לבקש חדש."
          : "הקוד לא נכון. בדוק שוב, או בקש קוד חדש."
      )
      return
    }
    // The session is now in this window's own storage. onAuthStateChange in
    // useAuth takes it from here.
  }

  const field =
    "w-full bg-transparent border border-white/30 rounded px-4 py-3 text-sm focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:border-white/50"
  const button =
    "font-mono text-xs uppercase tracking-wide border border-white/30 rounded-full px-6 min-h-[48px] hover:bg-foreground hover:text-background transition-colors disabled:opacity-50"

  if (stage === "code") {
    return (
      <div className="w-full max-w-sm">
        <div className="font-display font-bold text-2xl mb-2">{title}</div>
        <p className="text-dim text-sm mb-6 leading-relaxed">
          שלחנו מייל ל-<span className="text-foreground">{email}</span>. הזן את הקוד בן שש הספרות שבתוכו · או פשוט לחץ
          על הקישור, אם אתה במחשב.
        </p>
        <form onSubmit={verify} className="flex flex-col gap-4">
          <input
            // A numeric keypad, and iOS offers the code straight from the mail.
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]*"
            maxLength={6}
            required
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            placeholder="000000"
            aria-label="קוד מהמייל"
            className={`${field} font-mono text-center text-lg tracking-[0.4em]`}
          />
          <button type="submit" disabled={busy} className={button}>
            {busy ? "בודק…" : "כניסה"}
          </button>
          {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
          <button
            type="button"
            onClick={() => {
              setStage("email")
              setCode("")
              setError(null)
            }}
            className="font-mono text-[10px] uppercase tracking-wide text-dim hover:text-foreground transition-colors self-start py-2"
          >
            → כתובת אחרת, או קוד חדש
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="w-full max-w-sm">
      <div className="font-display font-bold text-2xl mb-2">{title}</div>
      <p className="text-dim text-sm mb-8 leading-relaxed">{intro}</p>
      <form onSubmit={send} className="flex flex-col gap-4">
        <input
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          aria-label="אימייל"
          className={field}
        />
        <button type="submit" disabled={busy} className={button}>
          {busy ? "שולח…" : submitLabel}
        </button>
        {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
      </form>
    </div>
  )
}

function failureFor(code: string | undefined, status: number): SendCodeFailure {
  if (code === "rate_limited" || status === 429) return "rate_limited"
  if (code === "not_authorized" || status === 403) return "not_authorized"
  if (code === "not_configured" || status === 503) return "not_configured"
  return "send_failed"
}
