import { createClient } from "@supabase/supabase-js"

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(url, anonKey)

export type ProjectDetailItem = {
  title: string
  description: string
}

export type ProjectGalleryItem = {
  type: "image" | "video"
  url: string
  caption: string
}

export type ProjectRow = {
  id: string
  slug: string
  number: string
  title: string
  category: string
  disciplines: string[]
  year: string
  video: string | null
  thumb_class: string
  concept: boolean
  featured: boolean
  sort_order: number
  overview: string | null
  duration: string | null
  client_name: string | null
  live_url: string | null
  challenges: ProjectDetailItem[]
  solutions: ProjectDetailItem[]
  results: string[]
  testimonial_quote: string | null
  testimonial_author: string | null
  testimonial_role: string | null
  project_type: "website" | "ai"
  categories: string[]
  tech_stack: string[]
  ai_tools: string[]
  gallery: ProjectGalleryItem[]
}

export type QuoteLineItem = {
  label: string
  description?: string
  price: number
}

export type QuoteStatus =
  | "draft"
  | "ready"
  | "sent"
  | "viewed"
  | "approved"
  | "signed"
  | "deposit_paid"
  | "in_progress"
  | "completed"
  | "declined"
  | "expired"

export type QuoteComplexity = "standard" | "advanced" | "complex"
export type QuoteUrgency = "normal" | "priority" | "rush"
export type QuoteDiscountType = "percent" | "fixed"
export type QuotePresentationMode = "detailed" | "package" | "simple"

export type PaymentScheduleEntry = { label: string; amount: number }

export type QuoteRow = {
  id: string
  lead_id: string | null
  client_id: string | null
  quote_number: string | null
  client_name: string
  client_email: string
  title: string
  line_items: QuoteLineItem[]
  currency: string
  total: number
  status: QuoteStatus
  notes: string | null
  internal_notes: string | null
  created_at: string
  sent_at: string | null
  drive_folder_url: string | null
  complexity: QuoteComplexity
  urgency: QuoteUrgency
  discount_type: QuoteDiscountType | null
  discount_value: number | null
  subtotal: number
  calculated_total: number
  recommended_total: number | null
  final_total: number | null
  presentation_mode: QuotePresentationMode
  payment_terms: string | null
  payment_schedule: PaymentScheduleEntry[]
  validity_days: number
  estimated_hours: number | null
  internal_cost: number | null
  reminder_count: number
  last_reminded_at: string | null
}

export type ClientRow = {
  id: string
  name: string
  email: string
  phone: string | null
  company: string | null
  lead_id: string | null
  notes: string | null
  created_at: string
}

export type PriceBookCategory = "websites" | "ai_content" | "creative" | "care" | "seo" | "automations"
export type PriceBookBillingType = "fixed" | "starting_from" | "per_unit" | "per_hour" | "monthly" | "custom"

export type PriceBookItemRow = {
  id: string
  category: PriceBookCategory
  package_slug: string
  name: string
  description: string | null
  internal_description: string | null
  client_description: string | null
  base_price: number | null
  minimum_price: number | null
  recommended_price: number | null
  cost: number | null
  estimated_hours: number | null
  billing_type: PriceBookBillingType
  unit: string | null
  quantity_enabled: boolean
  recurring: boolean
  included_by_default: boolean
  optional: boolean
  active: boolean
  sort_order: number
  created_at: string
}

export type QuoteItemRow = {
  id: string
  quote_id: string
  price_book_item_id: string | null
  name: string
  description: string | null
  quantity: number
  unit_price: number
  cost: number | null
  estimated_hours: number | null
  recurring: boolean
  included: boolean
  is_custom: boolean
  discount_type: QuoteDiscountType | null
  discount_value: number | null
  multiplier_exempt: boolean
  sort_order: number
  created_at: string
}

export type HiggsfieldCreditType = {
  id: string
  label: string
  unit: "per_item" | "per_second"
  creditsPerUnit: number
}

export type QuoteSettingsRow = {
  id: true
  currency: string
  vat_percent: number
  vat_included: boolean
  default_validity_days: number
  default_payment_terms: string
  min_margin_target: number
  min_hourly_rate_target: number
  complexity_multipliers: Record<QuoteComplexity, number>
  urgency_multipliers: Record<QuoteUrgency, number>
  default_discount_percent: number
  next_quote_number: number
  quote_number_prefix: string
  reminder_interval_days: number
  higgsfield_credit_types: HiggsfieldCreditType[]
  higgsfield_ils_per_credit: number
}

export const PRICE_BOOK_CATEGORIES: { value: PriceBookCategory; label: string }[] = [
  { value: "websites", label: "אתרים" },
  { value: "ai_content", label: "תוכן AI" },
  { value: "creative", label: "קריאייטיב" },
  { value: "care", label: "Care" },
  { value: "seo", label: "SEO" },
  { value: "automations", label: "אוטומציות" },
]

export const QUOTE_STATUS_LABELS: Record<QuoteStatus, string> = {
  draft: "טיוטה",
  ready: "מוכן",
  sent: "נשלח",
  viewed: "נצפה",
  approved: "אושר",
  signed: "נחתם",
  deposit_paid: "מקדמה שולמה",
  in_progress: "בעבודה",
  completed: "הושלם",
  declined: "נדחה",
  expired: "פג תוקף",
}

export type AdminNotificationRow = {
  id: string
  kind: string
  message: string
  quote_id: string | null
  read: boolean
  created_at: string
}

export type QuoteSignatureRow = {
  id: string
  quote_id: string
  full_name: string
  confirmed: boolean
  ip_address: string | null
  signed_at: string
}

export type SubServiceProcessStep = { title: string; text: string }
export type SubServiceFaq = { q: string; a: string }

export type SubServiceRow = {
  id: string
  slug: string
  hub_slug: "web-design" | "ai-content"
  title: string
  tagline: string
  hero_video: string | null
  explanation: string
  who_for: string[]
  problem: string
  benefits: string[]
  process: SubServiceProcessStep[]
  deliverables: string[]
  use_cases: string[]
  faq: SubServiceFaq[]
  related_slugs: string[]
  related_guide_slug: string | null
  sort_order: number
}

export type GuideSection = { heading: string; paragraphs: string[]; image?: string }

export type GuideRow = {
  id: string
  slug: string
  title: string
  excerpt: string
  category: string
  read_time: string
  date_published: string
  hero_video: string | null
  image: string | null
  hero_image: string | null
  related_service_slug: string | null
  sections: GuideSection[]
  sort_order: number
}

export type FaqItem = { q: string; a: string }

export type FaqGroupRow = {
  id: string
  title: string
  items: FaqItem[]
  sort_order: number
}

export type ServiceHubRow = {
  id: string
  slug: "web-design" | "ai-content"
  title: string
  tagline: string
  hero_description: string
  cta_label: string
  sort_order: number
}

export type SiteContentRow = {
  key: string
  value: unknown
  updated_at: string
}

export const PROJECT_CATEGORIES = [
  "אתרים",
  "דפי נחיתה",
  "אתרי WordPress",
  "אתרי AI",
  "פרסומות AI",
  "סרטוני AI",
  "תמונות מוצר",
  "ימי צילום AI",
  "UGC",
] as const

export type AITalentRow = {
  id: string
  slug: string
  full_name: string
  portrait_image: string
  full_body_image: string
  campaign_image: string | null
  gender_presentation: string
  style: string
  categories: string[]
  description: string
  creative_styles: string[]
  active: boolean
  sort_order: number
  created_at: string
}

export type AIProductRow = {
  id: string
  slug: string
  product_name: string
  brand_name: string
  category: string
  packshot_image: string
  lifestyle_image: string | null
  detail_image: string | null
  additional_images: string[]
  description: string
  active: boolean
  sort_order: number
  created_at: string
}

export type AICampaignCombinationRow = {
  id: string
  talent_id: string
  product_id: string
  video_url: string
  poster_image: string
  title: string
  description: string
  tags: string[]
  active: boolean
  sort_order: number
  created_at: string
}

export const AI_PRODUCT_CATEGORIES = [
  "Fragrance",
  "Skincare",
  "Fashion",
  "Sneakers",
  "Watches",
  "Eyewear",
  "Tech",
  "Food & Beverage",
  "Automotive",
  "Accessories",
] as const
