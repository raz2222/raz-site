import { sectionsFromTemplate, type ProviderDetails } from "@/lib/contracts"
import type { ClientRow, ContractSection, ContractTemplateRow, QuoteRow, QuoteStatus } from "@/lib/supabase"

/** A quote carries the agreement the client signs, so the clause text has to
 * behave the way a contract's does · except a quote is written and sent in one
 * screen, with no separate "render the clauses" button to press.
 *
 * So the rule is by status rather than by button: while it is a draft the
 * clauses are re-rendered from the template on every change, and the moment it
 * is sent · which is also the moment RLS lets the client read it · they freeze
 * onto the row. A price edit can never leave a stale number inside a paragraph,
 * and editing a template later never rewrites something already signed. */
export function isAgreementFrozen(status: QuoteStatus | null | undefined): boolean {
  return !!status && status !== "draft" && status !== "ready"
}

/** The fields the clause renderer reads, taken from a quote rather than a
 * contract. A quote has no timeline or start date: those are the contract's,
 * and a template that asks for them renders them empty rather than wrong. */
export function quoteAgreementSubject(
  quote: Partial<QuoteRow>,
  client: ClientRow | undefined,
  total: number
) {
  return {
    client_name: quote.client_name ?? client?.name ?? "",
    client_company: client?.company ?? null,
    client_id_number: null,
    client_address: null,
    client_email: quote.client_email ?? client?.email ?? "",
    client_phone: client?.phone ?? null,
    title: quote.title ?? "",
    total,
    currency: quote.currency ?? "ILS",
    payment_terms: quote.payment_terms ?? null,
    timeline: null,
    start_date: null,
  }
}

export type QuoteAgreementValue = { template_id: string | null; sections: ContractSection[] }

/** What a quote's agreement should be right now: the stored snapshot once it has
 * gone out, and a fresh render of the chosen template while it is still being
 * written. */
export function resolveQuoteAgreement({
  quote,
  template,
  client,
  total,
  provider,
}: {
  quote: Partial<QuoteRow>
  template: ContractTemplateRow | null | undefined
  client: ClientRow | undefined
  total: number
  provider: ProviderDetails
}): QuoteAgreementValue {
  if (isAgreementFrozen(quote.status)) {
    return { template_id: quote.template_id ?? null, sections: quote.sections ?? [] }
  }
  if (!template) return { template_id: null, sections: [] }
  return {
    template_id: template.id,
    sections: sectionsFromTemplate(template, quoteAgreementSubject(quote, client, total), provider),
  }
}
