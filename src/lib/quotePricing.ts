import type { QuoteComplexity, QuoteDiscountType, QuoteItemRow, QuoteSettingsRow, QuoteUrgency } from "@/lib/supabase"

export type PricingItem = Pick<
  QuoteItemRow,
  "quantity" | "unit_price" | "cost" | "estimated_hours" | "recurring" | "included" | "discount_type" | "discount_value" | "multiplier_exempt"
>

export function applyDiscount(amount: number, type: QuoteDiscountType | null | undefined, value: number | null | undefined): number {
  if (!type || !value) return amount
  if (type === "percent") return amount - amount * (value / 100)
  return amount - value
}

export function itemBaseTotal(item: PricingItem): number {
  if (item.included) return 0
  const raw = item.quantity * item.unit_price
  return Math.max(0, applyDiscount(raw, item.discount_type, item.discount_value))
}

export function itemIsMultiplierExempt(item: PricingItem): boolean {
  return item.recurring || item.multiplier_exempt
}

export function itemFinalTotal(item: PricingItem, complexityMult: number, urgencyMult: number): number {
  const base = itemBaseTotal(item)
  if (itemIsMultiplierExempt(item)) return base
  return base * complexityMult * urgencyMult
}

export function itemCost(item: PricingItem): number {
  if (item.included) return 0
  return item.quantity * (item.cost ?? 0)
}

export function itemHours(item: PricingItem): number {
  if (item.included) return 0
  return item.quantity * (item.estimated_hours ?? 0)
}

export type QuoteCalculation = {
  subtotal: number
  calculatedTotal: number
  totalCost: number
  totalHours: number
  grossProfit: number
  marginPercent: number
  effectiveHourlyRate: number | null
  complexityMultiplier: number
  urgencyMultiplier: number
  recurringMonthlyTotal: number
}

export function calculateQuote(
  items: PricingItem[],
  settings: Pick<QuoteSettingsRow, "complexity_multipliers" | "urgency_multipliers">,
  complexity: QuoteComplexity,
  urgency: QuoteUrgency,
  discountType: QuoteDiscountType | null,
  discountValue: number | null
): QuoteCalculation {
  const complexityMultiplier = settings.complexity_multipliers[complexity] ?? 1
  const urgencyMultiplier = settings.urgency_multipliers[urgency] ?? 1

  const subtotal = items.reduce((sum, i) => sum + itemFinalTotal(i, complexityMultiplier, urgencyMultiplier), 0)
  const calculatedTotal = Math.max(0, applyDiscount(subtotal, discountType, discountValue))

  const totalCost = items.reduce((sum, i) => sum + itemCost(i), 0)
  const totalHours = items.reduce((sum, i) => sum + itemHours(i), 0)
  const grossProfit = calculatedTotal - totalCost
  const marginPercent = calculatedTotal > 0 ? (grossProfit / calculatedTotal) * 100 : 0
  const effectiveHourlyRate = totalHours > 0 ? calculatedTotal / totalHours : null
  const recurringMonthlyTotal = items.filter((i) => i.recurring && !i.included).reduce((sum, i) => sum + i.quantity * i.unit_price, 0)

  return { subtotal, calculatedTotal, totalCost, totalHours, grossProfit, marginPercent, effectiveHourlyRate, complexityMultiplier, urgencyMultiplier, recurringMonthlyTotal }
}

export function formatCurrency(amount: number, currency = "ILS"): string {
  const symbol = currency === "ILS" ? "₪" : currency
  return `${symbol}${Math.round(amount).toLocaleString("he-IL")}`
}

export function buildPaymentSchedule(total: number, terms: string): { label: string; amount: number }[] {
  if (terms === "100% מראש") return [{ label: "תשלום מלא", amount: total }]
  if (terms === "50% / 50%") return [
    { label: "50% מקדמה", amount: Math.round(total * 0.5) },
    { label: "50% לפני השקה", amount: total - Math.round(total * 0.5) },
  ]
  if (terms === "40% / 30% / 30%") {
    const a = Math.round(total * 0.4)
    const b = Math.round(total * 0.3)
    return [
      { label: "40% מקדמה", amount: a },
      { label: "30% באמצע הפרויקט", amount: b },
      { label: "30% לפני השקה", amount: total - a - b },
    ]
  }
  return [{ label: terms, amount: total }]
}

export const PAYMENT_TERM_PRESETS = ["100% מראש", "50% / 50%", "40% / 30% / 30%", "חודשי", "מותאם אישית"] as const
