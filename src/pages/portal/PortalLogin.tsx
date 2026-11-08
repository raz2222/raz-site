import { EmailCodeForm, type SendCodeFailure } from "@/components/EmailCodeForm"
import { supabase } from "@/lib/supabase"

function sendMessage(failure: SendCodeFailure): string {
  if (failure === "rate_limited") {
    return "שלחנו כבר כמה קודים לכתובת הזאת. חכו דקה ונסו שוב · הקוד האחרון עדיין תקף."
  }
  return "משהו השתבש, נסו שוב."
}

/** `document` is set on a quote or contract link. Those are matched to the
 * address they were sent to and nothing else, so the screen says which address
 * to type: a client with two Gmail accounts signed in with the other one,
 * reached a page that could not show him anything, and read it as a broken
 * site (2026-11-08). */
export function PortalLogin({ document }: { document?: "quote" | "contract" } = {}) {
  const intro =
    document === "quote"
      ? "הזינו את כתובת האימייל שאליה נשלחה הצעת המחיר, ונשלח לכם קוד התחברות."
      : document === "contract"
        ? "הזינו את כתובת האימייל שאליה נשלח החוזה, ונשלח לכם קוד התחברות."
        : "הזינו את כתובת האימייל שלכם ונשלח לכם קוד התחברות."
  return (
    <div className="min-h-[100dvh] flex items-center justify-center px-6 pt-24">
      <EmailCodeForm
        title="פורטל לקוחות"
        intro={intro}
        submitLabel="שליחת קוד התחברות"
        audience="portal"
        sendError={sendMessage}
      />
    </div>
  )
}

/** Never `null` while the session is being read: a blank page is the one
 * screen a client cannot do anything about. */
export function PortalLoading() {
  return (
    <div className="min-h-[100dvh] flex items-center justify-center">
      <p className="font-mono text-xs uppercase tracking-wide text-dim">טוען…</p>
    </div>
  )
}

/** What a signed-in client sees when RLS returns no row for the link.
 *
 * Almost always it is the wrong account: the document was sent to one address
 * and they signed in with another. It deliberately does not say which address
 * the document was sent to · anyone holding the link would learn it · but it
 * shows the one they are signed in with and lets them switch in one tap.
 * Signing out re-renders the page as the login form, still on this link. */
export function DocumentNotFound({ document, email }: { document: "quote" | "contract"; email: string | undefined }) {
  const copy =
    document === "quote"
      ? { title: "ההצעה לא מופיעה בחשבון הזה", body: "את ההצעה אפשר לפתוח רק עם כתובת המייל שאליה נשלחה." }
      : { title: "החוזה לא מופיע בחשבון הזה", body: "את החוזה אפשר לפתוח רק עם כתובת המייל שאליה נשלח." }
  return (
    <div className="min-h-[100dvh] flex items-center justify-center px-6 pt-24">
      <div className="max-w-md w-full grid gap-5">
        <div className="font-display font-bold text-2xl">{copy.title}</div>
        <p className="text-dim text-sm leading-relaxed">
          {copy.body} כרגע אתם מחוברים כ־<span className="text-white" dir="ltr">{email}</span>. אם קיבלתם את המייל לכתובת
          אחרת, התחברו איתה.
        </p>
        <button
          onClick={() => supabase.auth.signOut()}
          className="w-fit font-mono text-[10px] font-bold uppercase tracking-wide bg-[#D1FE17] text-black rounded-full px-5 py-2.5 hover:scale-105 transition-transform"
        >
          התחברות עם כתובת אחרת
        </button>
        <p className="text-dim text-xs leading-relaxed">
          עדיין לא מצליחים? השיבו למייל שבו קיבלתם את הקישור ונסדר את זה.
        </p>
      </div>
    </div>
  )
}
