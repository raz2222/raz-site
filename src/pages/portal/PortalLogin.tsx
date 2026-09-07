import { EmailCodeForm, type SendCodeFailure } from "@/components/EmailCodeForm"

function sendMessage(failure: SendCodeFailure): string {
  if (failure === "rate_limited") {
    return "שלחנו כבר כמה קודים לכתובת הזאת. חכו דקה ונסו שוב · הקוד האחרון עדיין תקף."
  }
  return "משהו השתבש, נסו שוב."
}

export function PortalLogin() {
  return (
    <div className="min-h-[100dvh] flex items-center justify-center px-6 pt-24">
      <EmailCodeForm
        title="פורטל לקוחות"
        intro="הזינו את כתובת האימייל שלכם ונשלח לכם קוד התחברות."
        submitLabel="שליחת קוד התחברות"
        audience="portal"
        sendError={sendMessage}
      />
    </div>
  )
}
