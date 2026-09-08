import { supabase, type ContractRow } from "@/lib/supabase"
import { apiErrorMessage } from "@/lib/apiError"

export type SendOutcome = { ok: true } | { ok: false; message: string }

async function accessToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession()
  return data.session?.access_token ?? null
}

/** Emails a contract to its client and marks it sent.
 *
 * Marking it sent is not cosmetic: RLS gates the client's read on the status
 * being sent, viewed or signed, so a contract that stays a draft is invisible
 * to the person who just got the link. */
export async function sendContract(contract: ContractRow, origin: string): Promise<SendOutcome> {
  const token = await accessToken()
  if (!token) return { ok: false, message: "פג תוקף ההתחברות. רענן את הדף והתחבר שוב." }

  const res = await fetch("/api/send-document-email", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      kind: "contract",
      clientEmail: contract.client_email,
      clientName: contract.client_name,
      title: contract.title,
      contractNumber: contract.contract_number,
      link: `${origin}/portal/contract/${contract.id}`,
    }),
  })

  if (!res.ok) return { ok: false, message: await apiErrorMessage(res, "שליחת החוזה במייל נכשלה") }

  await supabase
    .from("contracts")
    .update({ status: "sent", sent_at: new Date().toISOString() })
    .eq("id", contract.id)

  return { ok: true }
}

/** Emails a quote to its client and marks it sent, for the same RLS reason. */
export async function sendQuote(
  quote: { id: string; client_email: string; client_name: string; title: string; total: number; currency: string },
  origin: string
): Promise<SendOutcome> {
  const token = await accessToken()
  if (!token) return { ok: false, message: "פג תוקף ההתחברות. רענן את הדף והתחבר שוב." }

  const res = await fetch("/api/send-document-email", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      kind: "quote",
      clientEmail: quote.client_email,
      clientName: quote.client_name,
      title: quote.title,
      link: `${origin}/portal/quote/${quote.id}`,
      total: quote.total,
      currency: quote.currency,
    }),
  })

  if (!res.ok) return { ok: false, message: await apiErrorMessage(res, "שליחת ההצעה במייל נכשלה") }

  await supabase
    .from("quotes")
    .update({ status: "sent", sent_at: new Date().toISOString() })
    .eq("id", quote.id)

  return { ok: true }
}
