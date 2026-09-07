import { EmailCodeForm } from "@/components/EmailCodeForm"

export function PortalLogin() {
  return (
    <div className="min-h-[100dvh] flex items-center justify-center px-6 pt-24">
      <EmailCodeForm
        title="פורטל לקוחות"
        intro="הזינו את כתובת האימייל שלכם ונשלח לכם קוד התחברות."
        submitLabel="שליחת קוד התחברות"
        redirectTo={`${window.location.origin}/portal`}
        shouldCreateUser
        signInError={() => "משהו השתבש, נסו שוב."}
      />
    </div>
  )
}
