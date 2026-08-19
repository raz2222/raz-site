import { useState } from "react"
import { supabase } from "@/lib/supabase"

export function PortalLogin() {
  const [email, setEmail] = useState("")
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function sendLink() {
    if (!email.trim()) return
    setSending(true)
    setError(null)
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: `${window.location.origin}/portal` },
    })
    setSending(false)
    if (error) setError("משהו השתבש, נסו שוב.")
    else setSent(true)
  }

  if (sent) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center px-6 pt-24">
        <div className="max-w-sm text-center">
          <h1 className="font-display font-medium text-2xl mb-4">בדקו את המייל שלכם</h1>
          <p className="text-dim text-sm leading-relaxed">
            שלחנו קישור התחברות ל־{email}. לחצו עליו כדי להיכנס לפורטל.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[100dvh] flex items-center justify-center px-6 pt-24">
      <div className="max-w-sm w-full">
        <h1 className="font-display font-medium text-2xl mb-2">פורטל לקוחות</h1>
        <p className="text-dim text-sm mb-8">הזינו את כתובת האימייל שלכם ונשלח לכם קישור התחברות מאובטח.</p>
        <div className="flex flex-col gap-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="אימייל"
            className="w-full bg-transparent border border-white/30 rounded px-4 py-3 text-sm focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:border-white/50"
          />
          {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
          <button
            onClick={sendLink}
            disabled={sending || !email.trim()}
            className="font-mono text-[10px] font-bold uppercase tracking-wide bg-[#D1FE17] text-black rounded-full px-6 py-3 hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
          >
            {sending ? "שולח…" : "שליחת קישור התחברות"}
          </button>
        </div>
      </div>
    </div>
  )
}
