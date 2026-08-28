import { supabase } from "@/lib/supabase"

/** Thin wrappers over supabase.auth for the course's own login / signup pages.
 *  Session state still comes from the shared useAuth() hook. */

const redirectTo =
  typeof window !== "undefined" ? `${window.location.origin}/account` : undefined

export async function signUpWithPassword(email: string, password: string) {
  return supabase.auth.signUp({
    email: email.trim(),
    password,
    options: { emailRedirectTo: redirectTo },
  })
}

export async function signInWithPassword(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email: email.trim(), password })
}

export async function sendMagicLink(email: string) {
  return supabase.auth.signInWithOtp({
    email: email.trim(),
    options: { emailRedirectTo: redirectTo, shouldCreateUser: true },
  })
}

export async function sendPasswordReset(email: string) {
  return supabase.auth.resetPasswordForEmail(email.trim(), {
    redirectTo:
      typeof window !== "undefined" ? `${window.location.origin}/account` : undefined,
  })
}

export async function courseSignOut() {
  return supabase.auth.signOut()
}

/** Map the common Supabase auth errors to Hebrew copy. */
export function authErrorHe(message: string | undefined | null): string {
  if (!message) return "משהו השתבש. נסו שוב."
  const m = message.toLowerCase()
  if (m.includes("invalid login")) return "אימייל או סיסמה שגויים."
  if (m.includes("already registered")) return "האימייל הזה כבר רשום. אפשר פשוט להתחבר."
  if (m.includes("password should be at least")) return "הסיסמה קצרה מדי (לפחות 6 תווים)."
  if (m.includes("email not confirmed")) return "צריך לאשר את האימייל קודם — בדקו את תיבת הדואר."
  if (m.includes("rate limit") || m.includes("too many")) return "יותר מדי ניסיונות. נסו שוב עוד כמה דקות."
  return message
}
