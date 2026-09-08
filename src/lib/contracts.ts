import type {
  ContractProvider,
  ContractRow,
  ContractSection,
  ContractTemplateRow,
  PaymentDetailsRow,
  PaymentScheduleEntry,
  QuoteSettingsRow,
} from "@/lib/supabase"
import { formatCurrency } from "@/lib/quotePricing"

/** The values a template's {{placeholders}} resolve against. Everything is a
 * string by the time it reaches here, so a clause never renders "undefined". */
export type ContractVariables = Record<string, string>

export type ContractParty = Pick<
  ContractRow,
  "client_name" | "client_company" | "client_id_number" | "client_address" | "client_email" | "client_phone"
>

export type ProviderDetails = ContractProvider

export const PROVIDER_DEFAULTS: ProviderDetails = {
  provider_name: "רז אברמוב",
  provider_business_name: "MADE BY RAZ",
  provider_id_number: "",
  provider_address: "",
  provider_email: "hello@madebyraz.co.il",
  provider_phone: "054-812-0747",
}

/** Fills the gaps in a partial provider block, wherever it came from: the
 * settings row, or the snapshot frozen onto a contract. */
export function resolveProvider(source: Partial<ContractProvider> | null | undefined): ProviderDetails {
  return {
    provider_name: source?.provider_name || PROVIDER_DEFAULTS.provider_name,
    provider_business_name: source?.provider_business_name || PROVIDER_DEFAULTS.provider_business_name,
    provider_id_number: source?.provider_id_number ?? PROVIDER_DEFAULTS.provider_id_number,
    provider_address: source?.provider_address ?? PROVIDER_DEFAULTS.provider_address,
    provider_email: source?.provider_email || PROVIDER_DEFAULTS.provider_email,
    provider_phone: source?.provider_phone || PROVIDER_DEFAULTS.provider_phone,
  }
}

/** The full list of placeholders a template may use, shown in the admin editor
 * so Raz never has to guess a variable name. */
export const CONTRACT_VARIABLE_HELP: { token: string; label: string }[] = [
  { token: "{{client_display}}", label: "הלקוח, כולל חברה וח.פ אם קיימים" },
  { token: "{{client_name}}", label: "שם הלקוח" },
  { token: "{{client_company}}", label: "שם החברה" },
  { token: "{{client_id_number}}", label: "ח.פ / ת.ז של הלקוח" },
  { token: "{{client_email}}", label: "אימייל הלקוח" },
  { token: "{{title}}", label: "שם ההתקשרות" },
  { token: "{{total}}", label: "התמורה הכוללת" },
  { token: "{{payment_terms}}", label: "תנאי התשלום" },
  { token: "{{timeline}}", label: "לוח הזמנים" },
  { token: "{{start_date}}", label: "תאריך התחלה" },
  { token: "{{provider_name}}", label: "השם שלך" },
  { token: "{{provider_business_name}}", label: "שם העסק שלך" },
  { token: "{{provider_id_number}}", label: "ח.פ / ע.מ שלך" },
]

export function formatContractDate(value: string | null | undefined): string {
  if (!value) return ""
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString("he-IL")
}

/** "שם הלקוח, חברה בע\"מ, ח.פ 12345" — whichever parts exist. */
export function clientDisplayName(party: Pick<ContractParty, "client_name" | "client_company" | "client_id_number">): string {
  const parts = [party.client_name?.trim()]
  const company = party.client_company?.trim()
  const idNumber = party.client_id_number?.trim()
  if (company) parts.push(company)
  if (idNumber) parts.push(`ח.פ / ת.ז ${idNumber}`)
  return parts.filter(Boolean).join(", ")
}

export function contractVariables(
  contract: Pick<ContractRow, "title" | "total" | "currency" | "payment_terms" | "timeline" | "start_date"> & ContractParty,
  provider: ProviderDetails
): ContractVariables {
  return {
    client_display: clientDisplayName(contract),
    client_name: contract.client_name ?? "",
    client_company: contract.client_company ?? "",
    client_id_number: contract.client_id_number ?? "",
    client_address: contract.client_address ?? "",
    client_email: contract.client_email ?? "",
    client_phone: contract.client_phone ?? "",
    title: contract.title ?? "",
    total: formatCurrency(contract.total ?? 0, contract.currency ?? "ILS"),
    payment_terms: contract.payment_terms ?? "",
    timeline: contract.timeline ?? "",
    start_date: formatContractDate(contract.start_date),
    provider_name: provider.provider_name,
    provider_business_name: provider.provider_business_name,
    provider_id_number: provider.provider_id_number,
    provider_address: provider.provider_address,
    provider_email: provider.provider_email,
    provider_phone: provider.provider_phone,
  }
}

/** Unknown tokens are left as they are rather than blanked: a visible
 * {{typo}} in the preview is a bug Raz can see, an empty gap is one he cannot. */
export function fillVariables(text: string, variables: ContractVariables): string {
  return text.replace(/\{\{\s*([a-z_]+)\s*\}\}/gi, (whole, key: string) => {
    const value = variables[key.toLowerCase()]
    return value === undefined ? whole : value
  })
}

export function renderSections(sections: ContractSection[], variables: ContractVariables): ContractSection[] {
  return sections.map((s) => ({
    heading: fillVariables(s.heading, variables),
    body: fillVariables(s.body, variables),
  }))
}

/** Applied when a contract is created from a template, and again on demand from
 * the editor. A contract that has been sent keeps the copy it was sent with. */
export function sectionsFromTemplate(
  template: Pick<ContractTemplateRow, "sections">,
  contract: Parameters<typeof contractVariables>[0],
  provider: ProviderDetails
): ContractSection[] {
  return renderSections(template.sections, contractVariables(contract, provider))
}

export function nextContractNumber(settings: Pick<QuoteSettingsRow, "contract_number_prefix" | "next_contract_number">): string {
  const year = new Date().getFullYear()
  return `${settings.contract_number_prefix}${year}-${String(settings.next_contract_number).padStart(3, "0")}`
}

export function scheduleTotal(schedule: PaymentScheduleEntry[]): number {
  return schedule.reduce((sum, entry) => sum + (Number(entry.amount) || 0), 0)
}

/** A signed contract is closed: nothing about it may be edited after the fact,
 * or the signature stops meaning anything. */
export function isContractLocked(status: ContractRow["status"]): boolean {
  return status === "signed"
}

/** What the client owes right now, the moment after signing. That is the first
 * instalment when the contract is paid in stages, and the whole sum when it is
 * not. Naming it matters as much as the number: "50% מקדמה" is the line the
 * client already read in the agreement. */
export function amountDueNow(
  document: { total: number | null; payment_schedule: PaymentScheduleEntry[] | null }
): { label: string; amount: number } {
  const first = (document.payment_schedule ?? []).find((entry) => (Number(entry.amount) || 0) > 0)
  if (first) return { label: first.label || "תשלום ראשון", amount: Number(first.amount) || 0 }
  return { label: "תשלום מלא", amount: document.total ?? 0 }
}

/** Whether there is any way at all for a client to pay.
 *
 * Mirrors exactly what PaymentInstructions checks before it gives up and says
 * "the details will be sent separately", so the warning in the admin and the
 * client's screen can never disagree about whether this is filled in. */
export function hasAnyPaymentMethod(payment: Partial<PaymentDetailsRow> | null | undefined): boolean {
  if (!payment) return false
  const filled = (value: string | null | undefined) => !!(value ?? "").trim()
  return (
    filled(payment.bank_name) ||
    filled(payment.bank_branch) ||
    filled(payment.bank_account_number) ||
    filled(payment.bank_account_holder) ||
    filled(payment.bit_link) ||
    filled(payment.bit_phone) ||
    filled(payment.paybox_link)
  )
}

/** Israeli phone numbers are typed a dozen ways and dialled one way. wa.me and
 * Bit both want the international form with no punctuation. */
export function internationalPhone(phone: string | null | undefined): string {
  const digits = (phone ?? "").replace(/\D/g, "")
  if (!digits) return ""
  if (digits.startsWith("972")) return digits
  if (digits.startsWith("0")) return `972${digits.slice(1)}`
  return digits
}
