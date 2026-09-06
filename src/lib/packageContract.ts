import {
  supabase,
  type ClientRow,
  type ContractRow,
  type ContractTemplateRow,
  type QuoteSettingsRow,
} from "@/lib/supabase"
import { buildPaymentSchedule } from "@/lib/quotePricing"
import { CALL_PACKAGES, type CallPackageKey } from "@/lib/callScript"
import { nextContractNumber, resolveProvider, sectionsFromTemplate } from "@/lib/contracts"

export type EditableContract = Partial<ContractRow>

/** A call that closed on a package should produce the contract for that package,
 * with the same numbers the lead heard on the phone. The monthly deal is a
 * retainer; the pilot is a single production. */
export const TEMPLATE_FOR_PACKAGE: Record<CallPackageKey, string> = {
  monthly: "retainer",
  pilot: "ai_creative",
}

/** The fields the clause renderer reads, with the holes filled. A half-built
 * contract is normal here: it is being written. */
export function contractSubject(contract: EditableContract) {
  return {
    client_name: contract.client_name ?? "",
    client_company: contract.client_company ?? null,
    client_id_number: contract.client_id_number ?? null,
    client_address: contract.client_address ?? null,
    client_email: contract.client_email ?? "",
    client_phone: contract.client_phone ?? null,
    title: contract.title ?? "",
    total: contract.total ?? 0,
    currency: contract.currency ?? "ILS",
    payment_terms: contract.payment_terms ?? null,
    timeline: contract.timeline ?? null,
    start_date: contract.start_date ?? null,
  }
}

export function contractFieldsFromPackage(packageKey: CallPackageKey): EditableContract {
  const pack = CALL_PACKAGES[packageKey]
  return {
    // Recorded rather than inferred later from the title or the total: a pilot
    // has to be identifiable for its 7-day offset window to be counted at all,
    // and both of those are editable free text.
    package_key: packageKey,
    title: pack.name,
    total: pack.price,
    payment_terms: pack.paymentTerms,
    payment_schedule: buildPaymentSchedule(pack.price, pack.paymentTerms),
    deliverables: [...pack.bullets],
    scope:
      packageKey === "monthly"
        ? "חמישה סרטוני פרסום קצרים בחודש, מבוססי AI ובהתאמה למוצר ולשפה של המותג: קריאייטיב, הפקה, עריכה ווריאציות לקמפיין."
        : "סרטון פרסום קצר אחד, מבוסס AI ובהתאמה למוצר ולשפה של המותג. אם תתקבל החלטה להמשיך לחבילה החודשית תוך 7 ימים ממסירת הסרטון, הסכום מתקזז במלואו והסרטון נחשב כראשון מתוך חמישה.",
  }
}

export function clientFields(client: ClientRow): EditableContract {
  return {
    client_id: client.id,
    client_name: client.name,
    client_email: client.email,
    client_company: client.company,
    client_phone: client.phone,
  }
}

/** The whole agreement for a package, clauses rendered, ready to insert.
 *
 * The call screen and the contract editor both need exactly this, and a second
 * copy of it is how the number said on the phone stops matching the number on
 * the contract. */
export function buildPackageContract({
  packageKey,
  client,
  settings,
  templates,
}: {
  packageKey: CallPackageKey
  client: ClientRow
  settings: QuoteSettingsRow | null
  templates: ContractTemplateRow[]
}): EditableContract {
  const template =
    templates.find((t) => t.slug === TEMPLATE_FOR_PACKAGE[packageKey]) ?? templates[0] ?? null

  const base: EditableContract = {
    template_id: template?.id ?? null,
    currency: settings?.currency ?? "ILS",
    vat_included: settings?.vat_included ?? false,
    status: "draft",
    ...clientFields(client),
    ...contractFieldsFromPackage(packageKey),
  }

  if (template) {
    base.sections = sectionsFromTemplate(template, contractSubject(base), resolveProvider(settings))
  }
  return base
}

/** Creates the contract in the database and hands back the saved row.
 *
 * The contract number is claimed the same way the editor claims it, so a
 * contract born on a call is numbered in the same sequence as one built by
 * hand. */
export async function insertContract(
  contract: EditableContract,
  settings: QuoteSettingsRow | null
): Promise<ContractRow | null> {
  const contractNumber = settings ? nextContractNumber(settings) : null

  const { data, error } = await supabase
    .from("contracts")
    .insert({
      client_id: contract.client_id ?? null,
      template_id: contract.template_id ?? null,
      client_name: contract.client_name ?? "",
      client_email: contract.client_email ?? "",
      client_company: contract.client_company || null,
      client_phone: contract.client_phone || null,
      title: contract.title || "הסכם התקשרות",
      scope: contract.scope || null,
      deliverables: contract.deliverables ?? [],
      currency: contract.currency ?? "ILS",
      total: contract.total ?? 0,
      vat_included: !!contract.vat_included,
      payment_terms: contract.payment_terms || null,
      payment_schedule: contract.payment_schedule ?? [],
      sections: contract.sections ?? [],
      provider: resolveProvider(settings),
      package_key: contract.package_key ?? null,
      status: "draft",
      contract_number: contractNumber,
    })
    .select()
    .single()

  if (error || !data) return null

  if (settings && contractNumber) {
    await supabase
      .from("quote_settings")
      .update({ next_contract_number: settings.next_contract_number + 1 })
      .eq("id", true)
  }
  return data as ContractRow
}

/** The same package, as a quote.
 *
 * A call that closed still sometimes wants a priced offer rather than an
 * agreement, and building it by hand from the call screen means retyping the
 * number the lead just heard. One line item, the package's own price. */
export async function insertPackageQuote({
  packageKey,
  client,
  settings,
  callId,
}: {
  packageKey: CallPackageKey
  client: ClientRow
  settings: QuoteSettingsRow | null
  callId?: string | null
}) {
  const pack = CALL_PACKAGES[packageKey]
  const quoteNumber = settings ? `${settings.quote_number_prefix}${settings.next_quote_number}` : null

  const { data, error } = await supabase
    .from("quotes")
    .insert({
      client_id: client.id,
      client_name: client.name,
      client_email: client.email,
      title: pack.name,
      status: "draft",
      currency: settings?.currency ?? "ILS",
      subtotal: pack.price,
      calculated_total: pack.price,
      total: pack.price,
      final_total: pack.price,
      payment_terms: pack.paymentTerms,
      validity_days: settings?.default_validity_days ?? 14,
      presentation_mode: "package",
      line_items: [],
      quote_number: quoteNumber,
    })
    .select()
    .single()

  if (error || !data) return null

  await supabase.from("quote_items").insert({
    quote_id: data.id,
    name: pack.name,
    description: pack.meta,
    quantity: 1,
    unit_price: pack.price,
    recurring: pack.recurring,
    included: false,
    is_custom: false,
    multiplier_exempt: true,
    sort_order: 0,
  })

  if (callId) await supabase.from("call_sessions").update({ quote_id: data.id }).eq("id", callId)
  if (settings && quoteNumber) {
    await supabase
      .from("quote_settings")
      .update({ next_quote_number: settings.next_quote_number + 1 })
      .eq("id", true)
  }

  return data
}

/** The three offers Raz actually sells on the phone: the pilot, the monthly
 * package, and the top-up between them. They live in the price book under one
 * slug, and the quote builder puts them first rather than making him find them
 * among a hundred and thirty other line items. */
export const FEATURED_PACKAGE_SLUG = "short_ads_2026"
