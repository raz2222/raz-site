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
}

export type QuoteSignatureRow = {
  id: string
  quote_id: string
  full_name: string
  confirmed: boolean
  ip_address: string | null
  signed_at: string
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
