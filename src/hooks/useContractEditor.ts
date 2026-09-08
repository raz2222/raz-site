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
import { apiErrorMessage } from "@/lib/apiError"
import { adminNotify } from "@/components/admin/AdminToaster"
import {
  TEMPLATE_FOR_PACKAGE,
  contractFieldsFromPackage,
  contractSubject,
  templateSlugForItems,
  type EditableContract,
} from "@/lib/packageContract"

export type { EditableContract }

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
        if (row) {
          // A contract created by the signed-quote trigger has no payment
          // schedule: splitting the terms is a TypeScript rule and belongs in
          // one place, not duplicated into SQL. Fill it in on first open, while
          // the contract is still a draft nobody has seen.
          const needsSchedule =
            row.status === "draft" && (row.payment_schedule ?? []).length === 0 && !!row.payment_terms
          setContract(needsSchedule ? { ...row, payment_schedule: buildPaymentSchedule(row.total ?? 0, row.payment_terms!) } : row)
        }
        setSignature(sig ?? null)
      } else {
        const quoteId = searchParams.get("quoteId")
        const clientId = searchParams.get("clientId")

        // No template until something says which one. The old default was
        // `templates[0]`, the website agreement, so every AI production
        // contract started life full of clauses about domains and hosting.
        const base: EditableContract = {
          template_id: null,
          title: "הסכם התקשרות",
          currency: s?.currency ?? "ILS",
          total: 0,
          vat_included: s?.vat_included ?? false,
          payment_terms: s?.default_payment_terms ?? "",
          payment_schedule: [],
          deliverables: [],
          sections: [],
          status: "draft",
        }
        const client = clientId ? (c ?? []).find((cl) => cl.id === clientId) : undefined
        if (client) Object.assign(base, clientFields(client))

        let slug: string | null = null
        if (quoteId) {
          const fromQuote = (await contractFieldsFromQuote(quoteId, c ?? [])) as EditableContract & {
            template_slug_hint?: string | null
          }
          slug = fromQuote.template_slug_hint ?? null
          delete fromQuote.template_slug_hint
          Object.assign(base, fromQuote)
        }

        const packageKey = searchParams.get("package") as CallPackageKey | null
        if (packageKey && CALL_PACKAGES[packageKey]) {
          Object.assign(base, contractFieldsFromPackage(packageKey))
          slug = TEMPLATE_FOR_PACKAGE[packageKey]
        }

        const chosenTemplate = slug ? (t ?? []).find((tpl) => tpl.slug === slug) : undefined
        if (chosenTemplate) {
          base.template_id = chosenTemplate.id
          // Render the clauses now that the client and the money are known, so
          // the first thing Raz sees is the real agreement, not {{tokens}}.
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
      supabase
        .from("quote_items")
        .select("*, price_book_items(category)")
        .eq("quote_id", quoteId)
        .order("sort_order"),
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
      // The agreement follows what is being sold. Without this the editor fell
      // back to the first template, which is the website one, so an AI video
      // quote produced a contract about domains and hosting.
      template_slug_hint: templateSlugForItems(
        (items ?? []).map((it) => ({
          category: (it as { price_book_items?: { category?: string } | null }).price_book_items?.category ?? null,
          recurring: it.recurring,
        }))
      ),
    } as EditableContract & { template_slug_hint: string | null }
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
      adminNotify("צריך שם ואימייל של הלקוח כדי לשמור את החוזה.")
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
      package_key: contract.package_key ?? null,
      pilot_delivered_at: contract.pilot_delivered_at ?? null,
      updated_at: new Date().toISOString(),
    }

    try {
      if (contract.id) {
        const { error } = await supabase.from("contracts").update(payload).eq("id", contract.id)
        if (error) { adminNotify(error.message); return null }
        return contract.id
      }

      const contractNumber = settings ? nextContractNumber(settings) : null
      const { data, error } = await supabase
        .from("contracts")
        .insert({ ...payload, contract_number: contractNumber })
        .select()
        .single()
      if (error) { adminNotify(error.message); return null }
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
      if (!token) { adminNotify("צריך להתחבר מחדש."); return }

      const res = await fetch("/api/send-document-email", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          kind: "contract",
          clientEmail: contract.client_email,
          clientName: contract.client_name,
          title: contract.title,
          contractNumber: contract.contract_number,
          link: `${window.location.origin}/portal/contract/${contractId}`,
        }),
      })
      if (!res.ok) {
        adminNotify(await apiErrorMessage(res, "שליחת החוזה במייל נכשלה"))
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

  /** Stamping the delivery is the one write a signed contract still accepts, and
   * it goes straight to the row rather than through `save`, which is disabled
   * once a contract is locked. Nothing else about the agreement moves: the
   * clauses the client signed stay exactly as they were. */
  async function setPilotDelivered(date: string | null) {
    if (!contract.id) return
    const { error } = await supabase
      .from("contracts")
      .update({ pilot_delivered_at: date, updated_at: new Date().toISOString() })
      .eq("id", contract.id)
    if (error) { adminNotify(error.message); return }
    setContract((prev) => ({ ...prev, pilot_delivered_at: date }))
  }

  async function remove() {
    if (!contract.id) return
    if (signature) {
      adminNotify("אי אפשר למחוק חוזה חתום.")
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
    setPilotDelivered,
    remove,
  }
}

export type ContractEditor = ReturnType<typeof useContractEditor>
