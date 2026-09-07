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
  meta_title: string | null
  meta_description: string | null
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
  // What Raz actually did here. A consulting engagement presented as
  // development is the kind of overclaim that costs more trust than the
  // portfolio entry earns, and Raz caught one himself. Null keeps the card
  // exactly as it read before.
  role: string | null
  // Prepared but not ready to show. Guides get this from date_published;
  // projects had nothing, so a half-filled case study went live the instant it
  // was inserted. The public site never sees a draft; the admin always does.
  draft: boolean
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
  /** The agreement the client signs together with the price. Snapshotted from
   * the template the same way `contracts.sections` is, so editing the wording
   * later never rewrites a quote someone already signed. */
  template_id: string | null
  sections: ContractSection[]
  provider: Partial<ContractProvider> | null
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
  next_contract_number: number
  contract_number_prefix: string
  // Printed at the head of every contract. Filled in once, here, rather than
  // retyped into each agreement.
  provider_name: string
  provider_business_name: string
  provider_id_number: string
  provider_address: string
  provider_email: string
  provider_phone: string
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

/** A live piece of client work. Separate from `projects`, which is the public
 * portfolio: that one is world-readable, this one is the client's own. */
export type ClientProjectRow = {
  id: string
  client_id: string
  contract_id: string | null
  title: string
  description: string | null
  stage: string
  stage_note: string | null
  drive_folder_url: string | null
  started_at: string | null
  due_at: string | null
  delivered_at: string | null
  sort_order: number
  created_at: string
  updated_at: string
}

export type AdminNotificationRow = {
  id: string
  kind: string
  message: string
  quote_id: string | null
  /** Set for `lead_new`, so the notification can open the person it is about. */
  lead_id: string | null
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

// A contract is the agreement itself: the clauses, the parties, the money, and
// the signature. Templates hold the reusable clause text; `contracts.sections`
// holds a frozen copy of the rendered clauses, so editing a template later never
// rewrites an agreement someone already signed.
export type ContractSection = { heading: string; body: string }

/** The business details printed at the head of a contract. Copied onto the
 * contract when it is saved: the client has to be able to read them, and
 * `quote_settings` is owner-only. */
export type ContractProvider = {
  provider_name: string
  provider_business_name: string
  provider_id_number: string
  provider_address: string
  provider_email: string
  provider_phone: string
}

export type ContractTemplateRow = {
  id: string
  slug: string
  name: string
  description: string | null
  sections: ContractSection[]
  active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export type ContractStatus = "draft" | "sent" | "viewed" | "signed" | "cancelled"

export const CONTRACT_STATUS_LABELS: Record<ContractStatus, string> = {
  draft: "טיוטה",
  sent: "נשלח",
  viewed: "נצפה",
  signed: "נחתם",
  cancelled: "בוטל",
}

export type ContractRow = {
  id: string
  contract_number: string | null
  quote_id: string | null
  client_id: string | null
  template_id: string | null
  client_name: string
  client_email: string
  client_company: string | null
  client_id_number: string | null
  client_address: string | null
  client_phone: string | null
  title: string
  scope: string | null
  deliverables: string[]
  timeline: string | null
  start_date: string | null
  currency: string
  total: number
  vat_included: boolean
  payment_terms: string | null
  payment_schedule: PaymentScheduleEntry[]
  sections: ContractSection[]
  provider: Partial<ContractProvider>
  notes: string | null
  internal_notes: string | null
  status: ContractStatus
  sent_at: string | null
  viewed_at: string | null
  /** Which CALL_PACKAGES entry built this contract, when one did. */
  package_key: "pilot" | "monthly" | null
  /** The day the pilot video was handed over; the 7-day offset window counts
   * from here rather than from the signature, because the client signs before
   * there is anything to judge. */
  pilot_delivered_at: string | null
  created_at: string
  updated_at: string
}

export type ContractSignatureRow = {
  id: string
  contract_id: string
  full_name: string
  id_number: string | null
  signature_image: string | null
  confirmed: boolean
  ip_address: string | null
  user_agent: string | null
  signed_at: string
}

// Where the deposit goes. Kept current rather than snapshotted onto a contract:
// if the bank account changes, a client opening an old contract must see the new
// one. Readable only by someone who actually has a contract.
export type PaymentDetailsRow = {
  id: true
  bank_name: string
  bank_branch: string
  bank_account_number: string
  bank_account_holder: string
  bit_phone: string
  bit_link: string
  paybox_link: string
  contact_phone: string
  whatsapp_phone: string
  note: string
  updated_at: string
}

// The sales call: the script Raz reads from, and the record of one call run
// against it. Both are internal, and neither is ever exposed to a client.
export type CallScriptRow = {
  id: string
  slug: string
  name: string
  description: string | null
  graph: unknown
  active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export type CallSessionStatus = "in_progress" | "completed" | "abandoned"

export const CALL_OUTCOME_LABELS: Record<string, string> = {
  pilot: "נסגר פיילוט",
  monthly: "נסגר חודשי",
  custom_quote: "הצעה נשלחת",
  follow_up: "פולואפ",
  not_relevant: "לא רלוונטי",
  no_answer: "לא ענה",
}

export type CallSessionRow = {
  id: string
  lead_id: string | null
  client_id: string | null
  script_id: string | null
  // Frozen when the call starts: editing the script later must not rewrite what
  // a past call was actually run against.
  script_snapshot: unknown
  contact_name: string
  contact_phone: string | null
  contact_email: string | null
  business_name: string | null
  call_context: string | null
  answers: Record<string, string>
  path: string[]
  current_node: string | null
  ending_key: string | null
  notes: string | null
  status: CallSessionStatus
  outcome: string | null
  recommended_package: string | null
  next_step: string | null
  follow_up_at: string | null
  /** When a scoping call was actually booked, as a moment rather than a day. */
  meeting_at: string | null
  meeting_minutes: number
  quote_id: string | null
  contract_id: string | null
  started_at: string
  ended_at: string | null
  /** Put away rather than removed · a call is a record of something that
   * actually happened. */
  archived_at: string | null
  deleted_at: string | null
  created_at: string
  updated_at: string
}

export type LeadRow = {
  id: string
  name: string
  email: string
  phone: string | null
  company: string | null
  project_type: string
  budget: string | null
  message: string | null
  status: string
  source: string
  client_id: string | null
  created_at: string
  /** Put away rather than removed. A lead is the top of the funnel and the one
   * record whose accidental loss cannot be undone from anywhere else, so the
   * lists filter on these two dates and nothing issues a DELETE. */
  archived_at: string | null
  deleted_at: string | null
  /** A meeting agreed with this person, wherever it was agreed · an email
   * thread has no call session to hang one on. */
  meeting_at: string | null
  meeting_minutes: number
  meeting_note: string | null
  /** When the client was actually sent the invitation, which is not the same
   * moment as pencilling the meeting in. */
  meeting_invited_at: string | null
}

export type SubServiceProcessStep = { title: string; text: string }
export type SubServiceFaq = { q: string; a: string }

export type SubServiceRow = {
  id: string
  meta_title: string | null
  meta_description: string | null
  seo_h1: string | null
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

export type FaqItem = { q: string; a: string }

export type GuideSection = { heading: string; paragraphs: string[]; image?: string }

// The blog and the tutorials are the same shape and the same renderer; what
// differs is why they exist. An article is written to rank in Google for a
// buying-intent query. A tutorial is a link Raz sends his Instagram followers,
// where the traffic arrives already knowing who he is. Keeping them in one
// table with one discriminator means one admin screen and one article page,
// while the two indexes stay separate so a how-to never dilutes the commercial
// cluster it sits next to.
export type GuideKind = "article" | "tutorial"

export type GuideRow = {
  /** Overrides the <title> for search. Empty falls back to the guide title. */
  meta_title: string | null
  /** Overrides the meta description. Empty falls back to the excerpt. */
  meta_description: string | null
  id: string
  kind: GuideKind
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
  faq: FaqItem[]
  sort_order: number
}

export type FaqGroupRow = {
  id: string
  title: string
  items: FaqItem[]
  sort_order: number
}

// meta_title / seo_h1 exist because the two do different jobs. The title tag
// competes in a list of ten results and has to lead with the phrase someone
// typed; the H1 confirms to a visitor who just landed that they are in the
// right place. Both fall back to `title` when null, so a row that has not been
// written yet behaves exactly as it did before.
export type ServiceHubRow = {
  id: string
  meta_title: string | null
  meta_description: string | null
  seo_h1: string | null
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

// The social command centre. Facebook is drafted here and sent by a person ·
// there is no API for a group Raz does not own · while Instagram genuinely
// publishes itself through the Content Publishing API.

export type FbGroupRow = {
  id: string
  name: string
  url: string | null
  members: number | null
  rules_note: string | null
  links_allowed: boolean
  cooldown_days: number
  active: boolean
  last_action_at: string | null
  created_at: string
}

export type OpportunityStatus = "new" | "ready" | "replied" | "skipped"

export type FbOpportunityRow = {
  id: string
  group_id: string | null
  group_name: string | null
  post_url: string | null
  author: string | null
  post_text: string
  intent: "video" | "ads" | "website" | "other"
  score: number
  summary: string | null
  draft_reply: string | null
  draft_dm: string | null
  status: OpportunityStatus
  replied_at: string | null
  archived_at: string | null
  created_at: string
}

export type SocialPostStatus = "draft" | "ready" | "publishing" | "published" | "failed" | "skipped"

export type SocialPostRow = {
  id: string
  platform: string
  project_id: string | null
  media_url: string | null
  media_type: "image" | "video"
  caption: string | null
  hashtags: string[]
  scheduled_for: string | null
  status: SocialPostStatus
  ig_media_id: string | null
  permalink: string | null
  error: string | null
  published_at: string | null
  source: "manual" | "project"
  created_at: string
}

export type SocialActionRow = {
  id: string
  platform: string
  action: "fb_comment" | "fb_post" | "fb_dm" | "ig_publish"
  group_id: string | null
  opportunity_id: string | null
  post_id: string | null
  text_fingerprint: string | null
  promotional: boolean
  created_at: string
}

export type SocialSettingsRow = {
  id: boolean
  fb_daily_cap: number
  fb_group_cooldown_days: number
  fb_min_gap_minutes: number
  fb_value_ratio: number
  warmup_started_on: string | null
  ig_daily_cap: number
  ig_auto_publish: boolean
  ig_auto_queue_projects: boolean
  updated_at: string
}
