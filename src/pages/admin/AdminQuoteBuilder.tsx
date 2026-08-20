import { useEffect, useMemo, useRef, useState } from "react"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import {
  supabase,
  PRICE_BOOK_CATEGORIES,
  QUOTE_STATUS_LABELS,
  type ClientRow,
  type PriceBookItemRow,
  type QuoteComplexity,
  type QuoteDiscountType,
  type QuoteItemRow,
  type QuotePresentationMode,
  type QuoteRow,
  type QuoteSettingsRow,
  type QuoteStatus,
  type QuoteUrgency,
} from "@/lib/supabase"
import { AdminGate } from "@/components/AdminGate"
import { AdminNav } from "@/components/AdminNav"
import { calculateQuote, formatCurrency, itemBaseTotal, itemFinalTotal, itemIsMultiplierExempt, PAYMENT_TERM_PRESETS } from "@/lib/quotePricing"
import { cn } from "@/lib/utils"

type EditableItem = Omit<QuoteItemRow, "id" | "quote_id" | "created_at"> & { localId: string; id?: string }

function newLocalId() {
  return crypto.randomUUID()
}

function itemFromPriceBook(pb: PriceBookItemRow, sortOrder: number): EditableItem {
  return {
    localId: newLocalId(),
    price_book_item_id: pb.id,
    name: pb.name,
    description: pb.description,
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

function emptyCustomItem(sortOrder: number): EditableItem {
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

const STATUS_ORDER: QuoteStatus[] = [
  "draft", "ready", "sent", "viewed", "approved", "signed", "deposit_paid", "in_progress", "completed", "declined", "expired",
]

function AdminQuoteBuilderInner() {
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

  const [catalogSearch, setCatalogSearch] = useState("")
  const [catalogCategory, setCatalogCategory] = useState<string>("הכל")
  const [showProfitability, setShowProfitability] = useState(true)
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle")
  const [copied, setCopied] = useState(false)
  const [sending, setSending] = useState(false)
  const [sendResult, setSendResult] = useState<"idle" | "sent" | "error">("idle")
  const [creatingClient, setCreatingClient] = useState(false)
  const [newClientName, setNewClientName] = useState("")
  const [newClientEmail, setNewClientEmail] = useState("")
  const [clientError, setClientError] = useState<string | null>(null)

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

  const filteredCatalog = useMemo(() => {
    return priceBook.filter((pb) => {
      if (catalogCategory !== "הכל" && pb.category !== catalogCategory) return false
      if (catalogSearch.trim() && !pb.name.includes(catalogSearch.trim())) return false
      return true
    })
  }, [priceBook, catalogCategory, catalogSearch])

  const catalogGrouped = useMemo(() => {
    const map = new Map<string, PriceBookItemRow[]>()
    for (const pb of filteredCatalog) {
      if (!map.has(pb.package_slug)) map.set(pb.package_slug, [])
      map.get(pb.package_slug)!.push(pb)
    }
    return [...map.entries()]
  }, [filteredCatalog])

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

  async function createAndAssignClient() {
    const name = newClientName.trim()
    const email = newClientEmail.trim()
    if (!name || !email) {
      setClientError("יש להזין שם ואימייל")
      return
    }
    setClientError(null)
    const { data, error } = await supabase.from("clients").insert({ name, email }).select().single()
    if (error) {
      setClientError(error.message)
      return
    }
    setClients((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)))
    setQuote((q) => ({ ...q, client_id: data.id, client_name: data.name, client_email: data.email }))
    setCreatingClient(false)
    setNewClientName("")
    setNewClientEmail("")
  }

  function copyProposalLink() {
    if (!quote.id) return
    navigator.clipboard.writeText(`${window.location.origin}/portal/quote/${quote.id}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
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

  if (loading || !settings) return <div className="pt-40 pb-40 container font-mono text-xs text-dim uppercase">טוען…</div>

  const belowMinimumItems = items.filter((it) => {
    if (it.included) return false
    const pb = priceBook.find((p) => p.id === it.price_book_item_id)
    if (!pb?.minimum_price) return false
    return it.unit_price < pb.minimum_price
  })

  const marginWarning = calc && calc.marginPercent < settings.min_margin_target && calc.calculatedTotal > 0
  const hourlyWarning = calc && calc.effectiveHourlyRate != null && calc.effectiveHourlyRate < settings.min_hourly_rate_target

  return (
    <div className="min-h-[100dvh] pt-28 pb-28 md:pb-20 px-6 md:px-12">
      <AdminNav />

      <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
        <div className="flex-1 min-w-[240px]">
          <div className="flex items-center gap-3 flex-wrap">
            <input
              value={quote.title ?? ""}
              onChange={(e) => setQuote({ ...quote, title: e.target.value })}
              placeholder="כותרת ההצעה"
              className="font-display font-bold text-xl bg-transparent border-b border-white/20 focus:border-[#D1FE17] outline-none px-1 py-1"
            />
            {quote.quote_number && <span className="font-mono text-xs text-dim">{quote.quote_number}</span>}
          </div>
          <div className="text-dim text-xs mt-2 font-mono">
            {saveState === "saving" && "שומר…"}
            {saveState === "saved" && "נשמר ✓"}
            {saveState === "idle" && quote.id && "נשמר"}
            {!quote.id && "טרם נשמר — בחרו לקוח כדי ליצור את ההצעה"}
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={quote.status ?? "draft"}
            onChange={(e) => setQuote({ ...quote, status: e.target.value as QuoteStatus })}
            className="bg-background border border-white/30 rounded px-3 py-2 text-xs font-mono uppercase"
          >
            {STATUS_ORDER.map((s) => (
              <option key={s} value={s}>{QUOTE_STATUS_LABELS[s]}</option>
            ))}
          </select>
          {quote.id && (
            <button
              onClick={sendQuoteEmail}
              disabled={sending}
              className="font-mono text-[10px] font-bold uppercase tracking-wide bg-[#D1FE17] text-black rounded-[8px] px-4 py-2 hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
            >
              {sending ? "שולח…" : sendResult === "sent" ? "נשלח ✓" : sendResult === "error" ? "שגיאה — נסו שוב" : "שליחה ללקוח במייל"}
            </button>
          )}
          {quote.id && (
            <button
              onClick={copyProposalLink}
              className="font-mono text-xs uppercase tracking-wide border border-white/30 rounded-full px-4 py-2 hover:border-[#D1FE17] transition-colors"
            >
              {copied ? "הועתק ✓" : "העתק קישור להצעה"}
            </button>
          )}
          {quote.id && (
            <button onClick={deleteQuote} className="font-mono text-xs uppercase tracking-wide text-red-400 px-2 py-2">
              מחיקה
            </button>
          )}
        </div>
      </div>

      <div className="mb-6">
        <label className="text-dim text-xs uppercase font-mono mb-2 block">לקוח</label>
        {!quote.client_id && (
          <p className="text-dim text-xs mb-2 max-w-md">
            צריך לשייך לקוח כדי שההצעה תישמר ויופיע כפתור השליחה. אם הלקוח עדיין לא קיים במערכת — אפשר ליצור אותו כאן ישירות.
          </p>
        )}
        {!creatingClient ? (
          <div className="flex items-center gap-3 flex-wrap">
            <select
              value={quote.client_id ?? ""}
              onChange={(e) => {
                const client = clients.find((c) => c.id === e.target.value)
                setQuote({ ...quote, client_id: client?.id ?? null, client_name: client?.name, client_email: client?.email })
              }}
              className="bg-background border border-white/30 rounded px-4 py-3 text-sm w-full max-w-sm"
            >
              <option value="">בחרו לקוח…</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.name} · {c.email}</option>
              ))}
            </select>
            <button
              onClick={() => setCreatingClient(true)}
              className="font-mono text-xs uppercase tracking-wide border border-white/30 rounded-full px-4 py-2 hover:border-[#D1FE17] transition-colors flex-none"
            >
              + לקוח חדש
            </button>
          </div>
        ) : (
          <div className="flex items-end gap-3 flex-wrap border border-white/15 rounded-lg p-4 max-w-xl">
            <div className="flex-1 min-w-[160px]">
              <label className="text-dim text-[10px] uppercase font-mono mb-1 block">שם</label>
              <input
                value={newClientName}
                onChange={(e) => setNewClientName(e.target.value)}
                className="w-full bg-transparent border border-white/30 rounded px-3 py-2 text-sm"
              />
            </div>
            <div className="flex-1 min-w-[160px]">
              <label className="text-dim text-[10px] uppercase font-mono mb-1 block">אימייל</label>
              <input
                type="email"
                value={newClientEmail}
                onChange={(e) => setNewClientEmail(e.target.value)}
                className="w-full bg-transparent border border-white/30 rounded px-3 py-2 text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={createAndAssignClient}
                className="font-mono text-xs uppercase tracking-wide bg-[#D1FE17] text-black rounded-[8px] px-4 py-2.5 hover:scale-105 transition-transform"
              >
                יצירה ושיוך
              </button>
              <button
                onClick={() => { setCreatingClient(false); setClientError(null) }}
                className="font-mono text-xs uppercase tracking-wide text-dim p-2.5"
              >
                ביטול
              </button>
            </div>
            {clientError && <p className="text-red-400 text-xs w-full">{clientError}</p>}
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-[280px_1fr_320px] gap-6 items-start">
        {/* LEFT: catalog */}
        <div className="lg:sticky lg:top-24 border border-white/10 rounded-lg p-4">
          <input
            value={catalogSearch}
            onChange={(e) => setCatalogSearch(e.target.value)}
            placeholder="חיפוש שירות…"
            className="w-full bg-transparent border border-white/20 rounded px-3 py-2 text-sm mb-3"
          />
          <div className="flex flex-wrap gap-1.5 mb-4">
            <button
              onClick={() => setCatalogCategory("הכל")}
              className={cn(
                "font-mono text-[10px] uppercase tracking-wide rounded-full px-2.5 py-1 border transition-colors",
                catalogCategory === "הכל" ? "border-[#D1FE17] bg-[#D1FE17] text-black" : "border-white/15 text-dim"
              )}
            >
              הכל
            </button>
            {PRICE_BOOK_CATEGORIES.map((c) => (
              <button
                key={c.value}
                onClick={() => setCatalogCategory(c.value)}
                className={cn(
                  "font-mono text-[10px] uppercase tracking-wide rounded-full px-2.5 py-1 border transition-colors",
                  catalogCategory === c.value ? "border-[#D1FE17] bg-[#D1FE17] text-black" : "border-white/15 text-dim"
                )}
              >
                {c.label}
              </button>
            ))}
          </div>

          <div className="max-h-[70vh] overflow-y-auto grid gap-4 pr-1">
            {catalogGrouped.map(([slug, groupItems]) => (
              <div key={slug}>
                <div className="text-dim text-[10px] font-mono uppercase mb-1.5">{slug}</div>
                <div className="grid gap-1">
                  {groupItems.map((pb) => (
                    <button
                      key={pb.id}
                      onClick={() => addItem(pb)}
                      className="text-right text-xs px-2.5 py-2 rounded hover:bg-white/5 transition-colors flex items-center justify-between gap-2"
                    >
                      <span>{pb.name}</span>
                      <span className="text-dim font-mono flex-none">
                        {pb.base_price != null ? `₪${pb.base_price.toLocaleString("he-IL")}` : "+"}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={addCustomItem}
            className="mt-4 w-full font-mono text-[10px] font-bold uppercase tracking-wide bg-[#D1FE17] text-black rounded-[8px] px-4 py-2.5 hover:scale-105 transition-transform"
          >
            + פריט מותאם אישית
          </button>
        </div>

        {/* CENTER: cart */}
        <div className="grid gap-2">
          {items.length === 0 && (
            <div className="border border-dashed border-white/15 rounded-lg p-10 text-center text-dim text-sm">
              הוסיפו שירותים מהמחירון בצד שמאל, או פריט מותאם אישית.
            </div>
          )}
          {items.map((it) => {
            const pb = priceBook.find((p) => p.id === it.price_book_item_id)
            const exempt = itemIsMultiplierExempt(it)
            const base = itemBaseTotal(it)
            const final = calc ? itemFinalTotal(it, calc.complexityMultiplier, calc.urgencyMultiplier) : base
            const belowMin = pb?.minimum_price != null && it.unit_price < pb.minimum_price && !it.included
            return (
              <div key={it.localId} className={cn("border rounded-lg p-4", belowMin ? "border-red-500/50" : "border-white/10")}>
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    {it.is_custom ? (
                      <input
                        value={it.name}
                        onChange={(e) => updateItem(it.localId, { name: e.target.value })}
                        placeholder="שם הפריט"
                        className="w-full bg-transparent border-b border-white/20 focus:border-[#D1FE17] outline-none text-sm font-medium py-1"
                      />
                    ) : (
                      <div className="text-sm font-medium">{it.name}</div>
                    )}
                    {it.description && <div className="text-dim text-xs mt-1">{it.description}</div>}
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      {it.recurring && <span className="font-mono text-[10px] uppercase text-dim border border-white/15 rounded-full px-2 py-0.5">חודשי</span>}
                      {it.included && <span className="font-mono text-[10px] uppercase text-[#D1FE17] border border-[#D1FE17]/40 rounded-full px-2 py-0.5">כלול</span>}
                      {!exempt && calc && (calc.complexityMultiplier !== 1 || calc.urgencyMultiplier !== 1) && !it.included && (
                        <span className="font-mono text-[10px] uppercase text-dim border border-white/15 rounded-full px-2 py-0.5">
                          × {(calc.complexityMultiplier * calc.urgencyMultiplier).toFixed(2)}
                        </span>
                      )}
                      {belowMin && <span className="font-mono text-[10px] uppercase text-red-400 border border-red-500/40 rounded-full px-2 py-0.5">מתחת למחיר מינימום</span>}
                    </div>
                  </div>
                  <div className="flex-none flex flex-col items-end gap-1">
                    <button onClick={() => moveItem(it.localId, -1)} className="text-dim hover:text-[#D1FE17] text-xs px-1">↑</button>
                    <button onClick={() => moveItem(it.localId, 1)} className="text-dim hover:text-[#D1FE17] text-xs px-1">↓</button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-3 items-end">
                  <div>
                    <label className="text-dim text-[10px] font-mono uppercase block mb-1">כמות</label>
                    <input
                      type="number"
                      min={0}
                      value={it.quantity}
                      onChange={(e) => updateItem(it.localId, { quantity: Number(e.target.value) })}
                      className="w-full bg-transparent border border-white/20 rounded px-2 py-1.5 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-dim text-[10px] font-mono uppercase block mb-1">מחיר יחידה</label>
                    <input
                      type="number"
                      value={it.unit_price}
                      onChange={(e) => updateItem(it.localId, { unit_price: Number(e.target.value) })}
                      className="w-full bg-transparent border border-white/20 rounded px-2 py-1.5 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-dim text-[10px] font-mono uppercase block mb-1">הנחה</label>
                    <div className="flex gap-1">
                      <select
                        value={it.discount_type ?? ""}
                        onChange={(e) => updateItem(it.localId, { discount_type: (e.target.value || null) as QuoteDiscountType | null })}
                        className="bg-background border border-white/20 rounded px-1 py-1.5 text-xs w-14"
                      >
                        <option value="">—</option>
                        <option value="percent">%</option>
                        <option value="fixed">₪</option>
                      </select>
                      <input
                        type="number"
                        value={it.discount_value ?? ""}
                        onChange={(e) => updateItem(it.localId, { discount_value: e.target.value === "" ? null : Number(e.target.value) })}
                        className="w-full bg-transparent border border-white/20 rounded px-2 py-1.5 text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-dim text-[10px] font-mono uppercase block mb-1">עלות פנימית</label>
                    <input
                      type="number"
                      value={it.cost ?? ""}
                      onChange={(e) => updateItem(it.localId, { cost: e.target.value === "" ? null : Number(e.target.value) })}
                      className="w-full bg-transparent border border-white/20 rounded px-2 py-1.5 text-sm"
                    />
                  </div>
                  <div className="text-left sm:text-right">
                    <label className="text-dim text-[10px] font-mono uppercase block mb-1">סה״כ</label>
                    <div className="font-mono text-sm font-bold">{formatCurrency(final, quote.currency)}</div>
                  </div>
                </div>

                <div className="flex items-center gap-4 mt-3 flex-wrap">
                  <label className="flex items-center gap-1.5 text-xs text-dim">
                    <input type="checkbox" checked={it.included} onChange={(e) => updateItem(it.localId, { included: e.target.checked })} />
                    כלול (ללא חיוב נפרד)
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-dim">
                    <input type="checkbox" checked={it.recurring} onChange={(e) => updateItem(it.localId, { recurring: e.target.checked })} />
                    חוזר (חודשי)
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-dim">
                    <input type="checkbox" checked={it.multiplier_exempt} onChange={(e) => updateItem(it.localId, { multiplier_exempt: e.target.checked })} />
                    לא כולל מכפילים
                  </label>
                  <button onClick={() => duplicateItem(it.localId)} className="font-mono text-[10px] uppercase text-dim hover:text-[#D1FE17] underline underline-offset-4">שכפול</button>
                  <button onClick={() => removeItem(it.localId)} className="font-mono text-[10px] uppercase text-red-400 underline underline-offset-4 mr-auto">הסרה</button>
                </div>
              </div>
            )
          })}
        </div>

        {/* RIGHT: pricing summary */}
        <div className="lg:sticky lg:top-24 grid gap-4">
          <div className="border border-white/10 rounded-lg p-4 grid gap-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-dim text-[10px] font-mono uppercase block mb-1">מורכבות</label>
                <select
                  value={quote.complexity ?? "standard"}
                  onChange={(e) => setQuote({ ...quote, complexity: e.target.value as QuoteComplexity })}
                  className="w-full bg-background border border-white/20 rounded px-2 py-1.5 text-xs"
                >
                  <option value="standard">רגיל ×{settings.complexity_multipliers.standard}</option>
                  <option value="advanced">מתקדם ×{settings.complexity_multipliers.advanced}</option>
                  <option value="complex">מורכב ×{settings.complexity_multipliers.complex}</option>
                </select>
              </div>
              <div>
                <label className="text-dim text-[10px] font-mono uppercase block mb-1">דחיפות</label>
                <select
                  value={quote.urgency ?? "normal"}
                  onChange={(e) => setQuote({ ...quote, urgency: e.target.value as QuoteUrgency })}
                  className="w-full bg-background border border-white/20 rounded px-2 py-1.5 text-xs"
                >
                  <option value="normal">רגיל ×{settings.urgency_multipliers.normal}</option>
                  <option value="priority">בעדיפות ×{settings.urgency_multipliers.priority}</option>
                  <option value="rush">דחוף ×{settings.urgency_multipliers.rush}</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-dim text-[10px] font-mono uppercase block mb-1">הנחה כללית</label>
              <div className="flex gap-2">
                <select
                  value={quote.discount_type ?? ""}
                  onChange={(e) => setQuote({ ...quote, discount_type: (e.target.value || null) as QuoteDiscountType | null })}
                  className="bg-background border border-white/20 rounded px-2 py-1.5 text-xs w-20"
                >
                  <option value="">ללא</option>
                  <option value="percent">%</option>
                  <option value="fixed">₪</option>
                </select>
                <input
                  type="number"
                  value={quote.discount_value ?? ""}
                  onChange={(e) => setQuote({ ...quote, discount_value: e.target.value === "" ? null : Number(e.target.value) })}
                  className="flex-1 bg-transparent border border-white/20 rounded px-2 py-1.5 text-sm"
                />
              </div>
            </div>

            {belowMinimumItems.length > 0 && (
              <div className="border border-red-500/40 bg-red-500/10 rounded p-3 text-xs text-red-300">
                ⚠ {belowMinimumItems.length} פריטים מתחת למחיר המינימום שהוגדר עבורם.
              </div>
            )}

            <div className="border-t border-white/10 pt-3 grid gap-1.5 text-sm">
              <div className="flex justify-between"><span className="text-dim">סכום ביניים</span><span className="font-mono">{formatCurrency(calc?.subtotal ?? 0, quote.currency)}</span></div>
              <div className="flex justify-between font-bold text-base"><span>מחושב</span><span className="font-mono">{formatCurrency(calc?.calculatedTotal ?? 0, quote.currency)}</span></div>
              <div className="flex justify-between text-dim text-xs"><span>מומלץ</span><span className="font-mono">{formatCurrency(recommendedTotal, quote.currency)}</span></div>
              {calc && calc.recurringMonthlyTotal > 0 && (
                <div className="flex justify-between text-dim text-xs"><span>חודשי חוזר</span><span className="font-mono">{formatCurrency(calc.recurringMonthlyTotal, quote.currency)} / חודש</span></div>
              )}
            </div>

            <div>
              <label className="text-dim text-[10px] font-mono uppercase block mb-1">מחיר סופי (ניתן לשינוי ידני)</label>
              <input
                type="number"
                value={quote.final_total ?? ""}
                placeholder={String(Math.round(calc?.calculatedTotal ?? 0))}
                onChange={(e) => setQuote({ ...quote, final_total: e.target.value === "" ? null : Number(e.target.value) })}
                className="w-full bg-transparent border border-white/30 rounded px-3 py-2 text-lg font-bold"
              />
            </div>
          </div>

          <div className="border border-white/10 rounded-lg">
            <button
              onClick={() => setShowProfitability((v) => !v)}
              className="w-full flex items-center justify-between px-4 py-3 font-mono text-xs uppercase tracking-wide text-dim"
            >
              רווחיות פנימית (לא מוצג ללקוח)
              <span>{showProfitability ? "−" : "+"}</span>
            </button>
            {showProfitability && calc && (
              <div className="px-4 pb-4 grid gap-1.5 text-sm">
                <div className="flex justify-between"><span className="text-dim">עלות משוערת</span><span className="font-mono">{formatCurrency(calc.totalCost, quote.currency)}</span></div>
                <div className="flex justify-between"><span className="text-dim">שעות משוערות</span><span className="font-mono">{calc.totalHours}</span></div>
                <div className="flex justify-between"><span className="text-dim">רווח גולמי</span><span className="font-mono">{formatCurrency(calc.grossProfit, quote.currency)}</span></div>
                <div className={cn("flex justify-between", marginWarning && "text-red-400")}>
                  <span className={marginWarning ? "" : "text-dim"}>רווחיות</span><span className="font-mono">{calc.marginPercent.toFixed(1)}%</span>
                </div>
                <div className={cn("flex justify-between", hourlyWarning && "text-red-400")}>
                  <span className={hourlyWarning ? "" : "text-dim"}>תעריף שעתי אפקטיבי</span>
                  <span className="font-mono">{calc.effectiveHourlyRate != null ? formatCurrency(calc.effectiveHourlyRate, quote.currency) : "—"}</span>
                </div>
                {(marginWarning || hourlyWarning) && (
                  <div className="mt-1 text-[11px] text-red-400">⚠ מתחת ליעד שהוגדר בהגדרות</div>
                )}
              </div>
            )}
          </div>

          <div className="border border-white/10 rounded-lg p-4 grid gap-3">
            <div>
              <label className="text-dim text-[10px] font-mono uppercase block mb-1">תנאי תשלום</label>
              <select
                value={quote.payment_terms ?? ""}
                onChange={(e) => setQuote({ ...quote, payment_terms: e.target.value })}
                className="w-full bg-background border border-white/20 rounded px-2 py-1.5 text-xs"
              >
                {PAYMENT_TERM_PRESETS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-dim text-[10px] font-mono uppercase block mb-1">אופן הצגה ללקוח</label>
              <select
                value={quote.presentation_mode ?? "package"}
                onChange={(e) => setQuote({ ...quote, presentation_mode: e.target.value as QuotePresentationMode })}
                className="w-full bg-background border border-white/20 rounded px-2 py-1.5 text-xs"
              >
                <option value="package">חבילה (מקובץ)</option>
                <option value="detailed">מפורט (כל סעיף)</option>
                <option value="simple">פשוט (מחיר אחד)</option>
              </select>
            </div>
            <div>
              <label className="text-dim text-[10px] font-mono uppercase block mb-1">תוקף (ימים)</label>
              <input
                type="number"
                value={quote.validity_days ?? 14}
                onChange={(e) => setQuote({ ...quote, validity_days: Number(e.target.value) })}
                className="w-full bg-transparent border border-white/20 rounded px-2 py-1.5 text-sm"
              />
            </div>
          </div>

          <div className="border border-white/10 rounded-lg p-4">
            <label className="text-dim text-[10px] font-mono uppercase block mb-1">הערות פנימיות (לא מוצג ללקוח לעולם)</label>
            <textarea
              value={quote.internal_notes ?? ""}
              onChange={(e) => setQuote({ ...quote, internal_notes: e.target.value })}
              rows={4}
              placeholder="לדוגמה: הלקוח אמר תקציב בסביבות 15K, אפשר לסגור ב-13.5K"
              className="w-full bg-transparent border border-white/20 rounded px-3 py-2 text-sm"
            />
          </div>

          <div className="border border-white/10 rounded-lg p-4">
            <label className="text-dim text-[10px] font-mono uppercase block mb-1">הערות ללקוח</label>
            <textarea
              value={quote.notes ?? ""}
              onChange={(e) => setQuote({ ...quote, notes: e.target.value })}
              rows={3}
              className="w-full bg-transparent border border-white/20 rounded px-3 py-2 text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export function AdminQuoteBuilder() {
  return (
    <AdminGate>
      <AdminQuoteBuilderInner />
    </AdminGate>
  )
}
