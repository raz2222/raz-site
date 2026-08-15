import { useState } from "react"
import { supabase } from "@/lib/supabase"

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
    if (error) setError("This email isn't authorized for admin access.")
    else setSent(true)
  }

  return (
    <div className="min-h-[100dvh] flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="font-display font-bold text-2xl mb-2">RAZ Admin</div>
        <p className="text-dim text-sm mb-8">
          Sign in with your email — no password, just a magic link.
        </p>

        {sent ? (
          <p className="text-sm">
            Check <span className="text-foreground">{email}</span> for a sign-in link.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="bg-transparent border border-white/20 rounded px-4 py-3 text-sm focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:border-white/50"
            />
            <button
              type="submit"
              disabled={loading}
              className="font-mono text-xs uppercase tracking-wide border border-white/20 rounded-full px-6 py-3 hover:bg-foreground hover:text-background transition-colors disabled:opacity-50"
            >
              {loading ? "Sending…" : "Send magic link"}
            </button>
            {error && <p className="text-sm text-red-400">{error}</p>}
          </form>
        )}
      </div>
    </div>
  )
}
