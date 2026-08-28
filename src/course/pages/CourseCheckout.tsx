import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/hooks/useAuth"
import { useCourseAccess, useCourseConfig } from "../hooks/useCourse"
import { formatPrice } from "../lib/config"
import { BtnLink, Btn, CheckIcon, Eyebrow } from "../components/ui"

const inputCls =
  "w-full rounded border border-white/25 bg-transparent px-4 py-3 text-sm focus:border-white/50 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"

const INCLUDED = [
  "14 סרטוני הדגמת־מסך — ~3 שעות",
  "6 קבצי הורדה (צ׳יטשיטים ותבניות)",
  "פרויקט גמר מודרך + צ׳קליסט הגשה",
  "גישה לכל החיים + עדכונים שוטפים",
]

export function CourseCheckout() {
  const { user } = useAuth()
  const { config, loading: configLoading } = useCourseConfig()
  const { hasAccess } = useCourseAccess()
  const price = formatPrice(config.price_agorot, config.currency)

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  useEffect(() => {
    if (user?.email) setEmail(user.email)
  }, [user?.email])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("צריך כתובת אימייל תקינה כדי לשלוח את קישור התשלום.")
      return
    }
    setBusy(true)
    setError(null)

    const { error: insertErr } = await supabase.from("course_orders").insert({
      user_id: user?.id ?? null,
      email: email.trim(),
      amount_agorot: config.price_agorot,
      currency: config.currency,
      status: "pending",
      provider: "manual",
      note: name.trim() ? `שם: ${name.trim()}` : null,
    })

    if (insertErr) {
      setBusy(false)
      setError("משהו השתבש בשמירת הבקשה. נסו שוב או כתבו ל־hello@madebyraz.co.il.")
      return
    }

    // Same owner notification path the contact form uses.
    fetch("/api/notify-lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim() || email.trim(),
        email: email.trim(),
        projectType: "רכישת קורס — פריים ראשון",
        budget: price,
        message: `בקשה לקישור תשלום לקורס «פריים ראשון». סכום: ${price}.`,
      }),
    }).catch(() => {})

    setBusy(false)
    setSent(true)
  }

  return (
    <div className="mx-auto max-w-5xl px-5 py-14 md:px-8 md:py-20">
      <Eyebrow>רכישת גישה</Eyebrow>
      <h1 className="font-display text-2xl font-bold md:text-3xl">פריים ראשון — קורס Higgsfield</h1>

      {hasAccess && (
        <p className="mt-4 rounded border border-[#D1FE17]/40 bg-[#D1FE17]/[0.06] px-4 py-3 text-sm">
          כבר יש לך גישה מלאה.{" "}
          <Link to="/account" className="underline underline-offset-4">
            לאזור שלי →
          </Link>
        </p>
      )}

      <div className="mt-8 grid items-start gap-10 md:grid-cols-[1fr_0.9fr] md:gap-14">
        <div>
          <div className="font-display text-4xl font-black leading-none">
            {price} <span className="font-mono text-base font-normal text-dim">חד־פעמי</span>
          </div>
          <p className="mt-2 text-sm text-dim">תשלום אחד, גישה לכל החיים. שיעור 1 פתוח לפני שקונים.</p>
          <ul className="mt-6 grid gap-3">
            {INCLUDED.map((t) => (
              <li key={t} className="flex gap-2.5 text-sm text-foreground/90">
                <CheckIcon />
                {t}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded border border-white/20 bg-white/[0.03] p-6">
          {configLoading ? (
            <p className="font-mono text-xs uppercase tracking-wide text-dim">טוען…</p>
          ) : config.checkout_mode === "disabled" ? (
            <>
              <div className="font-display text-lg font-bold">פתיחה לרכישה בקרוב</div>
              <p className="mt-2 text-sm text-dim">
                בינתיים אפשר לצפות בשיעור הראשון בחינם.
              </p>
              <BtnLink to="/lesson/01-hanof" variant="ghost" className="mt-4 w-full">
                לשיעור החינם
              </BtnLink>
            </>
          ) : sent ? (
            <>
              <div className="flex items-center gap-2 font-display text-lg font-bold text-[#D1FE17]">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                  <path d="M2 9.5 7 14 16 4" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                קיבלנו את הבקשה
              </div>
              <p className="mt-2 text-sm text-dim">
                נשלח אליך קישור תשלום ל־<span className="text-foreground">{email}</span> בהקדם. ברגע
                שהתשלום מאושר הגישה נפתחת אוטומטית.
              </p>
              {!user && (
                <p className="mt-4 text-sm text-dim">
                  כדי שהגישה תחכה לך מוכנה —{" "}
                  <Link to="/signup" className="text-foreground underline underline-offset-4">
                    צרו חשבון עכשיו
                  </Link>{" "}
                  עם אותו אימייל.
                </p>
              )}
            </>
          ) : (
            <>
              <div className="font-display text-lg font-bold">השאירו פרטים ונשלח קישור תשלום</div>
              <p className="mt-1.5 text-xs text-dim">
                הסליקה האוטומטית בהרצה אחרונה. בינתיים — קישור תשלום ידני, גישה נפתחת עם האישור.
              </p>
              <form onSubmit={submit} className="mt-5 flex flex-col gap-3">
                <input
                  type="text"
                  placeholder="שם (לא חובה)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={inputCls}
                />
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputCls}
                />
                <Btn type="submit" size="lg" disabled={busy} className="w-full">
                  {busy ? "שולח…" : "שלחו לי קישור תשלום"}
                </Btn>
              </form>
              {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
              <p className="mt-3 text-center font-mono text-[0.7rem] text-dim">
                אין חיוב עכשיו · לא נשמרים פרטי תשלום באתר
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
