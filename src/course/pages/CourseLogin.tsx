import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import { authErrorHe, sendMagicLink, signInWithPassword } from "../hooks/useCourseAuth"
import { Btn } from "../components/ui"

const inputCls =
  "w-full rounded border border-white/25 bg-transparent px-4 py-3 text-sm focus:border-white/50 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"

export function CourseLogin() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [magicSent, setMagicSent] = useState(false)

  if (user) {
    navigate("/account", { replace: true })
    return null
  }

  async function handlePassword(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    const { error } = await signInWithPassword(email, password)
    setBusy(false)
    if (error) setError(authErrorHe(error.message))
    else navigate("/account")
  }

  async function handleMagic() {
    if (!email.trim()) {
      setError("צריך אימייל בשביל קישור כניסה.")
      return
    }
    setBusy(true)
    setError(null)
    const { error } = await sendMagicLink(email)
    setBusy(false)
    if (error) setError(authErrorHe(error.message))
    else setMagicSent(true)
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-5 py-16">
      <h1 className="font-display text-2xl font-bold">התחברות</h1>
      <p className="mt-2 text-sm text-dim">לצפייה בשיעורים שרכשת ולמעקב אחרי ההתקדמות.</p>

      {magicSent ? (
        <p className="mt-8 text-sm">
          שלחנו קישור כניסה ל־<span className="text-foreground">{email}</span>. פִּתחו אותו מאותו דפדפן.
        </p>
      ) : (
        <>
          <form onSubmit={handlePassword} className="mt-8 flex flex-col gap-3">
            <input
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputCls}
            />
            <input
              type="password"
              required
              autoComplete="current-password"
              placeholder="סיסמה"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputCls}
            />
            <Btn type="submit" size="lg" disabled={busy}>
              {busy ? "רגע…" : "התחברות"}
            </Btn>
          </form>

          <button
            type="button"
            onClick={handleMagic}
            disabled={busy}
            className="mt-3 font-mono text-xs uppercase tracking-wide text-dim underline underline-offset-4 hover:text-foreground disabled:opacity-50"
          >
            שלחו לי קישור כניסה במקום סיסמה
          </button>

          {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

          <p className="mt-8 text-sm text-dim">
            עוד אין חשבון?{" "}
            <Link to="/signup" className="text-foreground underline underline-offset-4">
              הרשמה
            </Link>
          </p>
        </>
      )}
    </div>
  )
}
