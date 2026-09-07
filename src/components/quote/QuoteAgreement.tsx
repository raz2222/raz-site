import { clientDisplayName, resolveProvider, type ProviderDetails } from "@/lib/contracts"
import type { ContractProvider, ContractSection } from "@/lib/supabase"

type Party = {
  client_name: string | null
  client_company?: string | null
  client_email?: string | null
  client_phone?: string | null
}

function PartyBlock({ role, lines }: { role: string; lines: (string | null | undefined)[] }) {
  const visible = lines.map((l) => l?.trim()).filter(Boolean) as string[]
  if (visible.length === 0) return null
  return (
    <div className="border border-white/10 rounded-lg p-4 print:border-black/20">
      <div className="font-mono text-[10px] uppercase tracking-wide text-dim mb-2 print:text-black/60">{role}</div>
      {visible.map((line, i) => (
        <div key={i} className={i === 0 ? "font-medium text-sm" : "text-dim text-xs mt-1 print:text-black/70"}>
          {line}
        </div>
      ))}
    </div>
  )
}

/** The agreement text that travels with a quote.
 *
 * A quote used to be the price and nothing else, and the client signed it under
 * a link to the site's general terms · which are not an agreement about this
 * job. The clauses come from the same `contract_templates` rows the contract
 * editor renders, so there is one wording for both documents, edited in one
 * place. Whoever signs sees the whole thing on the page they sign. */
export function QuoteAgreement({
  sections,
  provider,
  party,
}: {
  sections: ContractSection[]
  provider: Partial<ContractProvider> | ProviderDetails | null | undefined
  party: Party
}) {
  if (!sections || sections.length === 0) return null
  const p = resolveProvider(provider)

  return (
    <section className="mt-12 pt-10 border-t border-white/10">
      <h2 className="font-display font-medium text-xl mb-1">הסכם ההתקשרות</h2>
      <p className="text-dim text-xs mb-6">
        התנאים שחלים על העבודה המפורטת למעלה. החתימה בתחתית העמוד חלה על ההצעה ועל ההסכם הזה כאחד.
      </p>

      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <PartyBlock
          role="נותן השירות"
          lines={[
            p.provider_business_name,
            p.provider_name,
            p.provider_id_number ? `ח.פ / ע.מ ${p.provider_id_number}` : null,
            p.provider_address,
            p.provider_email,
            p.provider_phone,
          ]}
        />
        <PartyBlock
          role="הלקוח"
          lines={[
            clientDisplayName({
              client_name: party.client_name ?? "",
              client_company: party.client_company ?? null,
              client_id_number: null,
            }),
            party.client_email,
            party.client_phone,
          ]}
        />
      </div>

      <div className="grid gap-6">
        {sections.map((section, i) => (
          <div key={i}>
            <h3 className="font-display font-medium text-base mb-2">{section.heading}</h3>
            <p className="text-sm leading-relaxed whitespace-pre-wrap text-dim print:text-black/80">{section.body}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
