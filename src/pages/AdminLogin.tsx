import { EmailCodeForm, type SendCodeFailure } from "@/components/EmailCodeForm"

/** Every failure used to read "this email isn't authorized", which sent the one
 * person who uses this screen looking for a permissions problem when the real
 * answer was that he had asked for six codes in forty seconds. The cause is in
 * the answer from the server; say it. */
function sendMessage(failure: SendCodeFailure): string {
  switch (failure) {
    case "rate_limited":
      return "יותר מדי בקשות. חכה כדקה ונסה שוב · והקוד האחרון שקיבלת עדיין תקף."
    case "not_authorized":
      return "האימייל הזה לא מורשה לניהול."
    case "not_configured":
      return "שליחת הקודים לא מוגדרת בשרת."
    default:
      return "השליחה נכשלה. נסה שוב בעוד רגע."
  }
}

export function AdminLogin() {
  return (
    <div className="min-h-[100dvh] flex items-center justify-center px-6">
      <EmailCodeForm
        title="RAZ Admin"
        intro="כניסה עם המייל, בלי סיסמה · נשלח קוד חד פעמי."
        submitLabel="שליחת קוד כניסה"
        audience="admin"
        sendError={sendMessage}
      />
    </div>
  )
}
