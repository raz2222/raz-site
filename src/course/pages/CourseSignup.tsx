import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import { authErrorHe, signUpWithPassword } from "../hooks/useCourseAuth"
import { Btn } from "../components/ui"

const inputCls =
  "w-full rounded border border-white/25 bg-transparent px-4 py-3 text-sm focus:border-white/50 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"

export function CourseSignup() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState<"confirm" | "in" | null>(null)

  if (user && !done) {
    navigate("/account", { replace: true })
    return null
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 6) {
      setError("הסיסמה צריכה להיות לפחות 6 תווים.")
      return
    }
    setBusy(true)
    setError(null)
    const { data, error } = await signUpWithPassword(email, password)
    setBusy(false)
    if (error) {
      setError(authErrorHe(error.message))
      return
    }
    // With email confirmation on, there is no session yet.
    if (data.session) {
      setDone("in")
      navigate("/account")
    } else {
      setDone("confirm")
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-5 py-16">
      <h1 className="font-display text-2xl font-bold">הרשמה</h1>
      <p className="mt-2 text-sm text-dim">
        חשבון פותח את השיעור החינם ושומר את ההתקדמות. רכישת גישה נעשית בנפרד.
      </p>

      {done === "confirm" ? (
        <p className="mt-8 text-sm">
          כמעט שם — שלחנו קישור אישור ל־<span className="text-foreground">{email}</span>. אשרו אותו וחזרו להתחבר.
        </p>
      ) : (
        <>
          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-3">
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
              autoComplete="new-password"
              placeholder="סיסמה (לפחות 6 תווים)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputCls}
            />
            <Btn type="submit" size="lg" disabled={busy}>
              {busy ? "רגע…" : "יצירת חשבון"}
            </Btn>
          </form>
          {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
          <p className="mt-8 text-sm text-dim">
            כבר יש חשבון?{" "}
            <Link to="/login" className="text-foreground underline underline-offset-4">
              התחברות
            </Link>
          </p>
        </>
      )}
    </div>
  )
}
