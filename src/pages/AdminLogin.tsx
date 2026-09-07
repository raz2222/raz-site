import { EmailCodeForm } from "@/components/EmailCodeForm"

/** Every failure used to read "this email isn't authorized", which sent the one
 * person who uses this screen looking for a permissions problem when the real
 * answer was that he had asked for six links in forty seconds. The cause is in
 * the error; say it. */
function signInMessage(error: { message?: string; status?: number }): string {
  const message = (error.message ?? "").toLowerCase()
  if (error.status === 429 || message.includes("rate limit") || message.includes("only request this after")) {
    return "יותר מדי בקשות. המייל מוגבל לכמה שליחות בשעה · חכה כדקה ונסה שוב, והקוד האחרון שקיבלת עדיין תקף."
  }
  if (message.includes("signups not allowed") || message.includes("user not found")) {
    return "האימייל הזה לא מורשה לניהול."
  }
  return "השליחה נכשלה. נסה שוב בעוד רגע."
}

export function AdminLogin() {
  return (
    <div className="min-h-[100dvh] flex items-center justify-center px-6">
      <EmailCodeForm
        title="RAZ Admin"
        intro="כניסה עם המייל, בלי סיסמה · נשלח קוד חד פעמי."
        submitLabel="שליחת קוד כניסה"
        redirectTo={window.location.origin + "/admin"}
        shouldCreateUser={false}
        signInError={signInMessage}
      />
    </div>
  )
}
