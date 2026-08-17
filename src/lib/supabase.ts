import { createClient } from "@supabase/supabase-js"

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(url, anonKey)

export type ProjectDetailItem = {
  title: string
  description: string
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
}

export type QuoteLineItem = {
  label: string
  description?: string
  price: number
}

export type QuoteRow = {
  id: string
  lead_id: string | null
  client_name: string
  client_email: string
  title: string
  line_items: QuoteLineItem[]
  currency: string
  total: number
  status: "draft" | "sent" | "signed" | "declined"
  notes: string | null
  created_at: string
  sent_at: string | null
  drive_folder_url: string | null
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

export const PROJECT_CATEGORIES = [
  "אתרים",
  "דפי נחיתה",
  "אתרי WordPress",
  "אתרי AI",
  "פרסומות AI",
  "סרטוני AI",
  "תמונות מוצר",
  "ימי צילום AI",
] as const
