import { useEffect, useMemo, useRef, useState } from "react"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import {
  supabase,
  type ClientRow,
  type PriceBookItemRow,
  type QuoteItemRow,
  type QuoteRow,
  type QuoteSettingsRow,
  type QuoteStatus,
} from "@/lib/supabase"
import { calculateQuote } from "@/lib/quotePricing"

export type EditableItem = Omit<QuoteItemRow, "id" | "quote_id" | "created_at"> & { localId: string; id?: string }

export function newLocalId() {
  return crypto.randomUUID()
}

export function itemFromPriceBook(pb: PriceBookItemRow, sortOrder: number): EditableItem {
  return {
    localId: newLocalId(),
    price_book_item_id: pb.id,
    name: pb.name,
    description: pb.client_description || pb.description,
    quantity: 1,
    unit_price: pb.base_price ?? 0,
    cost: pb.cost,
    estimated_hours: pb.estimated_hours,
    recurring: pb.recurring,
    included: pb.included_by_default,
    is_custom: false,
    discount_type: null,
    discount_value: null,
    multiplier_exempt: false,
    sort_order: sortOrder,
  }
}

export function emptyCustomItem(sortOrder: number): EditableItem {
  return {
    localId: newLocalId(),
    price_book_item_id: null,
    name: "",
    description: "",
    quantity: 1,
    unit_price: 0,
    cost: null,
    estimated_hours: null,
    recurring: false,
    included: false,
    is_custom: true,
    discount_type: null,
    discount_value: null,
    multiplier_exempt: false,
    sort_order: sortOrder,
  }
}

export const STATUS_ORDER: QuoteStatus[] = [
  "draft", "ready", "sent", "viewed", "approved", "signed", "deposit_paid", "in_progress", "completed", "declined", "expired",
]

export function useQuoteBuilder() {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const isNew = id === "new"

  const [loading, setLoading] = useState(true)
  const [clients, setClients] = useState<ClientRow[]>([])
  const [priceBook, setPriceBook] = useState<PriceBookItemRow[]>([])
  const [settings, setSettings] = useState<QuoteSettingsRow | null>(null)

  const [quote, setQuote] = useState<Partial<QuoteRow>>({})
  const [items, setItems] = useState<EditableItem[]>([])

  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle")
  const [sending, setSending] = useState(false)
  const [sendResult, setSendResult] = useState<"idle" | "sent" | "error">("idle")

  const skipAutosave = useRef(true)

  useEffect(() => {
    async function load() {
      const [{ data: c }, { data: pb }, { data: s }] = await Promise.all([
        supabase.from("clients").select("*").order("name"),
        supabase.from("price_book_items").select("*").eq("active", true).order("sort_order"),
        supabase.from("quote_settings").select("*").maybeSingle(),
      ])
      setClients(c ?? [])
      setPriceBook(pb ?? [])
      setSettings(s ?? null)

      if (!isNew && id) {
        const [{ data: q }, { data: qi }] = await Promise.all([
          supabase.from("quotes").select("*").eq("id", id).maybeSingle(),
          supabase.from("quote_items").select("*").eq("quote_id", id).order("sort_order"),
        ])
        if (q) setQuote(q)
        if (qi) setItems(qi.map((it) => ({ ...it, localId: it.id })))
      } else {
        const clientId = searchParams.get("clientId")
        const client = clientId ? (c ?? []).find((cl) => cl.id === clientId) : undefined
        setQuote({
          client_id: client?.id ?? null,
          client_name: client?.name ?? "",
          client_email: client?.email ?? "",
          title: "",
          currency: s?.currency ?? "ILS",
          status: "draft",
          complexity: "standard",
          urgency: "normal",
          discount_type: null,
          discount_value: null,
          presentation_mode: "package",
          payment_terms: s?.default_payment_terms ?? "",
          validity_days: s?.default_validity_days ?? 14,
          notes: "",
          internal_notes: "",
        })
      }
      setLoading(false)
      setTimeout(() => { skipAutosave.current = false }, 300)
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const calc = useMemo(() => {
    if (!settings) return null
    return calculateQuote(items, settings, quote.complexity ?? "standard", quote.urgency ?? "normal", quote.discount_type ?? null, quote.discount_value ?? null)
  }, [items, settings, quote.complexity, quote.urgency, quote.discount_type, quote.discount_value])

  const recommendedTotal = useMemo(() => {
    return items.reduce((sum, it) => {
      if (it.included) return sum
      const pb = priceBook.find((p) => p.id === it.price_book_item_id)
      const unit = pb?.recommended_price ?? pb?.base_price ?? it.unit_price
      return sum + unit * it.quantity
    }, 0)
  }, [items, priceBook])

  async function persist() {
    if (!quote.client_id || !calc) return
    setSaveState("saving")

    let quoteId = quote.id
    let quoteNumber = quote.quote_number

    const client = clients.find((c) => c.id === quote.client_id)

    const payload = {
      client_id: quote.client_id,
      client_name: client?.name ?? quote.client_name ?? "",
      client_email: client?.email ?? quote.client_email ?? "",
      title: quote.title || "הצעת מחיר",
      status: quote.status ?? "draft",
      complexity: quote.complexity ?? "standard",
      urgency: quote.urgency ?? "normal",
      discount_type: quote.discount_type ?? null,
      discount_value: quote.discount_value ?? null,
      presentation_mode: quote.presentation_mode ?? "package",
      payment_terms: quote.payment_terms || null,
      notes: quote.notes || null,
      internal_notes: quote.internal_notes || null,
      validity_days: quote.validity_days ?? 14,
      currency: quote.currency ?? "ILS",
      subtotal: calc.subtotal,
      calculated_total: calc.calculatedTotal,
      recommended_total: recommendedTotal,
      final_total: quote.final_total ?? null,
      total: quote.final_total ?? calc.calculatedTotal,
      estimated_hours: calc.totalHours,
      internal_cost: calc.totalCost,
      line_items: [],
    }

    const isCreating = !quoteId

    if (isCreating) {
      quoteNumber = settings ? `${settings.quote_number_prefix}${settings.next_quote_number}` : undefined
      const { data, error } = await supabase.from("quotes").insert({ ...payload, quote_number: quoteNumber }).select().single()
      if (error) { setSaveState("idle"); alert(error.message); return }
      quoteId = data.id
      if (settings) {
        await supabase.from("quote_settings").update({ next_quote_number: settings.next_quote_number + 1 }).eq("id", true)
        setSettings({ ...settings, next_quote_number: settings.next_quote_number + 1 })
      }
    } else {
      const { error } = await supabase.from("quotes").update(payload).eq("id", quoteId)
      if (error) { setSaveState("idle"); alert(error.message); return }
    }

    await supabase.from("quote_items").delete().eq("quote_id", quoteId)
    if (items.length > 0) {
      const rows = items.map((it, i) => ({
        quote_id: quoteId,
        price_book_item_id: it.price_book_item_id,
        name: it.name,
        description: it.description,
        quantity: it.quantity,
        unit_price: it.unit_price,
        cost: it.cost,
        estimated_hours: it.estimated_hours,
        recurring: it.recurring,
        included: it.included,
        is_custom: it.is_custom,
        discount_type: it.discount_type,
        discount_value: it.discount_value,
        multiplier_exempt: it.multiplier_exempt,
        sort_order: i,
      }))
      await supabase.from("quote_items").insert(rows)
    }

    if (isCreating) {
      // Only navigate (which reloads this quote's data from the id route param) once the quote
      // AND its items are fully persisted — doing this earlier raced the reload against the
      // still-in-flight items insert and could wipe the cart back to empty in the UI.
      skipAutosave.current = true
      setQuote((q) => ({ ...q, id: quoteId, quote_number: quoteNumber }))
      navigate(`/admin/quotes/${quoteId}`, { replace: true })
    }

    setSaveState("saved")
    setTimeout(() => setSaveState("idle"), 1500)
  }

  // Autosave: debounce after any change, once a client is selected. Skipped during initial load.
  useEffect(() => {
    if (skipAutosave.current || loading) return
    if (!quote.client_id) return
    const t = setTimeout(() => { persist() }, 1200)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quote, items])

  function addItem(pb: PriceBookItemRow) {
    setItems((prev) => [...prev, itemFromPriceBook(pb, prev.length)])
  }

  function addCustomItem() {
    setItems((prev) => [...prev, emptyCustomItem(prev.length)])
  }

  function updateItem(localId: string, patch: Partial<EditableItem>) {
    setItems((prev) => prev.map((it) => (it.localId === localId ? { ...it, ...patch } : it)))
  }

  function removeItem(localId: string) {
    setItems((prev) => prev.filter((it) => it.localId !== localId))
  }

  function duplicateItem(localId: string) {
    setItems((prev) => {
      const found = prev.find((it) => it.localId === localId)
      if (!found) return prev
      return [...prev, { ...found, localId: newLocalId(), id: undefined, sort_order: prev.length }]
    })
  }

  function moveItem(localId: string, dir: -1 | 1) {
    setItems((prev) => {
      const idx = prev.findIndex((it) => it.localId === localId)
      const swapWith = idx + dir
      if (idx < 0 || swapWith < 0 || swapWith >= prev.length) return prev
      const next = [...prev]
      ;[next[idx], next[swapWith]] = [next[swapWith], next[idx]]
      return next
    })
  }

  async function deleteQuote() {
    if (!quote.id) return
    if (!confirm("למחוק את ההצעה לצמיתות? הפעולה לא הפיכה.")) return
    await supabase.from("quote_items").delete().eq("quote_id", quote.id)
    await supabase.from("quotes").delete().eq("id", quote.id)
    navigate("/admin/clients")
  }

  async function createAndAssignClient(name: string, email: string): Promise<string | null> {
    const trimmedName = name.trim()
    const trimmedEmail = email.trim()
    if (!trimmedName || !trimmedEmail) return "יש להזין שם ואימייל"
    const { data, error } = await supabase.from("clients").insert({ name: trimmedName, email: trimmedEmail }).select().single()
    if (error) return error.message
    setClients((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)))
    setQuote((q) => ({ ...q, client_id: data.id, client_name: data.name, client_email: data.email }))
    return null
  }

  async function sendQuoteEmail() {
    if (!quote.id) return
    const client = clients.find((c) => c.id === quote.client_id)
    const email = client?.email ?? quote.client_email
    if (!email) return
    setSending(true)
    setSendResult("idle")
    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData.session?.access_token
      if (!token) {
        alert("צריך להתחבר מחדש.")
        return
      }
      const res = await fetch("/api/send-quote-email", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          clientEmail: email,
          clientName: client?.name ?? quote.client_name,
          title: quote.title,
          link: `${window.location.origin}/portal/quote/${quote.id}`,
          total: quote.final_total ?? calc?.calculatedTotal,
          currency: quote.currency,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        alert(data?.error ?? "שגיאה בשליחת המייל")
        setSendResult("error")
        return
      }
      const sentAt = new Date().toISOString()
      await supabase.from("quotes").update({ status: "sent", sent_at: sentAt }).eq("id", quote.id)
      setQuote((q) => ({ ...q, status: "sent", sent_at: sentAt }))
      setSendResult("sent")
      setTimeout(() => setSendResult("idle"), 2500)
    } finally {
      setSending(false)
    }
  }

  async function markAsSent() {
    if (!quote.id) return
    const sentAt = new Date().toISOString()
    const { error } = await supabase.from("quotes").update({ status: "sent", sent_at: sentAt }).eq("id", quote.id)
    if (error) { alert(error.message); return }
    setQuote((q) => ({ ...q, status: "sent", sent_at: sentAt }))
  }

  const belowMinimumItems = items.filter((it) => {
    if (it.included) return false
    const pb = priceBook.find((p) => p.id === it.price_book_item_id)
    if (!pb?.minimum_price) return false
    return it.unit_price < pb.minimum_price
  })

  const marginWarning = !!(calc && settings && calc.marginPercent < settings.min_margin_target && calc.calculatedTotal > 0)
  const hourlyWarning = !!(calc && settings && calc.effectiveHourlyRate != null && calc.effectiveHourlyRate < settings.min_hourly_rate_target)

  return {
    isNew,
    loading,
    clients,
    priceBook,
    settings,
    quote,
    setQuote,
    items,
    setItems,
    saveState,
    calc,
    recommendedTotal,
    persist,
    addItem,
    addCustomItem,
    updateItem,
    removeItem,
    duplicateItem,
    moveItem,
    deleteQuote,
    createAndAssignClient,
    sendQuoteEmail,
    markAsSent,
    sending,
    sendResult,
    belowMinimumItems,
    marginWarning,
    hourlyWarning,
  }
}

export type QuoteBuilder = ReturnType<typeof useQuoteBuilder>
