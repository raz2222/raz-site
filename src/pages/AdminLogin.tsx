import { useState } from "react"
import { supabase } from "@/lib/supabase"

/** Every failure used to read "this email isn't authorized", which sent the one
 * person who uses this screen looking for a permissions problem when the real
 * answer was that he had asked for six links in forty seconds. The cause is in
 * the error; say it. */
function signInMessage(error: { message?: string; status?: number }): string {
  const message = (error.message ?? "").toLowerCase()
  if (error.status === 429 || message.includes("rate limit") || message.includes("only request this after")) {
    return "יותר מדי בקשות לקישור. המייל מוגבל לכמה שליחות בשעה · חכה כדקה ונסה שוב, והקישור האחרון שקיבלת עדיין תקף."
  }
  if (message.includes("signups not allowed") || message.includes("user not found")) {
    return "האימייל הזה לא מורשה לניהול."
  }
  return "השליחה נכשלה. נסה שוב בעוד רגע."
}

export function AdminLogin() {
  const [email, setEmail] = useState("")
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin + "/admin",
        shouldCreateUser: false,
      },
    })
    setLoading(false)
    if (error) setError(signInMessage(error))
    else setSent(true)
  }

  return (
    <div className="min-h-[100dvh] flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="font-display font-bold text-2xl mb-2">RAZ Admin</div>
        <p className="text-dim text-sm mb-8">
          כניסה עם המייל, בלי סיסמה · נשלח קישור חד פעמי.
        </p>

        {sent ? (
          <p className="text-sm">
            נשלח קישור כניסה ל-<span className="text-foreground">{email}</span>. הוא תקף לשעה, ואפשר להשתמש בו פעם אחת.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="bg-transparent border border-white/30 rounded px-4 py-3 text-sm focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:border-white/50"
            />
            <button
              type="submit"
              disabled={loading}
              className="font-mono text-xs uppercase tracking-wide border border-white/30 rounded-full px-6 py-3 hover:bg-foreground hover:text-background transition-colors disabled:opacity-50"
            >
              {loading ? "שולח…" : "שליחת קישור כניסה"}
            </button>
            {error && <p className="text-sm text-red-400">{error}</p>}
          </form>
        )}
      </div>
    </div>
  )
}
