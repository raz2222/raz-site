import { useEffect, useMemo, useState } from "react"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import {
  supabase,
  type ClientRow,
  type ContractRow,
  type ContractSignatureRow,
  type ContractTemplateRow,
  type QuoteItemRow,
  type QuoteRow,
  type QuoteSettingsRow,
} from "@/lib/supabase"
import { buildPaymentSchedule } from "@/lib/quotePricing"
import { CALL_PACKAGES, type CallPackageKey } from "@/lib/callScript"
import {
  isContractLocked,
  nextContractNumber,
  resolveProvider,
  sectionsFromTemplate,
} from "@/lib/contracts"

export type EditableContract = Partial<ContractRow>

/** The fields the clause renderer reads, with the holes filled. A half-built
 * contract is normal here: it is being written. */
function contractSubject(contract: EditableContract) {
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

/** A call that closed on a package should produce the contract for that package,
 * with the same numbers the lead heard on the phone. The monthly deal is a
 * retainer; the pilot is a single production. */
const TEMPLATE_FOR_PACKAGE: Record<CallPackageKey, string> = {
  monthly: "retainer",
  pilot: "ai_creative",
}

function contractFieldsFromPackage(packageKey: CallPackageKey): EditableContract {
  const pack = CALL_PACKAGES[packageKey]
  return {
    title: pack.name,
    total: pack.price,
    payment_terms: pack.paymentTerms,
    payment_schedule: buildPaymentSchedule(pack.price, pack.paymentTerms),
    deliverables: [...pack.bullets],
    scope: packageKey === "monthly"
      ? "חמישה סרטוני פרסום קצרים בחודש, מבוססי AI ובהתאמה למוצר ולשפה של המותג: קריאייטיב, הפקה, עריכה ווריאציות לקמפיין."
      : "סרטון פרסום קצר אחד, מבוסס AI ובהתאמה למוצר ולשפה של המותג. אם תתקבל החלטה להמשיך לחבילה החודשית תוך 7 ימים, הסכום מתקזז במלואו והסרטון נחשב כראשון מתוך חמישה.",
  }
}

/** A contract's deliverables read best as the quote's own line items: the client
 * already agreed to that list, and retyping it is how the two drift apart. */
function deliverablesFromQuoteItems(items: QuoteItemRow[]): string[] {
  return items.map((it) => {
    const quantity = it.quantity > 1 ? ` × ${it.quantity}` : ""
    const included = it.included ? " (כלול)" : ""
    return `${it.name}${quantity}${included}`
  })
}

export function useContractEditor() {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const isNew = id === "new"

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [sending, setSending] = useState(false)
  const [sendResult, setSendResult] = useState<"idle" | "sent" | "error">("idle")

  const [settings, setSettings] = useState<QuoteSettingsRow | null>(null)
  const [templates, setTemplates] = useState<ContractTemplateRow[]>([])
  const [clients, setClients] = useState<ClientRow[]>([])
  const [quotes, setQuotes] = useState<QuoteRow[]>([])
  const [signature, setSignature] = useState<ContractSignatureRow | null>(null)

  const [contract, setContract] = useState<EditableContract>({})
  const callId = searchParams.get("callId")

  useEffect(() => {
    async function load() {
      const [{ data: s }, { data: t }, { data: c }, { data: q }] = await Promise.all([
        supabase.from("quote_settings").select("*").maybeSingle(),
        supabase.from("contract_templates").select("*").eq("active", true).order("sort_order"),
        supabase.from("clients").select("*").order("name"),
        supabase.from("quotes").select("*").order("created_at", { ascending: false }),
      ])
      setSettings(s ?? null)
      setTemplates(t ?? [])
      setClients(c ?? [])
      setQuotes(q ?? [])

      if (!isNew && id) {
        const [{ data: row }, { data: sig }] = await Promise.all([
          supabase.from("contracts").select("*").eq("id", id).maybeSingle(),
          supabase.from("contract_signatures").select("*").eq("contract_id", id).maybeSingle(),
        ])
        if (row) setContract(row)
        setSignature(sig ?? null)
      } else {
        const quoteId = searchParams.get("quoteId")
        const clientId = searchParams.get("clientId")
        const template = (t ?? [])[0]
        const base: EditableContract = {
          template_id: template?.id ?? null,
          title: "הסכם התקשרות",
          currency: s?.currency ?? "ILS",
          total: 0,
          vat_included: s?.vat_included ?? false,
          payment_terms: s?.default_payment_terms ?? "",
          payment_schedule: [],
          deliverables: [],
          sections: template?.sections ?? [],
          status: "draft",
        }
        const client = clientId ? (c ?? []).find((cl) => cl.id === clientId) : undefined
        if (client) Object.assign(base, clientFields(client))
        if (quoteId) Object.assign(base, await contractFieldsFromQuote(quoteId, c ?? []))

        const packageKey = searchParams.get("package") as CallPackageKey | null
        if (packageKey && CALL_PACKAGES[packageKey]) {
          Object.assign(base, contractFieldsFromPackage(packageKey))
          const packTemplate = (t ?? []).find((tpl) => tpl.slug === TEMPLATE_FOR_PACKAGE[packageKey])
          if (packTemplate) base.template_id = packTemplate.id
        }
        // Render the clauses now that the client and the money are known, so the
        // first thing Raz sees is the real agreement rather than {{tokens}}.
        const chosenTemplate = (t ?? []).find((tpl) => tpl.id === base.template_id) ?? template
        if (chosenTemplate) {
          base.sections = sectionsFromTemplate(chosenTemplate, contractSubject(base), resolveProvider(s))
        }
        setContract(base)
      }
      setLoading(false)
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  // A contract that was already sent shows the details it was sent with; a draft
  // tracks the settings, so fixing a typo in the business number fixes it there too.
  const provider = useMemo(
    () => resolveProvider((contract.status ?? "draft") === "draft" ? settings : contract.provider),
    [settings, contract.provider, contract.status]
  )
  const locked = isContractLocked((contract.status ?? "draft") as ContractRow["status"])

  function clientFields(client: ClientRow): EditableContract {
    return {
      client_id: client.id,
      client_name: client.name,
      client_email: client.email,
      client_company: client.company,
      client_phone: client.phone,
    }
  }

  async function contractFieldsFromQuote(quoteId: string, knownClients: ClientRow[]): Promise<EditableContract> {
    const [{ data: quote }, { data: items }] = await Promise.all([
      supabase.from("quotes").select("*").eq("id", quoteId).maybeSingle(),
      supabase.from("quote_items").select("*").eq("quote_id", quoteId).order("sort_order"),
    ])
    if (!quote) return {}
    const total = quote.final_total ?? (quote.calculated_total > 0 ? quote.calculated_total : quote.total)
    const client = knownClients.find((c) => c.id === quote.client_id)
    return {
      quote_id: quote.id,
      client_id: quote.client_id,
      client_name: quote.client_name,
      client_email: quote.client_email,
      client_company: client?.company ?? null,
      client_phone: client?.phone ?? null,
      title: quote.title,
      currency: quote.currency,
      total,
      payment_terms: quote.payment_terms,
      payment_schedule: quote.payment_terms ? buildPaymentSchedule(total, quote.payment_terms) : [],
      deliverables: deliverablesFromQuoteItems(items ?? []),
      notes: quote.notes,
    }
  }

  /** Pulling a quote into an already-open contract, from the editor's picker. */
  async function applyQuote(quoteId: string) {
    const fields = await contractFieldsFromQuote(quoteId, clients)
    setContract((prev) => ({ ...prev, ...fields }))
  }

  function applyClient(clientId: string) {
    const client = clients.find((c) => c.id === clientId)
    if (client) setContract((prev) => ({ ...prev, ...clientFields(client) }))
  }

  /** Re-renders the clause text from the chosen template against the current
   * client and money fields. Overwrites hand edits, so it is a button and not
   * an effect. */
  function applyTemplate(templateId: string) {
    const template = templates.find((t) => t.id === templateId)
    if (!template) return
    setContract((prev) => ({
      ...prev,
      template_id: template.id,
      sections: sectionsFromTemplate(template, contractSubject(prev), provider),
    }))
  }

  function rebuildSchedule() {
    setContract((prev) => ({
      ...prev,
      payment_schedule: prev.payment_terms ? buildPaymentSchedule(prev.total ?? 0, prev.payment_terms) : [],
    }))
  }

  async function save(): Promise<string | null> {
    if (locked) return null
    if (!contract.client_name || !contract.client_email) {
      alert("צריך שם ואימייל של הלקוח כדי לשמור את החוזה.")
      return null
    }
    setSaving(true)
    const payload = {
      quote_id: contract.quote_id ?? null,
      client_id: contract.client_id ?? null,
      template_id: contract.template_id ?? null,
      client_name: contract.client_name ?? "",
      client_email: contract.client_email ?? "",
      client_company: contract.client_company || null,
      client_id_number: contract.client_id_number || null,
      client_address: contract.client_address || null,
      client_phone: contract.client_phone || null,
      title: contract.title || "הסכם התקשרות",
      scope: contract.scope || null,
      deliverables: contract.deliverables ?? [],
      timeline: contract.timeline || null,
      start_date: contract.start_date || null,
      currency: contract.currency ?? "ILS",
      total: contract.total ?? 0,
      vat_included: !!contract.vat_included,
      payment_terms: contract.payment_terms || null,
      payment_schedule: contract.payment_schedule ?? [],
      sections: contract.sections ?? [],
      provider: resolveProvider(settings),
      notes: contract.notes || null,
      internal_notes: contract.internal_notes || null,
      status: contract.status ?? "draft",
      updated_at: new Date().toISOString(),
    }

    try {
      if (contract.id) {
        const { error } = await supabase.from("contracts").update(payload).eq("id", contract.id)
        if (error) { alert(error.message); return null }
        return contract.id
      }

      const contractNumber = settings ? nextContractNumber(settings) : null
      const { data, error } = await supabase
        .from("contracts")
        .insert({ ...payload, contract_number: contractNumber })
        .select()
        .single()
      if (error) { alert(error.message); return null }
      if (settings) {
        await supabase.from("quote_settings").update({ next_contract_number: settings.next_contract_number + 1 }).eq("id", true)
        setSettings({ ...settings, next_contract_number: settings.next_contract_number + 1 })
      }
      if (callId) {
        await supabase.from("call_sessions").update({ contract_id: data.id }).eq("id", callId)
      }
      setContract(data)
      navigate(`/admin/contracts/${data.id}`, { replace: true })
      return data.id as string
    } finally {
      setSaving(false)
    }
  }

  async function sendToClient() {
    const contractId = await save()
    if (!contractId) return
    setSending(true)
    setSendResult("idle")
    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData.session?.access_token
      if (!token) { alert("צריך להתחבר מחדש."); return }

      const res = await fetch("/api/send-contract-email", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          clientEmail: contract.client_email,
          clientName: contract.client_name,
          title: contract.title,
          contractNumber: contract.contract_number,
          link: `${window.location.origin}/portal/contract/${contractId}`,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        alert(data?.error ?? "שגיאה בשליחת המייל")
        setSendResult("error")
        return
      }
      const sentAt = new Date().toISOString()
      await supabase.from("contracts").update({ status: "sent", sent_at: sentAt }).eq("id", contractId)
      setContract((prev) => ({ ...prev, status: "sent", sent_at: sentAt }))
      setSendResult("sent")
      setTimeout(() => setSendResult("idle"), 2500)
    } finally {
      setSending(false)
    }
  }

  async function markAsSent() {
    const contractId = await save()
    if (!contractId) return
    const sentAt = new Date().toISOString()
    await supabase.from("contracts").update({ status: "sent", sent_at: sentAt }).eq("id", contractId)
    setContract((prev) => ({ ...prev, status: "sent", sent_at: sentAt }))
  }

  async function remove() {
    if (!contract.id) return
    if (signature) {
      alert("אי אפשר למחוק חוזה חתום.")
      return
    }
    if (!confirm("למחוק את החוזה לצמיתות? הפעולה לא הפיכה.")) return
    await supabase.from("contracts").delete().eq("id", contract.id)
    navigate("/admin/contracts")
  }

  return {
    isNew,
    loading,
    saving,
    sending,
    sendResult,
    settings,
    provider,
    templates,
    clients,
    quotes,
    contract,
    setContract,
    signature,
    locked,
    applyQuote,
    applyClient,
    applyTemplate,
    rebuildSchedule,
    save,
    sendToClient,
    markAsSent,
    remove,
  }
}

export type ContractEditor = ReturnType<typeof useContractEditor>
